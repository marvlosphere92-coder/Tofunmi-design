import { signIn } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <form action={signIn} className="w-full max-w-sm space-y-4">
        <h1 className="font-serif text-2xl text-center">Admin sign in</h1>
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
        <button type="submit" className="w-full rounded-full bg-accent text-white py-3">
          Sign in
        </button>
      </form>
    </main>
  );
}
