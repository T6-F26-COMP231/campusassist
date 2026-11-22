import mongoose from "mongoose";

// Story 11: the longest message a Campus User or helper can send.
export const MESSAGE_LIMIT = 300;

export const SENDER_ROLES = ["campus-user", "helper"];

// One message in the conversation of one help request.
const messageSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HelpRequest",
      required: true
    },

    senderRole: {
      type: String,
      enum: SENDER_ROLES,
      required: true
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: MESSAGE_LIMIT
    }
  },
  {
    timestamps: true
  }
);

// Reading a conversation oldest first uses this index.
messageSchema.index({ requestId: 1, createdAt: 1, _id: 1 });

const Message =
  mongoose.models.Message ||
  mongoose.model("Message", messageSchema);

export default Message;