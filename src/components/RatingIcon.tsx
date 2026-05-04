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
  if (!Icon) return null;
  return (
    <span title={labelMap[name]} className="inline-flex">
      <Icon size={size} strokeWidth={1.75} className={className} />
    </span>
  );
}
