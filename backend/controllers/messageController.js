import mongoose from "mongoose";
import HelpRequest from "../models/HelpRequest.js";
import Message, { MESSAGE_LIMIT, SENDER_ROLES } from "../models/Message.js";

// A helper is assigned once the request is accepted, and stays assigned until it is closed.
const MESSAGEABLE_STATUSES = ["Accepted", "On the Way", "Arrived"];
const CLOSED_STATUSES = ["Completed", "Cancelled"];

// These match the wording the app already shows for the same cases.
const EMPTY_MESSAGE = "Write a message before sending.";
const TOO_LONG_MESSAGE = `Keep the message to ${MESSAGE_LIMIT} characters or fewer.`;
const NO_HELPER_MESSAGE = "You can message your helper once a helper accepts your request.";
const CLOSED_MESSAGE = "This request is closed, so messages can no longer be sent.";

const clean = (value) => (typeof value === "string" ? value.trim() : "");

// The shape the app uses for a message: { id, text, sentAt }, plus who sent it.
const toMessage = (message) => ({
  id: String(message._id),
  requestId: String(message.requestId),
  senderRole: message.senderRole,
  senderId: message.senderId ? String(message.senderId) : null,
  text: message.text,
  sentAt: message.createdAt
});

// Story 11: Send a message in the conversation of a help request.
export async function sendHelpRequestMessage(req, res) {
  try {
    const { id } = req.params;
    const { text, senderRole, senderId } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid help request ID"
      });
    }

    // Temporary Iteration 1 input, like the helper ID when a request is accepted.
    // Authentication will later supply who is sending. Without it, a Campus User is assumed.
    const role = senderRole ?? "campus-user";

    if (!SENDER_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid sender role."
      });
    }

    const body = clean(text);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: EMPTY_MESSAGE
      });
    }

    if (body.length > MESSAGE_LIMIT) {
      return res.status(400).json({
        success: false,
        message: TOO_LONG_MESSAGE
      });
    }

    const request = await HelpRequest.findById(id)
      .select("status helperId userId")
      .lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Help request not found"
      });
    }

    if (CLOSED_STATUSES.includes(request.status)) {
      return res.status(409).json({
        success: false,
        message: CLOSED_MESSAGE
      });
    }

    // No message can be sent before a helper has accepted the request.
    if (!request.helperId || !MESSAGEABLE_STATUSES.includes(request.status)) {
      return res.status(409).json({
        success: false,
        message: NO_HELPER_MESSAGE
      });
    }

    // Only the helper assigned to this request can write as the helper.
    if (role === "helper" && String(senderId) !== String(request.helperId)) {
      return res.status(403).json({
        success: false,
        message: "Only the assigned helper can reply to this request."
      });
    }

    const sent = await Message.create({
      requestId: id,
      senderRole: role,
      senderId: role === "helper" ? request.helperId : request.userId ?? null,
      text: body
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      sentMessage: toMessage(sent)
    });
  } catch (error) {
    console.error("Error sending message:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to send the message"
    });
  }
}

// Story 11: Retrieve the conversation of a help request, oldest message first.
export async function getHelpRequestMessages(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid help request ID"
      });
    }

    const request = await HelpRequest.findById(id).select("_id").lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Help request not found"
      });
    }

    // _id breaks a tie between two messages saved in the same millisecond.
    const found = await Message.find({ requestId: id })
      .sort({ createdAt: 1, _id: 1 })
      .lean();

    // No messages yet is an empty list, not an error.
    return res.status(200).json({
      success: true,
      count: found.length,
      messages: found.map(toMessage)
    });
  } catch (error) {
    console.error("Error retrieving messages:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve messages"
    });
  }
}