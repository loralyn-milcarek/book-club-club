"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import EditMeetingForm from "./EditMeetingForm";
import DeleteMeetingButton from "./DeleteMeetingButton";

export default function EditableSection({
  meetingId,
  date,
  location,
  notes,
  isPast,
}: {
  meetingId: string;
  date: string;
  location: string;
  notes: string;
  isPast: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-sm text-bark-muted hover:text-bark transition-colors"
      >
        <Pencil size={14} strokeWidth={1.75} />
        Edit details
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-bark-muted">Edit details</p>
        <button
          onClick={() => setEditing(false)}
          className="p-1 rounded-full text-bark-muted hover:text-bark hover:bg-lace transition-colors"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
      <EditMeetingForm meetingId={meetingId} date={date} location={location} notes={notes} />
      {!isPast && (
        <div className="pt-2 border-t border-lace">
          <DeleteMeetingButton meetingId={meetingId} isPast={isPast} />
        </div>
      )}
    </div>
  );
}
