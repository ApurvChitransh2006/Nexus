import mongoose from 'mongoose';

// ------------------ USER SCHEMA ------------------
// Stores sync data from Clerk so our messages can query users directly
const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  imageUrl: { type: String },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

// ------------------ CONVERSATION SCHEMA ------------------
// Represents a single or group chat workspace
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGroup: { type: Boolean, default: false },
  name: { type: String }, // Required for group chats
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
}, { timestamps: true });

export const Conversation = mongoose.model('Conversation', conversationSchema);

// ------------------ MESSAGE SCHEMA ------------------
// Stores message data, files, and read receipts
const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  fileUrl: { type: String }, // For sharing image/documents
  fileType: { type: String }, // 'image' or 'document'
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);
