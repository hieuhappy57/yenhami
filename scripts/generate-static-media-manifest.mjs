import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const tracked=new Set(execFileSync("git",["ls-files","-z"],{encoding:"utf8"}).split("\0"));
const assets={};
const types={png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",webp:"image/webp",gif:"image/gif",avif:"image/avif"};
function scan(directory) {
  for(const item of fs.readdirSync(directory,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
    const file=path.join(directory,item.name);
    if(item.isDirectory()) {scan(file);continue;}
    const extension=path.extname(file).slice(1).toLowerCase();
    if(!types[extension]) continue;
    const bytes=fs.readFileSync(file);
    const sha256=crypto.createHash("sha256").update(bytes).digest("hex");
    const publicPath="/"+file.replace(/^public\//,"");
    assets[publicPath]={key:`uploads/site/${sha256.slice(0,16)}${publicPath}`,sha256,bytes:bytes.length,contentType:types[extension],tracked:tracked.has(file)};
  }
}
scan("public");
// Existing admin/demo links use an assets/ prefix although the source files live under public/brand.
for(const [url,asset] of Object.entries({...assets})) {
  if(url.startsWith("/brand/") || url.startsWith("/bai-viet/")) assets["/assets"+url] ||= asset;
}
const manifest={version:1,assets};
fs.writeFileSync("lib/static-media-manifest.json",JSON.stringify(manifest,null,2)+"\n");
const objects=[...new Map(Object.values(assets).map(asset=>[asset.key,asset])).values()];
console.log(JSON.stringify({objects:objects.length,urls:Object.keys(assets).length,bytes:objects.reduce((total,asset)=>total+asset.bytes,0),trackedBytes:objects.filter(asset=>asset.tracked).reduce((total,asset)=>total+asset.bytes,0)}));
