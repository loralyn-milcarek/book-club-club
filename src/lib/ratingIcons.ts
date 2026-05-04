export type RatingIconDef = { name: string; label: string };

export const RATING_ICONS: RatingIconDef[] = [
  // feelings
  { name: "Flame",         label: "Couldn't put it down" },
  { name: "Heart",         label: "Loved it" },
  { name: "Smile",         label: "Enjoyed it" },
  { name: "Meh",           label: "It was fine" },
  { name: "Frown",         label: "Disappointing" },
  // reading vibes
  { name: "BookOpen",      label: "Page-turner" },
  { name: "Quote",         label: "Beautifully written" },
  { name: "PenLine",       label: "Great storytelling" },
  { name: "Eye",           label: "Eye-opening" },
  { name: "Bed",           label: "Boring" },
  // mood
  { name: "Sun",           label: "Uplifting" },
  { name: "Coffee",        label: "Cozy" },
  { name: "Cloud",         label: "Melancholy" },
  { name: "Moon",          label: "Dark" },
  { name: "CircleAlert",   label: "Thought-provoking" },
];
