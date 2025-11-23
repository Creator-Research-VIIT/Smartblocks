import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema, sanitizeFormData } from "@/lib/validations";
import { ContactRepository } from "@/lib/database";
import { sendContactNotification, sendUserConfirmation } from "@/lib/email";
import { ZodError } from "zod";

const rateLimit = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";
  return `contact_form:${ip}`;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(key);

  if (!userLimit) {
    rateLimit.set(key, { count: 1, lastReset: now });
    return true;
  }

  if (now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
    rateLimit.set(key, { count: 1, lastReset: now });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

async function verifyCaptcha(
  token: string
): Promise<{ success: boolean; score?: number }> {
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      console.warn("RECAPTCHA_SECRET_KEY not configured");
      return { success: true };
    }

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secret}&response=${token}`,
      }
    );

    const data = await response.json();

    if (data.success && data.score) {
      return { success: data.score >= 0.5, score: data.score };
    }

    return { success: data.success };
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return { success: true };
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many requests. Please wait a minute before trying again.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    const captchaToken = body.captchaToken;
    let captchaResult: { success: boolean; score?: number } = { success: true };

    // Only verify captcha if token is provided and not a fallback value
    if (
      captchaToken &&
      captchaToken !== "no-captcha-available" &&
      captchaToken !== "captcha-failed" &&
      captchaToken !== "captcha-error"
    ) {
      captchaResult = await verifyCaptcha(captchaToken);
      if (!captchaResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: "CAPTCHA verification failed. Please try again.",
          },
          { status: 400 }
        );
      }
    } else if (!process.env.RECAPTCHA_SECRET_KEY) {
      // If no reCAPTCHA configured, proceed without verification
      console.log("reCAPTCHA not configured, proceeding without verification");
    }

    // const validatedData = contactFormSchema.parse(body);
    // const sanitizedData = sanitizeFormData(validatedData);
    const validatedData = contactFormSchema.parse(body);
    const sanitizedData = {
      ...sanitizeFormData(validatedData),
      captchaToken, // ensure optional field exists in type
    };

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const contact = await ContactRepository.create(
      sanitizedData,
      captchaResult.score,
      ipAddress,
      userAgent
    );

    sendContactNotification(contact).catch((error) => {
      console.error("Failed to send admin notification:", error);
    });

    sendUserConfirmation(contact).catch((error) => {
      console.error("Failed to send user confirmation:", error);
    });

    console.log(
      `New contact submission: ${contact.id} - ${contact.email} (Score: ${
        captchaResult.score || "N/A"
      })`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your message! We'll get back to you soon.",
        contactId: contact.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form submission error:", error);

    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const fieldPath = err.path[0];
        if (fieldPath && typeof fieldPath === "string") {
          fieldErrors[fieldPath] = err.message;
        }
      });

      return NextResponse.json(
        {
          success: false,
          message: "Please check your input and try again.",
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (
        error.message.includes("database") ||
        error.message.includes("connection")
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "We're experiencing technical difficulties. Please try again later.",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
