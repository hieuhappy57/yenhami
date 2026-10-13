import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import manifest from "../lib/static-media-manifest.json" with {type:"json"};
import { findStaticMedia } from "../lib/static-media";
import { MediaUploadError, storeVerifiedImage, validateImageBytes } from "../lib/media-upload";

test("static image manifest matches local originals and rejects private paths",()=>{
  const objects=new Map();
  for(const [url,asset] of Object.entries(manifest.assets)) {
    assert.deepEqual(findStaticMedia(url.slice(1).split("/")),asset);
    if(objects.has(asset.key)) continue;
    const body=fs.readFileSync("public"+url);
    assert.equal(body.length,asset.bytes,url);
    assert.equal(crypto.createHash("sha256").update(body).digest("hex"),asset.sha256,url);
    assert.equal(validateImageBytes(body,asset.contentType),true,url);
    objects.set(asset.key,true);
  }
  assert.ok(objects.size>100);
  for(const parts of [["db","ha-mi-db-state.json"],["brand","..","db","state.png"],["brand","%2e%2e","state.png"]]) assert.equal(findStaticMedia(parts),undefined);
});

test("image upload requires successful R2 acknowledgement and read-back checksum",async()=>{
  const body=fs.readFileSync("public/brand/ha-mi-logo-web.webp");
  const dataUrl="data:image/webp;base64,"+body.toString("base64");
  const input={dataUrl,fileName:"logo.webp"};
  const valid={ok:true,arrayBuffer:Uint8Array.from(body).buffer,contentType:"image/webp"};
  const good=await storeVerifiedImage(input,{enabled:true,put:async()=>({ok:true}),get:async()=>valid});
  assert.equal(good.storedInR2,true);
  assert.ok(good.url.startsWith("/api/media/uploads/editor/"));
  await assert.rejects(storeVerifiedImage(input,{enabled:false,put:async()=>({ok:true}),get:async()=>valid}),MediaUploadError);
  await assert.rejects(storeVerifiedImage(input,{enabled:true,put:async()=>({ok:false}),get:async()=>valid}),MediaUploadError);
  await assert.rejects(storeVerifiedImage(input,{enabled:true,put:async()=>({ok:true}),get:async()=>({...valid,arrayBuffer:new Uint8Array([1,2,3]).buffer})}),MediaUploadError);
  await assert.rejects(storeVerifiedImage({dataUrl:"data:image/png;base64,"+Buffer.from("<script>bad</script>").toString("base64")},{enabled:true,put:async()=>({ok:true}),get:async()=>valid}),MediaUploadError);
});
