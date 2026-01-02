import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn('Warning: GEMINI_API_KEY environment variable is not set');
}

const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const chatWithCode = async (req, res) => {
    try {
        const { code, language, userMessage } = req.body;

        if (!userMessage) {
            return res.status(400).json({
                success: false,
                message: 'User message is required'
            });
        }

        // Build a comprehensive prompt that includes the code context
        const prompt = code
            ? `You are a helpful coding assistant. The user is working with the following ${language || 'code'}:

\`\`\`${language || 'code'}
${code}
\`\`\`

User's question: ${userMessage}

Please provide a helpful, concise response. If you're suggesting code changes, explain what needs to be changed and why. Focus on debugging, explaining, or improving the code.`
            : `You are a helpful coding assistant. User's question: ${userMessage}`;

        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }]
                }
            ],
        });


        const aiResponse =
            response.candidates?.[0]?.content?.parts?.[0]?.text ??
            "No response from Gemini";


        res.json({
            success: true,
            response: aiResponse
        });

    } catch (error) {
        console.error('Gemini API error:', error.message);
        res.status(500).json({
            success: false,
            message: "I apologize, but I'm having trouble processing your request right now.",
            error: error.message
        });
    }
};
