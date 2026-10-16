import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as React from "react";
import * as productLines from "../lib/product-lines";

test("home is request-rendered and reads current product names and prices before rendering",async()=>{
  const module={exports:{} as any};
  let products=[{id:"prod-qa",name:"Original",priceVnd:100000,productLine:"fresh-bowl"}];
  let syncCalls=0,readCalls=0;
  const source=ts.transpileModule(fs.readFileSync("app/page.tsx","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
  vm.runInNewContext(source,{module,exports:module.exports,require:(id:string)=>{
    if(id==="react") return React;
    if(id==="@/lib/product-lines") return productLines;
    if(id==="@/db") return {
      syncDbFromCloud:async(force:boolean)=>{assert.equal(force,true);syncCalls++;},
      getAllProducts:()=>{assert.equal(syncCalls,++readCalls);return products;},
      getAllPosts:()=>[],
    };
    if(id==="next/link") return "a";
    if(id==="lucide-react") return {ArrowRight:"ArrowRight",CookingPot:"CookingPot",Leaf:"Leaf",Truck:"Truck"};
    if(id.startsWith("@/components/")) {const name=id.split("/").pop()!;return {[name]:name};}
    throw new Error(`Unexpected module ${id}`);
  }});
  assert.equal(module.exports.dynamic,"force-dynamic","ISR can serve seed HTML or stale prices after a CMS save");
  const menus=(node:any):any[]=>!node || typeof node!=="object" ? [] : [
    ...(node.type==="ProductMenuSection" || node.type==="CatalogProductLinesSection" ? [node.props.products] : []),
    ...React.Children.toArray(node.props?.children).flatMap(menus),
  ];
  const original=menus(await module.exports.default());
  assert.equal(original.length,2);
  products=[{...products[0],name:"Current name",priceVnd:320000}];
  const updated=menus(await module.exports.default());
  for(const menu of updated) {assert.equal(menu[0].name,"Current name");assert.equal(menu[0].priceVnd,320000);}
  products=[];
  for(const menu of menus(await module.exports.default())) assert.equal(menu.length,0);
  assert.equal(syncCalls,3);
});
