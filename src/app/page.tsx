import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { BookOpen, Sparkles, Settings, Calendar, UsersRound, Lightbulb, Palette } from "lucide-react";
import BookCard from "@/components/BookCard";
import { RatingIcon } from "@/components/RatingIcon";

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

  const [currentBooks, pastBooks, currentUser, allSessions, nextMeeting] = await Promise.all([
    prisma.book.findMany({
      where: { isActive: true, meeting: { date: { gte: now }, archivedAt: null } },
      include: {
        meeting: true,
        suggestedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { meeting: { date: "asc" } },
    }),
    prisma.book.findMany({
      where: { meeting: { date: { lt: now }, archivedAt: null } },
      include: {
        meeting: {
          include: {
            ratings: { select: { icons: true } },
          },
        },
      },
      orderBy: { meeting: { date: "desc" } },
    }),
    prisma.user.findUnique({
      where: { id: currentUserId },
      select: { progressPublic: true },
    }),
    prisma.readingSession.findMany({
      where: { book: { isActive: true, meeting: { date: { gte: now } } } },
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
              href="/nominations"
              className="p-2 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
              title="Nominations"
            >
              <Lightbulb size={18} strokeWidth={1.75} />
            </Link>
            <Link
              href="/meetings"
              className="p-2 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
              title="Meetings"
            >
              <UsersRound size={18} strokeWidth={1.75} />
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
                <div className="flex items-center gap-1 text-xs text-bark-muted">
                  <BookOpen size={10} strokeWidth={2} className="shrink-0" />
                  <span className="truncate">{nextMeeting.books.map((b) => b.title).join(", ")}</span>
                </div>
              )}
              {nextMeeting.activity && (
                <div className="flex items-center gap-1 text-xs text-bark-muted">
                  <Palette size={10} strokeWidth={2} className="text-blush shrink-0" />
                  <span className="truncate">{nextMeeting.activity}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-blush font-medium group-hover:underline shrink-0">Details →</span>
          </Link>
        )}

        {currentBooks.length === 0 && pastBooks.length === 0 ? (
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
              <p className="text-bark-muted text-sm">Nominate a book and schedule a meeting to get started.</p>
            </div>
            <Link
              href="/nominations"
              className="inline-flex items-center gap-2 rounded-full bg-blush px-6 py-3 font-semibold text-white transition-all hover:bg-blush-dark hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-warm)" }}
            >
              <Sparkles size={15} strokeWidth={2} />
              See nominations
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {currentBooks.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-medium uppercase tracking-widest text-bark-muted">
                  Currently reading
                </p>
                {currentBooks.map((book) => (
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

            {pastBooks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-widest text-bark-muted">
                  Past reads
                </p>
                {pastBooks.map((book) => {
                  const allIcons = book.meeting?.ratings.flatMap((r) => r.icons) ?? [];
                  const uniqueIcons = [...new Set(allIcons)];
                  return (
                    <Link
                      key={book.id}
                      href={book.meeting ? `/meetings/${book.meeting.id}` : "#"}
                      className="flex items-center gap-3 bg-parchment rounded-2xl px-4 py-3 border border-lace hover:border-blush-light transition-all hover:-translate-y-0.5"
                      style={{ boxShadow: "var(--shadow-warm)" }}
                    >
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-lace flex flex-col items-center justify-center text-[10px] font-bold text-bark-muted">
                        <span className="text-sm leading-none">
                          {book.meeting?.date.toLocaleDateString("en-US", { day: "numeric" })}
                        </span>
                        <span className="uppercase tracking-wide">
                          {book.meeting?.date.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-bark truncate">{book.title}</p>
                        {book.author && <p className="text-xs text-bark-muted truncate">{book.author}</p>}
                      </div>
                      {uniqueIcons.length > 0 && (
                        <div className="flex gap-1.5 shrink-0">
                          {uniqueIcons.slice(0, 4).map((name) => (
                            <RatingIcon key={name} name={name} size={13} className="text-bark-muted" />
                          ))}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
