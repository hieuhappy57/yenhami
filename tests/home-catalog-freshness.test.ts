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

test("jar filters follow actual volumes and show all current products without fixed prices",()=>{
  const module={exports:{} as any};
  const source=ts.transpileModule(fs.readFileSync("components/CatalogProductLinesSection.tsx","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
  vm.runInNewContext(source,{module,exports:module.exports,require:(id:string)=>{
    if(id==="react") return {...React,useMemo:(fn:()=>unknown)=>fn(),useState:(initial:unknown)=>[initial,()=>{}]};
    if(id==="@/lib/product-lines") return productLines;
    if(id==="next/link") return "a";
    if(id==="lucide-react") return {Check:"Check",Plus:"Plus"};
    if(id==="./CartProvider") return {useCart:()=>({addItem(){}})};
    throw new Error(`Unexpected module ${id}`);
  }});
  const products=[70,100,120].map(volumeMl=>({id:`jar-${volumeMl}`,slug:`jar-${volumeMl}`,name:`Jar ${volumeMl}`,productLine:"jar",volumeMl,priceVnd:75000,status:"AVAILABLE",variants:[],supportedOptions:[],ingredients:[]}));
  const walk=(node:any):any[]=>!node || typeof node!=="object" ? [] : [node,...React.Children.toArray(node.props?.children).flatMap(walk)];
  const nodes=walk(module.exports.CatalogProductLinesSection({products}));
  const tabs=nodes.filter(node=>node.props.role==="tab");
  const text=(node:any):string=>typeof node==="object" && node ? React.Children.toArray(node.props?.children).map(text).join("") : String(node ?? "");
  assert.deepEqual(tabs.map(text),["Hũ 70ml","Hũ 100ml","Hũ 120ml","Tất cả (3)"]);
  assert.equal(tabs.at(-1).props["aria-selected"],true);
  const cards=nodes.filter(node=>node.type==="article");
  assert.equal(cards.length,3);
  assert.ok(cards.every(node=>node.props.className!=="hidden"));
  assert.ok(!nodes.some(node=>text(node).includes("40k")));
});
