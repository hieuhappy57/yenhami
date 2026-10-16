import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {runInNewContext} from "node:vm";

test("admin uploads reject base64 fallback and failed product saves preserve server state",async()=>{
  const messages:string[]=[];
  const fields:Record<string,any>={
    editProductId:{value:"prod-test"},editProductName:{value:"Test dish"},editProductCategory:{value:"nguyen-ban"},
    editProductPrice:{value:"295000"},editProductDesc:{value:"Changed description"},
    editProductImage:{value:"/api/media/uploads/editor/new.webp",addEventListener(){},after(){}},
  };
  const state={currentRole:"OWNER",products:{}};
  let successfulUpload=false,successfulSave=false,catalogReads=0,closed=0,bannerAcknowledged=false;
  const context:any={appState:state,window:{},document:{getElementById:(id:string)=>fields[id] || null,
    createElement:()=>({style:{},append(){},click(){}})},renderProductsTable(){},closeDialog(){closed++;},
    showToast:(message:string)=>messages.push(message),getAdminAuthHeaders:()=>({}),Event:class{},
    FileReader:class {result="data:image/webp;base64,UklGRg==";onload:any;readAsDataURL(){this.onload();}},
    fetch:async(url:string,options:any)=>{
      if(url.startsWith("/api/catalog")) {catalogReads++;return {ok:true,json:async()=>({ok:true,products:[{id:"prod-test",name:"Test dish",imageUrl:"/old.webp",priceVnd:295000,category:"nguyen-ban",volumeMl:200}]})};}
      const body=JSON.parse(options.body);
      if(body.action==="upload_media_r2") return {ok:true,json:async()=>successfulUpload ? {ok:true,storedInR2:true,url:"/api/media/uploads/editor/verified.webp",...(bannerAcknowledged&&body.siteImageField ? {siteSettings:{[body.siteImageField]:"/api/media/uploads/editor/verified.webp"}} : {})} : {ok:true,storedInR2:false,url:"data:image/webp;base64,UklGRg=="}};
      if(successfulSave) return {ok:true,json:async()=>({ok:true,product:{id:"prod-test",name:"Server canonical name",imageUrl:"/verified.webp",priceVnd:295000}})};
      return {ok:false,json:async()=>({ok:false,errorMessage:"D1 unavailable"})};
    }};
  runInNewContext(fs.readFileSync("public/admin-media.js","utf8"),context);
  await assert.rejects(context.window.uploadImageToR2({name:"image.webp",size:100}),/Chưa lưu/);
  successfulUpload=true;
  assert.equal(await context.window.uploadImageToR2({name:"image.webp",size:100}),"/api/media/uploads/editor/verified.webp");
  await assert.rejects(context.window.uploadImageToR2({name:"banner.webp",size:100},"heroMobileImage"),/chưa gắn/);
  bannerAcknowledged=true;
  assert.equal(await context.window.uploadImageToR2({name:"banner.webp",size:100},"heroMobileImage"),"/api/media/uploads/editor/verified.webp");
  assert.equal((state as any).site.heroMobileImage,"/api/media/uploads/editor/verified.webp");
  await context.handleSaveProduct({preventDefault(){},currentTarget:{querySelector:()=>({disabled:false})}});
  assert.equal((state.products as any)["prod-test"].image,"/old.webp");
  assert.ok(messages.includes("D1 unavailable"));
  assert.equal(closed,0);
  successfulSave=true;
  const readsBefore=catalogReads;
  await context.handleSaveProduct({preventDefault(){},currentTarget:{querySelector:()=>({disabled:false})}});
  assert.equal(catalogReads,readsBefore,"acknowledged product save must not wait for extra catalog reads");
  assert.equal((state.products as any)["prod-test"].name,"Server canonical name");
  assert.equal(closed,1);
});
