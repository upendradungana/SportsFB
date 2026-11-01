import sharp from "sharp"; import { z } from "zod"; import { api, HttpError, requireRole } from "@/lib/guard"; import { receiptFor } from "@/lib/booking";
export const runtime = "nodejs";
export const GET = api(async (_r, { params }) => {
  const u = await requireRole("OWNER"); const id = z.uuid().parse((await params).bookingId);
  const b64 = await receiptFor(u.id, id); if (!b64) throw new HttpError(404, "NOT_AVAILABLE");
  const img = sharp(Buffer.from(b64, "base64")); const { width = 800, height = 600 } = await img.metadata();
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><text x="16" y="${height - 16}" font-size="${Math.max(14, width / 40)}" fill="#fff" fill-opacity=".6" stroke="#000" stroke-opacity=".4" stroke-width=".6">${id} | ${new Date().toISOString()}</text></svg>`;
  const out = await img.composite([{ input: Buffer.from(svg) }]).jpeg({ quality: 80 }).toBuffer();
  return new Response(new Uint8Array(out), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store" } });
});
