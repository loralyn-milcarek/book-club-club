"use client";

import { useRef, useState, useTransition } from "react";
import { logProgress, toggleProgressVisibility } from "@/lib/actions";
import { BookOpen, Eye, EyeOff, Percent } from "lucide-react";
import type { Format } from "@prisma/client";

type Props = {
  bookId: string;
  format: Format;
  totalPages: number | null;
  currentPage: number | null;
  currentPercent: number | null;
  progressPublic: boolean;
};

export default function LogProgressForm({
  bookId,
  format,
  totalPages,
  currentPage,
  currentPercent,
  progressPublic,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [isToggling, startToggle] = useTransition();
  const [usePercent, setUsePercent] = useState(format === "AUDIO");
  const formRef = useRef<HTMLFormElement>(null);

  const logAction = logProgress.bind(null, bookId);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await logAction(formData);
      formRef.current?.reset();
    });
  }

  return (
    <div className="space-y-3 pt-3 border-t border-lace">
      <form ref={formRef} action={handleSubmit} className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {usePercent ? (
            <Percent size={14} className="text-bark-muted shrink-0" strokeWidth={1.75} />
          ) : (
            <BookOpen size={14} className="text-bark-muted shrink-0" strokeWidth={1.75} />
          )}

          {usePercent ? (
            <>
              <input
                key="percent"
                name="percent"
                type="number"
                min={0}
                max={100}
                step={1}
                defaultValue={currentPercent != null ? Math.round(currentPercent) : ""}
                placeholder="0–100"
                required
                className="w-full rounded-xl border border-lace bg-cream px-3 py-2 text-sm text-bark placeholder:text-bark-muted/60 focus:border-blush focus:outline-none focus:ring-2 focus:ring-blush/20 transition-colors"
              />
              <span className="text-sm text-bark-muted shrink-0">%</span>
            </>
          ) : (
            <>
              <input
                key="page"
                name="page"
                type="number"
                min={0}
                max={totalPages ?? undefined}
                defaultValue={currentPage ?? ""}
                placeholder="Current page"
                required
                className="w-full rounded-xl border border-lace bg-cream px-3 py-2 text-sm text-bark placeholder:text-bark-muted/60 focus:border-blush focus:outline-none focus:ring-2 focus:ring-blush/20 transition-colors"
              />
              {totalPages && (
                <span className="text-sm text-bark-muted shrink-0">/ {totalPages}</span>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => setUsePercent((p) => !p)}
            title={usePercent ? "Switch to pages" : "Switch to percent"}
            className="shrink-0 rounded-lg border border-lace bg-cream px-2 py-1.5 text-xs text-bark-muted hover:text-bark hover:border-bark-muted transition-colors cursor-pointer"
          >
            {usePercent ? "pg" : "%"}
          </button>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-full bg-blush px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blush-dark hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
        >
          {isPending ? "Saving…" : "Update"}
        </button>
      </form>

      <form
        action={() => startToggle(async () => { await toggleProgressVisibility(); })}
      >
        <button
          type="submit"
          disabled={isToggling}
          className="flex items-center gap-1.5 text-xs text-bark-muted hover:text-bark transition-colors cursor-pointer disabled:opacity-50"
        >
          {progressPublic ? (
            <Eye size={13} strokeWidth={1.75} />
          ) : (
            <EyeOff size={13} strokeWidth={1.75} />
          )}
          {progressPublic ? "Visible to group" : "Hidden from group"}
        </button>
      </form>
    </div>
  );
}
