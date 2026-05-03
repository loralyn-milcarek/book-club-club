"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { setBookInactive } from "@/lib/actions";

export default function RemoveBookButton({ bookId }: { bookId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        title="Mark as finished"
        className="p-1.5 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors cursor-pointer"
      >
        <X size={14} strokeWidth={2} />
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <p className="text-xs text-bark-muted text-right leading-tight">
        Mark finished<br />for everyone?
      </p>
      <div className="flex gap-1.5">
        <button
          onClick={() => startTransition(() => setBookInactive(bookId))}
          className="rounded-full bg-blush px-3 py-1 text-xs font-semibold text-white hover:bg-blush-dark transition-colors"
        >
          Yes
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-full px-3 py-1 text-xs font-semibold text-bark-muted hover:text-bark hover:bg-lace transition-colors"
        >
          No
        </button>
      </div>
    </div>
  );
}
