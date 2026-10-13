import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, spawn } from "node:child_process";

const cli=process.env.HAMI_VERCEL_CLI;
if(!cli) throw new Error("HAMI_VERCEL_CLI is required");
const stage=fs.mkdtempSync("/private/tmp/hami-media-stage-");
const tracked=execFileSync("git",["ls-files","-z"],{encoding:"utf8"}).split("\0").filter(Boolean);
const added=[".vercelignore",".vercel/project.json","lib/static-media.ts","lib/static-media-manifest.json","lib/media-upload.ts","public/admin-media.js","app/api/internal/media-migration/route.ts"];
for(const file of new Set([...tracked,...added])) {
  if(/^public\/(brand|bai-viet|assets\/brand)\//.test(file) || !fs.existsSync(file)) continue;
  const target=path.join(stage,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(file,target);
}
const config={stage,token:crypto.randomBytes(32).toString("hex"),expires:Date.now()+4*60*60*1000};
fs.writeFileSync("/private/tmp/hami-media-migration.json",JSON.stringify(config),{mode:0o600});
const child=spawn(process.execPath,[cli,"deploy","--prod","--skip-domain","--yes","--scope","team_ec2wTunWFYQN5gSjJY45DGkB",
  "--env",`HAMI_MEDIA_MIGRATION_TOKEN=${config.token}`,"--env",`HAMI_MEDIA_MIGRATION_EXPIRES=${config.expires}`],{cwd:stage,stdio:"inherit"});
child.on("exit",code=>{process.exitCode=code || 0;});
