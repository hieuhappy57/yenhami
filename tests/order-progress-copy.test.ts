import test from "node:test";
import assert from "node:assert/strict";
import { ORDER_PROGRESS_COPY } from "../lib/order-progress-copy";

test("customer receipt copy follows every order state", () => {
  for (const [status, copy] of Object.entries(ORDER_PROGRESS_COPY)) {
    assert.ok(copy.label && copy.title && copy.heading && copy.message, status);
    if (status !== "PENDING_CONFIRMATION") {
      assert.doesNotMatch(`${copy.title} ${copy.heading} ${copy.message}`, /Chờ Hà Mi xác nhận/);
    }
  }
  assert.match(ORDER_PROGRESS_COPY.COMPLETED.title, /giao thành công/);
  assert.match(ORDER_PROGRESS_COPY.CANCELLED.title, /hủy/);
});
