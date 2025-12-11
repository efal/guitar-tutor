import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { PracticeRoutine } from "../types";

const genAI = new GoogleGenerativeAI(process.env.API_KEY || '');

export const generatePracticeRoutine = async (
  level: string,
  duration: number,
  focus: string
): Promise<PracticeRoutine> => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          totalDuration: { type: SchemaType.NUMBER },
          items: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING },
                durationMinutes: { type: SchemaType.NUMBER },
                description: { type: SchemaType.STRING },
                category: {
                  type: SchemaType.STRING,
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

  const prompt = `Create a guitar practice routine for a ${level} level player focusing on ${focus}. 
  The total duration should be approximately ${duration} minutes. 
  Include a breakdown of practice items.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  if (text) {
    return JSON.parse(text) as PracticeRoutine;
  }

  throw new Error("Failed to generate routine");
};

export const chatWithTutor = async (history: { role: 'user' | 'model', text: string }[], message: string): Promise<string> => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    systemInstruction: "You are Strum, a helpful and encouraging guitar tutor. Keep answers concise and focused on guitar playing, music theory, and practice habits."
  });

  const chatHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const chat = model.startChat({
    history: chatHistory
  });

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text() || "I'm having trouble thinking of a response right now.";
};
