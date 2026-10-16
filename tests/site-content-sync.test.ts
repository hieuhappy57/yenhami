import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as React from "react";
import { parseSiteSettings } from "../lib/site-settings-validation";

function load(file:string,dependencies:Record<string,unknown>,globals:Record<string,unknown>={}) {
  const module={exports:{} as any};
  const source=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
  vm.runInNewContext(source,{...globals,module,exports:module.exports,require:(id:string)=>{
    if(id in dependencies) return dependencies[id];
    throw new Error(`Unexpected module ${id}`);
  }});
  return module.exports;
}

test("public site loader forces D1 freshness before reading settings",async()=>{
  const calls:string[]=[];
  const settings={heroTitle:"Current title",heroDesktopImage:"/current.webp"};
  const loader=load("lib/site-content.ts",{react:{cache:(fn:unknown)=>fn},"@/db":{
    syncDbFromCloud:async(force:boolean)=>{assert.equal(force,true);calls.push("sync");},
    getSiteContentSettings:()=>{assert.equal(calls.at(-1),"sync");calls.push("read");return settings;},
  }}).loadSiteContent;
  assert.equal(await loader(),settings);
  assert.deepEqual(calls,["sync","read"]);
});

test("hero renders saved desktop/mobile sources and saved copy, not hardcoded content",()=>{
  const tree=load("components/LangfarmHeroCarousel.tsx",{
    react:{...React,useState:()=>[0,()=>{}],useEffect(){}},"next/link":"a",
    "lucide-react":{ChevronLeft:"Prev",ChevronRight:"Next"},
  }).LangfarmHeroCarousel({site:{heroBadge:"Saved badge",heroTitle:"Saved title",heroLead:"Saved lead",heroCta:"Saved CTA",heroDesktopImage:"/desktop.webp",heroMobileImage:"/mobile.webp"}});
  const walk=(node:any):any[]=>!node || typeof node!=="object" ? [] : [node,...React.Children.toArray(node.props?.children).flatMap(walk)];
  const nodes=walk(tree),picture=nodes.find(node=>node.type==="picture"),image=walk(picture).find(node=>node.type==="img");
  assert.equal(walk(picture).find(node=>node.type==="source").props.srcSet,"/desktop.webp");
  assert.equal(image.props.src,"/mobile.webp");assert.equal(image.props.alt,"Saved title");
  const strings=nodes.flatMap(node=>React.Children.toArray(node.props?.children).filter(child=>typeof child==="string"));
  for(const value of ["Saved badge","Saved title","Saved lead","Saved CTA"]) assert.ok(strings.includes(value));
});

test("settings accept only safe text fields and supported image/link URLs",()=>{
  assert.deepEqual(parseSiteSettings({heroTitle:" Custom ",unknown:"ignore"}),{heroTitle:"Custom"});
  for(const url of ["data:image/png;base64,AA==","javascript:alert(1)","//evil.test/img","http://unsafe.test/image"]) {
    assert.throws(()=>parseSiteSettings({heroDesktopImage:url}));
  }
  assert.throws(()=>parseSiteSettings({zaloUrl:"/local-not-zalo"}));
  assert.throws(()=>parseSiteSettings({heroTitle:42}));
  assert.throws(()=>parseSiteSettings({hotlineTel:"javascript:alert(1)"}));
  assert.equal(parseSiteSettings({heroMobileImage:"/api/media/uploads/mobile.webp"}).heroMobileImage,"/api/media/uploads/mobile.webp");
});

test("uploaded banner preserves its artwork while manual controls and autoplay keep all three slides",()=>{
  let active=0,tick:()=>void=()=>{},effectCalled=false;
  const component=load("components/LangfarmHeroCarousel.tsx",{
    react:{...React,useState:()=>[active,(next:any)=>{active=typeof next==="function" ? next(active) : next;}],useEffect:(fn:()=>void)=>{if(!effectCalled){effectCalled=true;fn();}}},"next/link":"a",
    "lucide-react":{ChevronLeft:"Prev",ChevronRight:"Next"},
  },{setInterval:(fn:()=>void,ms:number)=>{assert.equal(ms,5500);tick=fn;return 1;},clearInterval(){}});
  const walk=(node:any):any[]=>!node || typeof node!=="object" ? [] : [node,...React.Children.toArray(node.props?.children).flatMap(walk)];
  const uploaded="/api/media/uploads/editor/uploaded-banner.jpg";
  const props={site:{heroDesktopImage:uploaded,heroMobileImage:"/old-mobile.webp",heroTitle:"Printed in image",heroBadge:"Duplicate badge",heroCta:"Order",giftingTitle:"Gift slide",giftingImage:"/gift.webp"}};
  const tree=component.LangfarmHeroCarousel(props);
  const nodes=walk(tree),images=nodes.filter(node=>node.type==="img");
  assert.equal(images.length,1,"do not put a separate brand seal over a designed banner");
  assert.equal(images[0].props.src,uploaded,"mobile uses uploaded artwork when no uploaded mobile version exists");
  assert.match(images[0].props.className,/object-contain/);
  assert.equal(nodes.filter(node=>node.type==="h2").length,0);
  assert.equal(nodes.filter(node=>node.type==="button").length,5,"keep arrows and three slide selectors after upload");
  assert.equal(nodes.find(node=>node.type==="a").props.href,"#menu-chu-luc");
  nodes.find(node=>node.props["aria-label"]==="Slide tiếp theo").props.onClick();
  let next=walk(component.LangfarmHeroCarousel(props));
  assert.equal(active,1);assert.equal(next.find(node=>node.type==="source").props.srcSet,"/gift.webp");
  assert.ok(next.some(node=>node.type==="h2"),"text overlay remains available on the other slides");
  assert.equal(next.find(node=>node.props.className?.includes("h-[380px]")).props.className,nodes.find(node=>node.props.className?.includes("h-[380px]")).props.className,"slide changes must not shift page height");
  tick();assert.equal(active,2);tick();assert.equal(active,0);
  next=walk(component.LangfarmHeroCarousel(props));
  assert.equal(next.find(node=>node.type==="source").props.srcSet,uploaded);
  next.find(node=>node.props["aria-label"]==="Slide trước").props.onClick();assert.equal(active,2);
  next.find(node=>node.props["aria-label"]==="Chuyển đến slide 2").props.onClick();assert.equal(active,1);
});

