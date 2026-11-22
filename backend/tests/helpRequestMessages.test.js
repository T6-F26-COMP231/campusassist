import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import HelpRequest from "../models/HelpRequest.js";
import Message, { MESSAGE_LIMIT } from "../models/Message.js";
import {
  sendHelpRequestMessage,
  getHelpRequestMessages
} from "../controllers/messageController.js";

const requestId = new mongoose.Types.ObjectId().toString();
const userId = new mongoose.Types.ObjectId().toString();
const helperId = new mongoose.Types.ObjectId().toString();
const otherHelperId = new mongoose.Types.ObjectId().toString();

const EMPTY = "Write a message before sending.";
const TOO_LONG = "Keep the message to 300 characters or fewer.";
const NO_HELPER = "You can message your helper once a helper accepts your request.";
const CLOSED = "This request is closed, so messages can no longer be sent.";

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

// HelpRequest.findById(...).select(...).lean() resolves to `result`.
function stubFindById(result) {
  HelpRequest.findById = () => ({
    select() { return this; },
    lean: async () => result
  });
}

// Message.create saves nothing and echoes back a stored-looking document.
// `calls` records every document the controller tried to save.
function stubCreate(calls, createdAt = new Date("2026-11-21T12:00:00.000Z")) {
  Message.create = async (doc) => {
    calls.push(doc);
    return {
      _id: new mongoose.Types.ObjectId(),
      requestId: doc.requestId,
      senderRole: doc.senderRole,
      senderId: doc.senderId,
      text: doc.text,
      createdAt
    };
  };
}

// Message.find(...).sort(...).lean() resolves to `docs`.
// `captured` records the filter and the sort the controller asked for.
function stubFind(docs, captured = {}) {
  Message.find = (filter) => {
    captured.filter = filter;
    return {
      sort(spec) {
        captured.sort = spec;
        return this;
      },
      lean: async () => docs
    };
  };
}

// Run `fn` with the models and console.error restored afterwards.
async function withStubs(fn) {
  const originals = {
    findById: HelpRequest.findById,
    create: Message.create,
    find: Message.find,
    consoleError: console.error
  };

  try {
    await fn();
  } finally {
    HelpRequest.findById = originals.findById;
    Message.create = originals.create;
    Message.find = originals.find;
    console.error = originals.consoleError;
  }
}

const send = (body, id = requestId) => {
  const res = mockResponse();
  return sendHelpRequestMessage({ params: { id }, body }, res).then(() => res);
};

const retrieve = (id = requestId) => {
  const res = mockResponse();
  return getHelpRequestMessages({ params: { id } }, res).then(() => res);
};

// ---------- Sending ----------

test("Story 11 saves and returns a message from the campus user", () =>
  withStubs(async () => {
    const calls = [];
    stubFindById({ status: "Accepted", helperId, userId });
    stubCreate(calls);

    const res = await send({ text: "I am at A3-74." });

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, "Message sent successfully");

    assert.equal(calls.length, 1);
    assert.equal(calls[0].requestId, requestId);
    assert.equal(calls[0].senderRole, "campus-user");
    assert.equal(calls[0].senderId, userId);
    assert.equal(calls[0].text, "I am at A3-74.");

    const sent = res.body.sentMessage;
    assert.equal(typeof sent.id, "string");
    assert.equal(sent.requestId, requestId);
    assert.equal(sent.senderRole, "campus-user");
    assert.equal(sent.senderId, userId);
    assert.equal(sent.text, "I am at A3-74.");
    assert.deepEqual(sent.sentAt, new Date("2026-11-21T12:00:00.000Z"));
  }));

for (const status of ["Accepted", "On the Way", "Arrived"]) {
  test(`Story 11 allows messaging while the request is ${status}`, () =>
    withStubs(async () => {
      const calls = [];
      stubFindById({ status, helperId, userId });
      stubCreate(calls);

      const res = await send({ text: "Hello" });

      assert.equal(res.statusCode, 201);
      assert.equal(calls.length, 1);
    }));
}

test("Story 11 stores a null sender id when the request has no user id", () =>
  withStubs(async () => {
    const calls = [];
    stubFindById({ status: "Accepted", helperId, userId: null });
    stubCreate(calls);

    const res = await send({ text: "Hello" });

    assert.equal(res.statusCode, 201);
    assert.equal(calls[0].senderId, null);
    assert.equal(res.body.sentMessage.senderId, null);
  }));

test("Story 11 trims the message before saving it", () =>
  withStubs(async () => {
    const calls = [];
    stubFindById({ status: "Accepted", helperId, userId });
    stubCreate(calls);

    const res = await send({ text: "   by the main entrance   " });

    assert.equal(res.statusCode, 201);
    assert.equal(calls[0].text, "by the main entrance");
  }));

