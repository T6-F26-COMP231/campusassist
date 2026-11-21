import test from "node:test";
import assert from "node:assert/strict";
import { createBarrierReport } from "../controllers/barrierReportController.js";
import BarrierReport from "../models/BarrierReport.js";

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
}

test("Story 12 saves a report with a location for review", async () => {
  const originalCreate = BarrierReport.create;
  let saved;

  try {
    BarrierReport.create = async (input) => {
      saved = input;
      return { _id: "report-id", ...input };
    };

    const res = mockResponse();
    await createBarrierReport(
      {
        body: {
          type: "broken-elevator",
          location: "  Near room B230, Block B  ",
          description: "  The doors do not open  ",
          photoName: " elevator.jpg ",
          status: "Approved"
        }
      },
      res
    );

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, "Barrier report saved for review");
    assert.equal(saved.location, "Near room B230, Block B");
    assert.equal(saved.description, "The doors do not open");
    assert.equal(saved.photoName, "elevator.jpg");
    assert.equal(saved.status, "Pending");
    assert.equal(res.body.report.status, "Pending");
  } finally {
    BarrierReport.create = originalCreate;
  }
});

test("Story 12 does not accept a report without a location", async () => {
  const originalCreate = BarrierReport.create;
  let called = false;

  try {
    BarrierReport.create = async () => {
      called = true;
    };

    for (const location of ["", "   ", undefined]) {
      const res = mockResponse();
      await createBarrierReport(
        { body: { type: "broken-elevator", location, description: "Out of service" } },
        res
      );

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.equal(
        res.body.message,
        "A report without a location is not accepted. Tell us where the barrier is."
      );
    }

    assert.equal(called, false);
  } finally {
    BarrierReport.create = originalCreate;
  }
});

test("Story 12 does not accept a description over 300 characters", async () => {
  const originalCreate = BarrierReport.create;
  let called = false;

  try {
    BarrierReport.create = async () => {
      called = true;
    };

    const res = mockResponse();
    await createBarrierReport(
      {
        body: {
          type: "blocked-ramp",
          location: "Block B",
          description: "x".repeat(301)
        }
      },
      res
    );

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Keep the description to 300 characters or fewer.");
    assert.equal(called, false);
  } finally {
    BarrierReport.create = originalCreate;
  }
});

test("Story 38 saves a faculty classroom report in the existing barrier reports collection", async () => {
  assert.equal(BarrierReport.modelName, "BarrierReport");
  assert.equal(BarrierReport.collection.collectionName, "barrierreports");

  const originalCreate = BarrierReport.create;
  let saved;

  try {
    BarrierReport.create = async (input) => {
      saved = input;
      return { _id: "report-id", ...input };
    };

    const res = mockResponse();
    await createBarrierReport(
      {
        body: {
          type: "broken-elevator",
          location: "  B230  ",
          description: "  The elevator beside the classroom is out of service  "
        }
      },
      res
    );

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, "Barrier report saved for review");
    assert.equal(saved.location, "B230");
    assert.equal(saved.description, "The elevator beside the classroom is out of service");
    assert.equal(saved.status, "Pending");
    assert.equal(res.body.report.status, "Pending");
  } finally {
    BarrierReport.create = originalCreate;
  }
});

test("Story 12 does not accept a report without a barrier type", async () => {
  const res = mockResponse();

  await createBarrierReport(
    { body: { location: "Block B", type: "not-a-type" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, "Choose a barrier type.");
});
