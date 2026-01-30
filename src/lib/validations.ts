import { z } from "zod";

const SUBJECTS = [
  "general",
  "quote",
  "training",
  "environmental",
  "equipment",
  "other",
] as const;

const humanize = (subject: string): string => {
  const labels: Record<string, string> = {
    general: "General Inquiry",
    quote: "Request a Quote",
    training: "Training & Certification",
    environmental: "Environmental Services",
    equipment: "Equipment Sales/Rental",
    other: "Other",
  };
  return labels[subject] || subject;
};

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\(\)\+]+$/.test(val),
      "Please enter a valid phone number"
    ),
  subject: z.enum(SUBJECTS, { message: "Please select a subject" }),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be less than 5000 characters"),
  // Honeypot field — bots fill this in, humans never see it
  website: z.string().max(0, "Bot detected").optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const subjectOptions = SUBJECTS.map((s) => ({
  value: s,
  label: humanize(s),
}));
