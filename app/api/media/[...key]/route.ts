import { NextResponse } from "next/server";
import { getCloudflareR2Object, isCloudflareR2Enabled } from "@/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> }
) {
  if (!isCloudflareR2Enabled()) {
    return new NextResponse("Cloudflare R2 not configured", { status: 404 });
  }

  const { key } = await context.params;
  const objectKey = Array.isArray(key) ? key.join("/") : String(key || "");
  // Prevent access to internal database snapshot via public media route
  if (!objectKey || objectKey.startsWith("db/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const res = await getCloudflareR2Object(objectKey);
  if (!res.ok || !res.arrayBuffer) {
    return new NextResponse("Media not found", { status: 404 });
  }

  return new NextResponse(res.arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": res.contentType || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
