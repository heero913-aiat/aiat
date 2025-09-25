// /api/imagen.js
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
        
        const payload = {
            instances: [{ prompt: prompt }],
            parameters: { "sampleCount": 1 }
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.error('Imagen API Error:', errorBody);
            return res.status(apiResponse.status).json({ error: `Image API failed: ${apiResponse.statusText}` });
        }

        const result = await apiResponse.json();
        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            const imageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
            res.status(200).json({ imageUrl });
        } else {
            throw new Error("Invalid image data from API.");
        }
    } catch (error) {
        console.error('Error calling Imagen API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
