
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

// 全局请求锁：防止在同一时刻发起多个相同的请求
const requestLocks: Record<string, boolean> = {};

const generateSeed = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const cleanJSONResponse = (text: string): string => {
  return text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
};

const fetchWithRetry = async (fn: () => Promise<any>, retries = 2, delay = 2000) => {
  try {
    return await fn();
  } catch (error: any) {
    const status = error?.status;
    const message = error?.message?.toLowerCase() || "";
    
    // 如果是 429 (Too Many Requests) 或者包含 quota/limit 关键字
    if (status === 429 || message.includes('quota') || message.includes('limit')) {
      console.warn("Aura: API Quota reached. Cooling down...");
      if (retries > 0) {
        await new Promise(r => setTimeout(r, delay));
        return fetchWithRetry(fn, retries - 1, delay * 2);
      }
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
  const cacheKey = `aura_horoscope_v8_${sign}_${today}`;
  const lockKey = `lock_${cacheKey}`;

  // 1. 检查缓存
  const cached = localStorage.getItem(cacheKey);
  if (cached && !forceRefresh) return JSON.parse(cached);

  // 2. 检查锁：如果当前已经在请求中，直接返回缓存或空
  if (requestLocks[lockKey]) {
    console.log("Aura: Request already in progress, skipping...");
    return cached ? JSON.parse(cached) : null;
  }

  requestLocks[lockKey] = true;
  const ai = getAIClient();
  const seed = generateSeed(`${sign}-${today}`);

  try {
    const response = await fetchWithRetry(async () => {
      // 使用 Flash 模型以确保最高配额
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: `Today is ${today}. Research daily horoscope for ${sign}. Return valid JSON.`,
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
      
      const cleanedText = cleanJSONResponse(res.text || '{}');
      const jsonContent = JSON.parse(cleanedText);
      const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks.map(c => c.web).filter(w => !!(w && w.title && w.uri)).map(w => ({ title: w!.title, uri: w!.uri }));
      return { ...jsonContent, sources };
    });
    
    localStorage.setItem(cacheKey, JSON.stringify(response));
    return response;
  } catch (error) {
    console.error("Horoscope Error:", error);
    // 返回一个优雅的降级数据，不报错，防止组件循环触发
    return { 
      summary: "Rest", 
      prediction: "The stars suggest a digital break. (API Daily Limit Reached). Check back later!", 
      luckyNumber: "8", 
      luckyColor: "Indigo", 
      ratings: { love: 3, work: 3, health: 3, wealth: 3 }, 
      sources: [] 
    };
  } finally {
    // 延迟释放锁，防止极短时间内的重试
    setTimeout(() => { delete requestLocks[lockKey]; }, 5000);
  }
};

export const processAssistantQuery = async (query: string, currentContext: any) => {
  const ai = getAIClient();
  try {
    return await fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // 助手也全面使用 Flash 以节省配额
        contents: `Assistant Context: ${JSON.stringify(currentContext)}. User Query: "${query}"`,
        config: {
          tools: [{ googleSearch: {} }],
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
  } catch (error) {
    return { reply: "I'm currently resting due to high demand. Please try again in a moment!", action: { type: "NONE" } };
  }
};
