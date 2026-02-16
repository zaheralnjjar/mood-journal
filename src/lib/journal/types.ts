// أنواع البيانات الأساسية لتطبيق المفكرة اليومية

// نوع المزاج
export type MoodType = 'happy' | 'sad' | 'neutral' | 'excited' | 'tired' | 'anxious' | 'grateful' | 'angry';

// نوع عنصر المحتوى
export type ContentType = 'text' | 'image' | 'shape' | 'tag' | 'appointment' | 'quote' | 'code' | 'tracker' | 'shopping-list' | 'time' | 'location' | 'smart-form';

// نوع الشكل
export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'star' | 'hexagon' | 'diamond';

// نوع المحاذاة
export type AlignmentType = 'right' | 'center' | 'left' | 'justify';

// نوع التخطيط
export type LayoutType = 'inline' | 'wrap' | 'break' | 'float';

// وسم
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

// موعد
export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  reminder?: boolean;
}

// اقتباس
export interface Quote {
  id: string;
  text: string;
  author: string;
  style?: 'default' | 'minimal' | 'decorated';
}

// كتلة كود
export interface CodeBlock {
  id: string;
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

// متتبع العادات
export interface Tracker {
  id: string;
  name: string;
  icon: string;
  target: number;
  current: number;
  unit: string;
  color: string;
}

// عنصر قائمة التسوق
export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  quantity?: number;
}

// قائمة التسوق
export interface ShoppingList {
  id: string;
  title: string;
  items: ShoppingItem[];
}

// موقع
export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  image?: string;
  notes?: string;
}

// إحداثيات
export interface Coordinates {
  lat: number;
  lng: number;
}

// عنصر المحتوى
export interface ContentElement {
  id: string;
  type: ContentType;
  content: string;
  style?: ElementStyle;
  metadata?: Record<string, unknown>;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

// نمط العنصر
export interface ElementStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  alignment?: AlignmentType;
  layout?: LayoutType;
  zIndex?: number;
  opacity?: number;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  padding?: number;
  margin?: number;
}

// شكل
export interface Shape {
  id: string;
  type: ShapeType;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius: number;
  width: number;
  height: number;
  rotation?: number;
}

// اليومية
export interface JournalEntry {
  id: string;
  title: string;
  content: ContentElement[];
  mood?: MoodType;
  tags: string[];
  date: string;
  createdAt: string;
  updatedAt: string;
  location?: Location;
  weather?: WeatherData;
  attachments?: Attachment[];
  templateId?: string;
  smartForms?: SmartFormData[];
}

// البيانات الجوية
export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

// مرفق
export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

// وقت الصلاة
export interface PrayerTime {
  name: string;
  nameAr: string;
  time: string;
  timestamp: number;
}

// بيانات القالب
export interface TemplateField {
  id: string;
  type: 'text' | 'number' | 'rating' | 'signature' | 'image' | 'slider' | 'select' | 'date' | 'time';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  defaultValue?: unknown;
}

// القالب
export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'daily' | 'health' | 'work' | 'spiritual' | 'custom';
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
}

// بيانات النموذج الذكي
export interface SmartFormData {
  templateId: string;
  values: Record<string, unknown>;
  completedAt?: string;
}

// إعدادات المستخدم
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontFamily: string;
  fontSize: number;
  language: 'ar' | 'en';
  showPrayerTimes: boolean;
  showWeather: boolean;
  showHijriDate: boolean;
  location?: Coordinates;
  geminiApiKey?: string;
  autoBackup: boolean;
  backupInterval: 'daily' | 'weekly' | 'monthly';
}

// إحصائيات
export interface JournalStats {
  totalEntries: number;
  streak: number;
  longestStreak: number;
  moodsCount: Record<MoodType, number>;
  tagsUsed: Record<string, number>;
  averageWordsPerEntry: number;
}

// رسالة الذكاء الاصطناعي
export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// الموقع الجغرافي
export interface GeoLocation {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

// المخطط
export interface PlannerConfig {
  type: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  layers: ('religious' | 'professional' | 'health' | 'personal')[];
  routines: Routine[];
  includeQuotes: boolean;
  includePrayerTimes: boolean;
  includeWeather: boolean;
}

// الروتين
export interface Routine {
  id: string;
  name: string;
  time: string;
  days: number[];
  icon: string;
  color: string;
}

// بيانات التركيز اليومي
export interface DailyFocus {
  tasks: string[];
  appointments: Appointment[];
  priorities: string[];
  habits: string[];
}
