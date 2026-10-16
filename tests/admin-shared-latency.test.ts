import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import ts from "typescript";
import {runInNewContext} from "node:vm";
import * as database from "../db/index";
import * as media from "../lib/media-upload";
import * as productLines from "../lib/product-lines";
import { hasForbiddenCommercialProductFields } from "../lib/staff-access";
import * as siteValidation from "../lib/site-settings-validation";

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
    if(route==="cms") assert.match(source,/await syncDbFromCloud\(true\)/,"CMS editor must read authoritative settings, not a stale local snapshot");
    else assert.doesNotMatch(source,/await syncDbFromCloud/);
  }
});

test("partial product saves merge fresh database fields and return canonical data in one response",async()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),"hami-cms-speed-")),previous=process.env.HAMI_DB_PATH;
  process.env.HAMI_DB_PATH=path.join(temp,"isolated.sqlite");database.resetDbConnectionForTest();
  try {
    let deferred=false,commercial=true,uploads=0;
    const module={exports:{} as any};
    const source=ts.transpileModule(fs.readFileSync("app/api/admin/cms/route.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
    runInNewContext(source,{exports:module.exports,module,Buffer,console,process,
      require:(id:string)=>{
        if(id==="next/server") return {NextResponse:{json:Response.json},after(){}};
        if(id==="next/cache") return {revalidatePath(){}};
        if(id==="@/db") return database;
        if(id==="@/lib/media-upload") return {...media,storeVerifiedImage:async()=>{uploads++;return {ok:true,storedInR2:true,url:"/api/media/uploads/editor/qa.webp"};}};
        if(id==="@/lib/product-lines") return productLines;
        if(id==="@/lib/site-settings-validation") return siteValidation;
        if(id==="@/lib/authoritative-write") return {withAuthoritativeMutation:async(fn:any,options:any)=>{deferred=!!options?.deferBackup;return database.runDurableMutation(fn);}};
        if(id==="@/lib/staff-auth") return {getAuthenticatedStaff:async()=>({roles:[commercial ? "OWNER" : "MARKETING"]}),staffCan:(_staff:any,cap:string)=>cap==="catalog.commercial.write" ? commercial : true,guardMutationOrigin:()=>true,hasForbiddenCommercialProductFields,privateJsonHeaders:()=>({"Cache-Control":"no-store"})};
        throw new Error(`Unexpected module ${id}`);
      }});
    const before=database.getAllProducts().find(p=>p.id==="prod-dua-mat-thanh-diu")!;
    const response=await module.exports.POST(new Request("https://isolated.test/api/admin/cms",{method:"POST",body:JSON.stringify({action:"upsert_product",product:{id:before.id,shortDescription:"Updated copy"}})}));
    const result=await response.json();
    assert.equal(result.ok,true);assert.equal(deferred,true);
    assert.equal(result.product.shortDescription,"Updated copy");
    for(const key of ["priceVnd","status","ingredients","supportedOptions","cautionNote"] as const) assert.deepEqual(result.product[key],before[key],key);
    const post=async(body:unknown)=>module.exports.POST(new Request("https://isolated.test/api/admin/cms",{method:"POST",body:JSON.stringify(body)}));
    assert.equal((await post({action:"upload_media_r2",siteImageField:"addressDisplay"})).status,422);
    assert.equal(uploads,0,"reject invalid binding before writing an R2 object");
    const uploaded=await (await post({action:"upload_media_r2",siteImageField:"heroDesktopImage",dataUrl:"fake fixture"})).json();
    assert.equal(uploaded.ok,true);assert.equal(uploaded.siteSettings.heroDesktopImage,uploaded.url);
    database.resetDbConnectionForTest();
    assert.equal(database.getSiteContentSettings().heroDesktopImage,uploaded.url,"verified banner upload must bind durably without a second save click");
    const settings={heroTitle:"Yến Sào Hà Mi",heroLead:"Chưng theo ca theo yêu cầu",heroCta:"Chọn món",noticeBanner:"Khung giờ giao 08:00",heroDesktopImage:"/api/media/uploads/editor/desktop.webp",heroMobileImage:"https://example.test/mobile.webp",aboutLead:"Updated brand story"};
    const savedSite=await (await post({action:"save_site_settings",settings})).json();
    assert.equal(savedSite.ok,true);
    for(const [key,value] of Object.entries(settings)) assert.equal(savedSite.siteSettings[key],value);
    database.resetDbConnectionForTest();
    for(const [key,value] of Object.entries(settings)) assert.equal((database.getSiteContentSettings() as any)[key],value,"saved copy must survive reopening, not be auto-replaced by defaults");
    assert.equal((await post({action:"save_site_settings",settings:{heroDesktopImage:"javascript:alert(1)"}})).ok,false);
    const renamed=await (await post({action:"upsert_product",product:{id:before.id,name:"Updated catalog name",priceVnd:345000}})).json();
    assert.equal(renamed.product.name,"Updated catalog name");
    assert.equal(renamed.product.priceVnd,345000);
    for(const productLine of Object.keys(productLines.PRODUCT_LINES)) {
      const response=await post({action:"upsert_product",product:{id:`custom-${productLine}`,name:`QA ${productLine}`,category:"nguyen-ban",productLine,volumeMl:productLine==="jar" ? 75 : 200,priceVnd:100000}});
      const body=await response.json();assert.equal(body.ok,true);
      assert.equal(productLines.getProductLine(body.product),productLine);
    }
    const invalid=await post({action:"upsert_product",product:{id:before.id,productLine:"invalid"}});
    assert.equal(invalid.status,422);
    const order=database.submitOrderRequest({idempotencyKey:"isolated-delete-history",orderPurpose:"SELF",buyerName:"QA",buyerPhone:"0900000001",addressDetail:"Isolated QA",zoneId:"zone-cam-le-lien-chieu",requestedDate:"2026-11-01",slotId:"slot-morning",now:new Date("2026-10-16T01:00:00Z"),items:[{productId:before.id,quantity:1}]});
    assert.equal(order.ok,true);
    commercial=false;
    assert.equal((await post({action:"delete_product",productId:before.id})).status,403);
    assert.ok(database.getProductBySlug(before.slug));
    commercial=true;
    assert.equal((await post({action:"delete_product",productId:before.id})).status,200);
    assert.equal(database.getProductBySlug(before.slug),null);
    assert.equal(database.getOrderRequestByReference({referenceCode:order.order!.referenceCode,isStaff:true})!.items[0].productNameSnapshot,"Updated catalog name");
    assert.equal(database.calculateServerQuote({items:[{productId:before.id,quantity:1}]}).ok,false);
    database.resetDbConnectionForTest();
    assert.equal(database.getProductBySlug(before.slug),null,"deleted products must not be reseeded on restart");
  } finally {
    database.resetDbConnectionForTest();
    if(previous===undefined) delete process.env.HAMI_DB_PATH;else process.env.HAMI_DB_PATH=previous;
    fs.rmSync(temp,{recursive:true,force:true});
  }
});
