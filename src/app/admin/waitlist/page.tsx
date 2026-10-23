import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { toggleWaitlistContacted, deleteWaitlistEntry } from "./actions";
import type { WaitlistEntry } from "@/types/db";

export default async function AdminWaitlistPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("waitlist_entries")
    .select("*")
    .order("contacted", { ascending: true })
    .order("created_at", { ascending: false });

  const entries = (data ?? []) as WaitlistEntry[];

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Waitlist</h1>
      <div className="space-y-2">
        {entries.map((e) => (
          <div
            key={e.id}
            className="rounded-lg border border-accent-soft p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <p className="font-medium">
                {e.full_name}
                {e.contacted && <span className="ml-2 text-xs text-foreground/70">contacted</span>}
              </p>
              <p className="text-sm text-foreground/70">
                {e.phone}
                {e.design_reference ? ` · interested in ${e.design_reference}` : ""}
              </p>
              {e.notes && <p className="text-sm text-foreground/70 mt-1">{e.notes}</p>}
              <p className="text-xs text-foreground/70 mt-1">
                Joined {new Date(e.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <form action={toggleWaitlistContacted}>
                <input type="hidden" name="entryId" value={e.id} />
                <input type="hidden" name="contacted" value={String(e.contacted)} />
                <SubmitButton className="text-sm underline" pendingText="…">
                  {e.contacted ? "Mark uncontacted" : "Mark contacted"}
                </SubmitButton>
              </form>
              <ConfirmDeleteForm
                action={deleteWaitlistEntry}
                hiddenFields={{ entryId: e.id }}
                confirmMessage={`Remove ${e.full_name} from the waitlist?`}
              />
            </div>
          </div>
        ))}
        {entries.length === 0 && <p className="text-foreground/70">No one on the waitlist.</p>}
      </div>
    </div>
  );
}
