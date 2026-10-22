"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Design } from "@/types/db";

export function DesignCard({ design, index = 0 }: { design: Design; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 8) * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/designs/${design.id}`} className="group block">
        <motion.div
          className="aspect-[3/4] overflow-hidden rounded-lg bg-accent-soft"
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
        </motion.div>
        <p className="mt-2 text-sm">{design.title}</p>
        <p className="text-xs text-foreground/60">
          {design.labour_price != null
            ? `From ₦${design.labour_price.toLocaleString()}`
            : "Price on request"}
        </p>
      </Link>
    </motion.div>
  );
}
