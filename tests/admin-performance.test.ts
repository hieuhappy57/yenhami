import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { runDurableMutation, flushDurableBackupJobs, resetDbConnectionForTest, submitOrderRequest,
  confirmOrderWithPaymentByStaff, updateOrderStatusByStaff } from "../db/index";

test("admin confirmation commits before backup, releases the lease, and recovers failed R2 jobs",async()=>{
  const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),"hami-performance-"));
  const keys=["HAMI_DB_PATH","VERCEL","CLOUDFLARE_ACCOUNT_ID","CLOUDFLARE_D1_DATABASE_ID","CLOUDFLARE_API_TOKEN"];
  const previous=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
  const originalFetch=globalThis.fetch,remote=new DatabaseSync(":memory:");
  const objects=new Map<string,Uint8Array>();
  let r2Writes=0,failR2=false;
  const tasks:(()=>Promise<void>)[]=[];
  try {
    process.chdir(temp);
    delete process.env.HAMI_DB_PATH;delete process.env.VERCEL;
    process.env.CLOUDFLARE_ACCOUNT_ID="a".repeat(32);
    process.env.CLOUDFLARE_D1_DATABASE_ID="11111111-2222-3333-4444-555555555555";
    process.env.CLOUDFLARE_API_TOKEN="isolated-fake-token-never-sent-to-network";
    globalThis.fetch=(async(url,init)=>{
      const target=String(url);
      if(target.includes("/d1/database/")) {
        const body=JSON.parse(String(init?.body)),statements=body.batch || [body];
        remote.exec("BEGIN IMMEDIATE;");
        try {
          const result=statements.map((s:{sql:string;params?:any[]})=>{
            let results:unknown[]=[];
            if(s.sql.trim().split(";").filter(Boolean).length>1) remote.exec(s.sql);
            else if(/RETURNING|^\s*SELECT|^\s*PRAGMA/i.test(s.sql)) results=remote.prepare(s.sql).all(...s.params || []);
            else remote.prepare(s.sql).run(...s.params || []);
            return {success:true,results};
          });
          remote.exec("COMMIT;");return Response.json({success:true,result});
        } catch(error) {remote.exec("ROLLBACK;");throw error;}
      }
      if(target.includes("/r2/buckets/")) {
        if(!target.includes("/objects/")) return Response.json({success:true});
        if(init?.method==="PUT") {
          r2Writes++;
          if(failR2) return new Response("Unavailable",{status:503});
          objects.set(target,Uint8Array.from(init.body as Uint8Array));return Response.json({success:true});
        }
        return objects.has(target) ? new Response(objects.get(target) as BodyInit) : new Response("Missing",{status:404});
      }
      throw new Error("Unexpected network destination");
    }) as typeof fetch;
    resetDbConnectionForTest();
    await runDurableMutation(()=>{});
    const options={deferBackup:(task:()=>Promise<void>)=>{tasks.push(task);}};
    const now=new Date("2026-10-16T01:00:00Z");
    const created=await runDurableMutation(()=>submitOrderRequest({idempotencyKey:"isolated-speed-order",orderPurpose:"SELF",
      buyerName:"Isolated QA",buyerPhone:"0900000001",zoneId:"zone-cam-le-lien-chieu",addressDetail:"Isolated QA address",
      requestedDate:"2026-10-25",slotId:"slot-morning",now,items:[{productId:"prod-thanh-nguyen",quantity:1}]}),options);
    assert.equal(created.ok,true);
    const referenceCode=created.order!.referenceCode,beforeWrites=r2Writes;
    const confirmed=await runDurableMutation(()=>confirmOrderWithPaymentByStaff({referenceCode,expectedVersion:1,shippingFeeVnd:0,
      amountVnd:295000,method:"CASH",idempotencyKey:"isolated-speed-confirm",staffUsername:"qa",staffDisplayName:"Isolated QA"}),options);
    assert.equal(confirmed.ok,true);
    assert.equal(r2Writes,beforeWrites,"R2 must not block the acknowledged order mutation");
    assert.equal(remote.prepare("SELECT lock_owner FROM hami_persistence_meta WHERE id='main'").get()!.lock_owner,null);
    assert.equal(remote.prepare("SELECT order_status FROM order_requests WHERE reference_code=?").get(referenceCode)!.order_status,"CONFIRMED");
    const kitchen=await runDurableMutation(()=>updateOrderStatusByStaff({referenceCode,expectedVersion:2,newOrderStatus:"PREPARING",staffUsername:"qa",staffDisplayName:"Isolated QA",note:"Isolated performance test"}),options);
    assert.equal(kitchen.ok,true);
    assert.equal(remote.prepare("SELECT COUNT(*) AS n FROM hami_backup_jobs").get()!.n,3);
    failR2=true;
    await tasks[0]();
    assert.equal(remote.prepare("SELECT COUNT(*) AS n FROM hami_backup_jobs").get()!.n,3);
    failR2=false;
    remote.exec("UPDATE hami_backup_jobs SET next_attempt_at=0;");
    await flushDurableBackupJobs(5);
    assert.equal(remote.prepare("SELECT COUNT(*) AS n FROM hami_backup_jobs").get()!.n,0);
    assert.equal(remote.prepare("SELECT order_status FROM order_requests WHERE reference_code=?").get(referenceCode)!.order_status,"PREPARING");
  } finally {
    globalThis.fetch=originalFetch;resetDbConnectionForTest();remote.close();process.chdir(cwd);
    for(const key of keys) if(previous[key]===undefined) delete process.env[key]; else process.env[key]=previous[key];
    fs.rmSync(temp,{recursive:true,force:true});
  }
});
