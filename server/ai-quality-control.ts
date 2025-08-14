import { GoogleGenAI } from "@google/genai";

interface QualityAnalysis {
  hasErrors: boolean;
  errorDetails?: string;
  confidenceScore: number;
  needsReview: boolean;
  factChecked: boolean;
  businessCategory?: string;
  sources?: Array<{ claim: string; confidence: number; needsVerification: boolean }>;
}

export class AIQualityController {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Analyzes AI response for errors, inconsistencies, and business relevance
   * Similar to ChatGPT's quality control system
   */
  async analyzeResponse(
    userQuery: string,
    aiResponse: string,
    businessContext?: string
  ): Promise<QualityAnalysis> {
    try {
      const analysisPrompt = `
Du bist ein Qualitätskontrollsystem für KI-Antworten in einem Business-Kontext.
Analysiere die folgende KI-Antwort auf Fehler, Ungenauigkeiten und Business-Relevanz.

BENUTZER-ANFRAGE: "${userQuery}"
KI-ANTWORT: "${aiResponse}"
BUSINESS-KONTEXT: "${businessContext || 'Allgemein'}"

Bewerte die Antwort nach folgenden Kriterien:

1. FEHLERERKENNNUNG:
   - Faktische Unrichtigkeiten
   - Logische Widersprüche
   - Unvollständige Informationen
   - Veraltete Daten

2. BUSINESS-RELEVANZ:
   - Passt die Antwort zum Business-Kontext?
   - Sind die Empfehlungen praktisch umsetzbar?
   - Fehlen wichtige Business-Überlegungen?

3. VERTRAUENSWÜRDIGKEIT:
   - Wie sicher sind die gemachten Aussagen?
   - Welche Aussagen benötigen Quellenangaben?
   - Was sollte manuell überprüft werden?

Antworte mit JSON in folgendem Format:
{
  "hasErrors": boolean,
  "errorDetails": "Spezifische Fehlerbeschreibung oder null",
  "confidenceScore": number (0-100),
  "needsReview": boolean,
  "factChecked": boolean,
  "businessCategory": "finance|marketing|legal|strategy|operations|general",
  "sources": [
    {
      "claim": "Spezifische Aussage",
      "confidence": number (0-100),
      "needsVerification": boolean
    }
  ]
}`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              hasErrors: { type: "boolean" },
              errorDetails: { type: "string" },
              confidenceScore: { type: "number" },
              needsReview: { type: "boolean" },
              factChecked: { type: "boolean" },
              businessCategory: { type: "string" },
              sources: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    claim: { type: "string" },
                    confidence: { type: "number" },
                    needsVerification: { type: "boolean" }
                  }
                }
              }
            }
          }
        },
        contents: analysisPrompt,
      });

      const rawJson = response.text;
      if (!rawJson) {
        throw new Error("Empty response from quality control model");
      }

      return JSON.parse(rawJson) as QualityAnalysis;

    } catch (error) {
      console.error("Quality analysis failed:", error);
      // Fallback: conservative quality assessment
      return {
        hasErrors: false,
        confidenceScore: 70,
        needsReview: true,
        factChecked: false,
        businessCategory: "general"
      };
    }
  }

  /**
   * Direct AI response generation without quality analysis
   */
  async generateDirectResponse(
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<string> {
    try {
      const prompt = `Du bist ein hilfreicher AI-Assistent. Beantworte die Frage des Benutzers hilfreich und präzise.

Gesprächsverlauf:
${conversationHistory.map(msg => `${msg.role === 'user' ? 'Benutzer' : 'Assistent'}: ${msg.content}`).join('\n')}

Aktuelle Frage: ${userMessage}

Antworte freundlich und hilfreich auf Deutsch:`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text || "Entschuldigung, ich konnte keine Antwort generieren.";
    } catch (error) {
      console.error("Direct AI response failed:", error);
      return "Entschuldigung, es gab ein Problem bei der Antwortgenerierung. Bitte versuchen Sie es erneut.";
    }
  }

  /**
   * Enhanced business-focused AI response generation
   */
  async generateBusinessResponse(
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }>,
    businessContext?: {
      industry?: string;
      companySize?: string;
      businessGoals?: string[];
      errorTolerance?: string;
    }
  ): Promise<{ content: string; qualityAnalysis: QualityAnalysis }> {
    
    const businessPrompt = this.buildBusinessPrompt(userMessage, conversationHistory, businessContext);
    
    // Generate AI response
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: businessPrompt,
    });

    const aiContent = response.text || "Entschuldigung, ich konnte keine Antwort generieren.";

    // Quality control analysis
    const qualityAnalysis = await this.analyzeResponse(
      userMessage, 
      aiContent, 
      businessContext?.industry
    );

    return {
      content: aiContent,
      qualityAnalysis
    };
  }

  private buildBusinessPrompt(
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }>,
    businessContext?: {
      industry?: string;
      companySize?: string;
      businessGoals?: string[];
      errorTolerance?: string;
    }
  ): string {
    const context = conversationHistory
      .map(m => `${m.role}: ${m.content}`)
      .join('\n\n');

    const businessInfo = businessContext ? `
BUSINESS-KONTEXT:
- Branche: ${businessContext.industry || 'Nicht spezifiziert'}
- Unternehmensgröße: ${businessContext.companySize || 'Nicht spezifiziert'}
- Geschäftsziele: ${businessContext.businessGoals?.join(', ') || 'Nicht spezifiziert'}
- Fehlertoleranz: ${businessContext.errorTolerance || 'Medium'}
` : '';

    return `Du bist ein professioneller Business-AI-Assistent für Schweizer Unternehmen.

${businessInfo}

GESPRÄCHSVERLAUF:
${context}

AKTUELLE ANFRAGE: ${userMessage}

ANWEISUNGEN:
1. Antworte präzise und business-fokussiert
2. Berücksichtige den Schweizer Markt und Regulierungen
3. Gib praktische, umsetzbare Empfehlungen
4. Kennzeichne Unsicherheiten explizit
5. Verweise auf notwendige Quellen oder Expertenmeinungen
6. Antworte auf Schweizerdeutsch wenn angemessen, sonst Hochdeutsch

Antworte direkt auf die Anfrage:`;
  }
}