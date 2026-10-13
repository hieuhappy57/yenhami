import { NextResponse } from "next/server";
import { getCloudflareR2Object, isCloudflareR2Enabled } from "@/db";
import { isPublicMediaKey, isSafePublicMediaContentType } from "@/lib/media-storage-policy";
import { findStaticMedia } from "@/lib/static-media";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> }
) {
  if (!isCloudflareR2Enabled()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { key } = await context.params;
  const staticAsset=key[0]==="static" ? findStaticMedia(key.slice(1)) : undefined;
  const objectKey=staticAsset?.key || (key[0]==="static" ? "" : key.join("/"));
  // Prevent access to internal database snapshot via public media route
  if (!isPublicMediaKey(objectKey)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const res = await getCloudflareR2Object(objectKey);
  if (!res.ok || !res.arrayBuffer || !isSafePublicMediaContentType(res.contentType || "")) {
    return new NextResponse("Media not found", { status: 404 });
  }

  return new NextResponse(res.arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": res.contentType || "image/jpeg",
      "X-Content-Type-Options": "nosniff",
      "X-Media-Storage": "R2",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": staticAsset ? "public, max-age=3600" : "public, max-age=31536000, immutable",
      "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable",
      ...(staticAsset ? {ETag:`"${staticAsset.sha256}"`} : {}),
    },
  });
}
