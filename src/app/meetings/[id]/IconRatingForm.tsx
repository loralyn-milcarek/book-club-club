"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { rateMeeting } from "@/lib/actions";
import { RATING_ICONS } from "@/lib/ratingIcons";
import { RatingIcon } from "@/components/RatingIcon";

export default function IconRatingForm({
  meetingId,
  currentIcons,
}: {
  meetingId: string;
  currentIcons: string[];
}) {
  const hasExisting = currentIcons.length > 0;
  const [open, setOpen] = useState(!hasExisting);
  const [selected, setSelected] = useState<string[]>(currentIcons);

  function toggle(name: string) {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (prev.length >= 3) return prev;
      return [...prev, name];
    });
  }

  const action = rateMeeting.bind(null, meetingId);

  return (
    <div className="space-y-3">
      {/* Toggle button — shown when there's already a review */}
      {hasExisting && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-xs text-bark-muted hover:text-bark transition-colors"
        >
          {open ? <ChevronUp size={13} strokeWidth={2} /> : <ChevronDown size={13} strokeWidth={2} />}
          {open ? "Hide" : "Update your review"}
        </button>
      )}

      {open && (
        <form action={action} className="space-y-3">
          <input type="hidden" name="icons" value={selected.join(",")} />

          <p className="text-xs text-bark-muted">Pick up to 3 icons that describe this book</p>

          <div className="grid grid-cols-5 gap-1.5">
            {RATING_ICONS.map(({ name, label }) => {
              const isSelected = selected.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  title={label}
                  onClick={() => toggle(name)}
                  className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-blush-light ring-2 ring-blush"
                      : "bg-cream hover:bg-lace"
                  }`}
                >
                  <RatingIcon
                    name={name}
                    size={18}
                    className={isSelected ? "text-blush" : "text-bark-muted"}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={selected.length === 0}
              className="rounded-full bg-blush px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-blush-dark hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
              style={{ boxShadow: "var(--shadow-warm)" }}
            >
              {hasExisting ? "Update review" : "Add review"}
            </button>
            {hasExisting && (
              <button
                type="button"
                onClick={() => { setSelected(currentIcons); setOpen(false); }}
                className="rounded-full border border-lace px-4 py-2 text-sm text-bark-muted hover:bg-lace transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {!open && !hasExisting && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs text-bark-muted hover:text-bark transition-colors"
        >
          + Add your review
        </button>
      )}
    </div>
  );
}
