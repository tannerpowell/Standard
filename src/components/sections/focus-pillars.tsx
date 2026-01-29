"use client";

import { motion } from "framer-motion";

const pillars = [
  {
    number: "01",
    title: "SERVICE",
    description:
      'Setting the "Standard" for what our customers need and deserve',
  },
  {
    number: "02",
    title: "EXPERIENCE",
    description:
      "Seasoned company with 400 employees specializing in safety and environmental compliance",
  },
  {
    number: "03",
    title: "RESPONSE",
    description:
      "Five Texas / New Mexico locations allow Standard to be quick to react and respond",
  },
  {
    number: "04",
    title: "DEPENDABILITY",
    description: "Simply put, Standard is always available... 24/7, 365",
  },
];

export function FocusPillars() {
  return (
    <section className="bg-white py-20 dark:bg-slate-900">
      <div className="container">
        {/* Header row - OUR FOCUS left, description right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-8 grid gap-8 md:grid-cols-2 md:items-center"
        >
          <h2 className="font-['StandardTX_Display'] text-[100px] font-normal leading-[0.8] tracking-[-0.01em] text-[#d51f26]">
            OUR FOCUS
          </h2>
          <p className="text-lg text-muted-foreground">
            Located in the heart of the Permian Basin, Standard Safety & Supply
            strives to provide industry-leading and cost-effective health,
            safety and environmental services to oil and gas producers and
            service companies.{" "}
            <em className="text-foreground">
              When it comes to safety services, reputation is key and trust is
              earned.
            </em>
          </p>
        </motion.div>

        {/* Horizontal rule */}
        <hr className="mb-12 border-border" />

        {/* Four pillars */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Number - red */}
              <span className="mb-2 block font-[family-name:var(--font-jost)] text-sm font-semibold tracking-widest text-[#d51f26]">
                {pillar.number}
              </span>

              {/* Title with dash - navy blue, futura-pt style */}
              <h3 className="mb-1 font-[family-name:var(--font-jost)] text-2xl font-bold uppercase tracking-wide text-[#2a3583] dark:text-white">
                {pillar.title}
              </h3>
              <div className="mb-4 h-1 w-5 bg-[#2a3583] dark:bg-white" />

              {/* Description */}
              <p className="text-muted-foreground">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
