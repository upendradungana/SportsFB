import sharp from "sharp"; import crypto from "node:crypto"; import { z } from "zod";
import { api, fromResult, HttpError, requireRole } from "@/lib/guard"; import { submitProof } from "@/lib/booking"; import { limited } from "@/lib/ratelimit";
export const runtime = "nodejs";
export const POST = api(async (req) => {
  const u = await requireRole("PLAYER");
  if (await limited("upload", u.id, 2, "15 m")) throw new HttpError(429, "RATE_LIMITED");
  const f = await req.formData(); const file = f.get("file"); const bookingId = z.uuid().parse(f.get("bookingId"));
  if (!(file instanceof File) || file.size > 4 * 1024 * 1024) throw new HttpError(413, "FILE_TOO_LARGE_OR_MISSING");
  let out: Buffer;
  try {
    const img = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 24e6 });
    if (!["jpeg", "png", "webp"].includes((await img.metadata()).format ?? "")) throw 0; // decided by content, not by client MIME
    out = await img.rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 72 }).toBuffer(); // re-encode drops EXIF/payloads
  } catch { throw new HttpError(415, "INVALID_IMAGE"); }
  const hash = crypto.createHash("sha256").update(out).digest("hex");
  return fromResult(await submitProof(u.id, bookingId, hash, out.toString("base64")));
});
