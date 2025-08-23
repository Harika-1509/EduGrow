import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  userDomain: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { message, userDomain, conversationHistory }: ChatRequest = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get Groq API key from environment variables
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      console.error('GROQ_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Prepare conversation context for Groq
    const systemPrompt = `You are an expert AI career mentor specializing in ${userDomain || 'career development'}. 
    
Your role is to provide personalized, actionable career advice, guidance, and insights. You should:

1. **Be Encouraging**: Always provide positive, motivating guidance
2. **Be Specific**: Give concrete, actionable advice rather than generic statements
3. **Be Knowledgeable**: Share current industry insights and trends
4. **Be Personal**: Consider the user's domain and career context
5. **Be Practical**: Provide realistic, achievable recommendations

Focus on:
- Skill development and learning paths
- Career advancement strategies
- Industry trends and opportunities
- Resume and interview preparation
- Networking and professional development
- Work-life balance and personal growth

Keep responses conversational, helpful, and under 200 words unless the user asks for detailed information.`;

    // Build messages array for Groq API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Using Llama 3.1 8B model for fast responses
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        stream: false,
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    
    if (!groqData.choices || !groqData.choices[0] || !groqData.choices[0].message) {
      throw new Error('Invalid response from Groq API');
    }

    const aiResponse = groqData.choices[0].message.content;

    return NextResponse.json({
      response: aiResponse,
      model: groqData.model,
      usage: groqData.usage,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Provide a helpful fallback response
    const fallbackResponse = `I apologize, but I'm experiencing some technical difficulties right now. 
    
Here are some general career tips you can consider:
- Focus on continuous learning and skill development
- Build a strong professional network
- Stay updated with industry trends
- Practice your communication skills
- Seek mentorship and guidance from experienced professionals

Please try again in a moment, or feel free to ask a different question.`;

    return NextResponse.json(
      { 
        response: fallbackResponse,
        error: 'AI service temporarily unavailable'
      },
      { status: 500 }
    );
  }
}
