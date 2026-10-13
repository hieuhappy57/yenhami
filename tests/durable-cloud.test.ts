import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { DurableCloudStore, CloudPersistenceError, changedRowStatements, type CloudSnapshot, type CloudStatement } from "../db/durable-cloud";

const config = {
  accountId:"isolated-test-account",databaseId:"isolated-test-database",apiToken:"not-a-real-token",
  tableKeys:{orders:["id"],items:["id"]},
  schema:()=>[{sql:"CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,phone TEXT NOT NULL,version INTEGER NOT NULL);"},
    {sql:"CREATE TABLE IF NOT EXISTS items(id TEXT PRIMARY KEY,order_id TEXT NOT NULL,quantity INTEGER NOT NULL CHECK(quantity>0));"}],
};
const snapshot = (tables:CloudSnapshot["tables"]):CloudSnapshot => ({version:2,updatedAt:new Date().toISOString(),tables});

test("D1 durable transaction and recovery",async(t)=>{
  const db = new DatabaseSync(":memory:");
  const originalFetch = globalThis.fetch;
  let partialFailure = false;
  let timeoutAfterCommit = false;
  globalThis.fetch = (async(_url,init)=>{
    const body = JSON.parse(String(init?.body));
    const statements:CloudStatement[] = body.batch || [body];
    if (partialFailure) return Response.json({success:true,result:[{success:false,error:"SQL failure"}]});
    db.exec("BEGIN IMMEDIATE;");
    try {
      const result = statements.map((statement)=>{
        let results:unknown[] = [];
        if (statement.sql.trim().split(";").filter(Boolean).length>1) db.exec(statement.sql);
        else {
          const prepared = db.prepare(statement.sql);
          if (/RETURNING|^\s*SELECT|^\s*PRAGMA/i.test(statement.sql)) results=prepared.all(...statement.params || []);
          else prepared.run(...statement.params || []);
        }
        return {success:true,results};
      });
      db.exec("COMMIT;");
      if (timeoutAfterCommit && statements.some((statement)=>statement.sql.includes("hami_commit_guard(id,allowed)"))) throw new Error("Network disconnected after commit");
      return Response.json({success:true,result});
    } catch(error) {
      try {db.exec("ROLLBACK;");} catch {}
      if (timeoutAfterCommit) throw error;
      return Response.json({success:false,errors:[{message:(error as Error).message}]});
    }
  }) as typeof fetch;
  try {
    const first = new DurableCloudStore(config);
    await first.acquire();
    await first.commit(snapshot({orders:[],items:[]}),snapshot({orders:[{id:"order-1",phone:"0905000001",version:1}],items:[{id:"item-1",order_id:"order-1",quantity:2}]}),true);
    await first.release();

    await t.test("cold start restores complete order and item data",async()=>{
      const restarted = new DurableCloudStore(config);
      assert.equal(await restarted.isReady(),true);
      const restored = await restarted.read();
      assert.equal(restored.tables.orders[0].phone,"0905000001");
      assert.equal(restored.tables.items[0].quantity,2);
    });
    await t.test("only changed records are written",()=>{
      const before=snapshot({orders:[{id:"order-1",phone:"0905000001",version:1}],items:[{id:"item-1",order_id:"order-1",quantity:2}]});
      const after=snapshot({...before.tables,orders:[{...before.tables.orders[0],version:2}]});
      const delta=changedRowStatements(before,after,config.tableKeys);
      assert.equal(delta.length,1);
      assert.ok(delta[0].sql.includes('"orders"'));
      assert.equal(delta[0].params?.[1],"0905000001");
    });
    await t.test("a failing item rolls back its order in the same transaction",async()=>{
      await first.acquire();
      const before=await first.read();
      const after=snapshot({orders:[...before.tables.orders,{id:"order-invalid",phone:"0905000002",version:1}],items:[...before.tables.items,{id:"item-invalid",order_id:"order-invalid",quantity:-1}]});
      await assert.rejects(first.commit(before,after),CloudPersistenceError);
      assert.equal((await first.read()).tables.orders.length,1);
      await first.release();
    });
    await t.test("expired writer cannot overwrite a newer writer",async()=>{
      await first.acquire();
      const stale=await first.read();
      db.exec("UPDATE hami_persistence_meta SET lock_until=0;");
      const second=new DurableCloudStore(config);
      await second.acquire();
      const current=await second.read();
      await second.commit(current,snapshot({...current.tables,orders:[...current.tables.orders,{id:"order-2",phone:"0905000002",version:1}]}));
      await assert.rejects(first.commit(stale,snapshot({...stale.tables,orders:[{...stale.tables.orders[0],version:99}]})),CloudPersistenceError);
      await first.release();
      assert.equal((await second.read()).tables.orders.length,2);
      await second.release();
    });
    await t.test("a per-statement error never reports success",async()=>{
      partialFailure=true;
      await assert.rejects(first.read(),CloudPersistenceError);
      partialFailure=false;
    });
    await t.test("lost acknowledgement leaves the committed record available for idempotent retry",async()=>{
      await first.acquire();
      const before=await first.read();
      timeoutAfterCommit=true;
      await assert.rejects(first.commit(before,snapshot({...before.tables,orders:[...before.tables.orders,{id:"retry-stable-key",phone:"0905000003",version:1}]})),CloudPersistenceError);
      timeoutAfterCommit=false;
      await first.release();
      const restarted=new DurableCloudStore(config);
      assert.equal((await restarted.read()).tables.orders.filter((row)=>row.id==="retry-stable-key").length,1);
    });
  } finally {globalThis.fetch=originalFetch;db.close();}
});
