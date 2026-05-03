"use client";

import { useState, useTransition } from "react";
import { Archive } from "lucide-react";
import { archiveMeeting } from "@/lib/actions";

export default function DeleteMeetingButton({
  meetingId,
  isPast,
}: {
  meetingId: string;
  isPast: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (isPast) return null;

  function handleArchive() {
    startTransition(async () => {
      await archiveMeeting(meetingId);
    });
  }

  if (confirming) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-bark-muted">
          This hides the meeting for everyone. Ratings and reading progress are preserved.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleArchive}
            disabled={pending}
            className="rounded-full bg-blush px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-blush-dark disabled:opacity-50"
          >
            {pending ? "Archiving…" : "Yes, archive it"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="rounded-full px-4 py-1.5 text-sm font-semibold text-bark-muted hover:text-bark hover:bg-lace transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 text-sm text-bark-muted hover:text-blush transition-colors"
    >
      <Archive size={14} strokeWidth={1.75} />
      Archive meeting
    </button>
  );
}
