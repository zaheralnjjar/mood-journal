'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  Hash,
  Star,
  Image,
  Sliders,
  Calendar,
  Clock,
  List,
  Save,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { cn, generateId } from '@/lib/journal/utils';
import { TEMPLATE_CATEGORIES, TAG_COLORS } from '@/lib/journal/constants';
import type { Template, TemplateField } from '@/lib/journal/types';

interface TemplateBuilderProps {
  templates: Template[];
  onSaveTemplate: (template: Template) => void;
  onDeleteTemplate: (id: string) => void;
  onSelectTemplate: (template: Template) => void;
}

const fieldTypes: { type: TemplateField['type']; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'نص', icon: <Type className="w-4 h-4" /> },
  { type: 'number', label: 'رقم', icon: <Hash className="w-4 h-4" /> },
  { type: 'rating', label: 'تقييم', icon: <Star className="w-4 h-4" /> },
  { type: 'slider', label: 'سلايدر', icon: <Sliders className="w-4 h-4" /> },
  { type: 'select', label: 'اختيار', icon: <List className="w-4 h-4" /> },
  { type: 'date', label: 'تاريخ', icon: <Calendar className="w-4 h-4" /> },
  { type: 'time', label: 'وقت', icon: <Clock className="w-4 h-4" /> },
  { type: 'image', label: 'صورة', icon: <Image className="w-4 h-4" /> },
];

