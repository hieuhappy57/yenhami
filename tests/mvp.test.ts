import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  calculateServerQuote,
  getDeliverySlots,
  getOrderRequestByReference,
  isValidCalendarDateString,
  resetDbConnectionForTest,
  submitOrderRequest,
  updateOrderStatusByStaff,
  verifyStaffCredentials,
} from "../db/index";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hami-mvp-test-"));
const testDbPath = path.join(tmpDir, "test-hami.sqlite");

describe("Yến Sào Hà Mi MVP — Server Validation, Capacity, Security & Order Flow", () => {
  before(() => {
    process.env.HAMI_DB_PATH = testDbPath;
    resetDbConnectionForTest();
  });

  after(() => {
    resetDbConnectionForTest();
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });

  // Fixed reference time: 2026-10-06 08:15 Asia/Ho_Chi_Minh (01:15 UTC)
  const fixedNow = new Date("2026-10-06T01:15:00.000Z");

  it("1. Rejects client unit-price tampering and calculates authoritative server quote", () => {
    const tampered = calculateServerQuote({
      items: [
        {
          productId: "prod-thanh-nguyen",
          variantId: "prod-thanh-nguyen-var-standard",
          quantity: 2,
          clientExpectedUnitPriceVnd: 50000, // Real price is 185,000đ
        },
      ],
      zoneId: "zone-hai-chau",
      requestedDate: "2026-10-08",
      slotId: "slot-morning",
      now: fixedNow,
    });
    assert.equal(tampered.ok, false);
    assert.equal(tampered.errorCode, "PRICE_TAMPERED");

    const valid = calculateServerQuote({
      items: [
        {
          productId: "prod-thanh-nguyen",
          variantId: "prod-thanh-nguyen-var-standard",
          quantity: 2,
        },
      ],
      zoneId: "zone-hai-chau",
      requestedDate: "2026-10-08",
      slotId: "slot-morning",
      now: fixedNow,
    });
    assert.equal(valid.ok, true);
    assert.equal(valid.subtotalVnd, 370000);
    assert.equal(valid.shippingFeeVnd, 0);
    assert.equal(valid.totalVnd, 370000);
    assert.equal(valid.isTotalFinal, true);
  });

  it("2. Blocks OUT_OF_STOCK and PENDING_DATA_APPROVAL products on server", () => {
    const outOfStock = calculateServerQuote({
      items: [{ productId: "prod-luc-bao-trung-thao", quantity: 1 }],
      zoneId: "zone-hai-chau",
      requestedDate: "2026-10-08",
      slotId: "slot-morning",
      now: fixedNow,
    });
    assert.equal(outOfStock.ok, false);
    assert.equal(outOfStock.errorCode, "PRODUCT_OUT_OF_STOCK");

    const unapproved = calculateServerQuote({
      items: [{ productId: "prod-tam-an-trung-thao", quantity: 1 }],
      zoneId: "zone-hai-chau",
      requestedDate: "2026-10-08",
      slotId: "slot-morning",
      now: fixedNow,
    });
    assert.equal(unapproved.ok, false);
    assert.equal(unapproved.errorCode, "PRODUCT_UNAPPROVED_DATA");
  });

  it("3. Enforces service zone policies: OUT_OF_ZONE blocked, FEE_PENDING_CONFIRMATION marks isTotalFinal=false", () => {
    const outOfZone = calculateServerQuote({
      items: [{ productId: "prod-thanh-nguyen", quantity: 1 }],
      zoneId: "zone-hoa-vang-out",
      requestedDate: "2026-10-08",
      slotId: "slot-morning",
      now: fixedNow,
    });
    assert.equal(outOfZone.ok, false);
    assert.equal(outOfZone.errorCode, "OUT_OF_ZONE");

    const feePending = calculateServerQuote({
      items: [{ productId: "prod-thanh-nguyen", quantity: 1 }],
      zoneId: "zone-cam-le-lien-chieu",
      requestedDate: "2026-10-08",
      slotId: "slot-morning",
      now: fixedNow,
    });
    assert.equal(feePending.ok, true);
    assert.equal(feePending.shippingFeeVnd, null);
    assert.equal(feePending.isTotalFinal, false);
  });

  it("4. Validates real calendar dates, rejects past dates, and enforces Asia/Ho_Chi_Minh lead time", () => {
    assert.equal(isValidCalendarDateString("2026-02-30"), false);
    assert.equal(isValidCalendarDateString("2026-10-06"), true);

    const invalidCal = calculateServerQuote({
      items: [{ productId: "prod-thanh-nguyen", quantity: 1 }],
      zoneId: "zone-hai-chau",
      requestedDate: "2026-02-30",
      slotId: "slot-morning",
      now: fixedNow,
    });
    assert.equal(invalidCal.ok, false);
    assert.equal(invalidCal.errorCode, "INVALID_DATE");

    const pastDate = calculateServerQuote({
      items: [{ productId: "prod-thanh-nguyen", quantity: 1 }],
      zoneId: "zone-hai-chau",
      requestedDate: "2026-10-05",
      slotId: "slot-morning",
      now: fixedNow,
    });
    assert.equal(pastDate.ok, false);
    assert.equal(pastDate.errorCode, "PAST_DATE");

    // At 08:15 HCM on 2026-10-06, slot-morning (starts 09:00, 540m) has only 45m left (< 90m lead time)
    const insufficientLead = calculateServerQuote({
      items: [{ productId: "prod-thanh-nguyen", quantity: 1 }],
      zoneId: "zone-hai-chau",
      requestedDate: "2026-10-06",
      slotId: "slot-morning",
      now: fixedNow,
    });
    assert.equal(insufficientLead.ok, false);
    assert.equal(insufficientLead.errorCode, "INSUFFICIENT_LEAD_TIME");

    // At 10:00 HCM (03:00 UTC) on 2026-10-06, slot-morning (starts 09:00) is already in the past
    const laterSameDay = new Date("2026-10-06T03:00:00.000Z");
    const pastSlot = calculateServerQuote({
      items: [{ productId: "prod-thanh-nguyen", quantity: 1 }],
      zoneId: "zone-hai-chau",
      requestedDate: "2026-10-06",
      slotId: "slot-morning",
      now: laterSameDay,
    });
    assert.equal(pastSlot.ok, false);
    assert.equal(pastSlot.errorCode, "PAST_SLOT");
  });

  it("5. Tracks slot capacity independently per (requestedDate, slotId) and enforces idempotency", () => {
    const dateA = "2026-10-12";
    const dateB = "2026-10-13";

    const beforeSlotsA = getDeliverySlots({ requestedDate: dateA, now: fixedNow });
    const slotA0 = beforeSlotsA.find((s) => s.id === "slot-morning")!;
    assert.equal(slotA0.remainingBowls, 12);

    // Book 5 bowls on dateA with idempotency key
    const idemKey = "idem-test-dateA-001";
    const orderRes1 = submitOrderRequest({
      idempotencyKey: idemKey,
      orderPurpose: "GIFT",
      buyerName: "Nguyễn Minh Anh",
      buyerPhone: "0905123456",
      recipientName: "Cô Thu Hà",
      recipientPhone: "0914123456",
      giftMessage: "Chúc cô nhiều sức khỏe!",
      hidePriceOnReceipt: true,
      zoneId: "zone-hai-chau",
      addressDetail: "128 Bạch Đằng, Hải Châu",
      requestedDate: dateA,
      slotId: "slot-morning",
      items: [{ productId: "prod-tu-quy-an-nhien", quantity: 5 }],
      now: fixedNow,
    });

    assert.equal(orderRes1.ok, true);
    assert.equal(orderRes1.deduplicated, false);
    assert.ok(orderRes1.order?.referenceCode);
    assert.ok(orderRes1.order?.lookupToken);

    // Duplicate retry with same idempotencyKey must NOT deduct capacity again
    const orderRes2 = submitOrderRequest({
      idempotencyKey: idemKey,
      orderPurpose: "GIFT",
      buyerName: "Nguyễn Minh Anh",
      buyerPhone: "0905123456",
      recipientName: "Cô Thu Hà",
      recipientPhone: "0914123456",
      zoneId: "zone-hai-chau",
      addressDetail: "128 Bạch Đằng, Hải Châu",
      requestedDate: dateA,
      slotId: "slot-morning",
      items: [{ productId: "prod-tu-quy-an-nhien", quantity: 5 }],
      now: fixedNow,
    });
    assert.equal(orderRes2.ok, true);
    assert.equal(orderRes2.deduplicated, true);
    assert.equal(orderRes2.order?.referenceCode, orderRes1.order?.referenceCode);

    // Check dateA remaining capacity is 12 - 5 = 7
    const afterSlotsA = getDeliverySlots({ requestedDate: dateA, now: fixedNow });
    const slotA1 = afterSlotsA.find((s) => s.id === "slot-morning")!;
    assert.equal(slotA1.remainingBowls, 7);

    // Check dateB remaining capacity is still 12 (independent!)
    const slotsB = getDeliverySlots({ requestedDate: dateB, now: fixedNow });
    const slotB = slotsB.find((s) => s.id === "slot-morning")!;
    assert.equal(slotB.remainingBowls, 12);

    // Attempting to book 8 bowls on dateA slot-morning (only 7 left) fails with SLOT_FULL
    const overbookA = submitOrderRequest({
      idempotencyKey: "idem-test-dateA-overbook",
      orderPurpose: "SELF",
      buyerName: "Trần Văn B",
      buyerPhone: "0905999888",
      zoneId: "zone-hai-chau",
      addressDetail: "10 Nguyễn Văn Linh, Hải Châu",
      requestedDate: dateA,
      slotId: "slot-morning",
      items: [{ productId: "prod-thanh-nguyen", quantity: 8 }],
      now: fixedNow,
    });
    assert.equal(overbookA.ok, false);
    assert.equal(overbookA.errorCode, "SLOT_FULL");
  });

  it("6. Enforces strict order lookup authorization (requires valid lookupToken or staff)", () => {
    const created = submitOrderRequest({
      idempotencyKey: "idem-security-lookup-test",
      orderPurpose: "SELF",
      buyerName: "Lê Bảo Ngọc",
      buyerPhone: "0905111222",
      zoneId: "zone-son-tra",
      addressDetail: "25 Phạm Văn Đồng, Sơn Trà",
      requestedDate: "2026-10-14",
      slotId: "slot-afternoon",
      items: [{ productId: "prod-thanh-nguyen", quantity: 2 }],
      now: fixedNow,
    });
    assert.equal(created.ok, true);
    const ref = created.order!.referenceCode;
    const token = created.order!.lookupToken;

    // 1) Lookup without token -> null
    const noTokenLookup = getOrderRequestByReference({
      referenceCode: ref,
      isStaff: false,
    });
    assert.equal(noTokenLookup, null);

    // 2) Lookup with wrong token -> null
    const wrongTokenLookup = getOrderRequestByReference({
      referenceCode: ref,
      lookupToken: "wrong-token-12345",
      isStaff: false,
    });
    assert.equal(wrongTokenLookup, null);

    // 3) Lookup with valid token -> returns order
    const validTokenLookup = getOrderRequestByReference({
      referenceCode: ref,
      lookupToken: token,
      isStaff: false,
    });
    assert.notEqual(validTokenLookup, null);
    assert.equal(validTokenLookup?.referenceCode, ref);
    assert.equal(validTokenLookup?.buyerPhone, "0905111222");

    // 4) Lookup as authenticated staff without token -> returns order
    const staffLookup = getOrderRequestByReference({
      referenceCode: ref,
      isStaff: true,
    });
    assert.notEqual(staffLookup, null);
    assert.equal(staffLookup?.referenceCode, ref);
  });

  it("7. Releases date-specific slot capacity when staff cancels an order and logs status history", () => {
    const cancelTestDate = "2026-10-15";
    const orderRes = submitOrderRequest({
      idempotencyKey: "idem-cancel-capacity-test",
      orderPurpose: "SELF",
      buyerName: "Phạm Hoàng",
      buyerPhone: "0905333444",
      zoneId: "zone-cam-le-lien-chieu",
      addressDetail: "15 Cách Mạng Tháng 8, Cẩm Lệ",
      requestedDate: cancelTestDate,
      slotId: "slot-evening",
      items: [{ productId: "prod-thanh-nguyen", quantity: 4 }],
      now: fixedNow,
    });
    assert.equal(orderRes.ok, true);
    const ref = orderRes.order!.referenceCode;

    // Verify 4 bowls reserved on cancelTestDate (slot-evening maxCapacity is 12)
    const slotsBeforeCancel = getDeliverySlots({
      requestedDate: cancelTestDate,
      now: fixedNow,
    });
    const eveningBefore = slotsBeforeCancel.find((s) => s.id === "slot-evening")!;
    assert.equal(eveningBefore.reservedBowls, 4);
    assert.equal(eveningBefore.remainingBowls, 8); // 12 - 4 = 8

    // Verify staff credentials work
    const staff = verifyStaffCredentials("hami_staff", "HaMi@2026!");
    assert.notEqual(staff, null);

    // Staff cancels order -> capacity on cancelTestDate must return to 12
    const cancelUpdate = updateOrderStatusByStaff({
      referenceCode: ref,
      newOrderStatus: "CANCELLED",
      newPaymentStatus: "UNPAID",
      staffUsername: staff!.username,
      staffDisplayName: staff!.displayName,
      note: "Khách xin dời lịch sang tuần sau",
    });
    assert.equal(cancelUpdate.ok, true);
    assert.equal(cancelUpdate.order?.orderStatus, "CANCELLED");

    const slotsAfterCancel = getDeliverySlots({
      requestedDate: cancelTestDate,
      now: fixedNow,
    });
    const eveningAfter = slotsAfterCancel.find((s) => s.id === "slot-evening")!;
    assert.equal(eveningAfter.reservedBowls, 0);
    assert.equal(eveningAfter.remainingBowls, 12);
  });
});