test("editor image recovery returns only uploaded image metadata, not private objects",async()=>{
  const source=fs.readFileSync("db/index.ts","utf8");
  const fragment=source.slice(source.indexOf("export async function listEditorImages"),source.indexOf("export async function getCloudflareR2Object"));
  const module={exports:{} as any};
  const compiled=ts.transpileModule(fragment,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(compiled,{module,exports:module.exports,URL,AbortSignal,
    isCloudflareR2Enabled:()=>true,getCloudflareAccountId:()=>"test-account",getCloudflareR2BucketName:()=>"test-bucket",getCloudflareApiToken:()=>"test-secret",
    fetch:async(url:URL,options:any)=>{
      assert.equal(url.searchParams.get("prefix"),"uploads/editor/");
      assert.equal(options.headers.Authorization,"Bearer test-secret");
      return {ok:true,json:async()=>({success:true,result:[
        {key:"backups/database.json",last_modified:"2026-10-16"},
        {key:"uploads/editor/internal.json",last_modified:"2026-10-16"},
        {key:`uploads/editor/${"a".repeat(64)}-hero-desktop.webp`,size:100,last_modified:"2026-10-16"},
        {key:"uploads/editor/hero-mobile.png",size:50,last_modified:"2026-10-15"},
      ]})};
    }});
  const result=await module.exports.listEditorImages();
  assert.equal(result.images.length,2);assert.equal(result.images[0].name,"hero-desktop.webp");
  assert.equal(JSON.stringify(result).includes("test-secret"),false);
  assert.ok(result.images.every((image:any)=>image.url.startsWith("/api/media/uploads/editor/")));
});

test("admin site save waits for server acknowledgement and preserves fields on failure",async()=>{
  const fieldIds=['siteHeroBadge','siteHeroTitle','siteHeroLead','siteHeroCta','siteHeroDesktopImage','siteHeroMobileImage','siteGiftingBadge','siteGiftingTitle','siteGiftingDesc','siteGiftingImage','siteHotlineDisplay','siteHotlineTel','siteZaloUrl','siteAddressDisplay','siteServiceHours','siteNoticeBanner','siteAboutHeadline','siteAboutLead'];
  const events:Record<string,()=>void>={};
  const form={querySelectorAll:()=>[],addEventListener:(name:string,fn:()=>void)=>{events[name]=fn;}};
  const fields=Object.fromEntries(fieldIds.map(id=>[id,{value:"",closest:()=>form,after(){},addEventListener(){}}]));
  let saved={heroTitle:"Server title",heroDesktopImage:"/server-desktop.webp",heroMobileImage:"/server-mobile.webp"},allowSave=false,persisted=0;
  const messages:string[]=[],state:any={activeTab:"site",products:{},site:{heroTitle:"Local stale title"}};
  const context:any={appState:state,window:{},document:{getElementById:(id:string)=>fields[id] || null,createElement:()=>({style:{},append(){}})},
    loadSiteSettingsForm(){fields.siteHeroTitle.value=state.site.heroTitle;fields.siteHeroDesktopImage.value=state.site.heroDesktopImage;fields.siteHeroMobileImage.value=state.site.heroMobileImage;},
    renderProductsTable(){},persistAppState(){persisted++;},showToast:(text:string)=>messages.push(text),getAdminAuthHeaders:()=>({}),
    fetch:async(url:string,options:any)=>{
      if(url.startsWith("/api/catalog")) return {ok:true,json:async()=>({ok:true,products:[]})};
      if(options.method!=="POST") return {ok:true,json:async()=>({ok:true,siteSettings:saved})};
      const body=JSON.parse(options.body);assert.equal(body.action,"save_site_settings");
      if(!allowSave) return {ok:false,json:async()=>({ok:false,errorMessage:"D1 unavailable"})};
      saved={...saved,...body.settings};return {ok:true,json:async()=>({ok:true,siteSettings:saved})};
    }};
  vm.runInNewContext(fs.readFileSync("public/admin-media.js","utf8"),context);
  await context.loadSiteSettingsForm();
  assert.equal(fields.siteHeroTitle.value,"Server title");
  fields.siteHeroTitle.value="Edited title";
  events.input();await context.loadSiteSettingsForm();
  assert.equal(fields.siteHeroTitle.value,"Edited title","switching tabs must not discard unsaved edits");
  await context.handleSaveSiteSettings({preventDefault(){}});
  assert.equal(state.site.heroTitle,"Server title");assert.equal(fields.siteHeroTitle.value,"Edited title");
  assert.equal(persisted,0);assert.ok(messages.includes("D1 unavailable"));
  allowSave=true;
  await context.handleSaveSiteSettings({preventDefault(){}});
  assert.equal(state.site.heroTitle,"Edited title");assert.equal(saved.heroTitle,"Edited title");assert.equal(persisted,1);
  await context.loadSiteSettingsForm();assert.equal(fields.siteHeroTitle.value,"Edited title");
});
