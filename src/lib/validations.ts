import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\(\)\+]+$/.test(val),
      "Please enter a valid phone number"
    ),
  subject: z.enum(
    [
      "general",
      "quote",
      "training",
      "environmental",
      "equipment",
      "other",
    ],
    { message: "Please select a subject" }
  ),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be less than 5000 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const subjectOptions = [
  { value: "general", label: "General Inquiry" },
  { value: "quote", label: "Request a Quote" },
  { value: "training", label: "Training & Certification" },
  { value: "environmental", label: "Environmental Services" },
  { value: "equipment", label: "Equipment Sales/Rental" },
  { value: "other", label: "Other" },
];
