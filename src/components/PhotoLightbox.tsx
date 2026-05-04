"use client";

import { useEffect } from "react";
import { X, Download } from "lucide-react";

type Props = {
  url: string;
  caption: string | null;
  onClose: () => void;
};

export default function PhotoLightbox({ url, caption, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleDownload() {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = caption ? `${caption}.jpg` : "photo.jpg";
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bark/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full max-h-[90vh] flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full overflow-hidden rounded-xl bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={caption ?? "Activity photo"}
            className="w-full max-h-[75vh] object-contain"
          />
        </div>

        {caption && (
          <p className="font-display text-white text-center text-sm px-4 drop-shadow">
            {caption}
          </p>
        )}

        <div className="flex justify-center gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 text-sm text-white font-medium transition-colors"
          >
            <Download size={14} strokeWidth={2} />
            Save photo
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white text-bark hover:bg-lace transition-colors"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
