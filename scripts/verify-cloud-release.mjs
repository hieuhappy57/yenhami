import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const deployment = process.argv[2];
const cli = process.env.HAMI_VERCEL_CLI;
if (!deployment || !cli) throw new Error("Provide deployment URL and HAMI_VERCEL_CLI path");
const origin = new URL(deployment).origin;
const temp = fs.mkdtempSync(path.join(os.tmpdir(),"hami-storage-check-"));
const requestFile = path.join(temp,"request.json");
const headersFile = path.join(temp,"headers.txt");
const responseFile = path.join(temp,"response.json");
function request(route, body) {
  const args=[cli,"curl",route,"--deployment",origin,"--","--silent","--show-error","--header",`@${headersFile}`,"--output",responseFile];
  if(body) {
    fs.writeFileSync(requestFile,JSON.stringify(body),{mode:0o600});
    args.push("--request","POST","--data-binary",`@${requestFile}`);
  }
  execFileSync(process.execPath,args,{stdio:["ignore","pipe","pipe"],timeout:120_000});
  const result=JSON.parse(fs.readFileSync(responseFile,"utf8"));
  if(!result.ok) throw new Error(result.errorMessage || "Verification request failed");
  return result;
}
try {
  fs.writeFileSync(headersFile,`Origin: ${origin}\nContent-Type: application/json\n`,{mode:0o600});
  if(!process.env.HAMI_VERIFY_USERNAME || !process.env.HAMI_VERIFY_PASSWORD) throw new Error("Explicit verification credentials are required");
  const session=request("/api/admin/auth",{username:process.env.HAMI_VERIFY_USERNAME,password:process.env.HAMI_VERIFY_PASSWORD});
  fs.appendFileSync(headersFile,`Authorization: Bearer ${session.token}\n`);
  const report=request("/api/admin/storage");
  const orders=request("/api/admin/orders");
  const second=request("/api/admin/storage");
  if(report.provider!=="CLOUDFLARE_D1" || second.counts.order_requests!==orders.orders.length) throw new Error("D1/order API counts do not match");
  for(const field of ["ordersWithoutItems","ordersWithoutCustomer","ordersWithoutHistory","orphanPayments"]) if(second.integrity[field]!==0) throw new Error(`Integrity failure: ${field}`);
  if(!second.backup?.last_success_at || second.backup?.last_error) throw new Error("R2 backup is not verified");
  console.log(JSON.stringify({deployment:origin,authenticatedAcrossRequests:true,...second},null,2));
} finally {fs.rmSync(temp,{recursive:true,force:true});}
