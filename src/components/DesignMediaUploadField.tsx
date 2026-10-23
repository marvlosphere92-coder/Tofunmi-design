"use client";

import { useState } from "react";
import { CldUploadButton } from "next-cloudinary";

export function DesignMediaUploadField({
  initialPhotos = [],
  initialVideos = [],
}: {
  initialPhotos?: string[];
  initialVideos?: string[];
}) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [videos, setVideos] = useState<string[]>(initialVideos);

  return (
    <div className="space-y-3">
      {(photos.length > 0 || videos.length > 0) && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((url) => (
            <div key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-square rounded-md object-cover w-full" />
              <button
                type="button"
                onClick={() => setPhotos((prev) => prev.filter((u) => u !== url))}
                className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full w-5 h-5 transition hover:bg-black/80 active:scale-90"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
          {videos.map((url) => (
            <div key={url} className="relative">
              <video src={url} className="aspect-square rounded-md object-cover w-full bg-black" muted />
              <button
                type="button"
                onClick={() => setVideos((prev) => prev.filter((u) => u !== url))}
                className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full w-5 h-5 transition hover:bg-black/80 active:scale-90"
                aria-label="Remove video"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.map((url) => (
        <input key={url} type="hidden" name="photoUrls" value={url} />
      ))}
      {videos.map((url) => (
        <input key={url} type="hidden" name="videoUrls" value={url} />
      ))}

      <CldUploadButton
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{ multiple: true, maxFiles: 20, resourceType: "auto" }}
        className="rounded-md border border-accent-soft px-3 py-2 text-sm transition hover:bg-accent-soft active:scale-95"
        onSuccess={(result) => {
          if (typeof result.info !== "object" || !result.info || !("secure_url" in result.info)) {
            return;
          }
          const url = result.info.secure_url as string;
          const resourceType = (result.info as { resource_type?: string }).resource_type;
          if (resourceType === "video") {
            setVideos((prev) => [...prev, url]);
          } else {
            setPhotos((prev) => [...prev, url]);
          }
        }}
      >
        Add photos or videos ({photos.length + videos.length} added)
      </CldUploadButton>
      <p className="text-xs text-foreground/70">
        The first photo is used as the cover shown in the lookbook grid.
      </p>
    </div>
  );
}
