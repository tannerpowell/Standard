"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

export function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={ref} className="relative -mt-[160px] h-screen overflow-hidden max-lg:-mt-[110px]">
      {/* Parallax background image */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <Image
          src="/images/hero-truck.jpg"
          alt="Standard Safety truck on job site"
          fill
          className="scale-110 object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/5" />
      </motion.div>

      {/* Content — left-aligned, vertically centered */}
      <div className="container relative z-10 flex h-screen items-center py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={itemVariants}
            className="font-['StandardTX_Display'] text-[60px] sm:text-[80px] lg:text-[100px] font-normal leading-[0.8] tracking-[-0.01em] text-white/90"
          >
            REPUTATION
            <br />
            IS KEY
          </motion.h1>
        </motion.div>
      </div>

    </section>
  );
}
