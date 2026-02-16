import { NextRequest, NextResponse } from 'next/server';

interface JournalEntry {
  id: string;
  title: string;
  content: { type: string; content: string }[];
  mood?: string;
  tags: string[];
  date: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, entries, history, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({
        response: 'يرجى إدخال Gemini API Key في الإعدادات لاستخدام المساعد الذكي.',
      });
    }

    // بناء السياق من اليوميات
    let contextText = 'فيما يلي ملخص ليوميات المستخدم:\n\n';
    
    if (entries && entries.length > 0) {
      const recentEntries = entries.slice(0, 20);
      recentEntries.forEach((entry: JournalEntry) => {
        const content = entry.content
          .filter((el: { type: string }) => el.type === 'text')
          .map((el: { content: string }) => el.content)
          .join(' ')
          .substring(0, 200);
        
        contextText += `- التاريخ: ${entry.date}\n`;
        contextText += `  العنوان: ${entry.title || 'بدون عنوان'}\n`;
        contextText += `  المحتوى: ${content}...\n`;
        if (entry.mood) contextText += `  المزاج: ${entry.mood}\n`;
        if (entry.tags.length > 0) contextText += `  الوسوم: ${entry.tags.join(', ')}\n`;
        contextText += '\n';
      });
    } else {
      contextText = 'لا توجد يوميات مسجلة بعد.\n';
    }

    // بناء سجل المحادثة
    const conversationHistory = (history || [])
      .slice(-5)
      .map((msg: Message) => `${msg.role === 'user' ? 'المستخدم' : 'المساعد'}: ${msg.content}`)
      .join('\n\n');

    // إعداد الـ prompt
    const systemPrompt = `أنت مساعد ذكي متخصص في تحليل اليوميات والمذكرات الشخصية. 
تساعد المستخدم في فهم مشاعره وأنماط حياته من خلال تدويناته.
يجب أن ترد باللغة العربية دائماً وبأسلوب ودود ومتعاطف.
استخدم الإيموجي بشكل معتدل لإضفاء طابع ودي.

إحصائيات اليوميات:
- عدد التدوينات: ${entries?.length || 0}
${entries?.length > 0 ? `- آخر تدوينة: ${entries[0]?.date}` : ''}

${contextText}

${conversationHistory ? `سجل المحادثة السابقة:\n${conversationHistory}\n\n` : ''}

المستخدم: ${message}

المساعد:`;

    // استدعاء Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'عذراً، لم أتمكن من معالجة طلبك.';

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({
      response:
        'عذراً، حدث خطأ في الاتصال بالمساعد الذكي. تأكد من صحة API Key وحاول مرة أخرى.',
    });
  }
}