test("Story 11 rejects an empty message", () =>
  withStubs(async () => {
    const calls = [];
    stubFindById({ status: "Accepted", helperId, userId });
    stubCreate(calls);

    const res = await send({ text: "" });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, EMPTY);
    assert.equal(calls.length, 0);
  }));

test("Story 11 rejects a whitespace-only message", () =>
  withStubs(async () => {
    const calls = [];
    stubFindById({ status: "Accepted", helperId, userId });
    stubCreate(calls);

    const res = await send({ text: "   \n\t  " });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, EMPTY);
    assert.equal(calls.length, 0);
  }));

test("Story 11 rejects a missing text field and a missing body", () =>
  withStubs(async () => {
    const calls = [];
    stubFindById({ status: "Accepted", helperId, userId });
    stubCreate(calls);

    const noText = await send({});
    const noBody = await send(undefined);
    const notAString = await send({ text: 42 });

    for (const res of [noText, noBody, notAString]) {
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, EMPTY);
    }
    assert.equal(calls.length, 0);
  }));

test("Story 11 accepts exactly 300 characters and rejects 301", () =>
  withStubs(async () => {
    const calls = [];
    stubFindById({ status: "Accepted", helperId, userId });
    stubCreate(calls);

    const atLimit = await send({ text: "a".repeat(MESSAGE_LIMIT) });
    const overLimit = await send({ text: "a".repeat(MESSAGE_LIMIT + 1) });

    assert.equal(MESSAGE_LIMIT, 300);
    assert.equal(atLimit.statusCode, 201);
    assert.equal(overLimit.statusCode, 400);
    assert.equal(overLimit.body.message, TOO_LONG);
    assert.equal(calls.length, 1);
  }));

test("Story 11 rejects an invalid request ID", () =>
  withStubs(async () => {
    const calls = [];
    stubCreate(calls);

    const res = await send({ text: "Hello" }, "not-an-id");

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Invalid help request ID");
    assert.equal(calls.length, 0);
  }));

test("Story 11 returns 404 when the help request does not exist", () =>
  withStubs(async () => {
    const calls = [];
    stubFindById(null);
    stubCreate(calls);

    const res = await send({ text: "Hello" });

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Help request not found");
    assert.equal(calls.length, 0);
  }));

test("Story 11 blocks messages while the request is still Pending", () =>
  withStubs(async () => {
    const calls = [];
    stubFindById({ status: "Pending", helperId: null, userId });
    stubCreate(calls);

    const res = await send({ text: "Hello" });

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, NO_HELPER);
    assert.equal(calls.length, 0);
  }));

test("Story 11 blocks messages when no helper is assigned", () =>
  withStubs(async () => {
    const calls = [];
    stubFindById({ status: "Accepted", helperId: null, userId });
    stubCreate(calls);

    const res = await send({ text: "Hello" });

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.message, NO_HELPER);
    assert.equal(calls.length, 0);
  }));

for (const status of ["Completed", "Cancelled"]) {
  test(`Story 11 blocks messages once the request is ${status}`, () =>
    withStubs(async () => {
      const calls = [];
      stubFindById({ status, helperId, userId });
      stubCreate(calls);

      const res = await send({ text: "Hello" });

      assert.equal(res.statusCode, 409);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, CLOSED);
      assert.equal(calls.length, 0);
    }));
}

test("Story 11 lets the assigned helper reply", () =>
  withStubs(async () => {
    const calls = [];
    stubFindById({ status: "On the Way", helperId, userId });
    stubCreate(calls);

    const res = await send({
      text: "On my way, two minutes.",
      senderRole: "helper",
      senderId: helperId
    });

    assert.equal(res.statusCode, 201);
    assert.equal(calls[0].senderRole, "helper");
    assert.equal(calls[0].senderId, helperId);
    assert.equal(res.body.sentMessage.senderRole, "helper");
    assert.equal(res.body.sentMessage.senderId, helperId);
  }));

test("Story 11 rejects someone else writing as the helper", () =>
  withStubs(async () => {
    const calls = [];
    stubFindById({ status: "Accepted", helperId, userId });
    stubCreate(calls);

    const wrongHelper = await send({
      text: "Hello",
      senderRole: "helper",
      senderId: otherHelperId
    });
    const noSenderId = await send({ text: "Hello", senderRole: "helper" });

    for (const res of [wrongHelper, noSenderId]) {
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, "Only the assigned helper can reply to this request.");
    }
    assert.equal(calls.length, 0);
  }));

test("Story 11 rejects an unknown sender role", () =>
  withStubs(async () => {
    const calls = [];
    stubFindById({ status: "Accepted", helperId, userId });
    stubCreate(calls);

    const res = await send({ text: "Hello", senderRole: "admin" });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Choose a valid sender role.");
    assert.equal(calls.length, 0);
  }));

