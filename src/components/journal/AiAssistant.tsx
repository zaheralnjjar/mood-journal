'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User, Loader2, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, generateId } from '@/lib/journal/utils';
import type { AiMessage, JournalEntry } from '@/lib/journal/types';

interface AiAssistantProps {
  entries: JournalEntry[];
  apiKey?: string;
  onApiKeyChange?: (key: string) => void;
}

const SUGGESTED_QUESTIONS = [
  'ما هي أكثر المزاج التي سجلته؟',
  'لخص لي أسبوعي الماضي',
  'ما هي الأشياء التي أشعر بالامتنان لها؟',
  'كيف كانت صحتي النفسية هذا الشهر؟',
  'اقترح لي أهداف للشهر القادم',
];

export function AiAssistant({ entries, apiKey, onApiKeyChange }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey || '');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: AiMessage = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // إرسال الرسالة للـ API
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          entries: entries.slice(0, 50), // آخر 50 تدوينة للسياق
          history: messages.slice(-10), // آخر 10 رسائل للسياق
          apiKey: apiKey || tempApiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: AiMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.response || 'عذراً، حدث خطأ في معالجة طلبك.',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: AiMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ في الاتصال بالمساعد الذكي. تأكد من إعدادات API Key.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  const clearHistory = () => {
    setMessages([]);
  };

  const saveApiKey = () => {
    if (onApiKeyChange) {
      onApiKeyChange(tempApiKey);
    }
    setShowSettings(false);
  };

  return (
    <>
      {/* زر فتح المساعد */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 left-6 w-14 h-14 rounded-full shadow-lg z-50',
          'bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
          isOpen && 'hidden'
        )}
        size="icon"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>

      {/* نافذة المساعد */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-[380px] h-[550px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* رأس النافذة */}
          <div className="bg-gradient-to-l from-purple-500 to-pink-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">المساعد الذكي</h3>
                  <p className="text-xs text-white/80">أسال عن يومياتك</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* إعدادات API */}
          {showSettings && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <Input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="أدخل Gemini API Key..."
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveApiKey} className="flex-1">
                    حفظ
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSettings(false)}
                  >
                    إلغاء
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  ستحتاج إلى Gemini API Key من Google AI Studio
                </p>
              </div>
            </div>
          )}

          {/* الرسائل */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="w-12 h-12 text-purple-300 dark:text-purple-600 mb-4" />
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  مرحباً! أنا مساعدك الذكي
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  يمكنني مساعدتك في تحليل يومياتك والإجابة على أسئلتك
                </p>

                {/* أسئلة مقترحة */}
                <div className="space-y-2 w-full">
                  {SUGGESTED_QUESTIONS.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="w-full text-right text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-gray-700 dark:text-gray-300"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-3',
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    )}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback
                        className={cn(
                          msg.role === 'user'
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-pink-100 text-pink-600'
                        )}
                      >
                        {msg.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        'max-w-[80%] p-3 rounded-2xl text-sm',
                        msg.role === 'user'
                          ? 'bg-purple-500 text-white rounded-tl-none'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tr-none'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-pink-100 text-pink-600">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tr-none">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* حقل الإدخال */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="اكتب سؤالك..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Send className="w-4 h-4" />
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearHistory}
                  className="text-gray-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
