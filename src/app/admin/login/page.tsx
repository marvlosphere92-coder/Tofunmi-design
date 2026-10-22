import { signIn } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-plum px-6">
      <div className="w-full max-w-sm">
        <p className="font-serif text-2xl text-center text-gold-soft mb-8">SimplyBukky</p>
        <form action={signIn} className="space-y-4 bg-surface rounded-xl p-8 shadow-lg">
          <h1 className="font-serif text-xl text-center">Admin sign in</h1>
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          />
          <SubmitButton className="w-full rounded-full bg-accent text-white py-3" pendingText="Signing in…">
            Sign in
          </SubmitButton>
        </form>
      </div>
    </main>
  );
}
