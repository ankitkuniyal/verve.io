// services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateInterviewResultsWithGemini(questionsData) {
  console.debug('[GeminiService] Called generateInterviewResultsWithGemini');
  if (!apiKey || !genAI) {
    console.error('[GeminiService] GEMINI_API_KEY is not set in environment variables');
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  
  const systemPrompt = `You are an expert MBA admissions interviewer...`; // Your existing prompt
  
  try {
    console.debug('[GeminiService] Creating generative model with model "gemini-2.0-flash"');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt
    });

    const userContent = {
      contents: [{
        role: 'user',
        parts: [{ text: `Here is the interview data...` }]
      }]
    };
    console.debug('[GeminiService] Sending request to Gemini API:', JSON.stringify(userContent, null, 2));

    const result = await model.generateContent(userContent);

    if (!result || !result.response) {
      console.warn('[GeminiService] Gemini API returned no result or response object');
    }
    
    const text = result.response?.text?.();
    console.debug('[GeminiService] Received response from Gemini API:', text);

    // Parse and return JSON...
    
  } catch (error) {
    if (error.status === 429) {
      console.warn('⚠️ Gemini API quota exceeded. Please wait 48 hours or upgrade plan.');
      throw new Error('API quota exceeded. Please try again in 48 hours.');
    }
    console.error('[GeminiService] Error in generateInterviewResultsWithGemini:', error);
    throw error;
  }
}