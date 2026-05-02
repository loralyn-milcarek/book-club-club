import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { BookOpen, Sparkles, PlusCircle, Settings } from "lucide-react";
import BookCard from "@/components/BookCard";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
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
            <p className="text-bark-muted text-lg">A shared space for your book club</p>
          </div>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 rounded-full bg-blush px-8 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-blush-dark hover:-translate-y-0.5"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <Sparkles size={16} strokeWidth={2} />
            Sign in with magic link
          </Link>
        </div>
      </main>
    );
  }

  const currentUserId = session.user.id;

  const [activeBooks, currentUser, allSessions] = await Promise.all([
    prisma.book.findMany({
      where: { isActive: true },
      include: { meeting: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: currentUserId },
      select: { progressPublic: true },
    }),
    prisma.readingSession.findMany({
      where: {
        book: { isActive: true },
      },
      orderBy: { loggedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, progressPublic: true } },
      },
    }),
  ]);

  const progressPublic = currentUser?.progressPublic ?? true;

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blush" size={24} strokeWidth={1.5} />
            <h1 className="font-display text-2xl font-bold text-bark">Book Club Club</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
                href="/books/add"
                className="flex items-center gap-1.5 rounded-full bg-sage px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-sage/80 hover:-translate-y-0.5"
                style={{ boxShadow: "var(--shadow-warm)" }}
              >
                <PlusCircle size={14} strokeWidth={2} />
                Add book
              </Link>
            <Link
              href="/settings"
              className="p-2 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
              title="Settings"
            >
              <Settings size={18} strokeWidth={1.75} />
            </Link>
          </div>
        </header>

        {activeBooks.length === 0 ? (
          <div
            className="bg-parchment rounded-3xl p-8 border border-lace text-center space-y-4"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="text-blush" size={32} strokeWidth={1.5} />
              <Sparkles className="text-sage" size={24} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <p className="font-display text-xl font-bold text-bark">No books yet</p>
              <p className="text-bark-muted text-sm">Add your current read to get started.</p>
            </div>
            <Link
              href="/books/add"
              className="inline-flex items-center gap-2 rounded-full bg-blush px-6 py-3 font-semibold text-white transition-all hover:bg-blush-dark hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-warm)" }}
            >
              <PlusCircle size={15} strokeWidth={2} />
              Add the first book
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-bark-muted">
              Currently reading
            </p>
            {activeBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                sessions={allSessions.filter((s) => s.bookId === book.id)}
                currentUserId={currentUserId}
                currentUserProgressPublic={progressPublic}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
