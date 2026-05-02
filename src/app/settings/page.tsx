import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { updateName } from "@/lib/actions";
import { ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true },
  });

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </Link>
          <h1 className="font-display text-2xl font-bold text-bark">Settings</h1>
        </div>

        <div
          className="bg-parchment rounded-3xl p-6 border border-lace space-y-5"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          <div className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-widest text-bark-muted">
              Signed in as
            </p>
            <p className="text-sm text-bark">{user?.email}</p>
          </div>

          <form action={updateName} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-bark">
                Display name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={user?.name ?? ""}
                placeholder="Your name"
                required
                className="w-full rounded-2xl border border-lace bg-cream px-4 py-2.5 text-sm text-bark placeholder:text-bark-muted/60 focus:border-blush focus:outline-none focus:ring-2 focus:ring-blush/20 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-blush px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blush-dark hover:-translate-y-0.5 cursor-pointer"
              style={{ boxShadow: "var(--shadow-warm)" }}
            >
              Save
            </button>
          </form>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-bark-muted hover:text-bark transition-colors cursor-pointer"
          >
            <LogOut size={14} strokeWidth={1.75} />
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
