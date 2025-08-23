# Groq-Powered AI Career Roadmap System

## 🎯 **Overview**
The AI Career Roadmap system now uses **Groq API** instead of Gemini API to generate personalized career roadmaps. Users can input their career goals and get AI-generated, step-by-step learning paths tailored to their domain and background.

## 🚀 **New Features**

### **🤖 AI-Powered Roadmap Generation**
- **Groq Integration**: Uses Groq's fast Llama 3.1 8B model
- **Goal-Based Creation**: Users specify their career goal upfront
- **Personalized Steps**: AI generates 8-12 actionable learning steps
- **Rich Metadata**: Each step includes duration, resources, and milestones

### **💬 Interactive Chat Interface**
- **Conversational Flow**: Natural conversation to gather user information
- **Context Awareness**: Remembers user's domain, goal, and background
- **Real-Time Guidance**: Get help with any roadmap step via chat

### **💾 Persistent Storage**
- **Roadmap Saving**: All generated roadmaps are saved to database
- **Progress Tracking**: Users can mark steps as complete
- **History Access**: View and modify previous roadmaps

## 🔧 **Setup Requirements**

### **1. Environment Variables**
Add to your `.env.local` file:

```env
# Groq API Configuration
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
```

### **2. Get Groq API Key**
1. Visit [console.groq.com](https://console.groq.com/)
2. Sign up for free account
3. Create API key (starts with `gsk_`)
4. Add to `.env.local`

## 📱 **User Experience Flow**

### **Step 1: Create New Roadmap**
1. User clicks "Create AI Roadmap" button
2. Dialog opens asking for career goal
3. User enters specific goal (e.g., "Becoming a backend developer")
4. System creates roadmap with Groq AI

### **Step 2: Interactive Setup**
1. **Goal Confirmation**: "What is your final goal?"
2. **Background**: "Do you have any prior knowledge?"
3. **Specialization**: "Which track interests you most?"
4. **AI Generation**: Groq creates personalized roadmap

### **Step 3: Chat & Guidance**
- User can ask questions about any step
- Get additional resources and tips
- Modify roadmap based on feedback
- Track progress through to-do list

## 🏗️ **Technical Architecture**

### **API Endpoints**

#### **1. Roadmap Creation**
- **Route**: `/api/roadmap/create`
- **Method**: POST
- **Purpose**: Creates new roadmap with Groq AI integration

#### **2. Roadmap Generation**
- **Route**: `/api/ai/roadmap-generate`
- **Method**: POST
- **Purpose**: Generates roadmap steps using Groq API

#### **3. AI Chat**
- **Route**: `/api/ai/chat`
- **Method**: POST
- **Purpose**: Provides ongoing guidance and support

### **Database Schema**
```typescript
interface Roadmap {
  _id: string;
  name: string;
  domain: string;
  chatId: string;
  userEmail: string;
  goal: string;
  priorKnowledge: string;
  chosenTrack: string;
  todoList: TodoItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  metadata?: {
    duration: string;
    resources: string[];
    milestone: string;
  };
}
```

## 🎨 **UI Components**

### **1. Roadmap Creation Dialog**
- Goal input field
- Validation and error handling
- Loading states during AI generation

### **2. Roadmap Display**
- Interactive to-do list
- Progress indicators
- Rich step information

### **3. Chat Interface**
- Real-time messaging
- Context-aware responses
- User-friendly error handling

## 🔄 **AI Integration Details**

### **Groq API Configuration**
- **Model**: `llama3-8b-8192`
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 1200 for roadmap generation
- **Response Format**: JSON with fallback text parsing

### **System Prompts**
- **Roadmap Generation**: Expert career mentor persona
- **Chat Responses**: Domain-specific guidance
- **Context Maintenance**: Remembers conversation history

### **Error Handling**
- **API Failures**: Graceful fallback to basic roadmaps
- **Parse Errors**: Text-based step extraction
- **User Feedback**: Clear error messages and suggestions

## 📊 **Usage Examples**

### **Sample User Journey**
1. **User**: "I want to become a Data Scientist"
2. **System**: "Great! Do you have any prior knowledge?"
3. **User**: "I know Python basics and some statistics"
4. **System**: "Perfect! Which specialization interests you most?"
5. **User**: "Machine Learning"
6. **System**: *Generates personalized roadmap with Groq AI*

### **Generated Roadmap Steps**
```json
[
  {
    "id": "step1",
    "title": "Master Python Fundamentals",
    "description": "Deep dive into Python programming, data structures, and libraries",
    "duration": "3-4 weeks",
    "resources": ["Python for Data Science", "LeetCode Python problems"],
    "milestone": "Complete 50+ coding challenges"
  }
]
```

## 🚀 **Performance Benefits**

### **Speed Improvements**
- **Groq Response Time**: <1 second
- **Reduced Latency**: Faster roadmap generation
- **Efficient Processing**: Optimized token usage

### **Cost Optimization**
- **Competitive Pricing**: Groq's cost-effective models
- **Token Efficiency**: Smart prompt engineering
- **Fallback Systems**: Reduces unnecessary API calls

## 🔒 **Security Features**

- **API Key Protection**: Server-side only
- **Input Validation**: Sanitized user inputs
- **Rate Limiting**: Built-in conversation limits
- **Data Privacy**: No sensitive information stored

## 🧪 **Testing & Validation**

### **Test Scenarios**
1. **Valid Goal Input**: Test with realistic career goals
2. **API Failures**: Test fallback mechanisms
3. **Edge Cases**: Empty inputs, special characters
4. **Performance**: Response time under load

### **Quality Assurance**
- **Response Validation**: Ensure proper JSON formatting
- **Fallback Testing**: Verify basic roadmap generation
- **User Experience**: Smooth conversation flow
- **Error Handling**: Clear user feedback

## 📈 **Future Enhancements**

### **Planned Features**
- **Multi-Language Support**: International career guidance
- **Advanced Analytics**: Learning progress insights
- **Integration**: Connect with learning platforms
- **Mobile App**: Native mobile experience

### **AI Improvements**
- **Model Selection**: Choose different Groq models
- **Custom Prompts**: User-defined roadmap styles
- **Learning Adaptation**: Adjust based on user progress
- **Predictive Guidance**: Suggest next steps

## 🆘 **Troubleshooting**

### **Common Issues**

1. **"AI service not configured"**
   - Check `GROQ_API_KEY` in `.env.local`
   - Restart development server

2. **Roadmap generation fails**
   - Verify Groq API key validity
   - Check API rate limits
   - Review error logs

3. **Slow responses**
   - Check internet connection
   - Verify Groq API status
   - Monitor token usage

### **Support Resources**
- **Groq Documentation**: [docs.groq.com](https://docs.groq.com/)
- **API Status**: [status.groq.com](https://status.groq.com/)
- **Console**: [console.groq.com](https://console.groq.com/)

## 🎉 **Getting Started**

1. **Set up Groq API key** in `.env.local`
2. **Restart development server**
3. **Navigate to `/roadmap`** page
4. **Click "Create AI Roadmap"**
5. **Enter your career goal**
6. **Follow the AI-guided setup**
7. **Start your personalized learning journey!**

The new Groq-powered AI Career Roadmap system provides a seamless, intelligent experience for users to plan their career development with personalized guidance and actionable steps.
