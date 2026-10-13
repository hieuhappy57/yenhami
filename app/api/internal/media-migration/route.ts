import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getCloudflareR2Object, putCloudflareR2Object } from "@/db";
import manifest from "@/lib/static-media-manifest.json" with {type:"json"};
import { validateImageBytes } from "@/lib/media-upload";
import { type StaticMediaAsset } from "@/lib/static-media";

export const maxDuration=60;
export async function POST(request:Request) {
  const token=process.env.HAMI_MEDIA_MIGRATION_TOKEN;
  const supplied=request.headers.get("authorization")?.replace(/^Bearer /,"") || "";
  const expires=Number(process.env.HAMI_MEDIA_MIGRATION_EXPIRES || 0);
  if(!token || token.length<32 || !Number.isFinite(expires) || Date.now()>expires || !crypto.timingSafeEqual(crypto.createHash("sha256").update(token).digest(),crypto.createHash("sha256").update(supplied).digest())) {
    return NextResponse.json({ok:false},{status:404});
  }
  const path=new URL(request.url).searchParams.get("path") || "";
  const asset=(manifest.assets as Record<string,StaticMediaAsset>)[path];
  if(!asset || asset.bytes>4*1024*1024) return NextResponse.json({ok:false,errorMessage:"Asset not in the approved manifest"},{status:422});
  if(Number(request.headers.get("content-length") || 0)>4*1024*1024) return NextResponse.json({ok:false},{status:413});
  const bytes=Buffer.from(await request.arrayBuffer());
  if(bytes.length!==asset.bytes || crypto.createHash("sha256").update(bytes).digest("hex")!==asset.sha256 || !validateImageBytes(bytes,asset.contentType)) return NextResponse.json({ok:false,errorMessage:"Asset checksum/signature mismatch"},{status:422});
  try {
    const existing=await getCloudflareR2Object(asset.key);
    if(existing.ok && existing.arrayBuffer && crypto.createHash("sha256").update(Buffer.from(existing.arrayBuffer)).digest("hex")===asset.sha256) {
      return NextResponse.json({ok:true,alreadyStored:true,key:asset.key,sha256:asset.sha256,bytes:asset.bytes});
    }
    const uploaded=await putCloudflareR2Object(asset.key,bytes,asset.contentType);
    if(!uploaded.ok) return NextResponse.json({ok:false,errorMessage:"R2 upload failed"},{status:503});
    const verified=await getCloudflareR2Object(asset.key);
    if(!verified.ok || !verified.arrayBuffer || crypto.createHash("sha256").update(Buffer.from(verified.arrayBuffer)).digest("hex")!==asset.sha256) return NextResponse.json({ok:false,errorMessage:"R2 verification failed"},{status:503});
    return NextResponse.json({ok:true,key:asset.key,sha256:asset.sha256,bytes:asset.bytes});
  } catch {return NextResponse.json({ok:false,errorMessage:"R2 unavailable"},{status:503});}
}
