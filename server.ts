import express from 'express';
import multer from 'multer';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/analyze', upload.single('statement'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        Analyze the provided bank or credit card statement and extract the financial data.
        Categorize the spending, identify recurring subscriptions, and provide actionable insights for budgeting and reducing monthly overhead.
        
        CRITICAL INSTRUCTIONS:
        1. Accurately detect the primary currency used in the statement (e.g., "USD", "INR", "EUR", "GBP") and return its 3-letter ISO code.
        2. Extract the specific merchant name or payee name from the transaction description (e.g., if description is "POS REF AMAZON.IN", merchantName should be "Amazon").
        3. STRICT LENGTH LIMIT: To prevent output truncation, extract ONLY the top 15 most important or highest value transactions. Do NOT extract more than 15 transactions under any circumstances.
        
        Respond ONLY with a valid JSON object matching this schema:
        {
          "currency": "string",
          "transactions": [
            { "date": "YYYY-MM-DD", "description": "string", "merchantName": "string", "amount": number, "category": "string" }
          ],
          "summary": {
            "totalSpent": number,
            "topCategories": [
              { "name": "string", "amount": number }
            ]
          },
          "insights": ["string"],
          "subscriptions": [
            { "name": "string", "merchantName": "string", "amount": number, "frequency": "Monthly/Yearly", "suggestion": "string" }
          ]
        }
      `;

      // Determine mime type from the uploaded file, fallback to application/pdf
      const mimeType = req.file.mimetype || 'application/pdf';
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: req.file.buffer.toString('base64'),
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          maxOutputTokens: 8192,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              currency: { type: Type.STRING },
              transactions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    description: { type: Type.STRING },
                    merchantName: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    category: { type: Type.STRING }
                  },
                  required: ["date", "description", "merchantName", "amount", "category"]
                }
              },
              summary: {
                type: Type.OBJECT,
                properties: {
                  totalSpent: { type: Type.NUMBER },
                  topCategories: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.NUMBER }
                      },
                      required: ["name", "amount"]
                    }
                  }
                },
                required: ["totalSpent", "topCategories"]
              },
              insights: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              subscriptions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    merchantName: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    frequency: { type: Type.STRING },
                    suggestion: { type: Type.STRING }
                  },
                  required: ["name", "merchantName", "amount", "frequency", "suggestion"]
                }
              }
            },
            required: ["currency", "transactions", "summary", "insights", "subscriptions"]
          }
        },
      });

      if (!response.text) {
        throw new Error('Failed to generate analysis from AI');
      }

      let jsonText = response.text;
      
      // Remove any potential markdown wrappers that Gemini sometimes adds
      if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      }

      let parsedData;
      try {
        parsedData = JSON.parse(jsonText);
      } catch (parseError: any) {
        console.error('JSON Parse Error. Received text:', jsonText.substring(0, 500) + '...[truncated]');
        throw new Error(`Failed to parse AI response: ${parseError.message}. The statement might be too large.`);
      }
      
      res.json(parsedData);
    } catch (error: any) {
      console.error('Error analyzing statement:', error);
      res.status(500).json({ error: error.message || 'Failed to analyze statement' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
