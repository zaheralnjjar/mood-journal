// أدوات مساعدة للتطبيق

import { HIJRI_MONTHS_AR, GREGORIAN_MONTHS_AR, DAYS_AR, STORAGE_KEYS } from './constants';
import { JournalEntry, JournalStats, MoodType, Tag } from './types';

// إعادة تصدير cn من lib/utils
export { cn } from '@/lib/utils';

// تحويل التاريخ الميلادي إلى هجري
export function toHijri(date: Date): { day: number; month: number; year: number; monthName: string } {
  // خوارزمية تقريبية للتحويل للهجري
  const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const hijri = jdToHijri(jd);
  return {
    ...hijri,
    monthName: HIJRI_MONTHS_AR[hijri.month - 1],
  };
}

function gregorianToJD(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function jdToHijri(jd: number): { day: number; month: number; year: number } {
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { day, month, year };
}

// تنسيق التاريخ بالعربية
export function formatDateArabic(date: Date): string {
  const day = date.getDate();
  const month = GREGORIAN_MONTHS_AR[date.getMonth()];
  const year = date.getFullYear();
  const dayName = DAYS_AR[date.getDay()];
  return `${dayName}، ${day} ${month} ${year}`;
}

// تنسيق التاريخ الهجري
export function formatHijriDate(date: Date): string {
  const hijri = toHijri(date);
  return `${hijri.day} ${hijri.monthName} ${hijri.year} هـ`;
}

// الحصول على اسم اليوم
export function getDayName(date: Date): string {
  return DAYS_AR[date.getDay()];
}

// الحصول على اسم الشهر
export function getMonthName(month: number): string {
  return GREGORIAN_MONTHS_AR[month];
}

// حساب الفرق بالأيام
export function daysDifference(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

// تنسيق الوقت
export function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'م' : 'ص';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// حساب سلسلة الاستمرارية
export function calculateStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;
  
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].date);
    entryDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// حساب الإحصائيات
export function calculateStats(entries: JournalEntry[]): JournalStats {
  const moodsCount: Record<MoodType, number> = {
    happy: 0, sad: 0, neutral: 0, excited: 0, tired: 0, anxious: 0, grateful: 0, angry: 0,
  };
  
  const tagsUsed: Record<string, number> = {};
  let totalWords = 0;
  
  entries.forEach(entry => {
    if (entry.mood) {
      moodsCount[entry.mood]++;
    }
    entry.tags.forEach(tag => {
      tagsUsed[tag] = (tagsUsed[tag] || 0) + 1;
    });
    entry.content.forEach(el => {
      if (el.type === 'text') {
        totalWords += el.content.split(/\s+/).filter(Boolean).length;
      }
    });
  });
  
  const streak = calculateStreak(entries);
  
  // حساب أطول سلسلة
  let longestStreak = 0;
  let currentStreak = 0;
  const sortedDates = entries
    .map(e => new Date(e.date).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = daysDifference(prev, curr);
      if (diff === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);
  
  return {
    totalEntries: entries.length,
    streak,
    longestStreak,
    moodsCount,
    tagsUsed,
    averageWordsPerEntry: entries.length > 0 ? Math.round(totalWords / entries.length) : 0,
  };
}

// توليد معرف فريد
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// التخزين المحلي
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  },
};

// حفظ اليوميات
export function saveEntries(entries: JournalEntry[]): void {
  storage.set(STORAGE_KEYS.JOURNAL_ENTRIES, entries);
}

// تحميل اليوميات
export function loadEntries(): JournalEntry[] {
  return storage.get<JournalEntry[]>(STORAGE_KEYS.JOURNAL_ENTRIES, []);
}

// حفظ الوسوم
export function saveTags(tags: Tag[]): void {
  storage.set(STORAGE_KEYS.TAGS, tags);
}

// تحميل الوسوم
export function loadTags(): Tag[] {
  return storage.get<Tag[]>(STORAGE_KEYS.TAGS, []);
}

// تصدير البيانات كـ JSON
export function exportData(entries: JournalEntry[], tags: Tag[]): string {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    entries,
    tags,
  };
  return JSON.stringify(data, null, 2);
}

// استيراد البيانات
export function importData(jsonString: string): { entries: JournalEntry[]; tags: Tag[] } | null {
  try {
    const data = JSON.parse(jsonString);
    if (!data.entries || !Array.isArray(data.entries)) {
      throw new Error('Invalid data format');
    }
    return {
      entries: data.entries,
      tags: data.tags || [],
    };
  } catch (e) {
    console.error('Error importing data:', e);
    return null;
  }
}

// تنسيق حجم الملف
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت';
  const units = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

// تحويل الصورة إلى Base64
export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// تحقق من وجود صورة
export function isValidImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
}

// حساب العمر بالأيام
export function daysSince(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// تحديد لون النص بناءً على الخلفية
export function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// تقليص النص
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// البحث في النص
export function highlightSearch(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

// تحويل النص العربي إلى slug
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
