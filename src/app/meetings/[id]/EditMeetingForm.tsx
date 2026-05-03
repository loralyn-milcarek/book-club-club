"use client";

import { updateMeeting } from "@/lib/actions";

export default function EditMeetingForm({
  meetingId,
  date,
  location,
  notes,
}: {
  meetingId: string;
  date: string;
  location: string;
  notes: string;
}) {
  const action = updateMeeting.bind(null, meetingId);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="edit-date" className="text-sm font-semibold text-bark">
          Date <span className="text-blush">*</span>
        </label>
        <input
          id="edit-date"
          name="date"
          type="date"
          required
          defaultValue={date}
          className="w-full rounded-xl border border-lace bg-cream px-4 py-2.5 text-bark text-sm focus:outline-none focus:border-blush transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="edit-location" className="text-sm font-semibold text-bark">
          Location
        </label>
        <input
          id="edit-location"
          name="location"
          type="text"
          defaultValue={location}
          placeholder="e.g. Sarah's place, Coffee Bean on Main…"
          className="w-full rounded-xl border border-lace bg-cream px-4 py-2.5 text-bark text-sm placeholder:text-bark-muted focus:outline-none focus:border-blush transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="edit-notes" className="text-sm font-semibold text-bark">
          Notes
        </label>
        <textarea
          id="edit-notes"
          name="notes"
          rows={3}
          defaultValue={notes}
          placeholder="Anything to bring, agenda, etc."
          className="w-full rounded-xl border border-lace bg-cream px-4 py-2.5 text-bark text-sm placeholder:text-bark-muted focus:outline-none focus:border-blush transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-sage py-2.5 text-sm font-semibold text-white transition-all hover:bg-sage/80 hover:-translate-y-0.5"
        style={{ boxShadow: "var(--shadow-warm)" }}
      >
        Save changes
      </button>
    </form>
  );
}
