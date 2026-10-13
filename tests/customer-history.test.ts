import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { confirmOrderWithPaymentByStaff, getOrderRequestByReference, getSqliteDb, resetDbConnectionForTest, submitOrderRequest, updateOrderStatusByStaff, updateProductStatusByStaff } from "../db/index";

test("customer, recipient, payment and service timestamps survive the full order flow",()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),"hami-customer-history-"));
  const previous=process.env.HAMI_DB_PATH;
  process.env.HAMI_DB_PATH=path.join(temp,"orders.sqlite");
  resetDbConnectionForTest();
  try {
    const input={idempotencyKey:"customer-history-stable-request",source:"WEBSITE" as const,orderPurpose:"GIFT" as const,
      buyerName:"QA Buyer",buyerPhone:"0905000001",recipientName:"QA Recipient",recipientPhone:"0905000002",
      giftMessage:"QA greeting",buyerNote:"Less sweet",addressDetail:"QA delivery address",zoneId:"zone-hai-chau",
      requestedDate:"2026-10-20",slotId:"slot-afternoon",items:[{productId:"prod-thanh-nguyen",quantity:2}],
      now:new Date("2026-10-13T03:00:00Z")};
    const created=submitOrderRequest(input);
    assert.equal(created.ok,true);
    const reference=created.order!.referenceCode;
    const before=getOrderRequestByReference({referenceCode:reference,isStaff:true})!;
    const confirmation={referenceCode:reference,expectedVersion:before.rowVersion,shippingFeeVnd:20000,
      amountVnd:before.subtotalVnd+20000,method:"BANK_TRANSFER" as const,idempotencyKey:"customer-history-confirm",
      staffUsername:"qa-staff",staffDisplayName:"QA Staff"};
    assert.equal(confirmOrderWithPaymentByStaff(confirmation).ok,true);
    assert.equal(confirmOrderWithPaymentByStaff(confirmation).deduplicated,true);
    for(const status of ["PREPARING","DELIVERING","COMPLETED"] as const) {
      const current=getOrderRequestByReference({referenceCode:reference,isStaff:true})!;
      assert.equal(updateOrderStatusByStaff({referenceCode:reference,newOrderStatus:status,expectedVersion:current.rowVersion,
        staffUsername:"qa-staff",staffDisplayName:"QA Staff",note:"QA step"}).ok,true);
    }
    updateProductStatusByStaff({productId:"prod-thanh-nguyen",status:"AVAILABLE",priceVnd:999999});
    assert.equal(submitOrderRequest(input).deduplicated,true);
    resetDbConnectionForTest();
    const restored=getOrderRequestByReference({referenceCode:reference,isStaff:true})!;
    assert.equal(restored.orderStatus,"COMPLETED");
    assert.equal(restored.paymentStatus,"PAID");
    assert.equal(restored.items[0].unitPriceSnapshot,before.items[0].unitPriceSnapshot);
    assert.equal(restored.ledger.length,1);
    assert.equal(restored.ledger[0].amountVnd,confirmation.amountVnd);
    assert.equal(restored.buyerNote,"Less sweet");
    assert.equal(restored.giftMessage,"QA greeting");
    for(const value of [restored.confirmedAt,restored.preparingStartedAt,restored.preparedDoneAt,restored.completedAt]) assert.ok(value);
    const db=getSqliteDb();
    assert.equal((db.prepare("SELECT COUNT(*) AS n FROM customers").get() as {n:number}).n,1);
    assert.equal((db.prepare("SELECT phone FROM customers").get() as {phone:string}).phone,input.buyerPhone);
    assert.equal((db.prepare("SELECT recipient_phone FROM customer_addresses").get() as {recipient_phone:string}).recipient_phone,input.recipientPhone);
    assert.equal((db.prepare("SELECT COUNT(*) AS n FROM order_status_history").get() as {n:number}).n,5);
  } finally {
    resetDbConnectionForTest();
    if(previous===undefined) delete process.env.HAMI_DB_PATH; else process.env.HAMI_DB_PATH=previous;
    fs.rmSync(temp,{recursive:true,force:true});
  }
});
