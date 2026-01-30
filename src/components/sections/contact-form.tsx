"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import {
  contactFormSchema,
  type ContactFormData,
  subjectOptions,
} from "@/lib/validations";

type FormStatus = "idle" | "submitting" | "success" | "error";

const INPUT_BASE =
  "w-full rounded-lg border-[1.5px] border-slate-200 bg-white px-4 py-3.5 font-[family-name:var(--font-body)] text-[15px] text-foreground transition-all duration-200 placeholder:text-slate-400 focus:border-brand-red focus:outline-none focus:ring-[3px] focus:ring-brand-red/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-brand-red";

const INPUT_ERROR = "border-red-400 focus:border-red-500 focus:ring-red-500/10";

const LABEL =
  "mb-2 block font-[family-name:var(--font-body)] text-[14px] font-medium tracking-wide text-foreground";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: undefined,
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      setStatus("success");
      reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  if (status === "success") {
    return (
      <div
        className="rounded-2xl border border-[#e2e4e8] bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800"
        style={{
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 40px rgba(0, 0, 0, 0.03)",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-2 font-[family-name:var(--font-oswald)] text-2xl font-semibold uppercase tracking-wide text-foreground">
            Message Sent
          </h3>
          <p className="mb-6 text-slate-500 dark:text-slate-400">
            Thank you for reaching out. We&apos;ll get back to you within 24
            hours.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="rounded-lg border border-slate-300 px-6 py-2.5 font-[family-name:var(--font-body)] text-sm font-medium text-foreground transition-colors hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            Send Another Message
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-[#e2e4e8] bg-white p-8 sm:p-10 dark:border-slate-700 dark:bg-slate-800"
      style={{
        boxShadow:
          "0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 40px rgba(0, 0, 0, 0.03)",
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Honeypot — hidden from humans, bots fill it in */}
        <input
          type="text"
          {...register("website")}
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0"
        />

        {/* Contact Information */}
        <div className="mb-8">
          <h3 className="mb-6 border-b-2 border-brand-red pb-3 font-[family-name:var(--font-oswald)] text-lg font-semibold uppercase tracking-wide text-foreground">
            Contact Information
          </h3>

          <div className="mb-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={LABEL}>
                Name <span className="text-brand-red">*</span>
              </label>
              <input
                id="name"
                placeholder="John Smith"
                {...register("name")}
                className={`${INPUT_BASE} ${errors.name ? INPUT_ERROR : ""}`}
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div>
              <label htmlFor="email" className={LABEL}>
                Email <span className="text-brand-red">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="john@company.com"
                {...register("email")}
                className={`${INPUT_BASE} ${errors.email ? INPUT_ERROR : ""}`}
              />
              <FieldError message={errors.email?.message} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className={LABEL}>
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="(432) 555-0123"
                {...register("phone")}
                className={INPUT_BASE}
              />
            </div>

            <div>
              <label htmlFor="subject" className={LABEL}>
                Subject <span className="text-brand-red">*</span>
              </label>
              <select
                id="subject"
                {...register("subject")}
                className={`${INPUT_BASE} ${errors.subject ? INPUT_ERROR : ""}`}
              >
                <option value="" disabled>
                  Select a subject
                </option>
                {subjectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.subject?.message} />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h3 className="mb-6 border-b-2 border-brand-red pb-3 font-[family-name:var(--font-oswald)] text-lg font-semibold uppercase tracking-wide text-foreground">
            Your Message
          </h3>

          <div>
            <label htmlFor="message" className={LABEL}>
              Message <span className="text-brand-red">*</span>
            </label>
            <textarea
              id="message"
              placeholder="Tell us about your safety needs..."
              rows={6}
              {...register("message")}
              className={`${INPUT_BASE} resize-none ${errors.message ? INPUT_ERROR : ""}`}
            />
            <FieldError message={errors.message?.message} />
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-8 py-4 font-[family-name:var(--font-body)] text-[16px] font-semibold tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-red-dark hover:shadow-[0_6px_16px_rgba(213,31,38,0.3)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            style={{
              boxShadow: "0 4px 12px rgba(213, 31, 38, 0.2)",
            }}
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-1.5 text-sm text-red-500"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
