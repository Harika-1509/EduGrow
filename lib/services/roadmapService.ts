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

  static async createRoadmapWithGroq(firstName: string, domain: string, userEmail: string, goal?: string) {
    await dbConnect();
    
    const chatId = this.generateChatId();
    const name = `Roadmap for ${firstName} - ${domain}`;
    
    // Generate initial roadmap structure using Groq API
    let todoList: any[] = [];
    
    if (goal) {
      try {
        const groqResponse = await this.generateRoadmapWithGroq(domain, goal);
        todoList = groqResponse;
      } catch (error) {
        console.error('Failed to generate roadmap with Groq, using fallback:', error);
        // Fallback to basic roadmap structure
        todoList = this.generateFallbackRoadmap(domain);
      }
    } else {
      // Generate basic roadmap structure
      todoList = this.generateFallbackRoadmap(domain);
    }
    
    const roadmap = new Roadmap({
      name,
      domain,
      chatId,
      userEmail,
      goal: goal || null,
      todoList,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return await roadmap.save();
  }

  static async generateRoadmapWithGroq(domain: string, goal: string): Promise<any[]> {
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const systemPrompt = `You are an expert career mentor specializing in ${domain}. 
    
Your task is to create a detailed, step-by-step roadmap for someone who wants to achieve: "${goal}".

Create a roadmap with 8-12 specific, actionable steps that include:
1. **Learning milestones** - What skills to learn and in what order
2. **Practical projects** - Hands-on work to build experience
3. **Resources** - Specific courses, books, or platforms to use
4. **Timeline estimates** - How long each step typically takes
5. **Success metrics** - How to know when each step is complete

Format your response as a JSON array of objects with this structure:
[
  {
    "id": "step1",
    "title": "Step Title",
    "description": "Detailed description of what to do",
    "duration": "2-3 weeks",
    "resources": ["Resource 1", "Resource 2"],
    "milestone": "What you'll achieve"
  }
]

Make it practical, achievable, and tailored to the ${domain} field.`;

    const userPrompt = `Create a roadmap for: ${goal} in ${domain}`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 1,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Try to parse JSON response
      try {
        const roadmapSteps = JSON.parse(content);
        if (Array.isArray(roadmapSteps)) {
          return roadmapSteps.map((step, index) => ({
            id: step.id || `step${index + 1}`,
            text: `${step.title}: ${step.description}`,
            done: false,
            createdAt: new Date().toISOString(),
            metadata: {
              duration: step.duration,
              resources: step.resources,
              milestone: step.milestone
            }
          }));
        }
      } catch (parseError) {
        console.error('Failed to parse Groq response as JSON:', parseError);
      }

      // Fallback: parse as text and create basic structure
      return this.parseTextResponseToRoadmap(content);
      
    } catch (error) {
      console.error('Groq API call failed:', error);
      throw error;
    }
  }

  static parseTextResponseToRoadmap(content: string): any[] {
    // Parse text response and extract steps
    const lines = content.split('\n').filter(line => line.trim());
    const steps: any[] = [];
    
    lines.forEach((line, index) => {
      if (line.trim() && (line.includes('Step') || line.includes('1.') || line.includes('2.') || line.includes('3.'))) {
        steps.push({
          id: `step${index + 1}`,
          text: line.trim(),
          done: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    return steps.length > 0 ? steps : this.generateFallbackRoadmap('General');
  }

  static generateFallbackRoadmap(domain: string): any[] {
    const baseId = Date.now();
    const steps = [
      `Learn ${domain} fundamentals`,
      `Master core concepts and principles`,
      `Practice with hands-on projects`,
      `Build a portfolio of work`,
      `Network with professionals in ${domain}`,
      `Apply for entry-level positions`,
      `Continue learning and upskilling`,
      `Advance your career in ${domain}`
    ];

    return steps.map((text, idx) => ({
      id: (baseId + idx).toString(),
      text,
      done: false,
      createdAt: new Date().toISOString(),
    }));
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
