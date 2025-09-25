// /api/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Vercel 환경 변수에서 API 키를 가져옵니다.
const apiKey = process.env.GOOGLE_API_KEY;

let genAI;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // API 키가 설정되었는지 확인
  if (!apiKey || !genAI) {
    console.error('GOOGLE_API_KEY is not set in Vercel environment variables.');
    return res.status(500).json({ error: 'Server configuration error: API key is missing.' });
  }

  try {
    const { prompt, systemInstruction, isJson } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const generationConfig = isJson ? { responseMimeType: "application/json" } : {};

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
      systemInstruction: {
        parts: [{ text: systemInstruction || '' }],
        role: "model"
      },
      generationConfig: generationConfig
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.status(200).json({ text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

