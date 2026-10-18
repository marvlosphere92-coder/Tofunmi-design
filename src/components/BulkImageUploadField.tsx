"use client";

import { useState } from "react";
import { CldUploadButton } from "next-cloudinary";

export function BulkImageUploadField() {
  const [urls, setUrls] = useState<string[]>([]);

  return (
    <div className="space-y-3">
      {urls.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {urls.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" className="aspect-square rounded-md object-cover" />
          ))}
        </div>
      )}
      {urls.map((url) => (
        <input key={url} type="hidden" name="photoUrls" value={url} />
      ))}
      <CldUploadButton
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{ multiple: true, maxFiles: 20 }}
        className="rounded-md border border-accent-soft px-3 py-2 text-sm"
        onSuccess={(result) => {
          if (typeof result.info === "object" && result.info && "secure_url" in result.info) {
            const url = result.info.secure_url as string;
            setUrls((prev) => [...prev, url]);
          }
        }}
      >
        Select photos ({urls.length} added)
      </CldUploadButton>
      <p className="text-xs text-foreground/60">
        Each photo becomes a hidden draft design — edit title, category and
        price for each afterward from the list below.
      </p>
    </div>
  );
}
