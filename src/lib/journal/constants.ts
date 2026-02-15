// الثوابت والقوالب الجاهزة للتطبيق

import { Template, Tag, Routine, MoodType } from './types';

// ألوان المزاج
export const MOOD_COLORS: Record<MoodType, { bg: string; text: string; icon: string }> = {
  happy: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '😊' },
  sad: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '😢' },
  neutral: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '😐' },
  excited: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🤩' },
  tired: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '😴' },
  anxious: { bg: 'bg-red-100', text: 'text-red-700', icon: '😰' },
  grateful: { bg: 'bg-pink-100', text: 'text-pink-700', icon: '🥰' },
  angry: { bg: 'bg-red-200', text: 'text-red-800', icon: '😠' },
};

// أسماء المزاج بالعربية
export const MOOD_NAMES_AR: Record<MoodType, string> = {
  happy: 'سعيد',
  sad: 'حزين',
  neutral: 'محايد',
  excited: 'متحمس',
  tired: 'مرهق',
  anxious: 'قلق',
  grateful: 'ممتن',
  angry: 'غاضب',
};

// ألوان الوسوم الجاهزة
export const TAG_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#78716c', '#737373', '#71717a',
];

// الوسوم الافتراضية
export const DEFAULT_TAGS: Tag[] = [
  { id: '1', name: 'عمل', color: '#3b82f6', createdAt: new Date().toISOString() },
  { id: '2', name: 'عائلة', color: '#22c55e', createdAt: new Date().toISOString() },
  { id: '3', name: 'صحة', color: '#ef4444', createdAt: new Date().toISOString() },
  { id: '4', name: 'دين', color: '#8b5cf6', createdAt: new Date().toISOString() },
  { id: '5', name: 'دراسة', color: '#f59e0b', createdAt: new Date().toISOString() },
  { id: '6', name: 'سفر', color: '#06b6d4', createdAt: new Date().toISOString() },
  { id: '7', name: 'رياضة', color: '#10b981', createdAt: new Date().toISOString() },
  { id: '8', name: 'قراءة', color: '#ec4899', createdAt: new Date().toISOString() },
];

// لغات البرمجة للكود
export const PROGRAMMING_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'dart', 'sql',
  'html', 'css', 'json', 'yaml', 'markdown', 'bash', 'shell',
];

// أسماء الصلوات
export const PRAYER_NAMES = {
  fajr: { ar: 'الفجر', en: 'Fajr' },
  dhuhr: { ar: 'الظهر', en: 'Dhuhr' },
  asr: { ar: 'العصر', en: 'Asr' },
  maghrib: { ar: 'المغرب', en: 'Maghrib' },
  isha: { ar: 'العشاء', en: 'Isha' },
};

// الأشهر الميلادية بالعربية
export const GREGORIAN_MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

// الأشهر الهجرية بالعربية
export const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

// أيام الأسبوع بالعربية
export const DAYS_AR = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت',
];

// أيام الأسبوع المختصرة
export const DAYS_SHORT_AR = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