test("Story 11 handles database errors when sending", () =>
  withStubs(async () => {
    stubFindById({ status: "Accepted", helperId, userId });
    Message.create = async () => {
      throw new Error("Database unavailable");
    };
    console.error = () => {};

    const res = await send({ text: "Hello" });

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Unable to send the message");
  }));

// ---------- Retrieving ----------

test("Story 11 returns an empty list when no messages were sent yet", () =>
  withStubs(async () => {
    stubFindById({ _id: requestId });
    stubFind([]);

    const res = await retrieve();

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 0);
    assert.deepEqual(res.body.messages, []);
  }));

test("Story 11 returns messages oldest first", () =>
  withStubs(async () => {
    const captured = {};
    const first = {
      _id: new mongoose.Types.ObjectId(),
      requestId,
      senderRole: "campus-user",
      senderId: userId,
      text: "I am at A3-74.",
      createdAt: new Date("2026-11-21T12:00:00.000Z")
    };
    const second = {
      _id: new mongoose.Types.ObjectId(),
      requestId,
      senderRole: "helper",
      senderId: helperId,
      text: "Got it, coming now.",
      createdAt: new Date("2026-11-21T12:01:00.000Z")
    };
    stubFindById({ _id: requestId });
    stubFind([first, second], captured);

    const res = await retrieve();

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 2);

    // The controller asks the database for oldest first, with _id as the tie-breaker.
    assert.deepEqual(captured.filter, { requestId });
    assert.deepEqual(captured.sort, { createdAt: 1, _id: 1 });

    assert.deepEqual(res.body.messages, [
      {
        id: String(first._id),
        requestId,
        senderRole: "campus-user",
        senderId: userId,
        text: "I am at A3-74.",
        sentAt: first.createdAt
      },
      {
        id: String(second._id),
        requestId,
        senderRole: "helper",
        senderId: helperId,
        text: "Got it, coming now.",
        sentAt: second.createdAt
      }
    ]);
  }));

test("Story 11 still returns the history of a closed request", () =>
  withStubs(async () => {
    const stored = {
      _id: new mongoose.Types.ObjectId(),
      requestId,
      senderRole: "campus-user",
      senderId: userId,
      text: "Thank you!",
      createdAt: new Date("2026-11-21T12:05:00.000Z")
    };
    stubFindById({ _id: requestId, status: "Completed" });
    stubFind([stored]);

    const res = await retrieve();

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.messages[0].text, "Thank you!");
  }));

test("Story 11 returns an empty list for a Pending request", () =>
  withStubs(async () => {
    stubFindById({ _id: requestId, status: "Pending" });
    stubFind([]);

    const res = await retrieve();

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body.messages, []);
  }));

test("Story 11 rejects an invalid request ID when retrieving", () =>
  withStubs(async () => {
    const res = await retrieve("not-an-id");

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Invalid help request ID");
  }));

test("Story 11 returns 404 when retrieving for a missing request", () =>
  withStubs(async () => {
    stubFindById(null);

    const res = await retrieve();

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Help request not found");
  }));

test("Story 11 handles database errors when retrieving", () =>
  withStubs(async () => {
    stubFindById({ _id: requestId });
    Message.find = () => {
      throw new Error("Database unavailable");
    };
    console.error = () => {};

    const res = await retrieve();

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Unable to retrieve messages");
  }));

// ---------- Message model ----------

test("Story 11 message model requires a request, a sender role and text", () => {
  const error = new Message({}).validateSync();

  assert.ok(error);
  assert.ok(error.errors.requestId);
  assert.ok(error.errors.senderRole);
  assert.ok(error.errors.text);
});

test("Story 11 message model trims text and treats whitespace as empty", () => {
  const padded = new Message({
    requestId,
    senderRole: "campus-user",
    text: "  hello  "
  });
  assert.equal(padded.text, "hello");
  assert.equal(padded.validateSync(), undefined);

  const blank = new Message({
    requestId,
    senderRole: "campus-user",
    text: "    "
  }).validateSync();
  assert.ok(blank.errors.text);
});

test("Story 11 message model only allows known sender roles", () => {
  const bad = new Message({
    requestId,
    senderRole: "admin",
    text: "hello"
  }).validateSync();
  assert.ok(bad.errors.senderRole);

  for (const senderRole of ["campus-user", "helper"]) {
    const ok = new Message({ requestId, senderRole, text: "hello" }).validateSync();
    assert.equal(ok, undefined);
  }
});

test("Story 11 message model enforces the 300 character limit", () => {
  const atLimit = new Message({
    requestId,
    senderRole: "campus-user",
    text: "a".repeat(MESSAGE_LIMIT)
  }).validateSync();
  assert.equal(atLimit, undefined);

  const over = new Message({
    requestId,
    senderRole: "campus-user",
    text: "a".repeat(MESSAGE_LIMIT + 1)
  }).validateSync();
  assert.ok(over.errors.text);
});