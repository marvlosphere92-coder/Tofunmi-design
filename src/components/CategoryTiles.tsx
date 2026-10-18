"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const tiles = [
  {
    category: "bridal",
    label: "Bridal",
    image: "https://images.unsplash.com/photo-1661332517932-2d441bfb2994?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "aso_ebi",
    label: "Aso-ebi",
    image: "https://images.unsplash.com/photo-1692135842396-308698676718?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "casual",
    label: "Casual",
    image: "https://images.unsplash.com/photo-1663044022768-f4bb7b597b2c?auto=format&fit=crop&w=800&q=80",
  },
];

export function CategoryTiles() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiles.map((t, i) => (
          <motion.div
            key={t.category}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={`/designs?category=${t.category}`} className="group block relative">
              <div className="aspect-[4/5] overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.image}
                  alt={t.label}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
              </div>
              <span className="absolute bottom-4 left-4 font-serif text-xl text-white">
                {t.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
