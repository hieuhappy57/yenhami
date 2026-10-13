import crypto from "node:crypto";
import { isSafePublicMediaContentType } from "./media-storage-policy";

export class MediaUploadError extends Error {
  readonly status:number;
  constructor(message:string,status:number) {super(message);this.status=status;}
}
export const MAX_IMAGE_UPLOAD_BYTES=3*1024*1024;

export function validateImageBytes(bytes:Uint8Array,type:string): boolean {
  const head=Buffer.from(bytes.subarray(0,64));
  if(type==="image/png") return head.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if(type==="image/jpeg" || type==="image/jpg") return head[0]===255 && head[1]===216 && head[2]===255;
  if(type==="image/webp") return head.subarray(0,4).toString()==="RIFF" && head.subarray(8,12).toString()==="WEBP";
  if(type==="image/gif") return ["GIF87a","GIF89a"].includes(head.subarray(0,6).toString());
  if(type==="image/avif") return head.subarray(4,8).toString()==="ftyp" && /avif|avis/.test(head.toString("ascii"));
  return false;
}

export async function storeVerifiedImage(input:{dataUrl:string;fileName?:string},storage:{
  enabled:boolean;
  put:(key:string,body:Uint8Array,type:string)=>Promise<{ok:boolean;error?:string}>;
  get:(key:string)=>Promise<{ok:boolean;arrayBuffer?:ArrayBuffer;contentType?:string}>;
}) {
  if(!storage.enabled) throw new MediaUploadError("Kho ảnh R2 chưa được cấu hình.",503);
  const match=input.dataUrl.match(/^data:([^;]+);base64,([A-Za-z0-9+/]+={0,2})$/);
  if(!match || !isSafePublicMediaContentType(match[1])) throw new MediaUploadError("Ảnh không hợp lệ. Chọn PNG, JPEG, WebP, GIF hoặc AVIF.",422);
  const type=match[1].toLowerCase();
  if(match[2].length>Math.ceil(MAX_IMAGE_UPLOAD_BYTES/3)*4) throw new MediaUploadError("Ảnh tối đa 3 MB.",413);
  const bytes=Buffer.from(match[2],"base64");
  if(!bytes.length || bytes.length>MAX_IMAGE_UPLOAD_BYTES) throw new MediaUploadError("Ảnh tối đa 3 MB.",413);
  if(!validateImageBytes(bytes,type)) throw new MediaUploadError("Nội dung file không khớp định dạng ảnh.",422);
  const extension=type==="image/jpeg" || type==="image/jpg" ? "jpg" : type.slice(6);
  const hash=crypto.createHash("sha256").update(bytes).digest("hex");
  const name=(input.fileName || "image").replace(/\.[^.]+$/,"").toLowerCase().replace(/[^a-z0-9_-]+/g,"-").slice(0,40) || "image";
  const key=`uploads/editor/${hash}-${name}.${extension}`;
  const saved=await storage.put(key,bytes,type);
  if(!saved.ok) throw new MediaUploadError("Chưa lưu được ảnh lên R2. Vui lòng thử lại.",503);
  const checked=await storage.get(key);
  if(!checked.ok || !checked.arrayBuffer || checked.contentType?.split(";")[0]!==type || crypto.createHash("sha256").update(Buffer.from(checked.arrayBuffer)).digest("hex")!==hash) {
    throw new MediaUploadError("Ảnh R2 chưa vượt qua kiểm tra toàn vẹn. Vui lòng thử lại.",503);
  }
  return {ok:true,storedInR2:true,url:`/api/media/${key}`,objectKey:key,sha256:hash,bytes:bytes.length};
}
