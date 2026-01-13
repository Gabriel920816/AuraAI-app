export enum ViewType {
  CALENDAR = 'CALENDAR',
  TASKS = 'TASKS',
  FOCUS = 'FOCUS',
  HEALTH = 'HEALTH',
  AI_CHAT = 'AI_CHAT'
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  description?: string;
  category: 'work' | 'personal' | 'holiday' | 'health';
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  date: string; // YYYY-MM-DD
  originalDate?: string; // To track if it was rolled over
}

export interface PeriodRecord {
  id: string;
  date: string;
  type: 'start' | 'end';
}

export interface WeatherData {
  temp: number;
  condition: string;
  location: string;
}

export interface HoroscopeSource {
  title: string;
  uri: string;
}

export interface HoroscopeData {
  sign: string;
  summary: string;
  prediction: string;
  luckyNumber: string;
  luckyColor: string;
  ratings: {
    love: number;
    work: number;
    health: number;
    wealth: number;
  };
  sources?: HoroscopeSource[];
}

export interface GmailEmail {
  id: string;
  sender: string;
  subject: string;
  time: string;
  isRead: boolean;
}