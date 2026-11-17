"use client";

import { useRef, useState } from "react";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

async function uploadToCloudinary(file: File): Promise<{ url: string; isVideo: boolean }> {
  const isVideo = file.type.startsWith("video/");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${
      isVideo ? "video" : "image"
    }/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return { url: data.secure_url as string, isVideo };
}

export function DesignMediaUploadField({
  initialPhotos = [],
  initialVideos = [],
}: {
  initialPhotos?: string[];
  initialVideos?: string[];
}) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [videos, setVideos] = useState<string[]>(initialVideos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow picking the same file(s) again later
    if (files.length === 0) return;

    setError(null);
    setUploading(true);
    let failures = 0;
    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) {
        failures++;
        continue;
      }
      const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      if (file.size > maxBytes) {
        failures++;
        continue;
      }
      try {
        const { url, isVideo: wasVideo } = await uploadToCloudinary(file);
        if (wasVideo) {
          setVideos((prev) => [...prev, url]);
        } else {
          setPhotos((prev) => [...prev, url]);
        }
      } catch {
        failures++;
      }
    }
    setUploading(false);
    if (failures > 0) {
      setError(
        failures === files.length
          ? "Couldn't upload those files — check your connection and try again."
          : `${failures} file${failures === 1 ? "" : "s"} didn't upload — try again for those.`
      );
    }
  };

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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFilesPicked}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="rounded-md border border-accent-soft px-3 py-2 text-sm transition hover:bg-accent-soft active:scale-95 disabled:opacity-60"
      >
        {uploading ? "Uploading…" : `Add photos or videos (${photos.length + videos.length} added)`}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-foreground/70">
        The first photo is used as the cover shown in the lookbook grid.
      </p>
    </div>
  );
}
