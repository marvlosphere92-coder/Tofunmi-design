import { createClient } from "@/lib/supabase/server";
import { changePassword, changeEmail } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export default async function AdminAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <div className="space-y-10 max-w-md">
      <h1 className="font-serif text-2xl">Account</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-green-700">
          {success === "1" ? "Password updated." : success}
        </p>
      )}

      <section>
        <h2 className="font-medium mb-3">Email</h2>
        <p className="text-sm text-foreground/60 mb-3">
          Currently signed in as {data.user?.email}
        </p>
        <form action={changeEmail} className="flex gap-2">
          <input
            name="newEmail"
            type="email"
            placeholder="New email"
            required
            className="flex-1 rounded-md border border-accent-soft px-3 py-2"
          />
          <SubmitButton className="rounded-full bg-accent text-white px-5 py-2 text-sm" pendingText="Updating…">
            Update
          </SubmitButton>
        </form>
      </section>

      <section>
        <h2 className="font-medium mb-3">Password</h2>
        <form action={changePassword} className="space-y-3">
          <input
            name="newPassword"
            type="password"
            placeholder="New password (min. 8 characters)"
            required
            minLength={8}
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            required
            minLength={8}
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          />
          <SubmitButton className="rounded-full bg-accent text-white px-5 py-2 text-sm" pendingText="Updating…">
            Update password
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
