"use client";

import { useState, useRef, useEffect } from "react";
import { BookOpen } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  iconSize?: number;
};

export default function CoverImage({ src, alt, className = "", iconSize = 24 }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <div className={`relative overflow-hidden bg-lace flex items-center justify-center ${className}`}>
      <BookOpen size={iconSize} className="text-bark-muted" strokeWidth={1.5} />
      {!failed && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
