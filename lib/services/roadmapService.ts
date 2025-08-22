import { Roadmap } from '@/lib/models/Roadmap';
import dbConnect from '@/lib/db';

export class RoadmapService {
  static generateChatId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static async createRoadmap(userId: string, firstName: string, domain: string) {
    await dbConnect();
    
    const chatId = this.generateChatId();
    const name = `Roadmap for ${firstName} - ${domain}`;
    
    const roadmap = new Roadmap({
      name,
      domain,
      chatId,
      userId,
      todoList: []
    });
    
    return await roadmap.save();
  }

  static async getRoadmapsByUserId(userId: string) {
    await dbConnect();
    return await Roadmap.find({ userId }).sort({ createdAt: -1 });
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
}
