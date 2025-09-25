// /api/gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Vercel 환경 변수에서 API 키를 가져옵니다.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, systemInstruction, isJson } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
      systemInstruction: {
        parts: [{ text: systemInstruction || '' }],
        role: "model"
      },
    });
    
    // 요청할 때 generationConfig를 올바른 구조로 포함합니다.
    const generationConfig = isJson ? { responseMimeType: "application/json" } : {};
    
    const result = await model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: generationConfig
    });

    const response = await result.response;
    const text = response.text();
    
    res.status(200).json({ text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

