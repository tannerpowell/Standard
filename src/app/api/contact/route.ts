import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { contactFormSchema, subjectOptions } from "@/lib/validations";
import { companyInfo } from "@/data/navigation";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate the request body
    const result = contactFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = result.data;

    // Get readable subject label
    const subjectLabel =
      subjectOptions.find((opt) => opt.value === subject)?.label || subject;

    // HTML escape function to prevent XSS in email template
    const escapeHtml = (text: string): string => {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
      };
      return text.replace(/[&<>"'/]/g, (char) => map[char]);
    };

    // Escape all user inputs
    const escapedName = escapeHtml(name);
    const escapedEmail = escapeHtml(email);
    const escapedPhoneDisplay = phone ? escapeHtml(phone) : '';
    const escapedMessage = escapeHtml(message);
    const escapedSubjectLabel = escapeHtml(subjectLabel);

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log("Contact form submission (Resend not configured):", {
        name,
        email,
        phone,
        subject: subjectLabel,
        message,
      });

      // Return success for development without Resend
      return NextResponse.json({
        success: true,
        message: "Form received (email not sent - Resend not configured)",
      });
    }

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${companyInfo.name} Website <onboarding@resend.dev>`, // Replace with your verified domain
      to: process.env.CONTACT_EMAIL || "apply@standardtx.com",
      replyTo: email,
      subject: `[Website Contact] ${escapedSubjectLabel} - ${escapedName}`,
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
