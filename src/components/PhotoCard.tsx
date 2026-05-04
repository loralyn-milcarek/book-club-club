"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { deleteActivityPhoto } from "@/lib/actions";
import PhotoLightbox from "./PhotoLightbox";

type Props = {
  photo: {
    id: string;
    url: string;
    caption: string | null;
    uploadedByUserId: string;
    uploadedBy: { name: string | null; email: string | null };
  };
  currentUserId: string;
  rotate?: "left" | "right" | "none";
};

const rotations = {
  left: "-rotate-1",
  right: "rotate-1",
  none: "",
};

export default function PhotoCard({ photo, currentUserId, rotate = "none" }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isOwner = photo.uploadedByUserId === currentUserId;
  const deleteAction = deleteActivityPhoto.bind(null, photo.id);

  const uploaderName =
    photo.uploadedBy.name || (photo.uploadedBy.email ?? "").split("@")[0];

  return (
    <>
    <div
      className={`relative bg-white p-2 pb-0 border border-lace transition-transform hover:scale-[1.02] ${rotations[rotate]}`}
      style={{
        boxShadow: "0 4px 20px rgba(74,55,40,0.15), 0 1px 6px rgba(74,55,40,0.08)",
      }}
    >
      <button
        type="button"
        className="relative aspect-square w-full overflow-hidden bg-lace block cursor-zoom-in"
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={photo.url}
          alt={photo.caption ?? "Activity photo"}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 33vw"
        />
      </button>

      <div className="px-1 py-2 space-y-0.5 min-h-[3rem]">
        {photo.caption && (
          <p className="font-display text-sm text-bark leading-snug line-clamp-2">
            {photo.caption}
          </p>
        )}
        <p className="text-xs text-bark-muted">{uploaderName}</p>
      </div>

      {isOwner && (
        <form action={deleteAction} className="absolute top-4 right-4">
          <button
            type="submit"
            title="Delete photo"
            className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-bark-muted hover:text-blush hover:bg-white transition-colors"
            onClick={(e) => {
              if (!confirm("Delete this photo?")) e.preventDefault();
            }}
          >
            <Trash2 size={13} strokeWidth={2} />
          </button>
        </form>
      )}
    </div>

    {lightboxOpen && (
      <PhotoLightbox
        url={photo.url}
        caption={photo.caption}
        onClose={() => setLightboxOpen(false)}
      />
    )}
    </>
  );
}
