import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { BookOpen, Sparkles, PlusCircle, Settings, Calendar, CalendarDays, MapPin } from "lucide-react";
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

  const now = new Date();

  const [activeBooks, currentUser, allSessions, nextMeeting] = await Promise.all([
    prisma.book.findMany({
      where: { isActive: true },
      include: {
        meeting: true,
        suggestedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: currentUserId },
      select: { progressPublic: true },
    }),
    prisma.readingSession.findMany({
      where: { book: { isActive: true } },
      orderBy: { loggedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, progressPublic: true } },
      },
    }),
    prisma.meeting.findFirst({
      where: { date: { gte: now }, archivedAt: null },
      orderBy: { date: "asc" },
      include: { books: { select: { id: true, title: true } } },
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
              href="/meetings"
              className="p-2 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
              title="Meetings"
            >
              <CalendarDays size={18} strokeWidth={1.75} />
            </Link>
            <Link
              href="/availability"
              className="p-2 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
              title="Availability"
            >
              <Calendar size={18} strokeWidth={1.75} />
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

        {nextMeeting && (
          <Link
            href={`/meetings/${nextMeeting.id}`}
            className="flex items-center gap-3 bg-blush-light rounded-2xl px-4 py-3 border border-blush/20 hover:border-blush/40 transition-all hover:-translate-y-0.5 group"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-blush flex flex-col items-center justify-center text-white">
              <span className="text-sm font-bold leading-none">
                {nextMeeting.date.toLocaleDateString("en-US", { day: "numeric" })}
              </span>
              <span className="text-[9px] uppercase tracking-wide">
                {nextMeeting.date.toLocaleDateString("en-US", { month: "short" })}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-bark">
                Next meeting ·{" "}
                {nextMeeting.date.toLocaleDateString("en-US", { weekday: "long" })}
              </p>
              {nextMeeting.books.length > 0 && (
                <p className="text-xs text-bark-muted truncate">
                  {nextMeeting.books.map((b) => b.title).join(", ")}
                </p>
              )}
            </div>
            <span className="text-xs text-blush font-medium group-hover:underline shrink-0">Details →</span>
          </Link>
        )}

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
