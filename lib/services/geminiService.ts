import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

  static async generateText(prompt: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini text generation error:", error);
      throw new Error("Failed to generate text with Gemini");
    }
  }
}
