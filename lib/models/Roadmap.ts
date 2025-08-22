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
  userEmail: { type: String, required: true },
  goal: { type: String, default: null },
  priorKnowledge: { type: String, default: null },
  chosenTrack: { type: String, default: null },
  todoList: [todoItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

roadmapSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

if (mongoose.models.Roadmap) {
  delete mongoose.models.Roadmap;
}

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);
