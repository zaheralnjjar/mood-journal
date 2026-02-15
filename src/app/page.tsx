'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// المكونات
import { Header } from '@/components/journal/Header';
import { Sidebar } from '@/components/journal/Sidebar';
import { PrayerStrip } from '@/components/journal/PrayerStrip';
import { RichTextEditor } from '@/components/journal/RichTextEditor';
import { CalendarView } from '@/components/journal/CalendarView';
import { JournalList } from '@/components/journal/JournalList';
import { TemplateBuilder } from '@/components/journal/TemplateBuilder';
import { SmartFormRenderer } from '@/components/journal/SmartFormRenderer';
import { SettingsView } from '@/components/journal/SettingsView';
import { AiAssistant } from '@/components/journal/AiAssistant';
import { AuthForm } from '@/components/auth/AuthForm';

// Auth
import { useAuth } from '@/lib/auth-context';

// الأنواع والثوابت
import {
  JournalEntry,
  ContentElement,
  Tag,
  Template,
  UserSettings,
} from '@/lib/journal/types';
import {
  DEFAULT_TEMPLATES,
  DEFAULT_TAGS,
  DEFAULT_SETTINGS,
  WELCOME_MESSAGES,
  INSPIRATIONAL_QUOTES,
} from '@/lib/journal/constants';
import { generateId } from '@/lib/journal/utils';

