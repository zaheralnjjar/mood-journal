'use client';

import { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Paperclip, 
  Settings, 
  Search,
  Plus,
  X,
  Star,
  Calendar,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDateArabic } from '@/lib/journal/utils';
import { MOOD_NAMES_AR, MOOD_COLORS } from '@/lib/journal/constants';
import type { JournalEntry, MoodType } from '@/lib/journal/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  currentView: string;
  onViewChange: (view: string) => void;
  onNewEntry: () => void;
  onSelectEntry: (entry: JournalEntry) => void;
  selectedEntryId?: string;
}

const menuItems = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'today', label: 'تدوينة اليوم', icon: Calendar },
  { id: 'journal', label: 'اليوميات', icon: BookOpen },
  { id: 'attachments', label: 'المرفقات', icon: Paperclip },
  { id: 'favorites', label: 'المفضلة', icon: Heart },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

export function Sidebar({
  isOpen,
  onClose,
  entries,
  currentView,
  onViewChange,
  onNewEntry,
  onSelectEntry,
  selectedEntryId,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // استخدام useMemo بدلاً من useEffect + useState
  const filteredEntries = useMemo(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return entries.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query) ||
          entry.content.some((el) => el.content.toLowerCase().includes(query)) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return entries.slice(0, 10);
  }, [searchQuery, entries]);

  const handleViewChange = (view: string) => {
    onViewChange(view);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay للجوال */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* الشريط الجانبي */}
      <aside
        className={cn(
          'fixed right-0 top-0 h-full w-72 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* الشعار */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-gray-800 dark:text-white">مفكرتي</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">يومياتك الخاصة</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* زر إضافة جديد */}
          <div className="p-4">
            <Button
              onClick={onNewEntry}
              className="w-full bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              تدوينة جديدة
            </Button>
          </div>

          {/* البحث */}
          <div className="px-4 pb-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="بحث في اليوميات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>

          {/* القائمة الرئيسية */}
          <nav className="px-2 py-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleViewChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  currentView === item.id
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* فاصل */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

          {/* قائمة اليوميات */}
          <div className="flex-1 overflow-hidden">
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                آخر اليوميات
              </h3>
            </div>
            <ScrollArea className="h-[calc(100%-2rem)]">
              <div className="px-2 space-y-1">
                {filteredEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                    {searchQuery ? 'لا توجد نتائج' : 'لا توجد يوميات بعد'}
                  </div>
                ) : (
                  filteredEntries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => onSelectEntry(entry)}
                      className={cn(
                        'w-full text-right p-3 rounded-lg transition-colors',
                        selectedEntryId === entry.id
                          ? 'bg-purple-100 dark:bg-purple-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                            {entry.title || 'بدون عنوان'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {formatDateArabic(new Date(entry.date))}
                          </p>
                        </div>
                        {entry.mood && (
                          <span className="text-lg" title={MOOD_NAMES_AR[entry.mood as MoodType]}>
                            {MOOD_COLORS[entry.mood as MoodType]?.icon}
                          </span>
                        )}
                      </div>
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* التذييل */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              {entries.length} تدوينة
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
