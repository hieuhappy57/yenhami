import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import {execFile} from "node:child_process";
import {promisify} from "node:util";

const exec=promisify(execFile);
const deployment=process.argv[2];
const cli=process.env.HAMI_VERCEL_CLI;
if(!deployment || !cli) throw new Error("Provide deployment and HAMI_VERCEL_CLI");
const manifest=JSON.parse(fs.readFileSync("lib/static-media-manifest.json","utf8"));
const paths=["/brand/ha-mi-logo-web.webp","/brand/ha-mi-favicon-512.png","/brand/banners/hero-slide-1-tho-su-v2.webp",
  "/brand/banners/hero-slide-1-tho-su-mobile-v3.webp","/brand/dishes/thanh-nguyen-v2.webp",
  "/brand/catalog/set-qua-hop-sen-en-v2.webp","/bai-viet/banner_bai_1_yen_tuoi_tho_su.jpg",
  "/assets/brand/dishes/tu-quy-an-nhien-v2.webp","/bai-viet/to-yen-co-mau-gi-ha-mi.png"];
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"hami-r2-serving-check-"));
const results=[];
async function verify(url,index) {
  const file=path.join(temp,`asset-${index}`),headers=path.join(temp,`headers-${index}`);
  const output=await exec(process.execPath,[cli,"curl",url,"--deployment",deployment,"--","--silent","--show-error","--dump-header",headers,"--output",file,"--write-out","%{http_code}"],{timeout:120_000,maxBuffer:1024*1024});
  const bytes=fs.readFileSync(file);
  const hash=crypto.createHash("sha256").update(bytes).digest("hex");
  const metadata=fs.readFileSync(headers,"utf8");
  if(output.stdout.trim()!=="200" || hash!==manifest.assets[url].sha256 || !/x-media-storage:\s*R2/i.test(metadata)) throw new Error(`Image serving failed: ${url}`);
  results.push({path:url,status:200,bytes:bytes.length,sha256:hash,storage:"R2"});
}
try {
  for(let index=0;index<paths.length;index+=3) await Promise.all(paths.slice(index,index+3).map((url,offset)=>verify(url,index+offset)));
  fs.mkdirSync("output",{recursive:true});
  fs.writeFileSync("output/r2-media-serving-report.json",JSON.stringify({deployment,checkedAt:new Date().toISOString(),results},null,2));
  console.log(JSON.stringify({verified:results.length,allFromR2:true}));
} finally {fs.rmSync(temp,{recursive:true,force:true});}
