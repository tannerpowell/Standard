import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { contactFormSchema, subjectOptions } from "@/lib/validations";
import { companyInfo } from "@/data/navigation";

// Simple in-memory rate limiter (per-IP, resets on redeploy)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
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

    // Escape all user inputs for the HTML email template
    const escapedName = escapeHtml(name);
    const escapedEmail = escapeHtml(email);
    const escapedPhoneDisplay = phone ? escapeHtml(phone) : "";
    const escapedMessage = escapeHtml(message);
    const escapedSubjectLabel = escapeHtml(subjectLabel);

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

    const { data, error } = await resend.emails.send({
      from: `${companyInfo.name} Website <onboarding@resend.dev>`,
      to: process.env.CONTACT_EMAIL || companyInfo.email,
      replyTo: email,
      subject: `[Website Contact] ${subjectLabel} - ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #004d99; border-bottom: 2px solid #004d99; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapedName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <a href="mailto:${escapedEmail}" style="color: #004d99;">${escapedEmail}</a>
              </td>
            </tr>
            ${
              phone
                ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <a href="tel:${phone.replace(/[^0-9]/g, "")}" style="color: #004d99;">${escapedPhoneDisplay}</a>
              </td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapedSubjectLabel}</td>
            </tr>
          </table>

          <h3 style="color: #333;">Message:</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; white-space: pre-wrap;">
            ${escapedMessage}
          </div>

          <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            This message was sent from the ${companyInfo.name} website contact form.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
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
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
