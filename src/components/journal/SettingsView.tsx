'use client';

import { useState } from 'react';
import {
  Settings,
  Palette,
  Type,
  Sun,
  Moon,
  Monitor,
  Globe,
  Bell,
  Cloud,
  Download,
  Upload,
  Trash2,
  MapPin,
  Key,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn, exportData, formatFileSize } from '@/lib/journal/utils';
import { TAG_COLORS, DEFAULT_SETTINGS, STORAGE_KEYS } from '@/lib/journal/constants';
import type { UserSettings, JournalEntry, Tag } from '@/lib/journal/types';

interface SettingsViewProps {
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  entries: JournalEntry[];
  tags: Tag[];
  onDataImport: (data: { entries: JournalEntry[]; tags: Tag[] }) => void;
  onClearData: () => void;
}

const FONTS = [
  { value: 'Cairo', label: 'Cairo' },
  { value: 'Tajawal', label: 'Tajawal' },
  { value: 'Amiri', label: 'Amiri' },
  { value: 'Noto Sans Arabic', label: 'Noto Sans Arabic' },
  { value: 'IBM Plex Sans Arabic', label: 'IBM Plex Sans Arabic' },
];

export function SettingsView({
  settings,
  onSettingsChange,
  entries,
  tags,
  onDataImport,
  onClearData,
}: SettingsViewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = exportData(entries, tags);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journal-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const { importData } = await import('@/lib/journal/utils');
      const data = importData(text);
      if (data) {
        onDataImport(data);
        alert('تم استيراد البيانات بنجاح!');
      } else {
        alert('خطأ في قراءة الملف. تأكد من صحة التنسيق.');
      }
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleClearData = () => {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      onClearData();
    }
  };

  const calculateStorageSize = () => {
    const data = { entries, tags, settings };
    return new Blob([JSON.stringify(data)]).size;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* العنوان */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-bold">الإعدادات</h2>
      </div>

      {/* المظهر */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="w-5 h-5 text-purple-500" />
            المظهر
          </CardTitle>
          <CardDescription>تخصيص مظهر التطبيق</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* الوضع */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">الوضع</Label>
              <p className="text-sm text-gray-500">اختر وضع العرض</p>
            </div>
            <Select
              value={settings.theme}
              onValueChange={(value) => updateSetting('theme', value as UserSettings['theme'])}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    فاتح
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    داكن
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    النظام
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* اللون الرئيسي */}
          <div className="space-y-3">
            <div>
              <Label className="font-medium">اللون الرئيسي</Label>
              <p className="text-sm text-gray-500">اختر اللون المميز للتطبيق</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.slice(0, 12).map((color) => (
                <button
                  key={color}
                  className={cn(
                    'w-10 h-10 rounded-lg transition-transform hover:scale-110 flex items-center justify-center',
                    settings.primaryColor === color && 'ring-2 ring-offset-2 ring-gray-800'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => updateSetting('primaryColor', color)}
                >
                  {settings.primaryColor === color && (
                    <Check className="w-5 h-5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* الخط */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">نوع الخط</Label>
              <p className="text-sm text-gray-500">اختر خط العرض</p>
            </div>
            <Select
              value={settings.fontFamily}
              onValueChange={(value) => updateSetting('fontFamily', value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* حجم الخط */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">حجم الخط</Label>
                <p className="text-sm text-gray-500">تكبير أو تصغير النص</p>
              </div>
              <span className="text-sm text-gray-500">{settings.fontSize}px</span>
            </div>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => updateSetting('fontSize', value)}
              min={12}
              max={24}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* التخصيص */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-purple-500" />
            التخصيص
          </CardTitle>
          <CardDescription>إعدادات العرض والمحتوى</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* مواقيت الصلاة */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">عرض مواقيت الصلاة</Label>
              <p className="text-sm text-gray-500">إظهار شريط مواقيت الصلاة</p>
            </div>
            <Switch
              checked={settings.showPrayerTimes}
              onCheckedChange={(checked) => updateSetting('showPrayerTimes', checked)}
            />
          </div>

          <Separator />

          {/* الطقس */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">عرض الطقس</Label>
              <p className="text-sm text-gray-500">إظهار درجة الحرارة في الرأس</p>
            </div>
            <Switch
              checked={settings.showWeather}
              onCheckedChange={(checked) => updateSetting('showWeather', checked)}
            />
          </div>

          <Separator />

          {/* التاريخ الهجري */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">التاريخ الهجري</Label>
              <p className="text-sm text-gray-500">إظهار التاريخ الهجري والميلادي</p>
            </div>
            <Switch
              checked={settings.showHijriDate}
              onCheckedChange={(checked) => updateSetting('showHijriDate', checked)}
            />
          </div>

          <Separator />

          {/* اللغة */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">اللغة</Label>
              <p className="text-sm text-gray-500">لغة واجهة التطبيق</p>
            </div>
            <Select
              value={settings.language}
              onValueChange={(value) => updateSetting('language', value as 'ar' | 'en')}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* الموقع */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-purple-500" />
            الموقع
          </CardTitle>
          <CardDescription>إعدادات الموقع الجغرافي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      updateSetting('location', {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                      });
                    },
                    () => {
                      alert('لم نتمكن من تحديد موقعك');
                    }
                  );
                }
              }}
            >
              <MapPin className="w-4 h-4 ml-2" />
              تحديد موقعي
            </Button>
            {settings.location && (
              <Badge variant="secondary">
                {settings.location.lat.toFixed(2)}, {settings.location.lng.toFixed(2)}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">
            يتم استخدام الموقع لعرض مواقيت الصلاة والطقس بشكل دقيق
          </p>
        </CardContent>
      </Card>

      {/* الذكاء الاصطناعي */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="w-5 h-5 text-purple-500" />
            الذكاء الاصطناعي
          </CardTitle>
          <CardDescription>إعدادات المساعد الذكي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Gemini API Key</Label>
            <Input
              type="password"
              value={settings.geminiApiKey || ''}
              onChange={(e) => updateSetting('geminiApiKey', e.target.value)}
              placeholder="أدخل مفتاح API..."
            />
            <p className="text-xs text-gray-500">
              احصل على مفتاح API مجاني من{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-500 underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* النسخ الاحتياطي */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cloud className="w-5 h-5 text-purple-500" />
            النسخ الاحتياطي
          </CardTitle>
          <CardDescription>تصدير واستيراد البيانات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* معلومات التخزين */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <Label className="font-medium">حجم البيانات</Label>
              <p className="text-sm text-gray-500">
                {entries.length} تدوينة • {tags.length} وسم
              </p>
            </div>
            <Badge variant="secondary">{formatFileSize(calculateStorageSize())}</Badge>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* تصدير */}
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              <Download className="w-4 h-4 ml-2" />
              تصدير JSON
            </Button>

            {/* استيراد */}
            <label>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                disabled={isImporting}
              />
              <Button variant="outline" asChild disabled={isImporting}>
                <span>
                  <Upload className="w-4 h-4 ml-2" />
                  استيراد
                </span>
              </Button>
            </label>

            {/* حذف */}
            <Button variant="destructive" onClick={handleClearData}>
              <Trash2 className="w-4 h-4 ml-2" />
              حذف البيانات
            </Button>
          </div>

          <Separator />

          {/* النسخ الاحتياطي التلقائي */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">نسخ احتياطي تلقائي</Label>
              <p className="text-sm text-gray-500">تنزيل نسخة احتياطية تلقائياً</p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
            />
          </div>

          {settings.autoBackup && (
            <div className="flex items-center justify-between">
              <Label>تكرار النسخ</Label>
              <Select
                value={settings.backupInterval}
                onValueChange={(value) =>
                  updateSetting('backupInterval', value as 'daily' | 'weekly' | 'monthly')
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">يومي</SelectItem>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* معلومات */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-gray-500">
            <p>مفكرتي - المفكرة اليومية الذكية</p>
            <p className="mt-1">الإصدار 1.0.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
