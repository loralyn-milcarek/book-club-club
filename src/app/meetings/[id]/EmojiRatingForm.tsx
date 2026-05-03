"use client";

import { useState } from "react";
import { rateMeeting } from "@/lib/actions";

const EMOJI_OPTIONS = ["📚", "✨", "💕", "😂", "🎉", "🌿", "🧵", "🍷", "🤔", "😢", "🔥", "💫"];

export default function EmojiRatingForm({
  meetingId,
  currentEmojis,
}: {
  meetingId: string;
  currentEmojis: string[];
}) {
  const [selected, setSelected] = useState<string[]>(currentEmojis);

  function toggle(emoji: string) {
    setSelected((prev) => {
      if (prev.includes(emoji)) return prev.filter((e) => e !== emoji);
      if (prev.length >= 3) return prev;
      return [...prev, emoji];
    });
  }

  const action = rateMeeting.bind(null, meetingId);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="emojis" value={selected.join(",")} />

      <div>
        <p className="text-xs text-bark-muted mb-2">Pick up to 3 emojis for this meeting</p>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => toggle(emoji)}
              className={`text-xl w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                selected.includes(emoji)
                  ? "bg-blush-light ring-2 ring-blush scale-110"
                  : "bg-cream hover:bg-lace"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={selected.length === 0}
        className="rounded-full bg-blush px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-blush-dark hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
        style={{ boxShadow: "var(--shadow-warm)" }}
      >
        {currentEmojis.length > 0 ? "Update rating" : "Rate this meeting"}
      </button>
    </form>
  );
}
