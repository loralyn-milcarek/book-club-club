import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Calendar, MapPin, BookOpen, Plus, ChevronRight, ChevronLeft } from "lucide-react";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatDateShort(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function MeetingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const now = new Date();

  const meetings = await prisma.meeting.findMany({
    where: { archivedAt: null },
    include: {
      books: { select: { id: true, title: true, author: true, coverUrl: true } },
      ratings: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
    orderBy: { date: "desc" },
  });

  const upcoming = meetings.filter((m) => m.date >= now).reverse();
  const past = meetings.filter((m) => m.date < now);

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-2 -ml-2 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors" title="Back to reading">
              <ChevronLeft size={20} strokeWidth={1.75} />
            </Link>
            <h1 className="font-display text-2xl font-bold text-bark">Meetings</h1>
          </div>
          <Link
            href="/books/add"
            className="flex items-center gap-1.5 rounded-full bg-sage px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-sage/80 hover:-translate-y-0.5"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <Plus size={14} strokeWidth={2} />
            Add book
          </Link>
        </header>

        {upcoming.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-bark-muted">Upcoming</p>
            {upcoming.map((meeting) => (
              <MeetingRow key={meeting.id} meeting={meeting} isUpcoming />
            ))}
          </section>
        )}

        {past.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-bark-muted">Past meetings</p>
            {past.map((meeting) => (
              <MeetingRow key={meeting.id} meeting={meeting} isUpcoming={false} />
            ))}
          </section>
        )}

        {meetings.length === 0 && (
          <div
            className="bg-parchment rounded-3xl p-8 border border-lace text-center space-y-4"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <Calendar size={32} className="text-blush mx-auto" strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="font-display text-xl font-bold text-bark">No meetings yet</p>
              <p className="text-bark-muted text-sm">Add the next book club date to get started.</p>
            </div>
            <Link
              href="/books/add"
              className="inline-flex items-center gap-2 rounded-full bg-blush px-6 py-3 font-semibold text-white transition-all hover:bg-blush-dark hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-warm)" }}
            >
              <Plus size={15} strokeWidth={2} />
              Add the first book
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

type MeetingWithDetails = {
  id: string;
  date: Date;
  location: string | null;
  notes: string | null;
  books: { id: string; title: string; author: string | null; coverUrl: string | null }[];
  ratings: { emojis: string[]; user: { id: string; name: string | null; email: string | null } }[];
};

function MeetingRow({ meeting, isUpcoming }: { meeting: MeetingWithDetails; isUpcoming: boolean }) {
  const allEmojis = meeting.ratings.flatMap((r) => r.emojis);

  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="flex items-center gap-4 bg-parchment rounded-2xl p-4 border border-lace hover:border-blush-light transition-all hover:-translate-y-0.5 group"
      style={{ boxShadow: "var(--shadow-warm)" }}
    >
      <div className={`shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold ${isUpcoming ? "bg-blush-light text-blush-dark" : "bg-lace text-bark-muted"}`}>
        <span className="text-base leading-none">
          {meeting.date.toLocaleDateString("en-US", { day: "numeric" })}
        </span>
        <span className="uppercase tracking-wide">
          {meeting.date.toLocaleDateString("en-US", { month: "short" })}
        </span>
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="font-semibold text-bark text-sm">
          {meeting.date.toLocaleDateString("en-US", { weekday: "long" })}
        </p>
        {meeting.location && (
          <div className="flex items-center gap-1 text-xs text-bark-muted">
            <MapPin size={10} strokeWidth={1.75} />
            <span className="truncate">{meeting.location}</span>
          </div>
        )}
        {meeting.books.length > 0 && (
          <p className="text-xs text-bark-muted truncate">
            {meeting.books.map((b) => b.title).join(", ")}
          </p>
        )}
        {allEmojis.length > 0 && (
          <p className="text-sm">{allEmojis.join("")}</p>
        )}
      </div>

      <ChevronRight size={16} className="shrink-0 text-bark-muted group-hover:text-bark transition-colors" />
    </Link>
  );
}
