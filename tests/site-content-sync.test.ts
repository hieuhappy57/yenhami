import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as React from "react";
import { parseSiteSettings } from "../lib/site-settings-validation";

function load(file:string,dependencies:Record<string,unknown>) {
  const module={exports:{} as any};
  const source=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
  vm.runInNewContext(source,{module,exports:module.exports,require:(id:string)=>{
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
