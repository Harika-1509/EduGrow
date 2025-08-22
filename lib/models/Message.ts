import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  role: { type: String, enum: ['user', 'bot'], required: true },
  createdAt: { type: Date, default: Date.now }
});

if (mongoose.models.Message) {
  delete mongoose.models.Message;
}

export const Message = mongoose.model('Message', messageSchema);


