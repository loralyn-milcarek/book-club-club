"use client";

import { useEffect, useRef, useState } from "react";
import {
  Heart, Star, Flame, Sparkles, Zap,
  Laugh, Smile, Meh, Frown, HeartOff,
  BookOpen, Quote, Feather, Bookmark, PenLine,
  Coffee, Moon, Sun, Cloud, Umbrella,
  Skull, Ghost, Eye, Search, CircleAlert,
  Trophy, ThumbsUp, ThumbsDown, Crown, MessageSquare,
  Bed,
  type LucideIcon,
} from "lucide-react";
import { RATING_ICONS } from "@/lib/ratingIcons";

const iconMap: Record<string, LucideIcon> = {
  Heart, Star, Flame, Sparkles, Zap,
  Laugh, Smile, Meh, Frown, HeartOff,
  BookOpen, Quote, Feather, Bookmark, PenLine,
  Coffee, Moon, Sun, Cloud, Umbrella,
  Skull, Ghost, Eye, Search, CircleAlert,
  Trophy, ThumbsUp, ThumbsDown, Crown, MessageSquare,
  Bed,
};

const labelMap: Record<string, string> = Object.fromEntries(
  RATING_ICONS.map(({ name, label }) => [name, label])
);

export function RatingIcon({
  name,
  size = 16,
  className = "text-bark",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = iconMap[name];
  const label = labelMap[name];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  if (!Icon) return null;

  return (
    <span ref={ref} className="relative inline-flex group">
      <span
        className="inline-flex cursor-default"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon size={size} strokeWidth={1.75} className={className} />
      </span>

      {label && (
        <span
          className={`
            pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            px-2 py-1 rounded-lg bg-bark text-white text-xs whitespace-nowrap z-30
            transition-opacity duration-100
            ${open ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          `}
        >
          {label}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bark" />
        </span>
      )}
    </span>
  );
}
