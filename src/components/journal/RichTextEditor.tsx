'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignRight,
  AlignCenter,
  AlignLeft,
  AlignJustify,
  Palette,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Triangle,
  Star,
  Tag,
  Calendar,
  Quote,
  Code,
  Activity,
  ShoppingBag,
  Clock,
  MapPin,
  Plus,
  X,
  Trash2,
  Move,
  Maximize2,
  RotateCcw,
  Copy,
  MoreHorizontal,
  ChevronDown,
  Heart,
  Droplets,
  Dumbbell,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, generateId } from '@/lib/journal/utils';
import { TAG_COLORS, PROGRAMMING_LANGUAGES, COMMON_TRACKERS } from '@/lib/journal/constants';
import type {
  ContentElement,
  ElementStyle,
  ShapeType,
  Tag as TagType,
  Appointment,
  Quote as QuoteType,
  CodeBlock,
  Tracker,
  ShoppingList,
  ShoppingItem,
  Location,
} from '@/lib/journal/types';

interface RichTextEditorProps {
  content: ContentElement[];
  onChange: (content: ContentElement[]) => void;
  savedTags: TagType[];
  onTagsUpdate: (tags: TagType[]) => void;
}

// شريط الأدوات العائم
function FloatingToolbar({
  selectedElement,
  onStyleChange,
  onDelete,
  onDuplicate,
  position,
}: {
  selectedElement: ContentElement | null;
  onStyleChange: (style: Partial<ElementStyle>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  position: { x: number; y: number } | null;
}) {
  if (!selectedElement || !position) return null;

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-1 flex items-center gap-1"
      style={{ left: position.x, top: position.y - 50 }}
    >
      {/* المحاذاة */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onStyleChange({ alignment: 'right' })}
        >
          <AlignRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onStyleChange({ alignment: 'center' })}
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onStyleChange({ alignment: 'left' })}
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* اللون */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Palette className="w-3.5 h-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <Label className="text-xs mb-2 block">لون النص</Label>
          <div className="grid grid-cols-6 gap-1">
            {TAG_COLORS.slice(0, 12).map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded-full border-2 border-transparent hover:border-gray-400"
                style={{ backgroundColor: color }}
                onClick={() => onStyleChange({ color })}
              />
            ))}
          </div>
          <Label className="text-xs mb-2 mt-3 block">لون الخلفية</Label>
          <div className="grid grid-cols-6 gap-1">
            {TAG_COLORS.slice(0, 12).map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded-full border-2 border-transparent hover:border-gray-400"
                style={{ backgroundColor: color }}
                onClick={() => onStyleChange({ backgroundColor: color })}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* نسخ وحذف */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-blue-500"
        onClick={onDuplicate}
      >
        <Copy className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-red-500"
        onClick={onDelete}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// نافذة إدراج العناصر
function ToolModal({
  isOpen,
  onClose,
  onInsert,
  type,
  savedTags,
  onTagsUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (element: ContentElement) => void;
  type: 'tag' | 'appointment' | 'quote' | 'code' | 'tracker' | 'shopping' | 'time' | 'shape' | null;
  savedTags: TagType[];
  onTagsUpdate: (tags: TagType[]) => void;
}) {
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState(TAG_COLORS[0]);
  
  const [appointment, setAppointment] = useState<Appointment>({
    id: '',
    title: '',
    date: '',
    time: '',
    location: '',
  });

  const [quote, setQuote] = useState<QuoteType>({
    id: '',
    text: '',
    author: '',
  });

  const [codeBlock, setCodeBlock] = useState<CodeBlock>({
    id: '',
    code: '',
    language: 'javascript',
  });

  const [tracker, setTracker] = useState<Tracker>({
    id: '',
    name: '',
    icon: '💧',
    target: 8,
    current: 0,
    unit: 'كوب',
    color: '#0ea5e9',
  });

  const [shoppingList, setShoppingList] = useState<ShoppingList>({
    id: '',
    title: 'قائمة التسوق',
    items: [],
  });
  const [newItem, setNewItem] = useState('');

  const [selectedShape, setSelectedShape] = useState<ShapeType>('rectangle');
  const [shapeColor, setShapeColor] = useState('#8b5cf6');

  const handleInsertTime = useCallback(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const dateStr = now.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    onInsert({
      id: generateId(),
      type: 'time',
      content: `${timeStr} - ${dateStr}`,
      style: {
        backgroundColor: '#f0f9ff',
        color: '#0369a1',
        borderRadius: 8,
        padding: 12,
      },
    });
    onClose();
  }, [onInsert, onClose]);

  useEffect(() => {
    if (type === 'time') {
      handleInsertTime();
    }
  }, [type, handleInsertTime]);

  const handleInsertTag = () => {
    if (!tagName.trim()) return;

    const newTag: TagType = {
      id: generateId(),
      name: tagName,
      color: tagColor,
      createdAt: new Date().toISOString(),
    };

    // حفظ الوسم إذا كان جديداً
    if (!savedTags.find(t => t.name === tagName)) {
      onTagsUpdate([...savedTags, newTag]);
    }

    onInsert({
      id: generateId(),
      type: 'tag',
      content: tagName,
      style: {
        backgroundColor: tagColor,
        color: '#ffffff',
        borderRadius: 16,
        padding: 4,
      },
      metadata: { color: tagColor },
    });

    setTagName('');
    onClose();
  };

  const handleInsertAppointment = () => {
    if (!appointment.title || !appointment.date || !appointment.time) return;

    const appt = { ...appointment, id: generateId() };
    onInsert({
      id: generateId(),
      type: 'appointment',
      content: appointment.title,
      metadata: { appointment: appt },
      style: {
        backgroundColor: '#fef3c7',
        borderRadius: 8,
        padding: 12,
      },
    });

    setAppointment({ id: '', title: '', date: '', time: '', location: '' });
    onClose();
  };

  const handleInsertQuote = () => {
    if (!quote.text.trim()) return;

    onInsert({
      id: generateId(),
      type: 'quote',
      content: quote.text,
      metadata: { author: quote.author },
      style: {
        backgroundColor: '#f5f3ff',
        borderLeft: '4px solid #8b5cf6',
        borderRadius: 0,
        padding: 16,
        italic: true,
      },
    });

    setQuote({ id: '', text: '', author: '' });
    onClose();
  };

  const handleInsertCode = () => {
    if (!codeBlock.code.trim()) return;

    onInsert({
      id: generateId(),
      type: 'code',
      content: codeBlock.code,
      metadata: { language: codeBlock.language },
      style: {
        backgroundColor: '#1e293b',
        color: '#e2e8f0',
        borderRadius: 8,
        padding: 16,
        fontFamily: 'monospace',
      },
    });

    setCodeBlock({ id: '', code: '', language: 'javascript' });
    onClose();
  };

  const handleInsertTracker = () => {
    if (!tracker.name.trim()) return;

    onInsert({
      id: generateId(),
      type: 'tracker',
      content: tracker.name,
      metadata: { tracker: { ...tracker, id: generateId() } },
      style: {
        backgroundColor: tracker.color + '20',
        borderRadius: 8,
        padding: 12,
      },
    });

    setTracker({
      id: '',
      name: '',
      icon: '💧',
      target: 8,
      current: 0,
      unit: 'كوب',
      color: '#0ea5e9',
    });
    onClose();
  };

  const handleAddShoppingItem = () => {
    if (!newItem.trim()) return;
    setShoppingList({
      ...shoppingList,
      items: [
        ...shoppingList.items,
        { id: generateId(), name: newItem, checked: false },
      ],
    });
    setNewItem('');
  };

  const handleInsertShopping = () => {
    if (shoppingList.items.length === 0) return;

    onInsert({
      id: generateId(),
      type: 'shopping-list',
      content: shoppingList.title,
      metadata: { items: shoppingList.items },
      style: {
        backgroundColor: '#ecfdf5',
        borderRadius: 8,
        padding: 12,
      },
    });

    setShoppingList({ id: '', title: 'قائمة التسوق', items: [] });
    onClose();
  };

  const handleInsertShape = () => {
    onInsert({
      id: generateId(),
      type: 'shape',
      content: '',
      metadata: {
        shapeType: selectedShape,
        fillColor: shapeColor,
        strokeColor: '#000000',
        strokeWidth: 2,
      },
      size: { width: 100, height: 100 },
      style: {
        borderRadius: selectedShape === 'circle' ? 999 : 8,
        backgroundColor: shapeColor,
      },
    });

    onClose();
  };

  const renderContent = () => {
    switch (type) {
      case 'tag':
        return (
          <div className="space-y-4">
            <div>
              <Label>اسم الوسم</Label>
              <Input
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="أدخل اسم الوسم..."
              />
            </div>
            <div>
              <Label>لون الوسم</Label>
              <div className="grid grid-cols-10 gap-2 mt-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                      tagColor === color ? 'border-gray-800 scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setTagColor(color)}
                  />
                ))}
              </div>
            </div>
            {savedTags.length > 0 && (
              <div>
                <Label>الوسوم المحفوظة</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {savedTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      className="cursor-pointer"
                      style={{ backgroundColor: tag.color }}
                      onClick={() => {
                        setTagName(tag.name);
                        setTagColor(tag.color);
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleInsertTag} disabled={!tagName.trim()}>
                إدراج
              </Button>
            </DialogFooter>
          </div>
        );

      case 'appointment':
        return (
          <div className="space-y-4">
            <div>
              <Label>عنوان الموعد</Label>
              <Input
                value={appointment.title}
                onChange={(e) => setAppointment({ ...appointment, title: e.target.value })}
                placeholder="عنوان الموعد..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>التاريخ</Label>
                <Input
                  type="date"
                  value={appointment.date}
                  onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                />
              </div>
              <div>
                <Label>الوقت</Label>
                <Input
                  type="time"
                  value={appointment.time}
                  onChange={(e) => setAppointment({ ...appointment, time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>المكان (اختياري)</Label>
              <Input
                value={appointment.location}
                onChange={(e) => setAppointment({ ...appointment, location: e.target.value })}
                placeholder="اسم المكان..."
              />
            </div>
            <DialogFooter>
              <Button onClick={handleInsertAppointment} disabled={!appointment.title}>
                إدراج
              </Button>
            </DialogFooter>
          </div>
        );

      case 'quote':
        return (
          <div className="space-y-4">
            <div>
              <Label>الاقتباس</Label>
              <Textarea
                value={quote.text}
                onChange={(e) => setQuote({ ...quote, text: e.target.value })}
                placeholder="اكتب الاقتباس هنا..."
                rows={3}
              />
            </div>
            <div>
              <Label>القائل</Label>
              <Input
                value={quote.author}
                onChange={(e) => setQuote({ ...quote, author: e.target.value })}
                placeholder="اسم القائل..."
              />
            </div>
            <DialogFooter>
              <Button onClick={handleInsertQuote} disabled={!quote.text.trim()}>
                إدراج
              </Button>
            </DialogFooter>
          </div>
        );

      case 'code':
        return (
          <div className="space-y-4">
            <div>
              <Label>لغة البرمجة</Label>
              <Select
                value={codeBlock.language}
                onValueChange={(value) => setCodeBlock({ ...codeBlock, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الكود</Label>
              <Textarea
                value={codeBlock.code}
                onChange={(e) => setCodeBlock({ ...codeBlock, code: e.target.value })}
                placeholder="الصق الكود هنا..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleInsertCode} disabled={!codeBlock.code.trim()}>
                إدراج
              </Button>
            </DialogFooter>
          </div>
        );

      case 'tracker':
        return (
          <div className="space-y-4">
            <div>
              <Label>اسم المتتبع</Label>
              <Input
                value={tracker.name}
                onChange={(e) => setTracker({ ...tracker, name: e.target.value })}
                placeholder="مثال: ماء، رياضة..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الهدف</Label>
                <Input
                  type="number"
                  value={tracker.target}
                  onChange={(e) => setTracker({ ...tracker, target: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>الوحدة</Label>
                <Input
                  value={tracker.unit}
                  onChange={(e) => setTracker({ ...tracker, unit: e.target.value })}
                  placeholder="كوب، دقيقة..."
                />
              </div>
            </div>
            <div>
              <Label>الأيقونة</Label>
              <div className="flex gap-2 mt-2">
                {COMMON_TRACKERS.map((t) => (
                  <button
                    key={t.name}
                    className={cn(
                      'text-2xl p-2 rounded-lg transition-colors',
                      tracker.icon === t.icon ? 'bg-purple-100' : 'hover:bg-gray-100'
                    )}
                    onClick={() => setTracker({ ...tracker, icon: t.icon, name: t.name, unit: t.unit })}
                  >
                    {t.icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>اللون</Label>
              <div className="grid grid-cols-10 gap-2 mt-2">
                {TAG_COLORS.slice(0, 10).map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110',
                      tracker.color === color ? 'border-gray-800' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setTracker({ ...tracker, color })}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleInsertTracker} disabled={!tracker.name.trim()}>
                إدراج
              </Button>
            </DialogFooter>
          </div>
        );

      case 'shopping':
        return (
          <div className="space-y-4">
            <div>
              <Label>عنوان القائمة</Label>
              <Input
                value={shoppingList.title}
                onChange={(e) => setShoppingList({ ...shoppingList, title: e.target.value })}
              />
            </div>
            <div>
              <Label>العناصر</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="أضف عنصر..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddShoppingItem()}
                />
                <Button onClick={handleAddShoppingItem} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {shoppingList.items.length > 0 && (
                <div className="mt-3 space-y-2">
                  {shoppingList.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2"
                    >
                      <span>{item.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newItems = shoppingList.items.filter((_, i) => i !== index);
                          setShoppingList({ ...shoppingList, items: newItems });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleInsertShopping} disabled={shoppingList.items.length === 0}>
                إدراج
              </Button>
            </DialogFooter>
          </div>
        );

      case 'shape':
        return (
          <div className="space-y-4">
            <div>
              <Label>اختر الشكل</Label>
              <div className="grid grid-cols-4 gap-3 mt-2">
                {[
                  { type: 'rectangle' as ShapeType, icon: Square, label: 'مربع' },
                  { type: 'circle' as ShapeType, icon: Circle, label: 'دائرة' },
                  { type: 'triangle' as ShapeType, icon: Triangle, label: 'مثلث' },
                  { type: 'star' as ShapeType, icon: Star, label: 'نجمة' },
                ].map((shape) => (
                  <button
                    key={shape.type}
                    className={cn(
                      'p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors',
                      selectedShape === shape.type
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() => setSelectedShape(shape.type)}
                  >
                    <shape.icon className="w-8 h-8" />
                    <span className="text-sm">{shape.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>لون التعبئة</Label>
              <div className="grid grid-cols-10 gap-2 mt-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110',
                      shapeColor === color ? 'border-gray-800' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setShapeColor(color)}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleInsertShape}>إدراج</Button>
            </DialogFooter>
          </div>
        );

      default:
        return null;
    }
  };

  const titles: Record<string, string> = {
    tag: 'إدراج وسم',
    appointment: 'إدراج موعد',
    quote: 'إدراج اقتباس',
    code: 'إدراج كود',
    tracker: 'إدراج متتبع',
    shopping: 'إدراج قائمة تسوق',
    time: 'إدراج الوقت',
    shape: 'إدراج شكل',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{type && titles[type]}</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

// المحرر الرئيسي
export function RichTextEditor({
  content,
  onChange,
  savedTags,
  onTagsUpdate,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<ContentElement | null>(null);
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const [modalType, setModalType] = useState<'tag' | 'appointment' | 'quote' | 'code' | 'tracker' | 'shopping' | 'time' | 'shape' | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [activeTextId, setActiveTextId] = useState<string | null>(null);

  const insertTools = [
    { type: 'tag' as const, icon: Tag, label: 'وسم', color: 'text-purple-500' },
    { type: 'appointment' as const, icon: Calendar, label: 'موعد', color: 'text-amber-500' },
    { type: 'quote' as const, icon: Quote, label: 'اقتباس', color: 'text-indigo-500' },
    { type: 'code' as const, icon: Code, label: 'كود', color: 'text-slate-500' },
    { type: 'tracker' as const, icon: Activity, label: 'متتبع', color: 'text-emerald-500' },
    { type: 'shopping' as const, icon: ShoppingBag, label: 'قائمة تسوق', color: 'text-teal-500' },
    { type: 'time' as const, icon: Clock, label: 'وقت', color: 'text-blue-500' },
    { type: 'shape' as const, icon: Square, label: 'شكل', color: 'text-pink-500' },
  ];

  const handleInsertElement = (element: ContentElement) => {
    onChange([...content, element]);
    setModalType(null);
  };

  const handleUpdateElement = (id: string, updates: Partial<ContentElement>) => {
    onChange(
      content.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const handleDeleteElement = (id: string) => {
    onChange(content.filter((el) => el.id !== id));
    setSelectedElement(null);
    setSelectionPosition(null);
  };

  const handleDuplicateElement = (id: string) => {
    const element = content.find((el) => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: generateId(),
      };
      const index = content.findIndex((el) => el.id === id);
      const newContent = [...content];
      newContent.splice(index + 1, 0, newElement);
      onChange(newContent);
    }
  };

  const handleStyleChange = (style: Partial<ElementStyle>) => {
    if (!selectedElement) return;
    handleUpdateElement(selectedElement.id, {
      style: { ...selectedElement.style, ...style },
    });
  };

  const handleTextChange = (id: string, text: string) => {
    handleUpdateElement(id, { content: text });
  };

  const handleTextBlur = () => {
    setActiveTextId(null);
  };

  const addTextBlock = () => {
    const newElement: ContentElement = {
      id: generateId(),
      type: 'text',
      content: '',
      style: {},
    };
    onChange([...content, newElement]);
    setActiveTextId(newElement.id);
  };

  const renderElement = (element: ContentElement) => {
    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            className={cn(
              'relative group min-h-[40px] p-2 rounded-lg transition-colors',
              selectedElement?.id === element.id ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element);
              const rect = e.currentTarget.getBoundingClientRect();
              setSelectionPosition({ x: rect.left, y: rect.top });
            }}
          >
            {activeTextId === element.id ? (
              <Textarea
                value={element.content}
                onChange={(e) => handleTextChange(element.id, e.target.value)}
                onBlur={handleTextBlur}
                placeholder="اكتب هنا..."
                className="min-h-[60px] border-0 focus:ring-0 p-0 resize-none"
                autoFocus
              />
            ) : (
              <div
                className="whitespace-pre-wrap cursor-text"
                style={{
                  fontWeight: element.style?.bold ? 'bold' : undefined,
                  fontStyle: element.style?.italic ? 'italic' : undefined,
                  textDecoration: element.style?.underline ? 'underline' : undefined,
                  color: element.style?.color,
                  backgroundColor: element.style?.backgroundColor,
                  textAlign: element.style?.alignment,
                  fontSize: element.style?.fontSize ? `${element.style.fontSize}px` : undefined,
                }}
                onClick={() => setActiveTextId(element.id)}
              >
                {element.content || (
                  <span className="text-gray-400">انقر للكتابة...</span>
                )}
              </div>
            )}
          </div>
        );

      case 'tag':
        return (
          <span
            key={element.id}
            className={cn(
              'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-transform hover:scale-105',
              selectedElement?.id === element.id && 'ring-2 ring-purple-500'
            )}
            style={{
              backgroundColor: element.metadata?.color || '#8b5cf6',
              color: '#ffffff',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element);
              const rect = e.currentTarget.getBoundingClientRect();
              setSelectionPosition({ x: rect.left, y: rect.top });
            }}
          >
            <Tag className="w-3 h-3" />
            {element.content}
          </span>
        );

      case 'appointment':
        return (
          <div
            key={element.id}
            className={cn(
              'p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 cursor-pointer transition-all hover:shadow-md',
              selectedElement?.id === element.id && 'ring-2 ring-purple-500'
            )}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element);
              const rect = e.currentTarget.getBoundingClientRect();
              setSelectionPosition({ x: rect.left, y: rect.top });
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-700 dark:text-amber-300" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                  {element.content}
                </h4>
                <div className="flex flex-wrap gap-2 mt-1 text-sm text-amber-700 dark:text-amber-300">
                  <span>{element.metadata?.appointment?.date}</span>
                  <span>•</span>
                  <span>{element.metadata?.appointment?.time}</span>
                  {element.metadata?.appointment?.location && (
                    <>
                      <span>•</span>
                      <span>{element.metadata.appointment.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'quote':
        return (
          <div
            key={element.id}
            className={cn(
              'p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-r-4 border-purple-400 cursor-pointer transition-all hover:shadow-md',
              selectedElement?.id === element.id && 'ring-2 ring-purple-500'
            )}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element);
              const rect = e.currentTarget.getBoundingClientRect();
              setSelectionPosition({ x: rect.left, y: rect.top });
            }}
          >
            <Quote className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-lg text-gray-700 dark:text-gray-300 italic">
              "{element.content}"
            </p>
            {element.metadata?.author && (
              <p className="mt-2 text-sm text-purple-600 dark:text-purple-400 font-medium">
                — {element.metadata.author}
              </p>
            )}
          </div>
        );

      case 'code':
        return (
          <div
            key={element.id}
            className={cn(
              'rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md',
              selectedElement?.id === element.id && 'ring-2 ring-purple-500'
            )}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element);
              const rect = e.currentTarget.getBoundingClientRect();
              setSelectionPosition({ x: rect.left, y: rect.top });
            }}
          >
            <div className="bg-gray-800 dark:bg-gray-900 px-3 py-1.5 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">
                {element.metadata?.language}
              </span>
              <Code className="w-4 h-4 text-gray-400" />
            </div>
            <pre className="bg-gray-900 dark:bg-gray-950 p-4 overflow-x-auto text-sm text-gray-300 font-mono">
              <code>{element.content}</code>
            </pre>
          </div>
        );

      case 'tracker':
        const tracker = element.metadata?.tracker as Tracker;
        const progress = tracker ? (tracker.current / tracker.target) * 100 : 0;
        return (
          <div
            key={element.id}
            className={cn(
              'p-4 rounded-lg cursor-pointer transition-all hover:shadow-md',
              selectedElement?.id === element.id && 'ring-2 ring-purple-500'
            )}
            style={{ backgroundColor: tracker?.color + '15' }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element);
              const rect = e.currentTarget.getBoundingClientRect();
              setSelectionPosition({ x: rect.left, y: rect.top });
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{tracker?.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold">{tracker?.name}</h4>
                <p className="text-sm text-gray-500">
                  {tracker?.current} / {tracker?.target} {tracker?.unit}
                </p>
              </div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: tracker?.color,
                }}
              />
            </div>
          </div>
        );

      case 'shopping-list':
        return (
          <div
            key={element.id}
            className={cn(
              'p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 cursor-pointer transition-all hover:shadow-md',
              selectedElement?.id === element.id && 'ring-2 ring-purple-500'
            )}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element);
              const rect = e.currentTarget.getBoundingClientRect();
              setSelectionPosition({ x: rect.left, y: rect.top });
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">
                {element.content}
              </h4>
            </div>
            <ul className="space-y-1">
              {(element.metadata?.items as ShoppingItem[])?.map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-sm">
                  <div
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center',
                      item.checked
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-emerald-400'
                    )}
                  >
                    {item.checked && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={item.checked ? 'line-through text-gray-400' : ''}>
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'time':
        return (
          <div
            key={element.id}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 cursor-pointer transition-all hover:shadow-md',
              selectedElement?.id === element.id && 'ring-2 ring-purple-500'
            )}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element);
              const rect = e.currentTarget.getBoundingClientRect();
              setSelectionPosition({ x: rect.left, y: rect.top });
            }}
          >
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {element.content}
            </span>
          </div>
        );

      case 'shape':
        const shapeType = element.metadata?.shapeType as ShapeType;
        return (
          <div
            key={element.id}
            className={cn(
              'inline-block cursor-pointer transition-all hover:shadow-md',
              selectedElement?.id === element.id && 'ring-2 ring-purple-500'
            )}
            style={{
              width: element.size?.width || 100,
              height: element.size?.height || 100,
              backgroundColor: element.metadata?.fillColor,
              borderRadius: shapeType === 'circle' ? '50%' : 8,
              clipPath:
                shapeType === 'triangle'
                  ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                  : shapeType === 'star'
                  ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                  : undefined,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element);
              const rect = e.currentTarget.getBoundingClientRect();
              setSelectionPosition({ x: rect.left, y: rect.top });
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* شريط الأدوات العلوي */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {/* أدوات التنسيق */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => addTextBlock()}
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Underline className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* أدوات الإدراج */}
          <div className="flex items-center gap-1">
            {insertTools.map((tool) => (
              <Button
                key={tool.type}
                variant="ghost"
                size="sm"
                className="h-8 px-2 gap-1"
                onClick={() => setModalType(tool.type)}
              >
                <tool.icon className={cn('w-4 h-4', tool.color)} />
                <span className="hidden sm:inline text-xs">{tool.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* منطقة التحرير */}
      <div
        ref={editorRef}
        className="min-h-[400px] p-4 space-y-3"
        onClick={() => {
          setSelectedElement(null);
          setSelectionPosition(null);
        }}
      >
        {content.length === 0 ? (
          <div
            className="min-h-[300px] flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            onClick={addTextBlock}
          >
            <Plus className="w-12 h-12 mb-2" />
            <p className="text-lg font-medium">ابدأ الكتابة</p>
            <p className="text-sm">أو استخدم الأدوات أعلاه لإدراج عناصر</p>
          </div>
        ) : (
          <>
            {content.map(renderElement)}
            <Button
              variant="ghost"
              className="w-full h-12 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:text-purple-500 hover:border-purple-300"
              onClick={addTextBlock}
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة نص
            </Button>
          </>
        )}
      </div>

      {/* شريط الأدوات العائم */}
      <FloatingToolbar
        selectedElement={selectedElement}
        onStyleChange={handleStyleChange}
        onDelete={() => selectedElement && handleDeleteElement(selectedElement.id)}
        onDuplicate={() => selectedElement && handleDuplicateElement(selectedElement.id)}
        position={selectionPosition}
      />

      {/* نافذة الإدراج */}
      <ToolModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        onInsert={handleInsertElement}
        type={modalType}
        savedTags={savedTags}
        onTagsUpdate={onTagsUpdate}
      />
    </div>
  );
}
