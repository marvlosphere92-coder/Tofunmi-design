"use client";

import { useRef, useState } from "react";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function SinglePhotoUploadField({
  name = "photoUrl",
  initialPhoto = null,
}: {
  name?: string;
  initialPhoto?: string | null;
}) {
  const [photo, setPhoto] = useState<string | null>(initialPhoto);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("That image is too large (max 8MB).");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setPhoto(data.secure_url as string);
    } catch {
      setError("Couldn't upload that photo — try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {photo && (
        <div className="relative w-20 h-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="w-20 h-20 rounded-md object-cover" />
          <button
            type="button"
            onClick={() => setPhoto(null)}
            className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full w-5 h-5 transition hover:bg-black/80 active:scale-90"
            aria-label="Remove photo"
          >
            ×
          </button>
        </div>
      )}
      {photo && <input type="hidden" name={name} value={photo} />}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFilePicked}
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
        {uploading ? "Uploading…" : photo ? "Replace photo" : "Add a photo (optional)"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
