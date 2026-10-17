"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function HeroReveal({
  title,
  cta,
  extra,
}: {
  title: ReactNode;
  cta: { href: string; label: string };
  extra?: ReactNode;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.15 } } }}
      className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pb-16"
    >
      <motion.h1
        variants={{
          hidden: { opacity: 0, y: 28 },
          show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
        }}
        className="font-serif text-5xl md:text-6xl text-white leading-tight"
      >
        {title}
      </motion.h1>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 16 },
          show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
        }}
      >
        <Link
          href={cta.href}
          className="mt-8 inline-block rounded-full bg-white/95 text-foreground px-8 py-3 hover:bg-white transition"
        >
          {cta.label}
        </Link>
      </motion.div>
      {extra}
    </motion.div>
  );
}
