'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sun, Cloud, CloudRain, MapPin, Flame, Calendar, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatHijriDate, formatDateArabic, calculateStreak } from '@/lib/journal/utils';
import type { JournalEntry, WeatherData } from '@/lib/journal/types';

interface HeaderProps {
  onMenuClick: () => void;
  entries: JournalEntry[];
}

export function Header({ onMenuClick, entries }: HeaderProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string>('الرياض');
  const [today] = useState(new Date());

  // استخدام useMemo لحساب الـ streak بدلاً من useEffect + useState
  const streak = useMemo(() => calculateStreak(entries), [entries]);

  const fetchWeather = useCallback(async () => {
    try {
      // محاولة جلب الموقع
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await fetch(
                `/api/weather?lat=${latitude}&lon=${longitude}`
              );
              if (response.ok) {
                const data = await response.json();
                setWeather(data.weather);
                setLocation(data.location);
              }
            } catch {
              // استخدام بيانات افتراضية
              setWeather({ temp: 28, description: 'مشمس', icon: '01d' });
            }
          },
          () => {
            // في حالة رفض الإذن، استخدام بيانات افتراضية
            setWeather({ temp: 28, description: 'مشمس', icon: '01d' });
          }
        );
      } else {
        setWeather({ temp: 28, description: 'مشمس', icon: '01d' });
      }
    } catch {
      setWeather({ temp: 28, description: 'مشمس', icon: '01d' });
    }
  }, []);

  useEffect(() => {
    // جلب الطقس والموقع
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWeather();
  }, [fetchWeather]);

  const getWeatherIcon = (icon: string) => {
    if (icon.includes('01')) return <Sun className="w-5 h-5 text-yellow-500" />;
    if (icon.includes('02') || icon.includes('03')) return <Cloud className="w-5 h-5 text-gray-400" />;
    if (icon.includes('09') || icon.includes('10')) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (icon.includes('13')) return <Cloud className="w-5 h-5 text-blue-200" />;
    return <Sun className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <header className="bg-gradient-to-l from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 border-b border-purple-100 dark:border-gray-700 sticky top-0 z-40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* القائمة والموقع */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden hover:bg-purple-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">{location}</span>
            </div>
          </div>

          {/* التاريخ */}
          <div className="flex-1 text-center">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold">
                  {formatDateArabic(today)}
                </span>
              </div>
              <span className="text-xs text-purple-600 dark:text-purple-400">
                {formatHijriDate(today)}
              </span>
            </div>
          </div>

          {/* الطقس والاستمرارية */}
          <div className="flex items-center gap-3">
            {/* الطقس */}
            {weather && (
              <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-700/50 rounded-full px-3 py-1.5">
                {getWeatherIcon(weather.icon)}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {Math.round(weather.temp)}°
                </span>
              </div>
            )}

            {/* سلسلة الاستمرارية */}
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 bg-gradient-to-l from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-700 dark:text-orange-300 border-0 px-3 py-1.5"
            >
              <Flame className="w-4 h-4" />
              <span className="font-semibold">{streak}</span>
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
