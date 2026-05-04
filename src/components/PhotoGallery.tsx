import { Camera, Palette } from "lucide-react";
import PhotoCard from "./PhotoCard";
import PhotoUploader from "./PhotoUploader";
import PhotoComments from "./PhotoComments";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
  uploadedByUserId: string;
  uploadedBy: { name: string | null; email: string | null };
};

type Comment = {
  id: string;
  text: string;
  userId: string;
  createdAt: Date;
  user: { name: string | null; email: string | null };
};

type Props = {
  meetingId: string;
  activity?: string | null;
  photos: Photo[];
  comments: Comment[];
  currentUserId: string;
  isPast: boolean;
};

const rotationPattern: Array<"left" | "right" | "none"> = [
  "left", "right", "none", "right", "left",
];

export default function PhotoGallery({ meetingId, activity, photos, comments, currentUserId, isPast }: Props) {
  const hasContent = activity || photos.length > 0 || comments.length > 0;

  if (!hasContent && !isPast) return null;

  return (
    <section
      className="bg-parchment rounded-2xl p-4 border border-lace space-y-4"
      style={{ boxShadow: "var(--shadow-warm)" }}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-bark-muted">
        <Camera size={11} strokeWidth={2} className="text-blush" />
        {activity ? "Activity" : "Photos"}
      </div>

      {activity && (
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-bark">{activity}</p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 py-2">
          {photos.map((photo, i) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              currentUserId={currentUserId}
              rotate={rotationPattern[i % rotationPattern.length]}
            />
          ))}
        </div>
      )}

      {isPast && (
        <PhotoUploader meetingId={meetingId} />
      )}

      {isPast && (photos.length > 0 || comments.length > 0) && (
        <div className="pt-2 border-t border-lace">
          <PhotoComments
            meetingId={meetingId}
            comments={comments}
            currentUserId={currentUserId}
          />
        </div>
      )}

      {isPast && photos.length === 0 && comments.length === 0 && (
        <p className="text-sm text-bark-muted text-center py-2">
          Add photos from this meeting to remember the vibe ✨
        </p>
      )}
    </section>
  );
}
