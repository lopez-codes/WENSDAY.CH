import { GoogleGenAI } from "@google/genai";

if (!process.env.GOOGLE_API_KEY) {
  console.warn("GOOGLE_API_KEY not found - AI chat will not work until configured");
}

const ai = process.env.GOOGLE_API_KEY ? new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }) : null;

export interface ChatResponse {
  content: string;
  model: string;
}

export async function generateChatResponse(
  message: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  model: string = "gemini-2.5-flash"
): Promise<ChatResponse> {
  if (!ai) {
    throw new Error("AI service not configured. Please add your GOOGLE_API_KEY to enable chat functionality.");
  }

  try {
    // Prepare conversation context
    const systemPrompt = `You are a Swiss AI assistant for wensday.ch, a professional research platform. 
    You provide accurate, unbiased information with Swiss precision. You can communicate in German, French, 
    Italian, and English as appropriate for Swiss users. Be helpful, professional, and thorough in your responses.
    
    When discussing Swiss topics, use local context and knowledge. Always maintain neutrality and provide 
    well-researched information.`;

    // Build conversation context
    const conversationContext = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const fullPrompt = conversationContext 
      ? `${systemPrompt}\n\nConversation history:\n${conversationContext}\n\nUser: ${message}`
      : `${systemPrompt}\n\nUser: ${message}`;

    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
    });

    const content = response.text || "I apologize, but I couldn't generate a response. Please try again.";

    return {
      content,
      model,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate AI response. Please try again later.");
  }
}

export async function generateConversationTitle(firstMessage: string): Promise<string> {
  if (!ai) {
    return "New Conversation";
  }

  try {
    const prompt = `Generate a brief, descriptive title (max 50 characters) for a conversation that starts with this message: "${firstMessage}"
    
    The title should be in the same language as the message and capture the main topic. Return only the title, nothing else.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text?.trim() || "New Conversation";
  } catch (error) {
    console.error("Error generating conversation title:", error);
    return "New Conversation";
  }
}
