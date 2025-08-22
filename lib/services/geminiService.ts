import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";

export interface DomainScore {
  domain: string;
  score: number;
  percentage: number;
  reasoning: string;
}

export interface AnalysisResult {
  domainScores: DomainScore[];
  topDomains: DomainScore[];
  overallInsights: string;
  recommendations: string[];
}

export class GeminiService {
  static async analyzeOnboardingAnswers(answers: Record<string, any>): Promise<AnalysisResult> {
    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      const prompt = `
        You are a career counselor analyzing a person's onboarding responses to determine the best career domains for them.
        
        Please analyze the following answers and score each career domain from 1-10 based on how well it matches their profile.
        Consider their education, interests, skills, work preferences, goals, and constraints.
        
        User's Answers:
        ${JSON.stringify(answers, null, 2)}
        
        Career Domains to Score:
        - AI & Machine Learning
        - Web Development
        - Data Science
        - Mobile Development
        - Cybersecurity
        - Cloud Computing
        - DevOps
        - UI/UX Design
        - Digital Marketing
        - Business Analytics
        - Product Management
        - Sales & Business Development
        
        For each domain, provide:
        1. A score from 1-10 (where 10 is perfect match)
        2. A brief reasoning for the score
        3. Calculate the percentage (score/10 * 100)
        
        Return your analysis in this exact JSON format:
        {
          "domainScores": [
            {
              "domain": "Domain Name",
              "score": 8,
              "percentage": 80,
              "reasoning": "Brief explanation of why this score was given"
            }
          ],
          "overallInsights": "Overall analysis of the user's career profile",
          "recommendations": [
            "Specific recommendation 1",
            "Specific recommendation 2",
            "Specific recommendation 3"
          ]
        }
        
        Sort domains by score (highest first). Be thoughtful and considerate in your analysis.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse Gemini response");
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      
      // Sort by score and get top 3
      const sortedScores = analysis.domainScores.sort((a: DomainScore, b: DomainScore) => b.score - a.score);
      const topDomains = sortedScores.slice(0, 3);
      
      return {
        domainScores: sortedScores,
        topDomains,
        overallInsights: analysis.overallInsights,
        recommendations: analysis.recommendations
      };
    } catch (error) {
      console.error("Gemini analysis error:", error);
      throw new Error("Failed to analyze onboarding answers");
    }
  }

  static async generateChatResponse(prompt: string): Promise<string> {
    try {
      const primaryModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      try {
        const result = await primaryModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text?.trim() || "";
      } catch (errPrimary: any) {
        // If quota/rate-limit, fall back to a lighter model
        const status = errPrimary?.status || errPrimary?.errorDetails?.status;
        if (status === 429) {
          try {
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result = await fallbackModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return text?.trim() || "";
          } catch (errFallback) {
            console.error("Gemini chat fallback error:", errFallback);
            return "I'm currently at capacity. Please try again in a minute, and I'll continue helping you.";
          }
        }
        // Non-429 errors
        console.error("Gemini chat error:", errPrimary);
        return "I ran into a temporary issue. Please try again in a moment.";
      }
    } catch (error) {
      console.error("Gemini chat unexpected error:", error);
      return "I ran into a temporary issue. Please try again shortly.";
    }
  }

  static async suggestTracks(domain: string, goal: string, priorKnowledge?: string): Promise<string[]> {
    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const prompt = `You are a career mentor. Given the user's domain, final goal, and prior knowledge (if any), suggest 3-6 concise learning tracks or specializations they could choose from. Respond ONLY as a JSON array of short strings, no extra text.

Domain: ${domain}
Final goal: ${goal}
Prior knowledge: ${priorKnowledge || 'N/A'}`;
      const result = await model.generateContent(prompt);
      const text = (await result.response.text()).trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      const options = JSON.parse(jsonMatch[0]);
      if (Array.isArray(options)) {
        return options.map((o) => String(o)).slice(0, 8);
      }
      return [];
    } catch (e) {
      console.error('Gemini suggestTracks error:', e);
      return [];
    }
  }

  static async understandUserInput(input: string): Promise<{
    smallTalk: boolean;
    domain?: string | null;
    goal?: string | null;
    priorKnowledge?: string | null;
    followUp?: string | null;
  }> {
    try {
      const primaryModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      try {
        const prompt = `Extract structured intent from the user's message.
Respond ONLY with a JSON object like:
{
  "smallTalk": true|false,
  "domain": "string|null",
  "goal": "string|null",
  "priorKnowledge": "string|null",
  "followUp": "one short conversational follow-up question for missing info"
}

Message: ${JSON.stringify(input)}
`;
        const result = await primaryModel.generateContent(prompt);
        const text = (await result.response.text()).trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        return {
          smallTalk: Boolean(parsed.smallTalk),
          domain: parsed.domain ?? null,
          goal: parsed.goal ?? null,
          priorKnowledge: parsed.priorKnowledge ?? null,
          followUp: parsed.followUp ?? null,
        };
      } catch (errPrimary: any) {
        // If quota/rate-limit, fall back to a lighter model
        const status = errPrimary?.status || errPrimary?.errorDetails?.status;
        if (status === 429) {
          try {
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Extract structured intent from the user's message.
Respond ONLY with a JSON object like:
{
  "smallTalk": true|false,
  "domain": "string|null",
  "goal": "string|null",
  "priorKnowledge": "string|null",
  "followUp": "one short conversational follow-up question for missing info"
}

Message: ${JSON.stringify(input)}
`;
            const result = await fallbackModel.generateContent(prompt);
            const text = (await result.response.text()).trim();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
            return {
              smallTalk: Boolean(parsed.smallTalk),
              domain: parsed.domain ?? null,
              goal: parsed.goal ?? null,
              priorKnowledge: parsed.priorKnowledge ?? null,
              followUp: parsed.followUp ?? null,
            };
          } catch (errFallback) {
            console.error("Gemini understandUserInput fallback error:", errFallback);
            return { smallTalk: false };
          }
        }
        // Non-429 errors
        console.error("Gemini understandUserInput error:", errPrimary);
        return { smallTalk: false };
      }
    } catch (error) {
      console.error('Gemini understandUserInput unexpected error:', error);
      return { smallTalk: false };
    }
  }

  static async validateResponse(input: string, currentQuestion: string): Promise<{
    relevant: boolean;
    extractedInfo?: string | null;
    reason?: string | null;
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const prompt = `Determine if the user's response is relevant to the current question.

Current question: ${currentQuestion}
User response: ${input}

Respond ONLY with a JSON object:
{
  "relevant": true|false,
  "extractedInfo": "relevant information extracted from response, or null",
  "reason": "brief reason why response is relevant or irrelevant"
}`;
      const result = await model.generateContent(prompt);
      const text = (await result.response.text()).trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      return {
        relevant: Boolean(parsed.relevant),
        extractedInfo: parsed.extractedInfo ?? null,
        reason: parsed.reason ?? null,
      };
    } catch (e) {
      console.error('Gemini validateResponse error:', e);
      return { relevant: true };
    }
  }
}
