"use client";

import { useTransition } from "react";
import { toggleNominationVote } from "@/lib/actions";
import { Heart, Meh } from "lucide-react";

export default function VoteButton({
  nominationId,
  voteType,
  isActive,
  count,
}: {
  nominationId: string;
  voteType: "UP" | "DOWN";
  isActive: boolean;
  count: number;
}) {
  const [isPending, startTransition] = useTransition();
  const isUp = voteType === "UP";

  return (
    <button
      onClick={() => startTransition(() => toggleNominationVote(nominationId, voteType))}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-50 cursor-pointer ${
        isActive
          ? isUp
            ? "bg-blush text-white hover:bg-blush-dark"
            : "bg-lace text-bark hover:bg-lace"
          : "bg-lace text-bark-muted hover:bg-blush-light hover:text-blush"
      } ${isActive && !isUp ? "ring-1 ring-bark/20" : ""}`}
    >
      {isUp ? (
        <Heart size={13} strokeWidth={2} className={isActive ? "fill-white" : ""} />
      ) : (
        <Meh size={13} strokeWidth={2} />
      )}
      {count > 0 && count}
    </button>
  );
}
