import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import ts from "typescript";
import {runInNewContext} from "node:vm";
import * as database from "../db/index";
import * as media from "../lib/media-upload";

test("order mutations repaint only the visible admin view",()=>{
  const source=fs.readFileSync("public/admin-order-mutations.js","utf8");
  const fragment=source.slice(source.indexOf("function refreshOrderViews"),source.indexOf("async function sendOrderMutation"));
  const calls:string[]=[],state={activeTab:"posts"};
  const context:any={appState:state,persistAppState(){},document:{getElementById:()=>null},
    renderOrdersTable:()=>calls.push("orders"),updateDashboard:()=>calls.push("dashboard"),
    renderKitchenTable:()=>calls.push("kitchen"),renderCustomersTable:()=>calls.push("customers")};
  runInNewContext(fragment,context);
  context.refreshOrderViews("qa");assert.deepEqual(calls,[]);
  for(const tab of ["orders","dashboard","kitchen","customers"]) {state.activeTab=tab;context.refreshOrderViews("qa");}
  assert.deepEqual(calls,["orders","dashboard","kitchen","customers"]);
});

test("all admin write groups use durable deferred backups without disabling authentication",()=>{
  for(const route of ["auth","catalog","cms","staff","orders"]) {
    const source=fs.readFileSync(`app/api/admin/${route}/route.ts`,"utf8");
    assert.match(source,/deferBackup:after/,route);
    assert.match(source,/guardMutationOrigin/,route);
  }
  for(const route of ["cms","storage"]) {
    const source=fs.readFileSync(`app/api/admin/${route}/route.ts`,"utf8").split("export async function POST")[0];
    assert.match(source,/await getAuthenticatedStaff/);
    assert.doesNotMatch(source,/await syncDbFromCloud/);
  }
});

test("partial product saves merge fresh database fields and return canonical data in one response",async()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),"hami-cms-speed-")),previous=process.env.HAMI_DB_PATH;
  process.env.HAMI_DB_PATH=path.join(temp,"isolated.sqlite");database.resetDbConnectionForTest();
  try {
    let deferred=false;
    const module={exports:{} as any};
    const source=ts.transpileModule(fs.readFileSync("app/api/admin/cms/route.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
    runInNewContext(source,{exports:module.exports,module,Buffer,console,process,
      require:(id:string)=>{
        if(id==="next/server") return {NextResponse:{json:Response.json},after(){}};
        if(id==="next/cache") return {revalidatePath(){}};
        if(id==="@/db") return database;
        if(id==="@/lib/media-upload") return media;
        if(id==="@/lib/authoritative-write") return {withAuthoritativeMutation:async(fn:any,options:any)=>{deferred=!!options?.deferBackup;return database.runDurableMutation(fn);}};
        if(id==="@/lib/staff-auth") return {getAuthenticatedStaff:async()=>({roles:["OWNER"]}),staffCan:()=>true,guardMutationOrigin:()=>true,privateJsonHeaders:()=>({"Cache-Control":"no-store"})};
        throw new Error(`Unexpected module ${id}`);
      }});
    const before=database.getAllProducts().find(p=>p.id==="prod-dua-mat-thanh-diu")!;
    const response=await module.exports.POST(new Request("https://isolated.test/api/admin/cms",{method:"POST",body:JSON.stringify({action:"upsert_product",product:{id:before.id,shortDescription:"Updated copy"}})}));
    const result=await response.json();
    assert.equal(result.ok,true);assert.equal(deferred,true);
    assert.equal(result.product.shortDescription,"Updated copy");
    for(const key of ["priceVnd","status","ingredients","supportedOptions","cautionNote"] as const) assert.deepEqual(result.product[key],before[key],key);
  } finally {
    database.resetDbConnectionForTest();
    if(previous===undefined) delete process.env.HAMI_DB_PATH;else process.env.HAMI_DB_PATH=previous;
    fs.rmSync(temp,{recursive:true,force:true});
  }
});
