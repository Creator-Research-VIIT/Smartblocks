"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, AlertCircle, Loader2, Shield } from "lucide-react";
import {
  ContactFormData,
  SERVICE_INTERESTS,
  BUDGET_RANGES,
  COUNTRY_CODES,
} from "@/types/contact";
import { validatePhoneNumber } from "@/lib/validations";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface ContactFormProps {
  className?: string;
}

interface FormErrors {
  [key: string]: string;
}

export function ContactForm({ className }: ContactFormProps) {
  const [formData, setFormData] = useState<Partial<ContactFormData>>({
    name: "",
    email: "",
    phone: "",
    countryCode: "+91",
    company: "",
    subject: "",
    serviceInterest: "",
    budgetRange: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [captchaLoaded, setCaptchaLoaded] = useState(false);

  useEffect(() => {
    // Only load reCAPTCHA if site key is provided
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      setCaptchaLoaded(true); // Skip captcha if no key provided
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setCaptchaLoaded(true);
    };
    script.onerror = () => {
      console.warn("Failed to load reCAPTCHA, proceeding without it");
      setCaptchaLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src*="recaptcha"]`);
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "phone" && formData.countryCode) {
      const isValid = validatePhoneNumber(value, formData.countryCode);
      if (!isValid && value.length > 0) {
        const country = COUNTRY_CODES.find(
          (c) => c.code === formData.countryCode
        );
        setErrors((prev) => ({
          ...prev,
          phone: `Please enter a valid ${country?.maxLength}-digit phone number for ${country?.country}`,
        }));
      } else {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone || formData.phone.trim().length === 0) {
      newErrors.phone = "Phone number is required";
    } else if (
      !validatePhoneNumber(formData.phone, formData.countryCode || "+91")
    ) {
      const country = COUNTRY_CODES.find(
        (c) => c.code === formData.countryCode
      );
      newErrors.phone = `Invalid phone number for ${country?.country}`;
    }

    if (!formData.subject || formData.subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters";
    }

    if (!formData.message || formData.message.trim().length < 20) {
      newErrors.message = "Message must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCaptchaToken = async (): Promise<string> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    // Skip captcha if no site key or grecaptcha not available
    if (!siteKey || !captchaLoaded || !window.grecaptcha) {
      console.warn("reCAPTCHA not available, proceeding without verification");
      return "no-captcha-available";
    }

    try {
      return new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey, {
              action: "contact_form",
            })
            .then(resolve)
            .catch((error: unknown) => {
              console.warn("reCAPTCHA execution failed:", error);
              resolve("captcha-failed");
            });
        });
      });
    } catch (error) {
      console.warn("reCAPTCHA error:", error);
      return "captcha-error";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const captchaToken = await getCaptchaToken();

      const response = await fetch("/api/contacts1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          captchaToken,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus("success");
        setSubmitMessage(
          "Thank you! We've sent a confirmation email. We'll get back to you within 24 hours."
        );

        setFormData({
          name: "",
          email: "",
          phone: "",
          countryCode: "+91",
          company: "",
          subject: "",
          serviceInterest: "",
          budgetRange: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
        setSubmitMessage(
          result.message || "Something went wrong. Please try again."
        );

        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
      setSubmitMessage(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCountry = COUNTRY_CODES.find(
    (c) => c.code === formData.countryCode
  );

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={cn(
                "form-input",
                errors.name &&
                  "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              placeholder="John Doe"
              disabled={isSubmitting}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={cn(
                "form-input",
                errors.email &&
                  "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              placeholder="john@example.com"
              disabled={isSubmitting}
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="countryCode" className="form-label">
              Country *
            </label>
            <select
              id="countryCode"
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="form-select"
              disabled={isSubmitting}
            >
              {COUNTRY_CODES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.code} {country.country}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="phone" className="form-label">
              Phone Number *{" "}
              {selectedCountry && `(${selectedCountry.maxLength} digits)`}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={cn(
                "form-input",
                errors.phone &&
                  "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              placeholder={
                selectedCountry?.code === "+91" ? "9876543210" : "1234567890"
              }
              maxLength={selectedCountry?.maxLength}
              disabled={isSubmitting}
            />
            {errors.phone && <p className="form-error">{errors.phone}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="company" className="form-label">
              Company Name
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="form-input"
              placeholder="Your Company (Optional)"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="serviceInterest" className="form-label">
              Service Interest
            </label>
            <select
              id="serviceInterest"
              name="serviceInterest"
              value={formData.serviceInterest}
              onChange={handleChange}
              className="form-select"
              disabled={isSubmitting}
            >
              <option value="">Select a service</option>
              {SERVICE_INTERESTS.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="form-label">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={cn(
              "form-input",
              errors.subject &&
                "border-red-500 focus:border-red-500 focus:ring-red-500"
            )}
            placeholder="What would you like to discuss?"
            disabled={isSubmitting}
          />
          {errors.subject && <p className="form-error">{errors.subject}</p>}
        </div>

        <div>
          <label htmlFor="budgetRange" className="form-label">
            Budget Range
          </label>
          <select
            id="budgetRange"
            name="budgetRange"
            value={formData.budgetRange}
            onChange={handleChange}
            className="form-select"
            disabled={isSubmitting}
          >
            <option value="">Select budget range</option>
            {BUDGET_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="form-label">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            className={cn(
              "form-textarea",
              errors.message &&
                "border-red-500 focus:border-red-500 focus:ring-red-500"
            )}
            placeholder="Tell us about your project or inquiry..."
            disabled={isSubmitting}
          />
          {errors.message && <p className="form-error">{errors.message}</p>}
          <p className="text-xs text-gray-500 mt-1">
            {formData.message?.length || 0} / 2000 characters (minimum 20)
          </p>
        </div>

        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="h-4 w-4" />
            <span>
              Protected by reCAPTCHA. Your privacy is important to us.
            </span>
          </div>
        )}

        <div>
          <motion.button
            type="submit"
            disabled={
              isSubmitting ||
              (!captchaLoaded &&
                Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY))
            }
            className={cn(
              "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
              isSubmitting ||
                (!captchaLoaded && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
                ? "bg-gray-400 cursor-not-allowed"
                : submitStatus === "success"
                ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
              "text-white"
            )}
            whileHover={
              !isSubmitting &&
              (captchaLoaded || !process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
                ? { scale: 1.02 }
                : {}
            }
            whileTap={
              !isSubmitting &&
              (captchaLoaded || !process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
                ? { scale: 0.98 }
                : {}
            }
          >
            {!captchaLoaded && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading Security...
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : submitStatus === "success" ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Message Sent!
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Send Message
              </>
            )}
          </motion.button>
        </div>

        {submitMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-lg flex items-center gap-3",
              submitStatus === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            )}
          >
            {submitStatus === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            )}
            <p className="font-medium">{submitMessage}</p>
          </motion.div>
        )}
      </form>
    </div>
  );
}
