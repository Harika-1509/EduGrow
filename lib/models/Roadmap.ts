import mongoose from 'mongoose';

const todoItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const roadmapSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true },
  chatId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  todoList: [todoItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
roadmapSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', roadmapSchema);
