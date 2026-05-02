import Link from "next/link";
import { auth, signOut } from "@/auth";
import { BookOpen, Sparkles, LogOut } from "lucide-react";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 text-center">

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="text-blush" size={36} strokeWidth={1.5} />
            <Sparkles className="text-sage" size={28} strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-5xl font-bold text-bark leading-tight">
            Book Club Club
          </h1>
          <p className="text-bark-muted text-lg">
            A shared space for your book club
          </p>
        </div>

        {session?.user ? (
          <div
            className="bg-parchment rounded-3xl p-6 border border-lace space-y-5"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <div className="text-left space-y-0.5">
              <p className="text-xs font-medium uppercase tracking-widest text-bark-muted">
                Signed in as
              </p>
              <p className="font-semibold text-bark">{session.user.email}</p>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-full bg-blush px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-blush-dark hover:-translate-y-0.5 cursor-pointer"
                style={{ boxShadow: "var(--shadow-warm)" }}
              >
                <LogOut size={16} strokeWidth={2} />
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 rounded-full bg-blush px-8 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-blush-dark hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-warm)" }}
            >
              <Sparkles size={16} strokeWidth={2} />
              Sign in with magic link
            </Link>
            <p className="text-sm text-bark-muted">
              No password needed
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