export function TemplateBuilder({
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  onSelectTemplate,
}: TemplateBuilderProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // حالة القالب الجديد
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    name: '',
    description: '',
    icon: '📝',
    category: 'daily',
    fields: [],
  });

  const addField = (type: TemplateField['type']) => {
    const newField: TemplateField = {
      id: generateId(),
      type,
      label: `حقل ${newTemplate.fields?.length || 0 + 1}`,
      placeholder: '',
      required: false,
    };

    if (type === 'rating' || type === 'slider') {
      newField.min = 1;
      newField.max = 5;
    }

    if (type === 'select') {
      newField.options = ['خيار 1', 'خيار 2'];
    }

    setNewTemplate({
      ...newTemplate,
      fields: [...(newTemplate.fields || []), newField],
    });
  };

  const updateField = (index: number, updates: Partial<TemplateField>) => {
    const fields = [...(newTemplate.fields || [])];
    fields[index] = { ...fields[index], ...updates };
    setNewTemplate({ ...newTemplate, fields });
  };

  const removeField = (index: number) => {
    const fields = [...(newTemplate.fields || [])];
    fields.splice(index, 1);
    setNewTemplate({ ...newTemplate, fields });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const fields = [...(newTemplate.fields || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
    setNewTemplate({ ...newTemplate, fields });
  };

  const handleSave = () => {
    if (!newTemplate.name || !newTemplate.fields?.length) return;

    const template: Template = {
      id: editingTemplate?.id || generateId(),
      name: newTemplate.name,
      description: newTemplate.description || '',
      icon: newTemplate.icon || '📝',
      category: newTemplate.category as Template['category'],
      fields: newTemplate.fields,
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveTemplate(template);
    setIsCreating(false);
    setEditingTemplate(null);
    setNewTemplate({
      name: '',
      description: '',
      icon: '📝',
      category: 'daily',
      fields: [],
    });
  };

  const startEditing = (template: Template) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      description: template.description,
      icon: template.icon,
      category: template.category,
      fields: [...template.fields],
    });
    setIsCreating(true);
  };

  const renderFieldEditor = (field: TemplateField, index: number) => (
    <Card key={field.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* مقبض السحب */}
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => moveField(index, 'up')}
              disabled={index === 0}
            >
              <GripVertical className="w-3 h-3" />
            </Button>
          </div>

          {/* محتوى الحقل */}
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">اسم الحقل</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">النوع</Label>
                <Select
                  value={field.type}
                  onValueChange={(value) => updateField(index, { type: value as TemplateField['type'] })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((ft) => (
                      <SelectItem key={ft.type} value={ft.type}>
                        <div className="flex items-center gap-2">
                          {ft.icon}
                          {ft.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {field.type === 'text' && (
              <div>
                <Label className="text-xs">نص موجه</Label>
                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  placeholder="نص يظهر داخل الحقل..."
                  className="h-8"
                />
              </div>
            )}

            {(field.type === 'rating' || field.type === 'slider') && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">الحد الأدنى</Label>
                  <Input
                    type="number"
                    value={field.min || 1}
                    onChange={(e) => updateField(index, { min: parseInt(e.target.value) })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">الحد الأقصى</Label>
                  <Input
                    type="number"
                    value={field.max || 5}
                    onChange={(e) => updateField(index, { max: parseInt(e.target.value) })}
                    className="h-8"
                  />
                </div>
              </div>
            )}

            {field.type === 'select' && (
              <div>
                <Label className="text-xs">الخيارات (كل خيار في سطر)</Label>
                <textarea
                  value={field.options?.join('\n') || ''}
                  onChange={(e) =>
                    updateField(index, { options: e.target.value.split('\n').filter(Boolean) })
                  }
                  className="w-full h-20 px-3 py-2 text-sm border rounded-md resize-none focus:ring-2 focus:ring-purple-500"
                  placeholder="خيار 1&#10;خيار 2&#10;خيار 3"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.required}
                  onCheckedChange={(checked) => updateField(index, { required: checked })}
                />
                <Label className="text-xs">مطلوب</Label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600"
                onClick={() => removeField(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* قائمة القوالب */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">القوالب</CardTitle>
            <Button onClick={() => setIsCreating(true)} size="sm">
              <Plus className="w-4 h-4 ml-2" />
              قالب جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => onSelectTemplate(template)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-xs text-gray-500">
                        {template.fields.length} حقول •{' '}
                        {TEMPLATE_CATEGORIES.find((c) => c.id === template.category)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(template);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(template);
                      }}
                    >
                      تعديل
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTemplate(template.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* محرر القالب */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {editingTemplate ? 'تعديل القالب' : 'إنشاء قالب جديد'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCreating ? (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {/* معلومات القالب */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>اسم القالب</Label>
                    <Input
                      value={newTemplate.name || ''}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, name: e.target.value })
                      }
                      placeholder="مثال: يوميات الصباح"
                    />
                  </div>
                  <div>
                    <Label>التصنيف</Label>
                    <Select
                      value={newTemplate.category}
                      onValueChange={(value) =>
                        setNewTemplate({ ...newTemplate, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>الأيقونة</Label>
                  <div className="flex gap-2 mt-2">
                    {['📝', '📋', '✨', '🎯', '💪', '📚', '🏃', '🧘', '💼', '🏠'].map(
                      (emoji) => (
                        <button
                          key={emoji}
                          className={cn(
                            'text-2xl p-2 rounded-lg border-2 transition-colors',
                            newTemplate.icon === emoji
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-transparent hover:border-gray-300'
                          )}
                          onClick={() => setNewTemplate({ ...newTemplate, icon: emoji })}
                        >
                          {emoji}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <Label>الوصف</Label>
                  <Input
                    value={newTemplate.description || ''}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, description: e.target.value })
                    }
                    placeholder="وصف مختصر للقالب..."
                  />
                </div>

                <Separator className="my-4" />

                {/* الحقول */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>الحقول</Label>
                    <div className="flex gap-1">
                      {fieldTypes.map((ft) => (
                        <Button
                          key={ft.type}
                          variant="outline"
                          size="sm"
                          onClick={() => addField(ft.type)}
                          className="gap-1"
                        >
                          {ft.icon}
                          <span className="hidden sm:inline text-xs">{ft.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {(newTemplate.fields || []).map((field, index) =>
                    renderFieldEditor(field, index)
                  )}

                  {(newTemplate.fields || []).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>أضف حقولاً لإنشاء القالب</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={!newTemplate.name || !(newTemplate.fields || []).length}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    حفظ القالب
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingTemplate(null);
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
              <Plus className="w-16 h-16 mb-4 opacity-50" />
              <p>اضغط على "قالب جديد" للبدء</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* معاينة القالب */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewTemplate?.icon} {previewTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewTemplate?.fields.map((field) => (
              <div key={field.id}>
                <Label className="flex items-center gap-1">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </Label>
                {field.type === 'text' && (
                  <Input placeholder={field.placeholder} className="mt-1" />
                )}
                {field.type === 'number' && (
                  <Input type="number" placeholder="0" className="mt-1" />
                )}
                {field.type === 'rating' && (
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: field.max || 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-6 h-6 cursor-pointer text-gray-300 hover:text-yellow-400"
                      />
                    ))}
                  </div>
                )}
                {field.type === 'slider' && (
                  <input
                    type="range"
                    min={field.min || 1}
                    max={field.max || 10}
                    className="w-full mt-2"
                  />
                )}
                {field.type === 'select' && (
                  <Select>
                    <SelectTrigger className="mt-1">
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
                {field.type === 'date' && <Input type="date" className="mt-1" />}
                {field.type === 'time' && <Input type="time" className="mt-1" />}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Separator component
function Separator({ className }: { className?: string }) {
  return <div className={cn('h-px bg-gray-200 dark:bg-gray-700', className)} />;
}
