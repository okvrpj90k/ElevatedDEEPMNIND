import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    console.error("API Key missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// --- Models ---
const MODEL_FAST = 'gemini-2.5-flash';
const MODEL_REASONING = 'gemini-3-pro-preview';
const MODEL_LIVE = 'gemini-2.5-flash-native-audio-preview-09-2025';
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

// --- Flashcard Generation ---
export const generateFlashcardsFromText = async (text: string, count: number = 5) => {
  const ai = getAI();
  if (!ai) throw new Error("AI not initialized");

  const prompt = `Create ${count} high-quality study flashcards based on the following text. 
  Focus on key concepts, definitions, and relationships.
  
  Text:
  ${text.substring(0, 40000)}`; // Increased limit

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING, description: "The question or concept" },
            back: { type: Type.STRING, description: "The answer or definition" },
            difficulty: { type: Type.STRING, enum: ["new"] }
          },
          required: ["front", "back", "difficulty"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

// --- Study Chat (Materials Only) ---
export const chatWithMaterials = async (
  history: { role: string; content: string }[],
  newMessage: string,
  contextMaterial: string,
  isThinkingMode: boolean
) => {
  const ai = getAI();
  if (!ai) throw new Error("AI not initialized");

  const model = isThinkingMode ? MODEL_REASONING : MODEL_FAST;
  
  // If Thinking Mode is on, we configure the budget
  const config: any = {};
  if (isThinkingMode) {
    config.thinkingConfig = { thinkingBudget: 2048 }; 
  }

  const systemInstruction = `You are Elevated DeepMind, a serious, professional AI study assistant.
  Your goal is to help the user learn from their provided materials.
  
  STRICT RULE: You must answer ONLY based on the provided "Context Material". 
  If the answer is not in the material, state clearly: "I cannot find that information in your uploaded materials." and suggest using the Web Explorer.
  
  CITATION RULE: When you state a fact from the text, you MUST cite the source using this EXACT format:
  [[Source Title | exact quote substring from text]]
  
  Example: The mitochondria is the powerhouse of the cell [[Biology Ch1.pdf | mitochondria is the powerhouse]].
  
  Do not hallucinate facts not present in the text.
  
  Context Material:
  ${contextMaterial.substring(0, 100000)}
  `;

  const conversation = history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n');
  const finalPrompt = `${conversation}\nUSER: ${newMessage}\nMODEL:`;

  const response = await ai.models.generateContent({
    model: model,
    contents: finalPrompt,
    config: {
      ...config,
      systemInstruction: systemInstruction,
    }
  });

  return response.text;
};

// --- Web Search (Grounding) ---
export const searchWeb = async (query: string, isThinkingMode: boolean) => {
  const ai = getAI();
  if (!ai) throw new Error("AI not initialized");

  const model = isThinkingMode ? MODEL_REASONING : MODEL_FAST;
  const config: any = {
    tools: [{ googleSearch: {} }],
  };
  
  if (isThinkingMode) {
    config.thinkingConfig = { thinkingBudget: 2048 };
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: query,
    config: config
  });

  return {
    text: response.text,
    chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

// --- Quiz Generation ---
export const generateQuiz = async (text: string) => {
  const ai = getAI();
  if (!ai) throw new Error("AI not initialized");

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: `Generate a 5-question multiple choice quiz based on this text: ${text.substring(0, 30000)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER, description: "Index of correct option (0-3)" },
            explanation: { type: Type.STRING }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

// --- YouTube Analysis ---
export const analyzeYouTubeContent = async (transcript: string) => {
  const ai = getAI();
  if (!ai) throw new Error("AI not initialized");

  const prompt = `Analyze the following YouTube video transcript and provide a structured study summary.
  
  Transcript:
  ${transcript.substring(0, 50000)}`;

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A concise overview of the video content." },
          timeline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING, description: "Timestamp (e.g., '02:30')" },
                label: { type: Type.STRING, description: "Topic discussed" }
              }
            }
          },
          keyConcepts: {
            type: Type.ARRAY,
            items: { type: Type.STRING, description: "Major definitions or formulas" }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generatePodcastScript = async (transcript: string) => {
  const ai = getAI();
  if (!ai) throw new Error("AI not initialized");

  const prompt = `Convert this video transcript into a short, engaging educational podcast script (approx 3-5 minutes read time).
  It should have a Host explaining the concepts clearly to the listener.
  Use analogies and keep it conversational.
  
  Transcript:
  ${transcript.substring(0, 50000)}`;

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: prompt,
  });

  return response.text;
};

export const generateTTS = async (text: string) => {
  const ai = getAI();
  if (!ai) throw new Error("AI not initialized");

  const response = await ai.models.generateContent({
    model: MODEL_TTS,
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Fenrir' }, 
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

// --- Image to Text ---
export const processImageContent = async (base64Data: string, mimeType: string) => {
    const ai = getAI();
    if (!ai) throw new Error("AI not initialized");
  
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Analyze this image. If it contains text, extract all of it. If it contains diagrams or formulas, explain them in detail."
          }
        ]
      }
    });
    return response.text;
};

export const getLiveClient = () => {
    const ai = getAI();
    return ai ? ai : null;
}