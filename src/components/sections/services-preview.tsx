"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

const SERVICE_LINK_CLASS =
  "group inline-flex items-center gap-3 border border-white/70 bg-transparent px-10 py-5 font-[family-name:var(--font-oswald)] text-xs font-medium uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-white hover:text-[#2a3583]";

export function ServicesPreview() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax: image moves slower than scroll
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Background image with parallax */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <Image
          src="/images/footer-desert-2800w.jpg"
          alt="Standard Safety & Supply trucks in the Permian Basin"
          fill
          sizes="100vw"
          className="scale-125 object-cover object-center"
        />
      </motion.div>

      {/* Content overlay */}
      <div className="relative z-10 flex min-h-[700px] flex-col items-center justify-center py-16 lg:min-h-[800px]">
        {/* Services */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <h2 className="mb-6 font-['StandardTX_Display'] text-[100px] font-normal leading-[0.8] tracking-[-0.01em] text-white/90">
            SERVICES
          </h2>
          <Link href="/services" className={SERVICE_LINK_CLASS}>
            What We Do
            <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>

        {/* Training */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="mb-6 font-['StandardTX_Display'] text-[100px] font-normal leading-[0.8] tracking-[-0.01em] text-white/90">
            TRAINING
          </h2>
          <Link href="/training" className={SERVICE_LINK_CLASS}>
            Get Certified
            <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
