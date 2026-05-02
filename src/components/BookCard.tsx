import type { Book, Meeting, ReadingSession, User } from "@prisma/client";
import { Calendar, Users, BookOpen, X } from "lucide-react";
import ProgressBar from "./ProgressBar";
import LogProgressForm from "./LogProgressForm";
import { setBookInactive } from "@/lib/actions";

type BookWithMeeting = Book & { meeting: Meeting | null };
type SessionWithUser = ReadingSession & {
  user: Pick<User, "id" | "name" | "email" | "progressPublic">;
};

type Props = {
  book: BookWithMeeting;
  sessions: SessionWithUser[];
  currentUserId: string;
  currentUserProgressPublic: boolean;
};

function getLatestPerUser(sessions: SessionWithUser[]) {
  const map = new Map<string, SessionWithUser>();
  for (const s of sessions) {
    if (!map.has(s.userId)) map.set(s.userId, s);
  }
  return map;
}

function calcExpectedPercent(book: BookWithMeeting): number | undefined {
  if (!book.meeting) return undefined;
  const now = Date.now();
  const start = book.createdAt.getTime();
  const end = book.meeting.date.getTime();
  if (end <= start) return 100;
  return Math.min(((now - start) / (end - start)) * 100, 100);
}

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

function displayName(user: Pick<User, "name" | "email">) {
  return user.name || (user.email ?? "").split("@")[0];
}

function formatProgress(session: SessionWithUser | undefined, book: Book) {
  if (!session) return "Not started";
  if (session.page && book.totalPages) return `${session.page} / ${book.totalPages} pp`;
  if (session.percent != null) return `${Math.round(session.percent)}%`;
  return "In progress";
}

export default function BookCard({
  book,
  sessions,
  currentUserId,
  currentUserProgressPublic,
}: Props) {
  const latestPerUser = getLatestPerUser(sessions);
  const expectedPercent = calcExpectedPercent(book);
  const days = book.meeting ? daysUntil(book.meeting.date) : null;

  const mySession = latestPerUser.get(currentUserId);
  const myPage = mySession?.page ?? null;
  const myPercent = mySession?.percent ?? 0;

  const allParticipants = Array.from(
    new Map(sessions.map((s) => [s.userId, s.user])).values()
  );

  const removeAction = setBookInactive.bind(null, book.id);

  return (
    <div
      className="bg-parchment rounded-3xl p-5 border border-lace space-y-4"
      style={{ boxShadow: "var(--shadow-warm)" }}
    >
      <div className="flex gap-4">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="w-16 h-24 object-cover rounded-xl shrink-0 shadow-sm"
          />
        ) : (
          <div className="w-16 h-24 rounded-xl bg-lace flex items-center justify-center shrink-0">
            <BookOpen size={24} className="text-bark-muted" strokeWidth={1.5} />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1">
          <h2 className="font-display font-bold text-bark text-lg leading-tight line-clamp-2">
            {book.title}
          </h2>
          {book.author && (
            <p className="text-sm text-bark-muted">{book.author}</p>
          )}
          {book.meeting && (
            <div className="flex items-center gap-1.5 text-xs text-bark-muted pt-1">
              <Calendar size={12} strokeWidth={1.75} />
              <span>
                Meeting{" "}
                {book.meeting.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
                {days !== null && (
                  <span className={days < 0 ? "text-blush" : days <= 7 ? "text-blush font-medium" : ""}>
                    {" "}·{" "}
                    {days < 0
                      ? `${Math.abs(days)}d ago`
                      : days === 0
                      ? "today"
                      : `${days}d left`}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        <form action={removeAction} className="shrink-0">
          <button
            type="submit"
            title="Mark as finished"
            className="p-1.5 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors cursor-pointer"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </form>
      </div>

      {allParticipants.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-bark-muted">
            <Users size={11} strokeWidth={2} />
            Reading progress
          </div>
          {allParticipants.map((member) => {
            const session = latestPerUser.get(member.id);
            const isMe = member.id === currentUserId;
            const isHidden = !member.progressPublic && !isMe;
            const pct = session?.percent ?? 0;

            return (
              <div key={member.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${isMe ? "text-bark" : "text-bark-muted"}`}>
                    {displayName(member)}
                    {isMe && <span className="text-xs text-bark-muted font-normal"> (you)</span>}
                  </span>
                  {isHidden ? (
                    <span className="text-xs text-bark-muted italic">hidden</span>
                  ) : (
                    <span className="text-xs text-bark-muted">
                      {formatProgress(session, book)}
                      {expectedPercent !== undefined && session && (
                        <span className="ml-1.5">
                          {pct >= expectedPercent ? "✅" : "⚠️"}
                        </span>
                      )}
                    </span>
                  )}
                </div>
                {!isHidden && (
                  <ProgressBar
                    percent={pct}
                    expectedPercent={expectedPercent}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <LogProgressForm
        bookId={book.id}
        format={book.format}
        totalPages={book.totalPages}
        currentPage={myPage}
        currentPercent={mySession?.percent ?? null}
        progressPublic={currentUserProgressPublic}
      />
    </div>
  );
}
