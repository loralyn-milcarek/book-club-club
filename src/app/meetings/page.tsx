import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Calendar, MapPin, BookOpen, Plus, ChevronRight, ChevronLeft, Palette } from "lucide-react";
import { RatingIcon } from "@/components/RatingIcon";
import CoverImage from "@/components/CoverImage";

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
  activity: string | null;
  notes: string | null;
  books: { id: string; title: string; author: string | null; coverUrl: string | null }[];
  ratings: { icons: string[]; user: { id: string; name: string | null; email: string | null } }[];
};

function MeetingRow({ meeting, isUpcoming }: { meeting: MeetingWithDetails; isUpcoming: boolean }) {
  const allIcons = meeting.ratings.flatMap((r) => r.icons);
  const cover = meeting.books.find((b) => b.coverUrl)?.coverUrl ?? null;
  const hasTime = meeting.date.getHours() !== 0 || meeting.date.getMinutes() !== 0;
  const timeStr = hasTime
    ? meeting.date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    : null;

  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="flex items-center gap-3 bg-parchment rounded-2xl p-3 border border-lace hover:border-blush-light transition-all hover:-translate-y-0.5 group"
      style={{ boxShadow: "var(--shadow-warm)" }}
    >
      <div className={`shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center text-xs font-bold ${isUpcoming ? "bg-blush-light text-blush-dark" : "bg-lace text-bark-muted"}`}>
        <span className="text-base leading-none">
          {meeting.date.toLocaleDateString("en-US", { day: "numeric" })}
        </span>
        <span className="uppercase tracking-wide">
          {meeting.date.toLocaleDateString("en-US", { month: "short" })}
        </span>
      </div>

      {cover && (
        <CoverImage
          src={cover}
          alt=""
          className="shrink-0 w-8 h-11 rounded-lg"
          iconSize={12}
        />
      )}

      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-bark text-xs">
          {meeting.date.toLocaleDateString("en-US", { weekday: "long" })}
          {timeStr && <span className="text-bark-muted"> · {timeStr}</span>}
        </p>
        {meeting.books.length > 0 && (
          <div className="flex items-center gap-1.5">
            <BookOpen size={11} strokeWidth={1.75} className="text-bark-muted shrink-0" />
            <p className="font-semibold text-bark text-sm truncate">
              {meeting.books.map((b) => b.title).join(", ")}
            </p>
          </div>
        )}
        {meeting.location && (
          <div className="flex items-center gap-1 text-sm text-bark-muted">
            <MapPin size={10} strokeWidth={1.75} className="shrink-0" />
            <span className="truncate">{meeting.location}</span>
          </div>
        )}
        {meeting.activity && (
          <div className="flex items-center gap-1 text-sm text-bark-muted">
            <Palette size={10} strokeWidth={2} className="text-blush shrink-0" />
            <span className="truncate">{meeting.activity}</span>
          </div>
        )}
        {allIcons.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {[...new Set(allIcons)].map((name) => (
              <RatingIcon key={name} name={name} size={13} className="text-bark-muted" />
            ))}
          </div>
        )}
      </div>

      <ChevronRight size={16} className="shrink-0 text-bark-muted group-hover:text-bark transition-colors" />
    </Link>
  );
}
