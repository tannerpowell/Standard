import { Metadata } from "next";
import Image from "next/image";
import { Phone, MapPin } from "lucide-react";
import { ContactForm } from "@/components/sections/contact-form";
import { companyInfo } from "@/data/navigation";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Standard Safety & Supply for safety equipment, training, and environmental services. Located in Odessa, TX serving the Permian Basin.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Content */}
      <section className="bg-[#fafafa] pt-14 pb-14 dark:bg-slate-800/20">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-5">
            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="mb-2 font-[family-name:var(--font-body)] text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
                Get in Touch
              </h2>
              <p className="mb-8 font-[family-name:var(--font-display)] text-[40px] leading-[0.9] tracking-tight text-foreground sm:text-[52px]">
                ODESSA, TX
              </p>
              <ContactForm />
            </div>

            {/* Info */}
            <div className="lg:col-span-2">
              <div
                className="overflow-hidden rounded-[4px] border border-[#d5d7db] bg-[#eef0f2] p-[5px]"
                style={{
                  boxShadow:
                    "0 4px 8px rgba(0, 0, 0, 0.10), 0 1px 3px rgba(0, 0, 0, 0.06)",
                }}
              >
                <div
                  className="rounded-[3px] border border-[#e2e4e8] bg-[#fafafa] dark:border-slate-600 dark:bg-slate-800/80"
                  style={{
                    boxShadow:
                      "inset 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 0 0 0.5px rgba(255,255,255,0.7)",
                  }}
                >
                  {/* Map */}
                  <a
                    href="https://maps.apple.com/place?address=3401%20S%20County%20Rd%201290%2C%20Odessa%2C%20TX%20%2079765%2C%20United%20States&auid=2753523042508709684&ll=31.804640%2C-102.377930&lsp=9902&q=Standard%20Safety%20%26%20Supply&t=m"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[3px]">
                      <Image
                        src="/standard-map-2026.png"
                        alt="Standard Safety & Supply location — Odessa, TX"
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </a>

                  {/* Details */}
                  <div className="px-6 py-6">
                    <h3 className="mb-5 font-[family-name:var(--font-oswald)] text-lg font-semibold uppercase tracking-wide text-foreground">
                      Standard Safety & Supply
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                        <div>
                          <p className="font-[family-name:var(--font-body)] text-[15px] font-medium text-foreground">
                            {companyInfo.address.street}
                          </p>
                          <p className="font-[family-name:var(--font-body)] text-[15px] text-slate-500 dark:text-slate-400">
                            {companyInfo.address.city}, {companyInfo.address.state} {companyInfo.address.zip}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 shrink-0 text-brand-red" />
                        <div>
                          <p className="mb-0.5 font-[family-name:var(--font-body)] text-xs uppercase tracking-widest text-slate-400">
                            Office Main
                          </p>
                          <a
                            href={`tel:${companyInfo.phone.replace(/[^0-9]/g, "")}`}
                            className="font-[family-name:var(--font-body)] text-[17px] font-semibold text-foreground transition-colors hover:text-brand-red"
                          >
                            {companyInfo.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
