"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { companyInfo } from "@/data/navigation";

export function CTASection() {
  return (
    <section className="relative py-24">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-sunset.jpg"
          alt="Oil field at sunset"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#d51f26]/90" />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 font-[family-name:var(--font-oswald)] text-3xl font-semibold uppercase tracking-wide text-white sm:text-4xl lg:text-5xl">
              Ready to Get Started?
            </h2>
            <p className="mb-10 text-lg text-white/90">
              Contact us today for a free consultation. Our team of experts is
              ready to help you find the right safety solutions for your
              operation.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-14 bg-white px-8 font-[family-name:var(--font-oswald)] text-base font-medium uppercase tracking-wide text-[#d51f26] hover:bg-white/90"
              >
                <Link href="/contact">
                  Get Your Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 border-2 border-white bg-transparent px-8 font-[family-name:var(--font-oswald)] text-base font-medium uppercase tracking-wide text-white hover:bg-white hover:text-[#d51f26]"
              >
                <a href={`tel:${companyInfo.phone.replace(/[^0-9]/g, "")}`}>
                  <Phone className="mr-2 h-5 w-5" />
                  {companyInfo.phone}
                </a>
              </Button>
            </div>

            <p className="mt-10 text-sm uppercase tracking-wide text-white/70">
              Serving the Permian Basin with excellence since 1990
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
