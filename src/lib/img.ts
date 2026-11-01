import sharp from "sharp"; import crypto from "node:crypto"; import { HttpError } from "@/lib/guard";
/** Decides by content (not client MIME), re-encodes to a 1600px JPEG (drops EXIF/payloads) and hashes the result. */
export async function sanitizeImage(file: unknown) {
  if (!(file instanceof File) || file.size > 4 * 1024 * 1024) throw new HttpError(413, "FILE_TOO_LARGE_OR_MISSING");
  try {
    const img = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 24e6 });
    if (!["jpeg", "png", "webp"].includes((await img.metadata()).format ?? "")) throw 0;
    const out = await img.rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 72 }).toBuffer();
    return { b64: out.toString("base64"), hash: crypto.createHash("sha256").update(out).digest("hex") };
  } catch { throw new HttpError(415, "INVALID_IMAGE"); }
}
