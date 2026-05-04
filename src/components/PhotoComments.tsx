"use client";

import { useRef, useTransition } from "react";
import { Trash2, Send } from "lucide-react";
import { addGalleryComment, deleteGalleryComment } from "@/lib/actions";

type Comment = {
  id: string;
  text: string;
  userId: string;
  createdAt: Date;
  user: { name: string | null; email: string | null };
};

type Props = {
  meetingId: string;
  comments: Comment[];
  currentUserId: string;
};

function displayName(user: { name: string | null; email: string | null }) {
  return user.name || (user.email ?? "").split("@")[0];
}

export default function PhotoComments({ meetingId, comments, currentUserId }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = (formData.get("text") as string).trim();
    if (!text) return;
    startTransition(async () => {
      await addGalleryComment(meetingId, formData);
      formRef.current?.reset();
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-widest text-bark-muted">
        Comments ({comments.length})
      </p>

      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5 group">
              <div className="shrink-0 w-7 h-7 rounded-full bg-blush-light flex items-center justify-center text-xs font-bold text-blush-dark">
                {displayName(c.user).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-semibold text-bark">{displayName(c.user)}</span>
                  <span className="text-xs text-bark-muted">
                    {c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-bark mt-0.5">{c.text}</p>
              </div>
              {c.userId === currentUserId && (
                <form
                  action={deleteGalleryComment.bind(null, c.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    type="submit"
                    title="Delete comment"
                    className="p-1 text-bark-muted hover:text-blush transition-colors"
                  >
                    <Trash2 size={12} strokeWidth={2} />
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2">
        <input
          name="text"
          type="text"
          placeholder="Leave a comment…"
          maxLength={300}
          className="flex-1 rounded-full border border-lace bg-cream px-4 py-2 text-sm text-bark placeholder:text-bark-muted/60 focus:border-blush focus:ring-2 focus:ring-blush/20 outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 w-10 h-10 self-center flex items-center justify-center rounded-full bg-blush text-white hover:bg-blush-dark disabled:opacity-60 transition-colors"
        >
          <Send size={15} strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}
