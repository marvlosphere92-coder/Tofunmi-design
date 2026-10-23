"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export type CategoryTile = {
  category: string;
  image: string;
};

export function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  const shouldReduceMotion = useReducedMotion();

  if (tiles.length === 0) return null;

  return (
    <section className="bg-accent-soft/40 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-xs uppercase tracking-[0.2em] text-accent mb-6">
          Shop by occasion
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tiles.map((t, i) => (
            <motion.div
              key={t.category}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "200px" }}
              transition={{ duration: 0.3, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/designs?category=${t.category}`} className="group block relative">
                <div className="aspect-[4/5] overflow-hidden rounded-lg shadow-sm transition-shadow duration-300 group-hover:shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.image}
                    alt={`${t.category} designs`}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
                </div>
                <span className="absolute bottom-4 left-4 font-serif text-xl text-white flex items-center gap-1">
                  {t.category}
                  <span className="opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    →
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