// القوالب الجاهزة
export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'daily-reflection',
    name: 'تأمل يومي',
    description: 'قالب للتأمل اليومي وتدوين المشاعر',
    icon: '📝',
    category: 'daily',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      { id: '1', type: 'text', label: 'كيف كان يومك؟', placeholder: 'اكتب عن يومك...', required: true },
      { id: '2', type: 'rating', label: 'تقييم اليوم', min: 1, max: 5, required: true },
      { id: '3', type: 'text', label: 'ثلاثة أشياء ممتن لها', placeholder: '1. ...\n2. ...\n3. ...' },
      { id: '4', type: 'text', label: 'تحديات اليوم', placeholder: 'ما التحديات التي واجهتها؟' },
      { id: '5', type: 'text', label: 'خطة الغد', placeholder: 'ماذا تخطط لغد؟' },
    ],
  },
  {
    id: 'health-tracker',
    name: 'متتبع الصحة',
    description: 'تتبع صحتك اليومية',
    icon: '🏃',
    category: 'health',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      { id: '1', type: 'slider', label: 'مستوى الطاقة', min: 1, max: 10 },
      { id: '2', type: 'slider', label: 'جودة النوم', min: 1, max: 10 },
      { id: '3', type: 'number', label: 'عدد خطوات المشي', placeholder: '0' },
      { id: '4', type: 'number', label: 'أكواب الماء', placeholder: '0' },
      { id: '5', type: 'text', label: 'ملاحظات صحية', placeholder: 'أي ملاحظات...' },
    ],
  },
  {
    id: 'work-log',
    name: 'سجل العمل',
    description: 'تتبع إنجازات العمل اليومية',
    icon: '💼',
    category: 'work',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      { id: '1', type: 'text', label: 'المهام المنجزة', placeholder: 'قائمة المهام المنجزة...' },
      { id: '2', type: 'text', label: 'المهام المعلقة', placeholder: 'المهام التي لم تكتمل...' },
      { id: '3', type: 'text', label: 'التحديات', placeholder: 'التحديات التي واجهتها...' },
      { id: '4', type: 'rating', label: 'إنتاجية اليوم', min: 1, max: 5 },
      { id: '5', type: 'text', label: 'ملاحظات', placeholder: 'أي ملاحظات إضافية...' },
    ],
  },
  {
    id: 'spiritual-journal',
    name: 'يوميات روحية',
    description: 'تدوين الروحانيات والأذكار',
    icon: '🕌',
    category: 'spiritual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      { id: '1', type: 'checkbox', label: 'صلاة الفجر', options: ['نعم', 'لا', 'جماعة'] },
      { id: '2', type: 'checkbox', label: 'الوتر', options: ['نعم', 'لا'] },
      { id: '3', type: 'checkbox', label: 'أذكار الصباح', options: ['نعم', 'لا', 'بعضها'] },
      { id: '4', type: 'checkbox', label: 'أذكار المساء', options: ['نعم', 'لا', 'بعضها'] },
      { id: '5', type: 'text', label: 'قراءة القرآن', placeholder: 'الصفحات أو الأجزاء...' },
      { id: '6', type: 'text', label: 'الدعاء والتأمل', placeholder: 'ماذا دعوت اليوم؟' },
    ],
  },
  {
    id: 'gratitude-journal',
    name: 'يوميات الامتنان',
    description: 'تدوين الأشياء التي تشعر بالامتنان تجاهها',
    icon: '🙏',
    category: 'daily',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      { id: '1', type: 'text', label: 'شخص ممتن له', placeholder: 'من الشخص الذي تشكره اليوم؟' },
      { id: '2', type: 'text', label: 'حدث جميل', placeholder: 'ما الحدث الجميل الذي حدث؟' },
      { id: '3', type: 'text', label: 'نعمة صغيرة', placeholder: 'نعمة صغيرة لاحظتها اليوم...' },
      { id: '4', type: 'text', label: 'دراسة تعلمتها', placeholder: 'ماذا تعلمت اليوم؟' },
      { id: '5', type: 'rating', label: 'مستوى الامتنان', min: 1, max: 5 },
    ],
  },
  {
    id: 'meeting-notes',
    name: 'ملاحظات اجتماع',
    description: 'قالب لتدوين ملاحظات الاجتماعات',
    icon: '👥',
    category: 'work',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      { id: '1', type: 'text', label: 'عنوان الاجتماع', required: true },
      { id: '2', type: 'date', label: 'التاريخ' },
      { id: '3', type: 'time', label: 'الوقت' },
      { id: '4', type: 'text', label: 'الحضور', placeholder: 'أسماء الحاضرين...' },
      { id: '5', type: 'text', label: 'النقاط الرئيسية', placeholder: 'النقاط المطروحة...' },
      { id: '6', type: 'text', label: 'القرارات', placeholder: 'القرارات المتخذة...' },
      { id: '7', type: 'text', label: 'المهام القادمة', placeholder: 'المهام الموكلة...' },
    ],
  },
  {
    id: 'travel-log',
    name: 'سجل السفر',
    description: 'تدوين مغامرات السفر',
    icon: '✈️',
    category: 'personal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      { id: '1', type: 'text', label: 'الوجهة', required: true },
      { id: '2', type: 'date', label: 'تاريخ الرحلة' },
      { id: '3', type: 'image', label: 'صورة اليوم' },
      { id: '4', type: 'text', label: 'أبرز اللحظات', placeholder: 'ما أفضل ما حدث؟' },
      { id: '5', type: 'text', label: 'الطعام الجديد', placeholder: 'ماذا ذقت من أطعمة جديدة؟' },
      { id: '6', type: 'rating', label: 'تقييم الرحلة', min: 1, max: 5 },
      { id: '7', type: 'text', label: 'ملاحظات', placeholder: 'نصائح للمرة القادمة...' },
    ],
  },
  {
    id: 'book-review',
    name: 'مراجعة كتاب',
    description: 'تدوين ملاحظات ومراجعات الكتب',
    icon: '📚',
    category: 'personal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      { id: '1', type: 'text', label: 'عنوان الكتاب', required: true },
      { id: '2', type: 'text', label: 'المؤلف' },
      { id: '3', type: 'number', label: 'عدد الصفحات' },
      { id: '4', type: 'slider', label: 'التقييم', min: 1, max: 10 },
      { id: '5', type: 'text', label: 'ملخص الكتاب', placeholder: 'أهم الأفكار...' },
      { id: '6', type: 'text', label: 'اقتباسات مميزة', placeholder: 'أفضل ما أعجبك...' },
      { id: '7', type: 'text', label: 'ماذا تعلمت', placeholder: 'الدروس المستفادة...' },
    ],
  },
];

