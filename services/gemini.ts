import { GoogleGenAI, Type } from "@google/genai";
import { PracticeRoutine } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePracticeRoutine = async (
  level: string,
  duration: number,
  focus: string
): Promise<PracticeRoutine> => {
  const prompt = `Create a guitar practice routine for a ${level} level player focusing on ${focus}. 
  The total duration should be approximately ${duration} minutes. 
  Include a breakdown of practice items.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          totalDuration: { type: Type.NUMBER },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                durationMinutes: { type: Type.NUMBER },
                description: { type: Type.STRING },
                category: { 
                  type: Type.STRING,
                  enum: ['warmup', 'technique', 'repertoire', 'theory', 'cool-down'],
                  description: "Must be one of: warmup, technique, repertoire, theory, cool-down"
                }
              },
              required: ['title', 'durationMinutes', 'description', 'category']
            }
          }
        },
        required: ['title', 'totalDuration', 'items']
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as PracticeRoutine;
  }
  
  throw new Error("Failed to generate routine");
};

export const chatWithTutor = async (history: {role: 'user' | 'model', text: string}[], message: string): Promise<string> => {
  const chatHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: chatHistory,
    config: {
        systemInstruction: "You are Strum, a helpful and encouraging guitar tutor. Keep answers concise and focused on guitar playing, music theory, and practice habits."
    }
  });

  const result = await chat.sendMessage({ message });
  return result.text || "I'm having trouble thinking of a response right now.";
};
