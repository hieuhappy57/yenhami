import test from "node:test";
import assert from "node:assert/strict";
import { isPublicMediaKey, isSafePublicMediaContentType } from "../lib/media-storage-policy";

test("public image proxy cannot expose customer/database backups or traverse keys",()=>{
  assert.equal(isPublicMediaKey("uploads/1791861234-product.webp"),true);
  for(const key of ["db/ha-mi-db-state.json","db/backups/private.json.gz","uploads/../db/state.json",
    "uploads/../db/image.png","uploads/%2e%2e/db/image.png","uploads/..\\db/image.png","uploads//image.png","uploads/private.json"]) assert.equal(isPublicMediaKey(key),false,key);
});

test("public uploads cannot run HTML or SVG scripts on the admin origin",()=>{
  assert.equal(isSafePublicMediaContentType("image/png"),true);
  assert.equal(isSafePublicMediaContentType("image/jpeg; charset=utf-8"),true);
  assert.equal(isSafePublicMediaContentType("text/html"),false);
  assert.equal(isSafePublicMediaContentType("image/svg+xml"),false);
  assert.equal(isPublicMediaKey("uploads/script.svg"),false);
});
