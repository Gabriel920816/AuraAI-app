import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

// Simple string-to-integer hash for deterministic seeding
const generateSeed = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const fetchWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 1500) => {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error?.status === 429 || error?.status >= 500 || error?.message?.includes('quota');
    if (retries > 0 && isRetryable) {
      await new Promise(r => setTimeout(r, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2);
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
  
  if (cached && !forceRefresh) {
    return JSON.parse(cached);
  }

  const ai = getAIClient();
  const seed = generateSeed(`${sign}-${today}`);

  try {
    const response = await fetchWithRetry(async () => {
      const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Today is ${today}. 
        Act as a professional mathematical astrologer.
        1. Search for current real-time planetary positions and aspects affecting ${sign} today.
        2. Strictly CALCULATE the ratings (1-5) based on current celestial intensity.
        3. The 'summary' field MUST be exactly one word (a noun or adjective) representing the theme of the day (e.g., 'Prosperity', 'Reflection', 'Dynamic', 'Balance').
        
        Provide the response in JSON format. Ensure the prediction is grounded in the search data.`,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.0,
          seed: seed,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { 
                type: Type.STRING, 
                description: "A single word summarizing the day's theme (e.g., 'Clarity', 'Hustle', 'Peace')." 
              },
              prediction: { type: Type.STRING },
              luckyNumber: { type: Type.STRING },
              luckyColor: { type: Type.STRING },
              ratings: {
                type: Type.OBJECT,
                properties: {
                  love: { type: Type.NUMBER },
                  work: { type: Type.NUMBER },
                  health: { type: Type.NUMBER },
                  wealth: { type: Type.NUMBER }
                },
                required: ["love", "work", "health", "wealth"]
              }
            },
            required: ["summary", "prediction", "luckyNumber", "luckyColor", "ratings"]
          }
        }
      });
      
      const jsonContent = JSON.parse(res.text || '{}');
      
      const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .map(c => c.web)
        .filter((w): w is { title: string; uri: string } => !!(w && w.title && w.uri))
        .map(w => ({ title: w.title, uri: w.uri }));

      return { ...jsonContent, sources };
    });

    localStorage.setItem(cacheKey, JSON.stringify(response));
    return response;
  } catch (error) {
    console.warn("Horoscope API failed, using fallback.");
    return { 
      summary: "Mystery",
      prediction: "The stars are currently aligning in a complex geometric pattern that resists simple interpretation. Trust your intuition today.", 
      luckyNumber: "7", 
      luckyColor: "Deep Indigo",
      ratings: { love: 3, work: 3, health: 3, wealth: 3 },
      sources: []
    };
  }
};

export const processAssistantQuery = async (query: string, currentContext: any) => {
  const ai = getAIClient();
  try {
    return await fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are Aura AI. Context: ${JSON.stringify(currentContext)}. User asked: "${query}". Respond in JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              action: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["ADD_EVENT", "CHANGE_COUNTRY", "NONE"] },
                  data: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, date: { type: Type.STRING }, startTime: { type: Type.STRING }, endTime: { type: Type.STRING }, country: { type: Type.STRING } } }
                },
                required: ["type"]
              }
            },
            required: ["reply", "action"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    });
  } catch (error) {
    throw new Error("API Limit Reached");
  }
};