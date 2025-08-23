import { NextRequest, NextResponse } from 'next/server';

interface RoadmapRequest {
  domain: string;
  goal: string;
  priorKnowledge: string;
  chosenTrack: string;
}

export async function POST(request: NextRequest) {
  try {
    const { domain, goal, priorKnowledge, chosenTrack }: RoadmapRequest = await request.json();

    if (!domain || !goal || !priorKnowledge || !chosenTrack) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Prepare system prompt for roadmap generation
    const systemPrompt = `You are an expert career mentor specializing in ${domain}. 
    
Your task is to create a detailed, step-by-step roadmap for someone who wants to achieve: "${goal}".

User's background: ${priorKnowledge}
Chosen specialization: ${chosenTrack}

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

Make it practical, achievable, and tailored to the ${domain} field and ${chosenTrack} specialization.`;

    const userPrompt = `Create a roadmap for: ${goal} in ${domain} with focus on ${chosenTrack}. My background: ${priorKnowledge}`;

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
          max_tokens: 1200,
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
          const formattedSteps = roadmapSteps.map((step, index) => ({
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

          return NextResponse.json({
            success: true,
            roadmapSteps: formattedSteps,
            model: data.model,
            usage: data.usage,
          });
        }
      } catch (parseError) {
        console.error('Failed to parse Groq response as JSON:', parseError);
      }

      // Fallback: parse as text and create basic structure
      const fallbackSteps = parseTextResponseToRoadmap(content, domain, chosenTrack);
      
      return NextResponse.json({
        success: true,
        roadmapSteps: fallbackSteps,
        model: data.model,
        usage: data.usage,
      });

    } catch (error) {
      console.error('Groq API call failed:', error);
      throw error;
    }

  } catch (error) {
    console.error('Roadmap generation error:', error);
    
    // Provide a helpful fallback roadmap
    const fallbackSteps = generateFallbackRoadmap('General');
    
    return NextResponse.json(
      { 
        success: true,
        roadmapSteps: fallbackSteps,
        error: 'AI service temporarily unavailable, using fallback roadmap'
      },
      { status: 200 }
    );
  }
}

function parseTextResponseToRoadmap(content: string, domain: string, track: string): any[] {
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

  return steps.length > 0 ? steps : generateFallbackRoadmap(domain);
}

function generateFallbackRoadmap(domain: string): any[] {
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
