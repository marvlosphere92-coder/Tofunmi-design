import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { DesignCard } from "@/components/DesignCard";
import { sortCategories } from "@/lib/categories";
import type { Design } from "@/types/db";

export default async function DesignsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const [{ data: allActive }, query] = await Promise.all([
    supabase.from("designs").select("category").eq("active", true),
    (async () => {
      let q = supabase.from("designs").select("*").eq("active", true);
      if (category && category !== "all") {
        q = q.eq("category", category);
      }
      return q.order("display_order", { ascending: true });
    })(),
  ]);
  const { data: designs } = query;

  // Build the filter pills from whatever categories actually exist,
  // rather than a fixed list — any category name can be typed in admin.
  // Ordered to match the homepage's category tiles (Bridal, Aso-ebi,
  // Casual, then anything else alphabetically).
  const categoryOptions = sortCategories(
    Array.from(new Set((allActive ?? []).map((d) => d.category)))
  );

  return (
    <>
      <SiteNav />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full">
        <h1 className="font-serif text-3xl mb-6">Lookbook</h1>

        <div className="flex gap-3 mb-10 flex-wrap">
          <Link
            href="/designs"
            className={`flex items-center rounded-full px-4 min-h-11 text-sm border transition ${
              !category
                ? "bg-accent text-white border-accent"
                : "border-accent-soft hover:border-accent"
            }`}
          >
            All
          </Link>
          {categoryOptions.map((c) => (
            <Link
              key={c}
              href={`/designs?category=${encodeURIComponent(c)}`}
              className={`flex items-center rounded-full px-4 min-h-11 text-sm border transition ${
                category === c
                  ? "bg-accent text-white border-accent"
                  : "border-accent-soft hover:border-accent"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {((designs ?? []) as Design[]).map((d, i) => (
            <DesignCard key={d.id} design={d} index={i} />
          ))}
          {(!designs || designs.length === 0) && (
            <p className="text-foreground/70 col-span-full">
              No pieces in this category yet — check back soon.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