// مكون لوحة التحكم
function Dashboard({
  entries,
  onNewEntry,
  onViewChange,
}: {
  entries: JournalEntry[];
  onNewEntry: () => void;
  onViewChange: (view: string) => void;
}) {
  const stats = {
    total: entries.length,
    thisMonth: entries.filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
    thisWeek: entries.filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    }).length,
  };

  const randomQuote = INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)];
  const welcomeMessage = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-l from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">{welcomeMessage}</h1>
        <p className="text-white/80 mb-4">{randomQuote.text}</p>
        <p className="text-sm text-white/60">— {randomQuote.author}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي التدوينات</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">هذا الشهر</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.thisMonth}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">هذا الأسبوع</p>
          <p className="text-3xl font-bold text-pink-600 dark:text-pink-400 mt-1">{stats.thisWeek}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={onNewEntry} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-300 transition-colors text-center">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📝</span>
          </div>
          <p className="font-medium text-gray-800 dark:text-gray-200">تدوينة جديدة</p>
        </button>
        <button onClick={() => onViewChange('journal')} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-300 transition-colors text-center">
          <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📚</span>
          </div>
          <p className="font-medium text-gray-800 dark:text-gray-200">اليوميات</p>
        </button>
        <button onClick={() => onViewChange('templates')} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-300 transition-colors text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📋</span>
          </div>
          <p className="font-medium text-gray-800 dark:text-gray-200">القوالب</p>
        </button>
        <button onClick={() => onViewChange('calendar')} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-300 transition-colors text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📅</span>
          </div>
          <p className="font-medium text-gray-800 dark:text-gray-200">التقويم</p>
        </button>
      </div>

      {entries.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">آخر التدوينات</h2>
          <div className="space-y-3">
            {entries.slice(0, 3).map((entry) => (
              <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">{entry.title || 'بدون عنوان'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(entry.date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// مكون محرر التدوينة
function JournalEditor({
  entry,
  onSave,
  onCancel,
  savedTags,
  onTagsUpdate,
}: {
  entry: JournalEntry | null;
  onSave: (entry: JournalEntry) => void;
  onCancel: () => void;
  savedTags: Tag[];
  onTagsUpdate: (tags: Tag[]) => void;
}) {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState<ContentElement[]>(entry?.content || []);
  const [mood, setMood] = useState<string>(entry?.mood || '');
  const [tags, setTags] = useState<string[]>(entry?.tags || []);

  const handleSave = () => {
    const newEntry: JournalEntry = {
      id: entry?.id || generateId(),
      title: title || new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' }),
      content,
      mood: mood as JournalEntry['mood'],
      tags,
      date: entry?.date || new Date().toISOString().split('T')[0],
      createdAt: entry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(newEntry);
  };

  const moods = [
    { value: 'happy', emoji: '😊', label: 'سعيد' },
    { value: 'sad', emoji: '😢', label: 'حزين' },
    { value: 'neutral', emoji: '😐', label: 'محايد' },
    { value: 'excited', emoji: '🤩', label: 'متحمس' },
    { value: 'tired', emoji: '😴', label: 'مرهق' },
    { value: 'anxious', emoji: '😰', label: 'قلق' },
    { value: 'grateful', emoji: '🥰', label: 'ممتن' },
    { value: 'angry', emoji: '😠', label: 'غاضب' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">إلغاء</button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان التدوينة..."
            className="text-xl font-bold bg-transparent border-none outline-none flex-1 text-gray-800 dark:text-gray-200"
          />
        </div>
        <button onClick={handleSave} className="px-6 py-2 bg-gradient-to-l from-purple-500 to-pink-500 text-white rounded-lg font-medium">
          حفظ
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">المزاج:</span>
        {moods.map((m) => (
          <button
            key={m.value}
            onClick={() => setMood(mood === m.value ? '' : m.value)}
            className={`text-2xl p-2 rounded-lg transition-all ${mood === m.value ? 'bg-purple-100 scale-110' : 'hover:bg-gray-100'}`}
          >
            {m.emoji}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">الوسوم:</span>
        {savedTags.slice(0, 8).map((tag) => (
          <button
            key={tag.id}
            onClick={() => setTags(tags.includes(tag.name) ? tags.filter((t) => t !== tag.name) : [...tags, tag.name])}
            className={`px-3 py-1 rounded-full text-sm font-medium ${tags.includes(tag.name) ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
            style={tags.includes(tag.name) ? { backgroundColor: tag.color } : {}}
          >
            {tag.name}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 overflow-hidden">
        <RichTextEditor content={content} onChange={setContent} savedTags={savedTags} onTagsUpdate={onTagsUpdate} />
      </div>
    </div>
  );
}

// الصفحة الرئيسية
export default function HomePage() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [tags, setTags] = useState<Tag[]>(DEFAULT_TAGS);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل البيانات من الخادم
  const loadFromServer = useCallback(async () => {
    setIsLoading(true);
    try {
      // جلب اليوميات
      const journalsRes = await fetch('/api/journal');
      if (journalsRes.ok) {
        const data = await journalsRes.json();
        setEntries(data.journals || []);
      }

      // جلب الوسوم
      const tagsRes = await fetch('/api/tags');
      if (tagsRes.ok) {
        const data = await tagsRes.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  }, []);

  // تحميل البيانات عند تسجيل الدخول
  useEffect(() => {
    if (isAuthenticated && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadFromServer();
      // تحديث الإعدادات من المستخدم
      if (user.settings) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings(user.settings as UserSettings);
      }
    }
  }, [isAuthenticated, user, loadFromServer]);

  // كل الـ hooks يجب أن تكون قبل أي early return
  const handleNewEntry = useCallback(() => {
    setSelectedEntry(null);
    setCurrentView('editor');
  }, []);

  const handleSaveEntry = useCallback(async (entry: JournalEntry) => {
    try {
      const isNew = !entries.find(e => e.id === entry.id);
      
      if (isNew) {
        const response = await fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: entry.title,
            content: entry.content,
            mood: entry.mood,
            tags: entry.tags,
            date: entry.date,
          }),
        });
        
        if (response.ok) {
          loadFromServer();
        }
      } else {
        const response = await fetch('/api/journal', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: entry.id,
            title: entry.title,
            content: entry.content,
            mood: entry.mood,
            tags: entry.tags,
            date: entry.date,
          }),
        });
        
        if (response.ok) {
          loadFromServer();
        }
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    }
    
    setCurrentView('journal');
    setSelectedEntry(null);
  }, [entries, loadFromServer]);

  const handleDeleteEntries = useCallback(async (ids: string[]) => {
    for (const id of ids) {
      await fetch(`/api/journal?id=${id}`, { method: 'DELETE' });
    }
    loadFromServer();
  }, [loadFromServer]);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  }, []);

  const handleSaveTemplate = useCallback((template: Template) => {
    setTemplates((prev) => {
      const existing = prev.findIndex((t) => t.id === template.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = template;
        return updated;
      }
      return [...prev, template];
    });
  }, []);

  const handleDeleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSelectEntry = useCallback((entry: JournalEntry) => {
    setSelectedEntry(entry);
    setCurrentView('editor');
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    const entry = entries.find((e) => new Date(e.date).toDateString() === date.toDateString());
    if (entry) {
      setSelectedEntry(entry);
      setCurrentView('editor');
    } else {
      setSelectedEntry({
        id: '',
        title: '',
        content: [],
        tags: [],
        date: date.toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setCurrentView('editor');
    }
  }, [entries]);

  // إعادة توجيه لتسجيل الدخول إذا لم يكن مسجل - بعد كل الـ hooks
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm mode="login" />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard entries={entries} onNewEntry={handleNewEntry} onViewChange={setCurrentView} />;
      case 'today':
      case 'editor':
        return (
          <JournalEditor
            entry={selectedEntry}
            onSave={handleSaveEntry}
            onCancel={() => { setCurrentView('journal'); setSelectedEntry(null); }}
            savedTags={tags}
            onTagsUpdate={setTags}
          />
        );
      case 'journal':
        return <JournalList entries={entries} onSelectEntry={handleSelectEntry} onDeleteEntries={handleDeleteEntries} onToggleFavorite={handleToggleFavorite} favorites={favorites} />;
      case 'calendar':
        return <CalendarView entries={entries} onSelectDate={handleSelectDate} selectedDate={selectedDate} />;
      case 'templates':
        return <TemplateBuilder templates={templates} onSaveTemplate={handleSaveTemplate} onDeleteTemplate={handleDeleteTemplate} onSelectTemplate={(t) => { setSelectedTemplate(t); setCurrentView('form'); }} />;
      case 'form':
        return selectedTemplate ? (
          <div className="max-w-lg mx-auto">
            <button onClick={() => { setCurrentView('templates'); setSelectedTemplate(null); }} className="text-gray-500 mb-4">← العودة للقوالب</button>
            <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
              <SmartFormRenderer template={selectedTemplate} onSubmit={(data) => {
                const newEntry: JournalEntry = {
                  id: generateId(),
                  title: `${selectedTemplate.name} - ${new Date().toLocaleDateString('ar-SA')}`,
                  content: Object.entries(data.values).map(([_, value]) => ({ id: generateId(), type: 'text', content: String(value) })),
                  tags: [],
                  date: new Date().toISOString().split('T')[0],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                handleSaveEntry(newEntry);
              }} />
            </div>
          </div>
        ) : null;
      case 'favorites':
        return <JournalList entries={entries.filter((e) => favorites.includes(e.id))} onSelectEntry={handleSelectEntry} onDeleteEntries={handleDeleteEntries} onToggleFavorite={handleToggleFavorite} favorites={favorites} />;
      case 'settings':
        return (
          <SettingsView
            settings={settings}
            onSettingsChange={setSettings}
            entries={entries}
            tags={tags}
            onDataImport={() => {}}
            onClearData={() => {}}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} entries={entries} currentView={currentView} onViewChange={setCurrentView} onNewEntry={handleNewEntry} onSelectEntry={handleSelectEntry} selectedEntryId={selectedEntry?.id} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header onMenuClick={() => setIsSidebarOpen(true)} entries={entries} />
        {settings.showPrayerTimes && <PrayerStrip location={settings.location} />}
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderContent()}
        </main>
        
        <footer className="bg-white dark:bg-gray-800 border-t py-4 px-6 text-center text-sm text-gray-500">
          مفكرتي - المفكرة اليومية الذكية © {new Date().getFullYear()}
        </footer>
      </div>
      
      <AiAssistant entries={entries} apiKey={settings.geminiApiKey} onApiKeyChange={(key) => setSettings({ ...settings, geminiApiKey: key })} />
    </div>
  );
}
