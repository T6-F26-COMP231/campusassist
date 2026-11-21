import test from "node:test";
import assert from "node:assert/strict";
import BarrierReport from "../models/BarrierReport.js";

test("Story 24 reads Pending barrier reports from the existing collection", async () => {
  assert.equal(BarrierReport.modelName, "BarrierReport");
  assert.equal(BarrierReport.collection.collectionName, "barrierreports");

  const pending = [
    { _id: "older", status: "Pending", location: "Near room B230, Block B", createdAt: "2026-11-21T12:00:00.000Z" },
    { _id: "newer", status: "Pending", location: "A2-65A", createdAt: "2026-11-21T13:00:00.000Z" }
  ];

  const originalFind = BarrierReport.find;
  let filter;
  let sortOrder;

  try {
    BarrierReport.find = (query) => {
      filter = query;
      const chain = {
        select() {
          return chain;
        },
        sort(order) {
          sortOrder = order;
          return chain;
        },
        lean() {
          return Promise.resolve(pending);
        }
      };
      return chain;
    };

    const reports = await BarrierReport.findPending();

    assert.deepEqual(filter, { status: "Pending" });
    assert.deepEqual(sortOrder, { createdAt: 1 });
    assert.deepEqual(reports, pending);
    assert.equal(reports.every((report) => report.status === "Pending"), true);
  } finally {
    BarrierReport.find = originalFind;
  }
});
