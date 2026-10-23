"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Design } from "@/types/db";

export function DesignCard({ design, index = 0 }: { design: Design; index?: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "200px" }}
      transition={{ duration: 0.3, delay: (index % 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/designs/${design.id}`} className="group block">
        <motion.div
          className="relative aspect-[3/4] overflow-hidden rounded-lg bg-accent-soft shadow-sm transition-shadow duration-300 group-hover:shadow-xl"
          whileHover="active"
          whileTap="active"
        >
          {design.cover_photo_url && (
            <motion.img
              src={design.cover_photo_url}
              alt={design.title}
              className="h-full w-full object-cover"
              variants={{ active: { scale: 1.06 } }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute bottom-3 left-3 text-xs text-white rounded-full border border-white/70 px-3 py-1 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            View details
          </span>
        </motion.div>
        <p className="mt-2 text-sm transition group-hover:text-accent">{design.title}</p>
        <p className="text-xs text-foreground/70">
          {design.labour_price != null
            ? `From ₦${design.labour_price.toLocaleString()}`
            : "Price on request"}
        </p>
      </Link>
    </motion.div>
  );
}
