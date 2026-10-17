import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import type { Design, DesignCategory } from "@/types/db";

const categories: { value: DesignCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "bridal", label: "Bridal" },
  { value: "aso_ebi", label: "Aso-ebi" },
  { value: "casual", label: "Casual" },
  { value: "men", label: "Men's" },
];

export default async function DesignsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("designs").select("*").eq("active", true);
  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  const { data: designs } = await query.order("created_at", { ascending: false });

  return (
    <>
      <SiteNav />
      <main className="flex-1 mx-auto max-w-5xl px-6 py-12 w-full">
        <h1 className="font-serif text-3xl mb-6">Lookbook</h1>

        <div className="flex gap-3 mb-8 flex-wrap">
          {categories.map((c) => (
            <Link
              key={c.value}
              href={c.value === "all" ? "/designs" : `/designs?category=${c.value}`}
              className={`rounded-full px-4 py-1.5 text-sm border ${
                (category ?? "all") === c.value
                  ? "bg-accent text-white border-accent"
                  : "border-accent-soft"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {((designs ?? []) as Design[]).map((d) => (
            <Link key={d.id} href={`/designs/${d.id}`} className="group block">
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-accent-soft">
                {d.cover_photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.cover_photo_url}
                    alt={d.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                )}
              </div>
              <p className="mt-2 text-sm">{d.title}</p>
              <p className="text-xs text-foreground/60">
                From ₦{d.labour_price.toLocaleString()}
              </p>
            </Link>
          ))}
          {(!designs || designs.length === 0) && (
            <p className="text-foreground/60 col-span-full">
              No pieces in this category yet — check back soon.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
