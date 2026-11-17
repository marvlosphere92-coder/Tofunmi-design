// Cloudinary serves an auto-generated frame of an uploaded video when the
// same URL is requested with an image extension instead of the video's
// own — used as a fallback cover photo for designs uploaded as video only,
// so the lookbook grid never shows an empty tile for them.
export function videoThumbnailUrl(videoUrl: string): string {
  return videoUrl.replace(/\.[a-zA-Z0-9]+$/, ".jpg").replace("/video/upload/", "/video/upload/so_0/");
}
