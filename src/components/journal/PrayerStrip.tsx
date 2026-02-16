'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PrayerTime } from '@/lib/journal/types';

interface PrayerStripProps {
  location?: { lat: number; lng: number };
}

export function PrayerStrip({ location }: PrayerStripProps) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [countdown, setCountdown] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [locationName, setLocationName] = useState('الرياض');

  const getNextTimestamp = (hours: number, minutes: number): number => {
    const now = new Date();
    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0, 0);
    
    if (prayerTime.getTime() < now.getTime()) {
      prayerTime.setDate(prayerTime.getDate() + 1);
    }
    
    return prayerTime.getTime();
  };

  const fetchPrayerTimes = useCallback(async () => {
    try {
      const lat = location?.lat || 24.7136;
      const lng = location?.lng || 46.6753;
      
      const response = await fetch(`/api/prayer?lat=${lat}&lng=${lng}`);
      
      if (response.ok) {
        const data = await response.json();
        setPrayerTimes(data.times);
        setLocationName(data.location || 'الرياض');
        
        const now = Date.now();
        const next = data.times.find((prayer: PrayerTime) => prayer.timestamp > now) || data.times[0];
        setNextPrayer(next);
      } else {
        // استخدام أوقات افتراضية
        const defaultTimes: PrayerTime[] = [
          { name: 'fajr', nameAr: 'الفجر', time: '05:15', timestamp: getNextTimestamp(5, 15) },
          { name: 'dhuhr', nameAr: 'الظهر', time: '12:05', timestamp: getNextTimestamp(12, 5) },
          { name: 'asr', nameAr: 'العصر', time: '15:25', timestamp: getNextTimestamp(15, 25) },
          { name: 'maghrib', nameAr: 'المغرب', time: '18:15', timestamp: getNextTimestamp(18, 15) },
          { name: 'isha', nameAr: 'العشاء', time: '19:45', timestamp: getNextTimestamp(19, 45) },
        ];
        setPrayerTimes(defaultTimes);
        
        const now = Date.now();
        const next = defaultTimes.find((prayer) => prayer.timestamp > now) || defaultTimes[0];
        setNextPrayer(next);
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      // استخدام أوقات افتراضية عند الخطأ
      const defaultTimes: PrayerTime[] = [
        { name: 'fajr', nameAr: 'الفجر', time: '05:15', timestamp: getNextTimestamp(5, 15) },
        { name: 'dhuhr', nameAr: 'الظهر', time: '12:05', timestamp: getNextTimestamp(12, 5) },
        { name: 'asr', nameAr: 'العصر', time: '15:25', timestamp: getNextTimestamp(15, 25) },
        { name: 'maghrib', nameAr: 'المغرب', time: '18:15', timestamp: getNextTimestamp(18, 15) },
        { name: 'isha', nameAr: 'العشاء', time: '19:45', timestamp: getNextTimestamp(19, 45) },
      ];
      setPrayerTimes(defaultTimes);
      
      const now = Date.now();
      const next = defaultTimes.find((prayer) => prayer.timestamp > now) || defaultTimes[0];
      setNextPrayer(next);
    }
  }, [location]);

  const updateCountdown = useCallback(() => {
    if (!nextPrayer) return;

    const now = Date.now();
    const diff = nextPrayer.timestamp - now;

    if (diff <= 0) {
      fetchPrayerTimes();
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setCountdown(
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
  }, [nextPrayer, fetchPrayerTimes]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  useEffect(() => {
    // تحديث العد التنازلي كل ثانية
    const interval = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateCountdown]);

  const formatPrayerTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'م' : 'ص';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const isCurrentPrayer = (prayer: PrayerTime): boolean => {
    if (!nextPrayer) return false;
    const prayerIndex = prayerTimes.findIndex((p) => p.name === prayer.name);
    const nextIndex = prayerTimes.findIndex((p) => p.name === nextPrayer.name);
    return prayerIndex === (nextIndex === 0 ? prayerTimes.length - 1 : nextIndex - 1);
  };

  const isNextPrayer = (prayer: PrayerTime): boolean => {
    return nextPrayer?.name === prayer.name;
  };

  return (
    <div className="bg-gradient-to-l from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-emerald-100 dark:border-emerald-800">
      <div className="px-4 py-2">
        {/* الشريط الرئيسي */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* الصلاة القادمة */}
            {nextPrayer && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">الصلاة القادمة</p>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                      {nextPrayer.nameAr}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                    {countdown}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {formatPrayerTime(nextPrayer.time)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* الموقع وزر التوسيع */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>{locationName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 ml-1" />
                  إخفاء
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 ml-1" />
                  جميع الأوقات
                </>
              )}
            </Button>
          </div>
        </div>

        {/* جميع الأوقات */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700">
            <div className="flex flex-wrap justify-center gap-3">
              {prayerTimes.map((prayer) => (
                <div
                  key={prayer.name}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors
                    ${isCurrentPrayer(prayer) 
                      ? 'bg-emerald-200 dark:bg-emerald-700' 
                      : isNextPrayer(prayer)
                      ? 'bg-emerald-100 dark:bg-emerald-800 ring-2 ring-emerald-400'
                      : 'bg-white/50 dark:bg-gray-800/50'
                    }
                  `}
                >
                  <span className="font-medium text-sm text-emerald-800 dark:text-emerald-200">
                    {prayer.nameAr}
                  </span>
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">
                    {formatPrayerTime(prayer.time)}
                  </span>
                  {isCurrentPrayer(prayer) && (
                    <Badge className="bg-emerald-500 text-white text-xs px-1.5 py-0.5">
                      الآن
                    </Badge>
                  )}
                  {isNextPrayer(prayer) && (
                    <Badge className="bg-amber-500 text-white text-xs px-1.5 py-0.5">
                      التالي
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
