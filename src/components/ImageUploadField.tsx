"use client";

import { useState } from "react";
import { CldUploadButton } from "next-cloudinary";

export function ImageUploadField({ name }: { name: string }) {
  const [url, setUrl] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url ?? ""} />
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Uploaded preview" className="h-32 rounded-md object-cover" />
      )}
      <CldUploadButton
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        className="rounded-md border border-accent-soft px-3 py-2 text-sm"
        onSuccess={(result) => {
          if (typeof result.info === "object" && result.info && "secure_url" in result.info) {
            setUrl(result.info.secure_url as string);
          }
        }}
      >
        {url ? "Replace photo" : "Upload photo"}
      </CldUploadButton>
    </div>
  );
}
