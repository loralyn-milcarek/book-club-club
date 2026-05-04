"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, X, ImagePlus } from "lucide-react";
import { uploadActivityPhoto } from "@/lib/actions";

type Props = {
  meetingId: string;
};

export default function PhotoUploader({ meetingId }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setError(null);
  }

  function clearFile() {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    formData.set("file", file);
    setError(null);
    startTransition(async () => {
      try {
        await uploadActivityPhoto(meetingId, formData);
        formRef.current?.reset();
        clearFile();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    });
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        id={`photo-upload-${meetingId}`}
      />

      {!preview ? (
        <label
          htmlFor={`photo-upload-${meetingId}`}
          className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-dashed border-lace bg-cream hover:border-blush-light hover:bg-blush-light/20 transition-colors cursor-pointer group"
        >
          <ImagePlus size={24} className="text-bark-muted group-hover:text-blush transition-colors" strokeWidth={1.5} />
          <span className="text-sm text-bark-muted group-hover:text-blush transition-colors">
            Add a photo
          </span>
        </label>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-lace">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full object-cover max-h-64" />
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-bark/60 text-white hover:bg-bark transition-colors"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>

          <input
            type="text"
            name="caption"
            placeholder="Add a caption (optional)"
            maxLength={120}
            className="w-full rounded-xl border border-lace bg-cream px-3 py-2 text-sm text-bark placeholder:text-bark-muted/60 focus:border-blush focus:ring-2 focus:ring-blush/20 outline-none"
          />

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearFile}
              className="flex-1 rounded-full border border-lace px-4 py-2 text-sm text-bark-muted hover:bg-lace transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-blush px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blush-dark disabled:opacity-60"
            >
              <Camera size={14} strokeWidth={2} />
              {isPending ? "Uploading…" : "Save photo"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
