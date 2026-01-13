
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

// 全局請求鎖
const requestLocks: Record<string, boolean> = {};

// 檢查是否處於「熔斷冷卻期」
const checkCircuitBreaker = () => {
  const blockedUntil = localStorage.getItem('aura_api_blocked_until');
  if (blockedUntil) {
    if (Date.now() < parseInt(blockedUntil)) {
      console.warn("Aura: API is in cooling down period. Skipping request.");
      return true;
    } else {
      localStorage.removeItem('aura_api_blocked_until');
    }
  }
  return false;
};

// 設置熔斷：如果報錯，暫停請求 1 小時
const setCircuitBreaker = () => {
  const oneHour = 60 * 60 * 1000;
  localStorage.setItem('aura_api_blocked_until', (Date.now() + oneHour).toString());
};

const cleanJSONResponse = (text: string): string => {
  return text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
};

const fetchWithRetry = async (fn: () => Promise<any>, retries = 1, delay = 5000) => {
  if (checkCircuitBreaker()) {
    throw new Error("API_QUOTA_COOLDOWN");
  }

  try {
    return await fn();
  } catch (error: any) {
    const status = error?.status;
    const message = error?.message?.toLowerCase() || "";
    
    if (status === 429 || message.includes('quota') || message.includes('limit') || message.includes('exhausted')) {
      console.error("Aura: Critical Quota Error. Triggering Circuit Breaker.");
      setCircuitBreaker();
      throw new Error("API_QUOTA_EXHAUSTED");
    }
    
    if (retries > 0) {
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
  const cacheKey = `aura_horoscope_v9_${sign}_${today}`;
  const lockKey = `lock_${cacheKey}`;

  const cached = localStorage.getItem(cacheKey);
  if (cached && !forceRefresh) return JSON.parse(cached);
  if (requestLocks[lockKey]) return cached ? JSON.parse(cached) : null;

  requestLocks[lockKey] = true;
  const ai = getAIClient();

  try {
    const response = await fetchWithRetry(async () => {
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: `Today is ${today}. Provide daily horoscope for ${sign}. Short & Insightful.`,
        config: {
          // 減少搜尋頻率，這能顯著節省額度
          tools: forceRefresh ? [{ googleSearch: {} }] : [], 
          temperature: 0.7,
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
      
      const cleanedText = cleanJSONResponse(res.text || '{}');
      const jsonContent = JSON.parse(cleanedText);
      const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks.map(c => c.web).filter(w => !!(w && w.title && w.uri)).map(w => ({ title: w!.title, uri: w!.uri }));
      return { ...jsonContent, sources };
    });
    
    localStorage.setItem(cacheKey, JSON.stringify(response));
    return response;
  } catch (error: any) {
    if (error.message === "API_QUOTA_EXHAUSTED" || error.message === "API_QUOTA_COOLDOWN") {
      return { 
        summary: "Limit Reached", 
        prediction: "API Daily Limit Reached. Aura is resting to save energy. Reset happens at PT Midnight (16:00 Local).", 
        luckyNumber: "--", 
        luckyColor: "Gray", 
        ratings: { love: 0, work: 0, health: 0, wealth: 0 }, 
        sources: [] 
      };
    }
    return null;
  } finally {
    setTimeout(() => { delete requestLocks[lockKey]; }, 5000);
  }
};

export const processAssistantQuery = async (query: string, currentContext: any) => {
  const ai = getAIClient();
  try {
    return await fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Assistant Context: ${JSON.stringify(currentContext)}. User Query: "${query}"`,
        config: {
          // 對於簡單問題，停用 googleSearch 以節省極為珍貴的 Pro/Flash 搜尋配額
          tools: query.length > 15 ? [{ googleSearch: {} }] : [],
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              action: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["ADD_EVENT", "CHANGE_COUNTRY", "NONE"] },
                  data: { type: Type.OBJECT }
                },
                required: ["type"]
              }
            },
            required: ["reply", "action"]
          }
        }
      });
      return JSON.parse(cleanJSONResponse(response.text || '{"reply": "Understood.", "action": {"type": "NONE"}}'));
    });
  } catch (error: any) {
    return { reply: "My API quota is currently full. Please try again after 16:00 (Local Time).", action: { type: "NONE" } };
  }
};
