"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export function EditorialBreak() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "200px" }}
      transition={{ duration: 0.4 }}
      className="relative h-[55vh] min-h-[360px] overflow-hidden"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1787779350681-ae93f1e604ab?auto=format&fit=crop&w=1800&q=80"
        alt="A woman in a blue ankara ensemble and gele on a Lagos street"
        loading="lazy"
        className="h-full w-full object-cover object-[75%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex items-center px-6 md:px-16">
        <div className="max-w-sm text-left">
          <h2 className="font-serif text-3xl md:text-4xl text-white">
            Rooted in African style
          </h2>
          <Link
            href="/designs"
            className="mt-5 inline-block rounded-full border border-white/70 text-white px-6 py-2.5 hover:bg-white hover:text-foreground hover:shadow-lg hover:-translate-y-0.5 transition active:scale-95"
          >
            Explore the lookbook
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
