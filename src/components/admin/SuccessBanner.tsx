const MESSAGES: Record<string, string> = {
  published: "Design published — it's now visible on the lookbook.",
  "saved-as-draft": "Saved as a draft — hidden from the lookbook until you publish it.",
  hidden: "Design hidden from the lookbook.",
  saved: "Changes saved.",
  deleted: "Design deleted.",
  "status-updated": "Order status updated — the client has been emailed.",
  "measurement-verified": "Measurement marked verified.",
  "details-saved": "Order details saved.",
  "order-deleted": "Order deleted.",
};

export function SuccessBanner({ success }: { success?: string }) {
  if (!success) return null;
  const message = MESSAGES[success] ?? "Done.";
  return (
    <p className="rounded-md bg-emerald-50 text-emerald-800 text-sm px-4 py-3 mb-6">{message}</p>
  );
}