// الروتينات الافتراضية
export const DEFAULT_ROUTINES: Routine[] = [
  { id: '1', name: 'صلاة الفجر', time: '05:00', days: [0, 1, 2, 3, 4, 5, 6], icon: '🕌', color: '#8b5cf6' },
  { id: '2', name: 'قراءة القرآن', time: '06:00', days: [0, 1, 2, 3, 4, 5, 6], icon: '📖', color: '#22c55e' },
  { id: '3', name: 'رياضة صباحية', time: '07:00', days: [0, 2, 4], icon: '🏃', color: '#f59e0b' },
  { id: '4', name: 'مراجعة الأهداف', time: '08:00', days: [0], icon: '🎯', color: '#3b82f6' },
  { id: '5', name: 'قراءة', time: '21:00', days: [0, 1, 2, 3, 4, 5, 6], icon: '📚', color: '#ec4899' },
];

// اقتباسات ملهمة
export const INSPIRATIONAL_QUOTES = [
  { text: 'النجاح ليس نهائياً، والفشل ليس قاتلاً، إنما الشجاعة للاستمرار هي ما يهم.', author: 'ونستون تشرشل' },
  { text: 'الطريقة الوحيدة للقيام بعمل عظيم هي أن تحب ما تفعله.', author: 'ستيف جوبز' },
  { text: 'لا تخف من الفشل، بل خف من عدم المحاولة.', author: 'روي بينيت' },
  { text: 'كل إنجاز عظيم كان في البداية مستحيلاً.', author: 'توماس كارلايل' },
  { text: 'الصبر مفتاح الفرج.', author: 'حكمة عربية' },
  { text: 'من جد وجد، ومن زرع حصد.', author: 'مثل عربي' },
  { text: 'العلم نور والجهل ظلام.', author: 'حكمة عربية' },
  { text: 'في التأني السلامة وفي العجلة الندامة.', author: 'مثل عربي' },
  { text: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه.', author: 'حديث شريف' },
  { text: 'الدنيا ساعة فاجعلها طاعة.', author: 'حكمة عربية' },
];

// تصنيفات القوالب
export const TEMPLATE_CATEGORIES = [
  { id: 'daily', name: 'يومي', icon: '📅' },
  { id: 'health', name: 'صحة', icon: '🏃' },
  { id: 'work', name: 'عمل', icon: '💼' },
  { id: 'spiritual', name: 'روحاني', icon: '🕌' },
  { id: 'personal', name: 'شخصي', icon: '👤' },
  { id: 'custom', name: 'مخصص', icon: '✨' },
];

// الإعدادات الافتراضية
export const DEFAULT_SETTINGS = {
  theme: 'light' as const,
  primaryColor: '#8b5cf6',
  fontFamily: 'Cairo',
  fontSize: 16,
  language: 'ar' as const,
  showPrayerTimes: true,
  showWeather: true,
  showHijriDate: true,
  autoBackup: false,
  backupInterval: 'weekly' as const,
};

// أسماء المتتبعات الشائعة
export const COMMON_TRACKERS = [
  { name: 'ماء', icon: '💧', unit: 'كوب', target: 8, color: '#0ea5e9' },
  { name: 'خطوات', icon: '👟', unit: 'خطوة', target: 10000, color: '#22c55e' },
  { name: 'رياضة', icon: '🏋️', unit: 'دقيقة', target: 30, color: '#f59e0b' },
  { name: 'نوم', icon: '😴', unit: 'ساعة', target: 8, color: '#8b5cf6' },
  { name: 'قراءة', icon: '📖', unit: 'صفحة', target: 30, color: '#ec4899' },
  { name: 'تأمل', icon: '🧘', unit: 'دقيقة', target: 10, color: '#14b8a6' },
];

// رسائل الترحيب
export const WELCOME_MESSAGES = [
  'مرحباً بك في مفكرتك اليومية ✨',
  'كيف كان يومك؟ 🌟',
  'سجل لحظاتك الجميلة 📝',
  'كل يوم هو صفحة جديدة 📖',
  'دع أفكارك تتدفق 💭',
];

// مفتاح التخزين المحلي
export const STORAGE_KEYS = {
  JOURNAL_ENTRIES: 'journal_entries',
  TEMPLATES: 'journal_templates',
  TAGS: 'journal_tags',
  SETTINGS: 'journal_settings',
  ROUTINES: 'journal_routines',
  STREAK: 'journal_streak',
  LAST_BACKUP: 'journal_last_backup',
  AI_HISTORY: 'journal_ai_history',
  TRACKER_DATA: 'journal_tracker_data',
};
