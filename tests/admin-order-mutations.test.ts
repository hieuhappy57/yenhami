import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync('public/admin-order-mutations.js', 'utf8');
function setup(fetch: (...args: any[]) => Promise<any>) {
  const order = {id:'QA',referenceCode:'QA',rowVersion:1,status:'pending',ledger:[],items:[]};
  const state = {currentRole:'OWNER',orders:[order]};
  const inputs: Record<string,any> = {colAmount_QA:{value:'100'},colMethod_QA:{value:'Tiền mặt'},orderDetailModal:{open:false}};
  const messages: string[] = [];
  const context: any = {appState:state,fetch,crypto:{randomUUID:()=> 'stable-retry-key'},
    document:{getElementById:(id:string)=>inputs[id],querySelectorAll:()=>[]},
    mapServerOrderToUiOrder:(o:any)=>({...o}),getAdminAuthHeaders:()=>({'Content-Type':'application/json'}),
    persistAppState:()=>{},renderOrdersTable:()=>{},updateDashboard:()=>{},renderKitchenTable:()=>{},renderCustomersTable:()=>{},
    openOrderDetail:()=>{},fetchServerOrders:async()=>{},lockAdminApp:()=>{},showToast:(m:string)=>messages.push(m),
    computeOrderFinancials:()=>({outstanding:500,netCollected:100}),window:{prompt:()=> 'QA reason'}};
  runInNewContext(source,context);
  return {context,state,messages};
}

test('status changes only after server acknowledgement and uses canonical version',async()=>{
  let release: any;
  const {context,state} = setup(()=>new Promise(resolve=>{release=resolve;}));
  const pending = context.progressOrderStatus('QA','confirmed');
  assert.equal(state.orders[0].status,'pending');
  release({ok:true,status:200,json:async()=>({ok:true,order:{id:'QA',rowVersion:2,status:'confirmed',ledger:[]}})});
  await pending;
  assert.equal(state.orders[0].status,'confirmed');
  assert.equal(state.orders[0].rowVersion,2);
});

test('failed collection leaves ledger unchanged and retry uses the same key',async()=>{
  const bodies:any[]=[];
  const {context,state} = setup(async(_url:any,options:any)=>{bodies.push(JSON.parse(options.body));throw new Error('offline');});
  await context.handleRecordCollection({preventDefault(){}},'QA');
  await context.handleRecordCollection({preventDefault(){}},'QA');
  assert.equal(state.orders[0].ledger.length,0);
  assert.equal(bodies[0].idempotencyKey,bodies[1].idempotencyKey);
});

test('collection parses response and reads real ledger occurrence date',async()=>{
  const {context,state} = setup(async()=>({ok:true,status:200,json:async()=>({ok:true,order:{id:'QA',rowVersion:2,status:'pending',source:'ZALO',ledger:[{id:'cash',type:'COLLECTION',amountVnd:100,occurredAt:'2026-10-11T06:00:00Z',method:'CASH'}]}})}));
  await context.handleRecordCollection({preventDefault(){}},'QA');
  assert.equal((state.orders[0].ledger[0] as any).amount,100);
  assert.equal((state.orders[0].ledger[0] as any).date,'2026-10-11T06:00:00Z');
  assert.equal((state.orders[0] as any).source,'Zalo');
});

test('all admin entry points load mutation fixes outside the inline script',()=>{
  for(const file of ['public/admin.html','public/admin-demo.html','demo/admin/index.html']) {
    const html=readFileSync(file,'utf8');
    assert.equal(html.indexOf('<script src="/admin-order-mutations.js"></script>'),html.lastIndexOf('<script src="/admin-order-mutations.js"></script>'));
    assert.ok(html.lastIndexOf('<script src="/admin-order-mutations.js"></script>')>html.lastIndexOf('if (window.lucide) lucide.createIcons();'));
  }
});
