
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

const generateSeed = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const fetchWithRetry = async (fn: () => Promise<any>, retries = 2, delay = 1000) => {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error?.status === 429 || error?.status >= 500 || error?.message?.includes('quota');
    if (retries > 0 && isRetryable) {
      await new Promise(r => setTimeout(r, delay));
      return fetchWithRetry(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
};

export const getZodiacSign = (date: string) => {
  if (!date) return "Aries";
  const d = new Date(date);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return "Aries";
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return "Taurus";
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return "Gemini";
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return "Cancer";
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return "Leo";
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return "Virgo";
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return "Libra";
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return "Scorpio";
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return "Sagittarius";
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "Capricorn";
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
};

export const generateHoroscope = async (sign: string, birthDate: string, forceRefresh = false) => {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `aura_horoscope_v6_consistent_${sign}_${today}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached && !forceRefresh) return JSON.parse(cached);

  const ai = getAIClient();
  const seed = generateSeed(`${sign}-${today}`);

  try {
    const response = await fetchWithRetry(async () => {
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Today is ${today}. Act as a professional mathematical astrologer. Provide the response in JSON format.`,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.1,
          seed: seed,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              prediction: { type: Type.STRING },
              luckyNumber: { type: Type.STRING },
              luckyColor: { type: Type.STRING },
              ratings: {
                type: Type.OBJECT,
                properties: { love: { type: Type.NUMBER }, work: { type: Type.NUMBER }, health: { type: Type.NUMBER }, wealth: { type: Type.NUMBER } },
                required: ["love", "work", "health", "wealth"]
              }
            },
            required: ["summary", "prediction", "luckyNumber", "luckyColor", "ratings"]
          }
        }
      });
      const jsonContent = JSON.parse(res.text || '{}');
      const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks.map(c => c.web).filter(w => !!(w && w.title && w.uri)).map(w => ({ title: w!.title, uri: w!.uri }));
      return { ...jsonContent, sources };
    });
    localStorage.setItem(cacheKey, JSON.stringify(response));
    return response;
  } catch (error) {
    return { summary: "Mystery", prediction: "The stars are complex today.", luckyNumber: "7", luckyColor: "Indigo", ratings: { love: 3, work: 3, health: 3, wealth: 3 }, sources: [] };
  }
};

export const processAssistantQuery = async (query: string, currentContext: any) => {
  const ai = getAIClient();
  const today = new Date();
  const dateContext = {
    today_iso: today.toISOString().split('T')[0],
    today_full: today.toString(),
    day_of_week: today.toLocaleDateString('en-US', { weekday: 'long' })
  };

  try {
    return await fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are Aura AI, a helpful life assistant. 
        CURRENT TIME: ${JSON.stringify(dateContext)}.
        LOCAL WEATHER: ${JSON.stringify(currentContext.currentWeather || {})}.
        USER DATA: ${JSON.stringify(currentContext)}.
        
        QUERY: "${query}"
        
        INSTRUCTIONS:
        1. If user asks about weather, use the LOCAL WEATHER context. If they ask about other locations or forecasts, use the googleSearch tool.
        2. For dates like "tomorrow", use CURRENT TIME to calculate exact YYYY-MM-DD.
        3. Return ONLY JSON.`,
        config: {
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 2000 },
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              action: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["ADD_EVENT", "CHANGE_COUNTRY", "NONE"] },
                  data: { 
                    type: Type.OBJECT, 
                    properties: { 
                      title: { type: Type.STRING }, 
                      date: { type: Type.STRING }, 
                      startTime: { type: Type.STRING }, 
                      endTime: { type: Type.STRING }, 
                      country: { type: Type.STRING } 
                    } 
                  }
                },
                required: ["type"]
              }
            },
            required: ["reply", "action"]
          }
        }
      });
      return JSON.parse(response.text || '{"reply": "I understood.", "action": {"type": "NONE"}}');
    });
  } catch (error) {
    throw new Error("Connection Timeout");
  }
};
