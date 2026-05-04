"use client";

import { useTransition } from "react";
import { archiveNomination, restoreNomination } from "@/lib/actions";
import VoteButton from "@/components/VoteButton";
import CoverImage from "@/components/CoverImage";
import { Archive, RotateCcw, Star, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

type Nomination = {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  googleBooksId: string | null;
  blurb: string;
  gbDescription: string | null;
  gbRating: number | null;
  gbRatingCount: number | null;
  status: string;
  nominatedBy: { id: string; name: string | null; email: string | null };
  votes: { userId: string; voteType: string }[];
};

function displayName(u: { name: string | null; email: string | null }) {
  return u.name || (u.email ?? "").split("@")[0];
}

function formatRatingCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

const boxClass = "rounded-2xl bg-cream border border-lace px-3 py-2.5 text-xs text-bark/80 leading-relaxed";
const labelClass = "text-[10px] font-medium uppercase tracking-wider text-bark-muted mb-1";

export default function NominationCard({
  nomination,
  currentUserId,
}: {
  nomination: Nomination;
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const isArchived = nomination.status === "ARCHIVED";

  const myVote = nomination.votes.find((v) => v.userId === currentUserId)?.voteType ?? null;
  const upCount = nomination.votes.filter((v) => v.voteType === "UP").length;
  const downCount = nomination.votes.filter((v) => v.voteType === "DOWN").length;

  const nomName = displayName(nomination.nominatedBy);
  const gbUrl = nomination.googleBooksId
    ? `https://books.google.com/books?id=${nomination.googleBooksId}`
    : null;
  const hasGbSection = nomination.gbRating !== null || !!nomination.gbDescription;

  return (
    <div
      className={`bg-parchment rounded-3xl border border-lace p-4 space-y-2.5 transition-opacity ${isArchived ? "opacity-60" : ""}`}
      style={{ boxShadow: "var(--shadow-warm)" }}
    >
      <div className="flex gap-4">
        <div className="shrink-0">
          <CoverImage
            src={nomination.coverUrl ?? ""}
            alt={nomination.title}
            className="w-14 h-20 rounded-xl"
            iconSize={20}
          />
        </div>
        <div className="flex-1 min-w-0 space-y-0.5 pt-0.5">
          <p className="font-semibold text-bark text-sm leading-snug line-clamp-2">
            {nomination.title}
          </p>
          {nomination.author && (
            <p className="text-xs text-bark-muted">{nomination.author}</p>
          )}
        </div>
      </div>

      <div className={boxClass}>
        <p className={labelClass}>{nomName} says...</p>
        {nomination.blurb}
      </div>

      {hasGbSection && (
        <div className={boxClass}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {gbUrl ? (
                <a
                  href={gbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={labelClass + " mb-0 flex items-center gap-1 hover:text-bark transition-colors"}
                >
                  Google Books says...
                  <ExternalLink size={9} strokeWidth={2.5} />
                </a>
              ) : (
                <p className={labelClass + " mb-0"}>Google Books says...</p>
              )}
            </div>
            {nomination.gbRating !== null && (
              <div className="flex items-center gap-1">
                <Star size={10} className="fill-bark-muted text-bark-muted shrink-0" />
                <span className="text-[10px] text-bark-muted">
                  {nomination.gbRating}
                  {nomination.gbRatingCount !== null && (
                    <> · {formatRatingCount(nomination.gbRatingCount)}</>
                  )}
                </span>
              </div>
            )}
          </div>
          {nomination.gbDescription ? (
            <p className="line-clamp-3">{nomination.gbDescription}</p>
          ) : (
            <p className="text-bark-muted italic">No description available.</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5">
          {!isArchived && (
            <>
              <VoteButton
                nominationId={nomination.id}
                voteType="UP"
                isActive={myVote === "UP"}
                count={upCount}
              />
              <VoteButton
                nominationId={nomination.id}
                voteType="DOWN"
                isActive={myVote === "DOWN"}
                count={downCount}
              />
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isArchived && (
            <Link
              href={`/books/add?nominationId=${nomination.id}`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-bark-muted hover:text-bark hover:bg-lace transition-colors"
              title="We're reading this"
            >
              <Sparkles size={12} strokeWidth={2} />
              We&rsquo;re reading this
            </Link>
          )}
          <button
            onClick={() =>
              startTransition(() =>
                isArchived ? restoreNomination(nomination.id) : archiveNomination(nomination.id)
              )
            }
            disabled={isPending}
            title={isArchived ? "Restore" : "Archive"}
            className="p-1.5 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isArchived ? (
              <RotateCcw size={13} strokeWidth={2} />
            ) : (
              <Archive size={13} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
