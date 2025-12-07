// services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateInterviewResultsWithGemini(questionsData) {
  if (!apiKey || !genAI) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  
  const systemPrompt = `You are an expert MBA admissions interviewer...`; // Your existing prompt
  
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt
    });
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: `Here is the interview data...` }]
      }]
    });
    
    const text = result.response.text();
    // Parse and return JSON...
    
  } catch (error) {
    if (error.status === 429) {
      console.log('⚠️ Gemini API quota exceeded. Please wait 48 hours or upgrade plan.');
      throw new Error('API quota exceeded. Please try again in 48 hours.');
    }
    throw error;
  }
}