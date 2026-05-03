"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toggleAvailability } from "@/lib/actions";

type BlocksByDate = Record<string, { name: string; email: string | null }[]>;

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function AvailabilityCalendar({
  myBlocks,
  blocksByDate,
  currentUserId,
}: {
  myBlocks: string[];
  blocksByDate: BlocksByDate;
  currentUserId: string;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [optimisticBlocks, setOptimisticBlocks] = useState<Set<string>>(new Set(myBlocks));
  const [, startTransition] = useTransition();

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function dateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function handleToggle(day: number) {
    const key = dateKey(day);
    setOptimisticBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    startTransition(async () => {
      await toggleAvailability(key);
    });
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div
      className="bg-parchment rounded-3xl p-5 border border-lace space-y-4"
      style={{ boxShadow: "var(--shadow-warm)" }}
    >
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
        >
          <ChevronLeft size={18} strokeWidth={1.75} />
        </button>
        <span className="font-display font-bold text-bark">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
        >
          <ChevronRight size={18} strokeWidth={1.75} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-bark-muted py-1">
            {d}
          </div>
        ))}

        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const key = dateKey(day);
          const isMyBlock = optimisticBlocks.has(key);
          const otherBlockers = (blocksByDate[key] ?? []).filter((b) => b.email !== currentUserId);
          const totalBlocked = (blocksByDate[key] ?? []).length + (isMyBlock && !myBlocks.includes(key) ? 1 : 0);
          const isToday = key === todayKey;

          return (
            <button
              key={day}
              onClick={() => handleToggle(day)}
              title={
                otherBlockers.length > 0
                  ? `${otherBlockers.map((b) => b.name).join(", ")} unavailable`
                  : undefined
              }
              className={`
                relative aspect-square rounded-xl text-sm font-medium transition-all
                ${isMyBlock
                  ? "bg-blush text-white"
                  : isToday
                  ? "ring-2 ring-blush text-bark hover:bg-lace"
                  : "text-bark hover:bg-lace"
                }
              `}
            >
              {day}
              {otherBlockers.length > 0 && (
                <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-sage" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-xs text-bark-muted pt-1 border-t border-lace">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blush" />
          You&apos;re unavailable
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-sage" />
          Others unavailable
        </div>
      </div>

      <p className="text-xs text-bark-muted text-center">
        Tap a date to mark yourself unavailable. Visible to everyone.
      </p>
    </div>
  );
}
