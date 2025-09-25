// /api/tts.js
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    try {
        const { script, persona } = req.body;
        if (!script) {
            return res.status(400).json({ error: 'Script is required' });
        }

        let voiceName = "Zephyr"; // 기본값
        switch(persona) {
            case '활기찬 아이돌': voiceName = 'Puck'; break;
            case '차분한 분석가': voiceName = 'Charon'; break;
        }
        
        const apiKey = process.env.GOOGLE_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

        const payload = { 
            contents: [{ parts: [{ text: script }] }],
            generationConfig: { 
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName }
                    }
                }
            }
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.error('TTS API Error:', errorBody);
            return res.status(apiResponse.status).json({ error: `TTS API failed: ${apiResponse.statusText}` });
        }

        const result = await apiResponse.json();
        const audioData = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        const mimeType = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType;

        if (!audioData || !mimeType) {
            throw new Error("Invalid audio data from API.");
        }
        
        const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)[1], 10);
        
        res.status(200).json({ audioData, sampleRate });

    } catch (error) {
        console.error('Error calling TTS API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
