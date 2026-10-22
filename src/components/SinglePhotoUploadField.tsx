"use client";

import { useState } from "react";
import { CldUploadButton } from "next-cloudinary";

export function SinglePhotoUploadField({
  name = "photoUrl",
  initialPhoto = null,
}: {
  name?: string;
  initialPhoto?: string | null;
}) {
  const [photo, setPhoto] = useState<string | null>(initialPhoto);

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

      <CldUploadButton
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{ multiple: false, maxFiles: 1, resourceType: "image" }}
        className="rounded-md border border-accent-soft px-3 py-2 text-sm transition hover:bg-accent-soft active:scale-95"
        onSuccess={(result) => {
          if (typeof result.info !== "object" || !result.info || !("secure_url" in result.info)) {
            return;
          }
          setPhoto(result.info.secure_url as string);
        }}
      >
        {photo ? "Replace photo" : "Add a photo (optional)"}
      </CldUploadButton>
    </div>
  );
}
