import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Book Club Club</h1>
          <p className="text-slate-300">A shared space for your book club</p>
        </div>

        {session?.user ? (
          <div className="space-y-6 bg-slate-800 rounded-lg p-6">
            <div className="text-left">
              <p className="text-slate-400 text-sm">Signed in as:</p>
              <p className="text-white text-lg font-semibold">{session.user.email}</p>
            </div>
            <Link
              href="/api/auth/signout"
              className="inline-block w-full rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
            >
              Sign out
            </Link>
          </div>
        ) : (
          <Link
            href="/auth/signin"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Sign in with magic link
          </Link>
        )}
      </div>
    </main>
  );
}
