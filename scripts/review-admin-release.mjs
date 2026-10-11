import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const html=readFileSync('public/admin.html','utf8');
const section=(start,end)=>{const a=html.indexOf(start),b=html.indexOf(end,a+start.length);assert.ok(a>=0&&b>a);return html.slice(a,b);};
const mapper=section('    function mapServerOrderToUiOrder(', '    let isFetchingOrders');
const financial=section('    function computeOrderFinancials(', '    function handleRoleSwitch(');
const fixture={id:'synthetic-order',referenceCode:'TEST-ONLY',createdAt:'2026-10-11T03:00:00.000Z',updatedAt:'2026-10-11T04:00:00.000Z',requestedDate:'2026-10-12',orderStatus:'PENDING_CONFIRMATION',paymentStatus:'UNPAID',subtotalVnd:370000,shippingFeeVnd:25000,totalVnd:395000,items:[{productId:'synthetic-product',quantity:2,unitPriceSnapshot:185000}]};
const stub=()=>({value:'',style:{},innerText:'',innerHTML:'',disabled:false});
const base={SIMULATED_TODAY:'2026-10-11',showToast:()=>{},formatVND:v=>v,esc:v=>v,renderDailyChart:()=>{},updateDashboard:()=>{},renderOrdersTable:()=>{},renderCustomersTable:()=>{},renderKitchenTable:()=>{},persistAppState:()=>{},openOrderDetail:()=>{},console:{warn:()=>{}}};

test('released mapper must preserve ISO dates for dashboard filtering',()=>{
  const el={dashPeriod:{value:'custom'},dashSource:{value:'ALL'},dashStart:{value:'2026-10-11'},dashEnd:{value:'2026-10-11'}};
  const get=id=>el[id]??(el[id]=stub());
  runInNewContext(`${mapper}\n${financial}\n${section('    function updateDashboard(', '    function renderDailyChart(')}\nappState.orders=[mapServerOrderToUiOrder(fixture)];updateDashboard();`,{...base,fixture,appState:{orders:[]},document:{getElementById:get}});
  assert.equal(el.kpiNewRequests.innerText,1);
});

test('refunded server order must not reconstruct negative receipts from a refund alone',()=>{
  const fin=runInNewContext(`${mapper}\n${financial}\ncomputeOrderFinancials(mapServerOrderToUiOrder(fixture));`,{fixture:{...fixture,paymentStatus:'REFUNDED'}});
  assert.equal(fin.netCollected,0);
});

test('partial collection must survive next successful server synchronization',async()=>{
  const state={currentRole:'OWNER',orders:[]};let calls=0;
  const el={'colAmount_TEST-ONLY':{value:'100000'},'colMethod_TEST-ONLY':{value:'Cash'}};
  const ctx={...base,fixture,appState:state,document:{getElementById:id=>el[id]??null},fetch:async()=>{calls++;return {status:200,json:async()=>({ok:true,orders:[fixture]})}}};
  await runInNewContext(`${mapper}\n${financial}\n${section('    let isFetchingOrders','    function renderOrdersTable(')}\n${section('    function handleRecordCollection(', '    function handleRecordRefund(')}\nappState.orders=[mapServerOrderToUiOrder(fixture)];handleRecordCollection({preventDefault(){}},'TEST-ONLY',395000);fetchServerOrders(true);`,ctx);
  assert.equal(state.orders[0].ledger.reduce((s,t)=>s+t.amount,0),100000);
});

test('server 401 must not unlock admin even if local credential check succeeds',async()=>{
  let unlocked=false;
  const el={authGateUsernameInput:{value:'synthetic-user'},authGatePasswordInput:{value:'test-only-password'},authGateErrorMsg:stub(),authGateSubmitBtn:stub()};
  const ctx={...base,document:{getElementById:id=>el[id]},authenticateUser:()=>({ok:true,staff:{name:'Synthetic'},role:'OWNER'}),fetch:async()=>({status:401,ok:false,json:async()=>({ok:false})}),saveAdminSession:()=>{},unlockAdminApp:()=>{unlocked=true;},renderStaffTable:()=>{}};
  await runInNewContext(`${section('    async function handleAuthGateLogin(', '        function handleStaffLoginSubmit(')}\nhandleAuthGateLogin({preventDefault(){}});`,ctx);
  assert.equal(unlocked,false);
});

test('failed server status update must not leave order confirmed in UI',async()=>{
  const state={currentRole:'OWNER',orders:[{id:'TEST-ONLY',status:'pending',paymentStatus:'UNPAID'}]};
  await runInNewContext(`${section('    async function progressOrderStatus(', '    async function promptCancelOrder(')}\nprogressOrderStatus('TEST-ONLY','confirmed');`,{...base,appState:state,fetch:async()=>({status:400,ok:false,json:async()=>({ok:false})})});
  assert.equal(state.orders[0].status,'pending');
});
