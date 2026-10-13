import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec=promisify(execFile);
const cli=process.env.HAMI_VERCEL_CLI;
const deployment=process.argv[2];
if(!cli || !deployment) throw new Error("Provide HAMI_VERCEL_CLI and the migration deployment URL");
const config=JSON.parse(fs.readFileSync("/private/tmp/hami-media-migration.json","utf8"));
if(Date.now()>config.expires) throw new Error("Migration credential expired");
const manifest=JSON.parse(fs.readFileSync("lib/static-media-manifest.json","utf8"));
const assets=[...new Map(Object.entries(manifest.assets).map(([url,asset])=>[asset.key,{url,...asset}])).values()];
// Prefer the real file path over compatibility aliases.
for(const asset of assets) {
  const source=Object.entries(manifest.assets).find(([url,value])=>value.key===asset.key && fs.existsSync("public"+url));
  if(!source) throw new Error("Missing original image");
  asset.file="public"+source[0];asset.url=source[0];
}
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"hami-r2-transfer-"));
const header=path.join(temp,"headers.txt");
fs.writeFileSync(header,`Authorization: Bearer ${config.token}\nContent-Type: application/octet-stream\n`,{mode:0o600});
const report={deployment,startedAt:new Date().toISOString(),verified:[],failed:[]};
let cursor=0;
async function worker() {
  while(cursor<assets.length) {
    const index=cursor++;
    const asset=assets[index];
    const responseFile=path.join(temp,`response-${index}.json`);
    let error;
    for(let attempt=0;attempt<3;attempt++) {
      try {
        await exec(process.execPath,[cli,"curl",`/api/internal/media-migration?path=${encodeURIComponent(asset.url)}`,"--deployment",deployment,"--",
          "--silent","--show-error","--request","POST","--header",`@${header}`,"--data-binary",`@${path.resolve(asset.file)}`,"--output",responseFile],{timeout:120_000,maxBuffer:1024*1024});
        const result=JSON.parse(fs.readFileSync(responseFile,"utf8"));
        if(!result.ok || result.sha256!==asset.sha256 || result.bytes!==asset.bytes) throw new Error(result.errorMessage || "R2 verification failed");
        report.verified.push({path:asset.url,key:asset.key,bytes:asset.bytes,sha256:asset.sha256});error=null;break;
      } catch(caught) {error=caught instanceof Error ? caught.message : "Transfer failed";}
    }
    if(error) report.failed.push({path:asset.url,error});
    fs.writeFileSync("output/r2-media-transfer-report.json",JSON.stringify(report,null,2));
    const done=report.verified.length+report.failed.length;
    if(done%10===0 || done===assets.length) console.log(JSON.stringify({done,total:assets.length,verified:report.verified.length,failed:report.failed.length}));
  }
}
try {
  fs.mkdirSync("output",{recursive:true});
  await Promise.all([worker(),worker(),worker()]);
  report.completedAt=new Date().toISOString();
  report.verifiedBytes=report.verified.reduce((total,asset)=>total+asset.bytes,0);
  fs.writeFileSync("output/r2-media-transfer-report.json",JSON.stringify(report,null,2));
  console.log(JSON.stringify({verified:report.verified.length,bytes:report.verifiedBytes,failed:report.failed.length}));
  if(report.failed.length) process.exitCode=1;
} finally {fs.rmSync(temp,{recursive:true,force:true});}
