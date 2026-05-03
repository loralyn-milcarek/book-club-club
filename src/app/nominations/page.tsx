import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { BookOpen, PlusCircle, ArrowLeft } from "lucide-react";
import NominationCard from "@/components/NominationCard";

export default async function NominationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const currentUserId = session.user.id;

  const nominations = await prisma.bookNomination.findMany({
    include: {
      nominatedBy: { select: { id: true, name: true, email: true } },
      votes: { select: { userId: true, voteType: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const active = nominations.filter((n) => n.status === "ACTIVE");
  const archived = nominations.filter((n) => n.status === "ARCHIVED");

  const sortedActive = [...active].sort((a, b) => b.votes.length - a.votes.length);

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
            >
              <ArrowLeft size={18} strokeWidth={2} />
            </Link>
            <h1 className="font-display text-2xl font-bold text-bark">Nominations</h1>
          </div>
          <Link
            href="/nominations/new"
            className="flex items-center gap-1.5 rounded-full bg-blush px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blush-dark hover:-translate-y-0.5"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <PlusCircle size={14} strokeWidth={2} />
            Nominate
          </Link>
        </header>

        {sortedActive.length === 0 && archived.length === 0 ? (
          <div
            className="bg-parchment rounded-3xl p-8 border border-lace text-center space-y-4"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <BookOpen className="mx-auto text-blush" size={36} strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="font-display text-xl font-bold text-bark">No nominations yet</p>
              <p className="text-bark-muted text-sm">Be the first to suggest a book!</p>
            </div>
            <Link
              href="/nominations/new"
              className="inline-flex items-center gap-2 rounded-full bg-blush px-6 py-3 font-semibold text-white transition-all hover:bg-blush-dark hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-warm)" }}
            >
              <PlusCircle size={15} strokeWidth={2} />
              Nominate a book
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedActive.length > 0 && (
              <section className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-widest text-bark-muted">
                  Up for consideration · {sortedActive.length}
                </p>
                <div className="space-y-3">
                  {sortedActive.map((nom) => (
                    <NominationCard
                      key={nom.id}
                      nomination={nom}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </section>
            )}

            {archived.length > 0 && (
              <section className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-widest text-bark-muted">
                  Archived · {archived.length}
                </p>
                <div className="space-y-3">
                  {archived.map((nom) => (
                    <NominationCard
                      key={nom.id}
                      nomination={nom}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
