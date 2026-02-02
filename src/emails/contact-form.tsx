import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Preview,
} from "@react-email/components";

interface ContactFormEmailProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  companyName: string;
}

export function ContactFormEmail({
  name,
  email,
  phone,
  subject,
  message,
  companyName,
}: ContactFormEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact form submission from {name}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={heading}>New Contact Form Submission</Text>
          </Section>

          <Section style={detailsSection}>
            <Text style={label}>Name</Text>
            <Text style={value}>{name}</Text>

            <Text style={label}>Email</Text>
            <Link href={`mailto:${email}`} style={link}>
              {email}
            </Link>

            {phone && (
              <>
                <Text style={label}>Phone</Text>
                <Link
                  href={`tel:${phone.replace(/[^0-9]/g, "")}`}
                  style={link}
                >
                  {phone}
                </Link>
              </>
            )}

            <Text style={label}>Subject</Text>
            <Text style={value}>{subject}</Text>
          </Section>

          <Hr style={hr} />

          <Section>
            <Text style={label}>Message</Text>
            <Section style={messageBox}>
              <Text style={messageText}>{message}</Text>
            </Section>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This message was sent from the {companyName} website contact form.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden" as const,
};

const headerSection = {
  backgroundColor: "#2a3583",
  padding: "24px 32px",
};

const heading = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "bold" as const,
  margin: "0",
};

const detailsSection = {
  padding: "24px 32px 0",
};

const label = {
  color: "#666666",
  fontSize: "12px",
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "16px 0 4px",
};

const value = {
  color: "#333333",
  fontSize: "16px",
  margin: "0 0 8px",
};

const link = {
  color: "#2a3583",
  fontSize: "16px",
  textDecoration: "none",
  display: "block" as const,
  marginBottom: "8px",
};

const hr = {
  borderColor: "#eeeeee",
  margin: "24px 32px",
};

const messageBox = {
  backgroundColor: "#f8f9fa",
  padding: "16px 20px",
  borderRadius: "6px",
  borderLeft: "3px solid #d51f26",
  margin: "0 32px",
};

const messageText = {
  color: "#333333",
  fontSize: "15px",
  lineHeight: "1.6",
  whiteSpace: "pre-wrap" as const,
  margin: "0",
};

const footer = {
  color: "#999999",
  fontSize: "12px",
  textAlign: "center" as const,
  padding: "0 32px 24px",
};

export default ContactFormEmail;
