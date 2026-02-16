'use client';

import { useState } from 'react';
import { Star, Image, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Template, TemplateField, SmartFormData } from '@/lib/journal/types';

interface SmartFormRendererProps {
  template: Template;
  initialData?: SmartFormData;
  onSubmit?: (data: SmartFormData) => void;
  onChange?: (data: SmartFormData) => void;
  readOnly?: boolean;
}

export function SmartFormRenderer({
  template,
  initialData,
  onSubmit,
  onChange,
  readOnly = false,
}: SmartFormRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>(
    initialData?.values || {}
  );
  const [signatures, setSignatures] = useState<Record<string, string>>({});

  const updateValue = (fieldId: string, value: unknown) => {
    const newValues = { ...values, [fieldId]: value };
    setValues(newValues);
    if (onChange) {
      onChange({ templateId: template.id, values: newValues });
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({
        templateId: template.id,
        values,
        completedAt: new Date().toISOString(),
      });
    }
  };

  const renderField = (field: TemplateField) => {
    const value = values[field.id];

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            {readOnly ? (
              <p className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {(value as string) || '-'}
              </p>
            ) : (
              <Input
                value={(value as string) || ''}
                onChange={(e) => updateValue(field.id, e.target.value)}
                placeholder={field.placeholder}
              />
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            {readOnly ? (
              <p className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-lg font-semibold">
                {(value as number) || 0}
              </p>
            ) : (
              <Input
                type="number"
                value={(value as number) || ''}
                onChange={(e) => updateValue(field.id, parseFloat(e.target.value) || 0)}
                placeholder={field.placeholder}
              />
            )}
          </div>
        );

      case 'rating':
        const ratingValue = (value as number) || 0;
        return (
          <div key={field.id} className="space-y-2">
            <Label className="flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: field.max || 5 }).map((_, i) => (
                  <button
                    key={i}
                    disabled={readOnly}
                    onClick={() => updateValue(field.id, i + 1)}
                    className={cn(
                      'transition-colors',
                      readOnly ? 'cursor-default' : 'cursor-pointer'
                    )}
                  >
                    <Star
                      className={cn(
                        'w-8 h-8',
                        i < ratingValue
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  </button>
                ))}
              </div>
              {ratingValue > 0 && (
                <span className="text-sm text-gray-500">
                  {ratingValue} / {field.max || 5}
                </span>
              )}
            </div>
          </div>
        );

      case 'slider':
        const sliderValue = (value as number) || field.min || 1;
        return (
          <div key={field.id} className="space-y-2">
            <Label className="flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 w-6">{field.min || 1}</span>
              <Slider
                value={[sliderValue]}
                onValueChange={([v]) => updateValue(field.id, v)}
                min={field.min || 1}
                max={field.max || 10}
                step={1}
                disabled={readOnly}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-6">{field.max || 10}</span>
            </div>
            <p className="text-center text-lg font-semibold text-purple-600">
              {sliderValue}
            </p>
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            {readOnly ? (
              <p className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {(value as string) || '-'}
              </p>
            ) : (
              <Select
                value={(value as string) || ''}
                onValueChange={(v) => updateValue(field.id, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt, i) => (
                    <SelectItem key={i} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            {readOnly ? (
              <p className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {(value as string) || '-'}
              </p>
            ) : (
              <Input
                type="date"
                value={(value as string) || ''}
                onChange={(e) => updateValue(field.id, e.target.value)}
              />
            )}
          </div>
        );

      case 'time':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            {readOnly ? (
              <p className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {(value as string) || '-'}
              </p>
            ) : (
              <Input
                type="time"
                value={(value as string) || ''}
                onChange={(e) => updateValue(field.id, e.target.value)}
              />
            )}
          </div>
        );

      case 'image':
        const imageUrl = value as string;
        return (
          <div key={field.id} className="space-y-2">
            <Label className="flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={field.label}
                  className="w-full h-40 object-cover rounded-lg"
                />
                {!readOnly && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 left-2"
                    onClick={() => updateValue(field.id, null)}
                  >
                    إزالة
                  </Button>
                )}
              </div>
            ) : readOnly ? (
              <div className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                <Image className="w-8 h-8" />
              </div>
            ) : (
              <label className="block">
                <div className="w-full h-24 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Image className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">اضغط لتحميل صورة</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        updateValue(field.id, e.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}
          </div>
        );

      case 'signature':
        const signature = signatures[field.id];
        return (
          <div key={field.id} className="space-y-2">
            <Label className="flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            {signature ? (
              <div className="relative">
                <img
                  src={signature}
                  alt="التوقيع"
                  className="w-full h-20 object-contain bg-white border rounded-lg"
                />
                {!readOnly && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 left-1"
                    onClick={() => {
                      const newSigs = { ...signatures };
                      delete newSigs[field.id];
                      setSignatures(newSigs);
                      updateValue(field.id, null);
                    }}
                  >
                    إزالة
                  </Button>
                )}
              </div>
            ) : readOnly ? (
              <div className="w-full h-16 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                لا يوجد توقيع
              </div>
            ) : (
              <canvas
                className="w-full h-24 bg-white border rounded-lg cursor-crosshair"
                onMouseDown={(e) => {
                  const canvas = e.currentTarget;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;

                  ctx.strokeStyle = '#000';
                  ctx.lineWidth = 2;
                  ctx.lineCap = 'round';

                  const rect = canvas.getBoundingClientRect();
                  let isDrawing = true;
                  ctx.beginPath();
                  ctx.moveTo(
                    e.clientX - rect.left,
                    e.clientY - rect.top
                  );

                  const draw = (e: MouseEvent) => {
                    if (!isDrawing) return;
                    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                    ctx.stroke();
                  };

                  const stop = () => {
                    isDrawing = false;
                    const dataUrl = canvas.toDataURL();
                    setSignatures({ ...signatures, [field.id]: dataUrl });
                    updateValue(field.id, dataUrl);
                    canvas.removeEventListener('mousemove', draw);
                    canvas.removeEventListener('mouseup', stop);
                    canvas.removeEventListener('mouseleave', stop);
                  };

                  canvas.addEventListener('mousemove', draw);
                  canvas.addEventListener('mouseup', stop);
                  canvas.addEventListener('mouseleave', stop);
                }}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // حساب نسبة الإكمال
  const filledFields = template.fields.filter((field) => {
    const value = values[field.id];
    if (field.required) {
      return value !== undefined && value !== null && value !== '';
    }
    return true;
  }).length;

  const progress = (filledFields / template.fields.length) * 100;

  return (
    <div className="space-y-6">
      {/* رأس القالب */}
      <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
        <span className="text-4xl mb-2 block">{template.icon}</span>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          {template.name}
        </h2>
        {template.description && (
          <p className="text-sm text-gray-500 mt-1">{template.description}</p>
        )}
        
        {/* شريط التقدم */}
        {!readOnly && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
              <span>الإكمال</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* الحقول */}
      <div className="space-y-4">
        {template.fields.map(renderField)}
      </div>

      {/* زر الحفظ */}
      {!readOnly && onSubmit && (
        <Button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          size="lg"
        >
          <Check className="w-4 h-4 ml-2" />
          حفظ النموذج
        </Button>
      )}
    </div>
  );
}
