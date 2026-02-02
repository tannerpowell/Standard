import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { contactFormSchema, subjectOptions } from "@/lib/validations";
import { companyInfo } from "@/data/navigation";
import { ContactFormEmail } from "@/emails/contact-form";

// Simple in-memory rate limiter (per-IP, resets on redeploy)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per window
const GC_THRESHOLD = 100; // Run GC when map exceeds this size

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Lightweight GC: remove expired entries when map grows large
  if (rateLimit.size > GC_THRESHOLD) {
    rateLimit.forEach((value, key) => {
      if (now > value.resetAt) {
        rateLimit.delete(key);
      }
    });
  }

  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function sanitizeHeader(text: string): string {
  // Remove CR and LF characters to prevent header injection
  return text.replace(/[\r\n]/g, "");
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate (includes honeypot check via the `website` field)
    const result = contactFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }

    // Honeypot triggered — silently accept to not tip off bots
    if (result.data.website) {
      return NextResponse.json({
        success: true,
        message: "Message sent successfully",
      });
    }

    const { name, email, phone, subject, message } = result.data;

    const subjectLabel =
      subjectOptions.find((opt) => opt.value === subject)?.label || subject;

    // Sanitize header values to prevent CR/LF injection
    const sanitizedEmail = sanitizeHeader(email);
    const sanitizedName = sanitizeHeader(name);
    const sanitizedSubjectLabel = sanitizeHeader(subjectLabel);

    if (!process.env.RESEND_API_KEY) {
      console.log("Contact form submission (Resend not configured):", {
        subject: subjectLabel,
        hasName: !!name,
        hasEmail: !!email,
        hasPhone: !!phone,
        messageLength: message.length,
      });

      return NextResponse.json({
        success: true,
        message: "Form received (email not sent - Resend not configured)",
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailHtml = await render(
      ContactFormEmail({
        name,
        email,
        phone: phone || undefined,
        subject: subjectLabel,
        message,
        companyName: companyInfo.name,
      })
    );

    const fromDomain = process.env.RESEND_FROM_DOMAIN || "send.standardtx.com";
    const { data, error } = await resend.emails.send({
      from: `${companyInfo.name} Website <noreply@${fromDomain}>`,
      to: process.env.CONTACT_EMAIL || companyInfo.email,
      replyTo: sanitizedEmail,
      subject: `[Website Contact] ${sanitizedSubjectLabel} - ${sanitizedName}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", JSON.stringify(error, null, 2));
      console.error("Resend config:", {
        from: `noreply@${fromDomain}`,
        to: process.env.CONTACT_EMAIL || companyInfo.email,
        hasApiKey: !!process.env.RESEND_API_KEY,
      });
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      id: data?.id,
    });
  } catch (error) {
    console.error("Contact form error:", error instanceof Error ? { message: error.message, stack: error.stack } : error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
