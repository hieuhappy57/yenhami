import fs from "node:fs";
import path from "node:path";
import { execFileSync,spawn } from "node:child_process";

const cli=process.env.HAMI_VERCEL_CLI;
if(!cli) throw new Error("HAMI_VERCEL_CLI is required");
const report=JSON.parse(fs.readFileSync("output/r2-media-transfer-report.json","utf8"));
const manifest=JSON.parse(fs.readFileSync("lib/static-media-manifest.json","utf8"));
const assets=[...new Map(Object.values(manifest.assets).map(asset=>[asset.key,asset])).values()];
const checked=new Map(report.verified.map(asset=>[asset.key,asset]));
if(report.failed.length || assets.some(asset=>checked.get(asset.key)?.sha256!==asset.sha256)) throw new Error("Every R2 object must be verified before removing local deployment assets");
const stage=fs.mkdtempSync("/private/tmp/hami-media-release-");
const tracked=execFileSync("git",["ls-files","-z"],{encoding:"utf8"}).split("\0").filter(Boolean);
const added=[".vercelignore",".vercel/project.json","lib/static-media.ts","lib/static-media-manifest.json","lib/media-upload.ts","public/admin-media.js",
  "app/api/internal/media-migration/route.ts","tests/media-r2.test.ts","tests/admin-media.test.ts"];
for(const file of new Set([...tracked,...added])) {
  if(/^public\/(brand|bai-viet|assets\/brand)\//.test(file) || !fs.existsSync(file)) continue;
  const target=path.join(stage,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(file,target);
}
fs.writeFileSync("/private/tmp/hami-media-release-stage",stage);
const child=spawn(process.execPath,[cli,"deploy","--prod","--skip-domain","--yes","--scope","team_ec2wTunWFYQN5gSjJY45DGkB"],{cwd:stage,stdio:"inherit"});
child.on("exit",code=>{process.exitCode=code || 0;});
