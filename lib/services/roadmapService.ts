import { Roadmap } from '@/lib/models/Roadmap';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export class RoadmapService {
  static generateChatId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static async ensureCollection() {
    await dbConnect();
    // Force model recreation and drop collection
    try {
      // Delete the model if it exists to force recreation
      if (mongoose.models.Roadmap) {
        delete mongoose.models.Roadmap;
      }
      
      // Drop the existing collection to ensure clean schema
      await Roadmap.collection.drop();
      console.log('Roadmap collection dropped and will be recreated');
    } catch (error) {
      // Collection doesn't exist, which is fine
      console.log('Roadmap collection will be created');
    }
  }

  static async createRoadmap(firstName: string, domain: string, userEmail: string) {
    await dbConnect();
    
    const chatId = this.generateChatId();
    const name = `Roadmap for ${firstName} - ${domain}`;
    
    const roadmap = new Roadmap({
      name,
      domain,
      chatId,
      userEmail,
      todoList: []
    });
    
    return await roadmap.save();
  }

  static async getRoadmapsByUserEmail(userEmail: string) {
    await dbConnect();
    return await Roadmap.find({ userEmail }).sort({ createdAt: -1 });
  }

  static async getRoadmapByChatId(chatId: string) {
    await dbConnect();
    return await Roadmap.findOne({ chatId });
  }

  static async updateTodoList(chatId: string, todoList: any[]) {
    await dbConnect();
    return await Roadmap.findOneAndUpdate(
      { chatId },
      { todoList },
      { new: true }
    );
  }

  static async updateRoadmap(
    chatId: string,
    update: {
      todoList?: any[];
      domain?: string | null;
      goal?: string | null;
      priorKnowledge?: string | null;
      chosenTrack?: string | null;
    }
  ) {
    await dbConnect();
    const $set: Record<string, any> = {};
    if (typeof update.todoList !== 'undefined') $set['todoList'] = update.todoList;
    if (typeof update.domain !== 'undefined') $set['domain'] = update.domain;
    if (typeof update.goal !== 'undefined') $set['goal'] = update.goal;
    if (typeof update.priorKnowledge !== 'undefined') $set['priorKnowledge'] = update.priorKnowledge;
    if (typeof update.chosenTrack !== 'undefined') $set['chosenTrack'] = update.chosenTrack;

    return await Roadmap.findOneAndUpdate(
      { chatId },
      { $set },
      { new: true }
    );
  }
}
