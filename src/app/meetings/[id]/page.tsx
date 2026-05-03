import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ChevronLeft, MapPin, BookOpen, StickyNote } from "lucide-react";
import EmojiRatingForm from "./EmojiRatingForm";
import EditableSection from "./EditableSection";
import { setBookActive } from "@/lib/actions";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const { id } = await params;

  const meeting = await prisma.meeting.findUnique({
    where: { id, archivedAt: null },
    include: {
      books: {
        select: { id: true, title: true, author: true, coverUrl: true, isActive: true },
      },
      ratings: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!meeting) notFound();

  const now = new Date();
  const isPast = meeting.date < now;
  const myRating = meeting.ratings.find((r) => r.userId === session.user!.id);

  const dateLabel = meeting.date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function displayName(user: { name: string | null; email: string | null }) {
    return user.name || (user.email ?? "").split("@")[0];
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <header className="flex items-center gap-2">
          <Link
            href="/meetings"
            className="p-2 -ml-2 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
          >
            <ChevronLeft size={20} strokeWidth={1.75} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-bark">{dateLabel}</h1>
            {meeting.location && (
              <div className="flex items-center gap-1 text-sm text-bark-muted">
                <MapPin size={12} strokeWidth={1.75} />
                {meeting.location}
              </div>
            )}
          </div>
        </header>

        {meeting.books.length > 0 && (
          <section
            className="bg-parchment rounded-2xl p-4 border border-lace space-y-2"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-bark-muted">Books</p>
            {meeting.books.map((book) => {
              const reactivateAction = setBookActive.bind(null, book.id);
              return (
                <div key={book.id} className="flex items-center gap-3">
                  <BookOpen size={14} className={`shrink-0 ${book.isActive ? "text-bark-muted" : "text-lace"}`} strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${book.isActive ? "text-bark" : "text-bark-muted line-through"}`}>
                      {book.title}
                    </p>
                    {book.author && <p className="text-xs text-bark-muted">{book.author}</p>}
                    {!book.isActive && <p className="text-xs text-bark-muted italic">Marked finished</p>}
                  </div>
                  {!book.isActive && (
                    <form action={reactivateAction} className="shrink-0">
                      <button
                        type="submit"
                        className="text-xs text-sage font-medium hover:text-sage/70 transition-colors"
                      >
                        Reactivate
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {meeting.notes && (
          <section
            className="bg-parchment rounded-2xl p-4 border border-lace space-y-2"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-bark-muted">
              <StickyNote size={11} strokeWidth={2} />
              Notes
            </div>
            <p className="text-sm text-bark whitespace-pre-wrap">{meeting.notes}</p>
          </section>
        )}

        {isPast && (
          <section
            className="bg-parchment rounded-2xl p-4 border border-lace space-y-3"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-bark-muted">
              How was it? ({meeting.ratings.length} rating{meeting.ratings.length !== 1 ? "s" : ""})
            </p>

            {meeting.ratings.length > 0 && (
              <div className="space-y-1">
                {meeting.ratings.map((r) => (
                  <div key={r.userId} className="flex items-center gap-2 text-sm">
                    <span className="text-bark-muted w-24 truncate">{displayName(r.user)}</span>
                    <span>{r.emojis.join("")}</span>
                  </div>
                ))}
              </div>
            )}

            <EmojiRatingForm
              meetingId={meeting.id}
              currentEmojis={myRating?.emojis ?? []}
            />
          </section>
        )}

        <div
          className="bg-parchment rounded-2xl px-4 py-3 border border-lace"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          <EditableSection
            meetingId={meeting.id}
            date={meeting.date.toISOString().split("T")[0]}
            location={meeting.location ?? ""}
            notes={meeting.notes ?? ""}
            isPast={isPast}
          />
        </div>
      </div>
    </main>
  );
}
