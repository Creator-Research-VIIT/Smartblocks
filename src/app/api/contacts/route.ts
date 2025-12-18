/**
 * Contacts collection CRUD
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { contactFormSchema, sanitizeFormData } from '@/lib/validations';
import {
  getContacts as getContactsPrisma,
  updateContactStatus,
  createContact,
} from '@/lib/contacts-prisma';
import {
  sendContactNotification,
  sendUserConfirmation,
} from '@/lib/email';

/* ---------------------------------- */
/* CORS                                */
/* ---------------------------------- */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/* ---------------------------------- */
/* Auth (placeholder – always true)    */
/* ---------------------------------- */
function checkAuth() {
  // 🔒 Replace with real auth later
  return { role: 'admin' };
}

/* ---------------------------------- */
/* CAPTCHA verification                */
/* ---------------------------------- */
async function verifyCaptcha(
  token: string
): Promise<{ success: boolean; score?: number }> {
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) return { success: true };

    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secret}&response=${token}`,
      }
    );

    const data = await response.json();

    if (data.success && typeof data.score === 'number') {
      return { success: data.score >= 0.5, score: data.score };
    }

    return { success: !!data.success };
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    // fail-open to avoid blocking users
    return { success: true };
  }
}

/* ---------------------------------- */
/* OPTIONS                             */
/* ---------------------------------- */
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

/* ---------------------------------- */
/* GET /api/contacts (admin)           */
/* ---------------------------------- */
export async function GET(request: NextRequest) {
  const session = checkAuth();

  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    const result = await getContactsPrisma({
      page,
      limit,
      status: status !== 'all' ? status : undefined,
      search: search.trim() || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        contacts: result.contacts,
        totalPages: result.totalPages,
        currentPage: page,
        total: result.total,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch contacts',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/* ---------------------------------- */
/* PATCH /api/contacts (admin)         */
/* ---------------------------------- */
export async function PATCH(request: NextRequest) {
  const session = checkAuth();

  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Contact ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const updated = await updateContactStatus(
      Number(id),
      status,
      adminNotes,
      'admin'
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Contact not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, contact: updated },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Failed to update contact:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update contact',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/* ---------------------------------- */
/* POST /api/contacts (public)         */
/* ---------------------------------- */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    /* CAPTCHA */
    let captchaResult: { success: boolean; score?: number } = {
      success: true,
    };

    if (
      body.captchaToken &&
      !['no-captcha-available', 'captcha-failed', 'captcha-error'].includes(
        body.captchaToken
      )
    ) {
      captchaResult = await verifyCaptcha(body.captchaToken);

      if (!captchaResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: 'CAPTCHA verification failed. Please try again.',
          },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    /* Validation */
    const validated = contactFormSchema.parse(body);
    const sanitized = sanitizeFormData(validated);

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    const contact = await createContact({
      ...sanitized,
      captchaScore: captchaResult.score ?? null,
      ipAddress,
      userAgent,
    } as any);

    /* Fire-and-forget emails */
    sendContactNotification(contact as any).catch(console.error);
    sendUserConfirmation(contact as any).catch(console.error);

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your message! We'll get back to you soon.",
        contactId: contact.id,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const field = err.path[0];
        if (typeof field === 'string') {
          fieldErrors[field] = err.message;
        }
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Please check your input and try again.',
          errors: fieldErrors,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.error('Contact POST error:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to submit contact',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
