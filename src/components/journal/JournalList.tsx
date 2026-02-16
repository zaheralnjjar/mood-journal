'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  FileText,
  File,
  MoreVertical,
  Heart,
  Calendar,
  Tag,
  CheckSquare,
  Square,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatDateArabic, truncateText } from '@/lib/journal/utils';
import { MOOD_COLORS, MOOD_NAMES_AR, GREGORIAN_MONTHS_AR } from '@/lib/journal/constants';
import type { JournalEntry, MoodType } from '@/lib/journal/types';

interface JournalListProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntries: (ids: string[]) => void;
  onToggleFavorite: (id: string) => void;
  favorites: string[];
}

type SortOption = 'date-desc' | 'date-asc' | 'title' | 'mood';
type FilterOption = 'all' | 'favorites' | 'has-mood';

export function JournalList({
  entries,
  onSelectEntry,
  onDeleteEntries,
  onToggleFavorite,
  favorites,
}: JournalListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedMood, setSelectedMood] = useState<string>('all');

  // تصفية وترتيب اليوميات
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // البحث
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query) ||
          entry.content.some((el) => el.content.toLowerCase().includes(query)) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // فلتر المفضلة
    if (filterOption === 'favorites') {
      filtered = filtered.filter((entry) => favorites.includes(entry.id));
    }

    // فلتر المزاج
    if (filterOption === 'has-mood') {
      filtered = filtered.filter((entry) => entry.mood);
    }

    // فلتر الشهر
    if (selectedMonth !== 'all') {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date);
        const entryMonth = `${entryDate.getFullYear()}-${entryDate.getMonth()}`;
        return entryMonth === selectedMonth;
      });
    }

    // فلتر المزاج المحدد
    if (selectedMood !== 'all') {
      filtered = filtered.filter((entry) => entry.mood === selectedMood);
    }

    // الترتيب
    switch (sortOption) {
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
        break;
      case 'mood':
        filtered.sort((a, b) => {
          if (!a.mood && !b.mood) return 0;
          if (!a.mood) return 1;
          if (!b.mood) return -1;
          return a.mood.localeCompare(b.mood);
        });
        break;
    }

    return filtered;
  }, [entries, searchQuery, sortOption, filterOption, selectedMonth, selectedMood, favorites]);

  // الأشهر المتاحة
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    entries.forEach((entry) => {
      const date = new Date(entry.date);
      months.add(`${date.getFullYear()}-${date.getMonth()}`);
    });
    return Array.from(months).sort().reverse();
  }, [entries]);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEntries(newSelected);
  };

  const selectAll = () => {
    if (selectedEntries.size === filteredEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(filteredEntries.map((e) => e.id)));
    }
  };

  const handleDeleteSelected = () => {
    onDeleteEntries(Array.from(selectedEntries));
    setSelectedEntries(new Set());
  };

  const exportToJSON = () => {
    const toExport = selectedEntries.size > 0
      ? entries.filter((e) => selectedEntries.has(e.id))
      : filteredEntries;
    
    const dataStr = JSON.stringify(toExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToText = () => {
    const toExport = selectedEntries.size > 0
      ? entries.filter((e) => selectedEntries.has(e.id))
      : filteredEntries;

    let text = '';
    toExport.forEach((entry) => {
      text += `${'='.repeat(50)}\n`;
      text += `التاريخ: ${formatDateArabic(new Date(entry.date))}\n`;
      text += `العنوان: ${entry.title || 'بدون عنوان'}\n`;
      if (entry.mood) {
        text += `المزاج: ${MOOD_NAMES_AR[entry.mood as MoodType]}\n`;
      }
      if (entry.tags.length > 0) {
        text += `الوسوم: ${entry.tags.join(', ')}\n`;
      }
      text += `${'─'.repeat(50)}\n`;
      entry.content.forEach((el) => {
        if (el.content) {
          text += `${el.content}\n`;
        }
      });
      text += '\n';
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPreviewText = (entry: JournalEntry): string => {
    const textContent = entry.content.find((el) => el.type === 'text');
    if (textContent) {
      return truncateText(textContent.content, 100);
    }
    return 'تدوينة بدون محتوى نصي';
  };

  return (
    <div className="space-y-4">
      {/* شريط الأدوات */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* البحث */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="بحث في اليوميات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>

        {/* فلتر الشهر */}
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="الشهر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأشهر</SelectItem>
            {availableMonths.map((month) => {
              const [year, monthIndex] = month.split('-');
              return (
                <SelectItem key={month} value={month}>
                  {GREGORIAN_MONTHS_AR[parseInt(monthIndex)]} {year}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* فلتر المزاج */}
        <Select value={selectedMood} onValueChange={setSelectedMood}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="المزاج" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المزاج</SelectItem>
            {Object.entries(MOOD_NAMES_AR).map(([key, name]) => (
              <SelectItem key={key} value={key}>
                {MOOD_COLORS[key as MoodType]?.icon} {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* ترتيب */}
        <Select
          value={sortOption}
          onValueChange={(value) => setSortOption(value as SortOption)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="الترتيب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">
              <div className="flex items-center gap-2">
                <SortDesc className="w-4 h-4" />
                الأحدث
              </div>
            </SelectItem>
            <SelectItem value="date-asc">
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4" />
                الأقدم
              </div>
            </SelectItem>
            <SelectItem value="title">العنوان</SelectItem>
            <SelectItem value="mood">المزاج</SelectItem>
          </SelectContent>
        </Select>

        {/* قائمة التصدير */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              تصدير
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={exportToJSON}>
              <File className="w-4 h-4 ml-2" />
              JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToText}>
              <FileText className="w-4 h-4 ml-2" />
              نص
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* شريط التحديد المتعدد */}
      {selectedEntries.size > 0 && (
        <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={selectAll}>
              {selectedEntries.size === filteredEntries.length ? (
                <CheckSquare className="w-4 h-4 ml-2" />
              ) : (
                <Square className="w-4 h-4 ml-2" />
              )}
              تحديد الكل
            </Button>
            <span className="text-sm text-purple-700 dark:text-purple-300">
              {selectedEntries.size} محدد
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            حذف المحدد
          </Button>
        </div>
      )}

      {/* قائمة اليوميات */}
      <ScrollArea className="h-[calc(100vh-320px)]">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              لا توجد يوميات
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {searchQuery
                ? 'جرب البحث بكلمات أخرى'
                : 'ابدأ بكتابة أول تدوينة لك'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <Card
                key={entry.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedEntries.has(entry.id) &&
                    'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/10'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* مربع التحديد */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(entry.id);
                      }}
                      className="mt-1"
                    >
                      {selectedEntries.has(entry.id) ? (
                        <CheckSquare className="w-5 h-5 text-purple-500" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* المحتوى */}
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => onSelectEntry(entry)}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {entry.title || 'بدون عنوان'}
                        </h3>
                        <div className="flex items-center gap-2">
                          {entry.mood && (
                            <span className="text-lg" title={MOOD_NAMES_AR[entry.mood as MoodType]}>
                              {MOOD_COLORS[entry.mood as MoodType]?.icon}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(entry.id);
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Heart
                              className={cn(
                                'w-4 h-4',
                                favorites.includes(entry.id) &&
                                  'fill-red-500 text-red-500'
                              )}
                            />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {getPreviewText(entry)}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDateArabic(new Date(entry.date))}</span>
                        </div>

                        {entry.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3 text-gray-400" />
                            <div className="flex gap-1">
                              {entry.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs px-1.5 py-0"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {entry.tags.length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{entry.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
