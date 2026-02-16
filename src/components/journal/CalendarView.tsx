'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Target, Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, getMonthName, getDayName } from '@/lib/journal/utils';
import { DAYS_SHORT_AR, MOOD_COLORS, MOOD_NAMES_AR } from '@/lib/journal/constants';
import type { JournalEntry, DailyFocus, Appointment, MoodType } from '@/lib/journal/types';

interface CalendarViewProps {
  entries: JournalEntry[];
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}

export function CalendarView({ entries, onSelectDate, selectedDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // حساب أيام التدوين
  const entryDates = useMemo(() => {
    const dates = new Set<string>();
    entries.forEach((entry) => {
      dates.add(new Date(entry.date).toDateString());
    });
    return dates;
  }, [entries]);

  // حساب المزاج لكل يوم
  const moodByDate = useMemo(() => {
    const map = new Map<string, MoodType>();
    entries.forEach((entry) => {
      if (entry.mood) {
        map.set(new Date(entry.date).toDateString(), entry.mood);
      }
    });
    return map;
  }, [entries]);

  // توليد أيام الشهر
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysArray: (Date | null)[] = [];

    // إضافة أيام فارغة في البداية
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      daysArray.push(null);
    }

    // إضافة أيام الشهر
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push(new Date(year, month, i));
    }

    return daysArray;
  }, [currentMonth]);

  // التركيز اليومي - استخراج المهام والمواعيد من تدوينة اليوم
  const todayFocus: DailyFocus = useMemo(() => {
    const today = new Date().toDateString();
    const todayEntry = entries.find(
      (e) => new Date(e.date).toDateString() === today
    );

    if (!todayEntry) {
      return { tasks: [], appointments: [], priorities: [], habits: [] };
    }

    const tasks: string[] = [];
    const appointments: Appointment[] = [];
    const priorities: string[] = [];
    const habits: string[] = [];

    todayEntry.content.forEach((el) => {
      if (el.type === 'text' && el.content) {
        // البحث عن كلمات مفتاحية
        const text = el.content.toLowerCase();
        if (text.includes('مهمة') || text.includes('مهام') || text.includes('Task')) {
          tasks.push(el.content);
        }
        if (text.includes('أولوية') || text.includes('مهم')) {
          priorities.push(el.content);
        }
      }
      if (el.type === 'appointment' && el.metadata?.appointment) {
        appointments.push(el.metadata.appointment as Appointment);
      }
      if (el.type === 'tracker') {
        habits.push(el.content);
      }
    });

    return { tasks, appointments, priorities, habits };
  }, [entries]);

  const navigateMonth = (direction: number) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const hasEntry = (date: Date) => {
    return entryDates.has(date.toDateString());
  };

  const getMood = (date: Date) => {
    return moodByDate.get(date.toDateString());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* التقويم */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">
              {getMonthName(currentMonth.getMonth())} {currentMonth.getFullYear()}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth(-1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth(1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_SHORT_AR.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* أيام الشهر */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const mood = getMood(date);
              const moodColor = mood ? MOOD_COLORS[mood] : null;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => onSelectDate(date)}
                  className={cn(
                    'aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative',
                    isToday(date) && 'ring-2 ring-purple-500',
                    isSelected(date) && 'bg-purple-100 dark:bg-purple-900/30',
                    hasEntry(date) && !isSelected(date) && 'bg-gray-50 dark:bg-gray-800',
                    !hasEntry(date) && !isSelected(date) && 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  <span
                    className={cn(
                      'font-medium',
                      isToday(date) && 'text-purple-600 dark:text-purple-400'
                    )}
                  >
                    {date.getDate()}
                  </span>
                  {hasEntry(date) && (
                    <div
                      className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: moodColor?.text.replace('text-', '') || '#8b5cf6',
                      }}
                    />
                  )}
                  {mood && (
                    <span className="absolute top-0.5 left-0.5 text-xs">
                      {moodColor?.icon}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* مخطط المزاج */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              المزاج هذا الشهر
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(MOOD_COLORS).map(([key, value]) => {
                const count = Array.from(moodByDate.values()).filter(
                  (m) => m === key
                ).length;
                if (count === 0) return null;
                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <span>{value.icon}</span>
                    <span>{MOOD_NAMES_AR[key as MoodType]}</span>
                    <span className="text-xs text-gray-500">({count})</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تركيز اليوم */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            تركيز اليوم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {todayFocus.tasks.length === 0 &&
            todayFocus.appointments.length === 0 &&
            todayFocus.priorities.length === 0 &&
            todayFocus.habits.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد مهام لليوم</p>
                <p className="text-sm">ابدأ تدوينة جديدة لإضافة المهام</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* المواعيد */}
                {todayFocus.appointments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-amber-500" />
                      المواعيد
                    </h4>
                    <div className="space-y-2">
                      {todayFocus.appointments.map((apt, index) => (
                        <div
                          key={index}
                          className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3"
                        >
                          <p className="font-medium text-amber-800 dark:text-amber-200">
                            {apt.title}
                          </p>
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            {apt.time} {apt.location && `• ${apt.location}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* الأولويات */}
                {todayFocus.priorities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                      <Target className="w-4 h-4 text-red-500" />
                      الأولويات
                    </h4>
                    <ul className="space-y-2">
                      {todayFocus.priorities.map((priority, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span>{priority}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* المهام */}
                {todayFocus.tasks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      المهام
                    </h4>
                    <ul className="space-y-2">
                      {todayFocus.tasks.map((task, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <div className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 mt-0.5" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* العادات */}
                {todayFocus.habits.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      العادات
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {todayFocus.habits.map((habit, index) => (
                        <Badge key={index} variant="secondary">
                          {habit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
