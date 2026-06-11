import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Search, MessageSquare, AlertCircle, RefreshCcw } from 'lucide-react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Button, Card } from './UI';
import { format } from 'date-fns';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  sources?: { title: string; url: string }[];
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'مرحباً بك! أنا مساعدك الذكي من أوتو كير. يمكنني مساعدتك في البحث عن أخبار السيارات، التحقق من مواعيد الصيانة، أو تزويدك بمعلومات فورية حول الطقس والأسعار. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for chat
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await (ai.models as any).generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: `أنت مساعد ذكي لتطبيق "أوتو كير" (AutoCare) لإدارة المركبات.
أنت خبير في السيارات، الصيانة، وأخبار النقل.
استخدم البحث في جوجل (Google Search) دائماً لتوفير معلومات دقيقة وحديثة حول الأسعار، الأخبار، والطقس إذا لزم الأمر.
اجعل إجاباتك سريعة، مفيدة، وباللغة العربية الفصحى أو بلهجة مفهومة.
تأكد من ذكر المصادر إذا قمت باستخدام البحث.`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
        tools: [{ googleSearch: {} }]
      });

      const modelText = response.text;
      
      // Extract grounding metadata if available (sources)
      const sources: { title: string; url: string }[] = [];
      const groundingMetadata = (response.candidates?.[0] as any)?.groundingMetadata;
      
      if (groundingMetadata?.groundingChunks) {
        groundingMetadata.groundingChunks.forEach((chunk: any) => {
          if (chunk.web) {
            sources.push({ title: chunk.web.title, url: chunk.web.uri });
          }
        });
      }

      const modelMessage: Message = {
        role: 'model',
        content: modelText || 'عذراً، لم أتمكن من معالجة الطلب حالياً.',
        timestamp: new Date(),
        sources: sources.length > 0 ? sources : undefined
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        role: 'model',
        content: 'عذراً، حدث خطأ أثناء الاتصال بالخادم الذكي. يرجى المحاولة لاحقاً.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-border-main overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border-main bg-gradient-to-r from-brand/5 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">المساعد الذكي (AutoCare AI)</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs text-text-muted font-bold uppercase tracking-widest">مدعوم بـ Google Search & Flash-Lite</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMessages([{
          role: 'model',
          content: 'تم بدء محادثة جديدة. كيف يمكنني مساعدتك؟',
          timestamp: new Date(),
        }])}>
          <RefreshCcw className="w-4 h-4 ml-2" />
          محادثة جديدة
        </Button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FDFDFD]"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                m.role === 'user' ? "mr-auto flex-row-reverse" : "ml-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                m.role === 'user' ? "bg-brand text-white" : "bg-gray-100 text-brand"
              )}>
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className="space-y-2">
                <div className={cn(
                  "p-5 rounded-2xl shadow-sm text-sm leading-relaxed",
                  m.role === 'user' 
                    ? "bg-brand text-white rounded-tl-none font-medium" 
                    : "bg-white border border-border-main text-gray-800 rounded-tr-none"
                )}>
                  {m.content}
                </div>
                
                {m.sources && m.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {m.sources.map((s, i) => (
                      <a 
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-text-muted px-2 py-1 rounded-full flex items-center gap-1 transition-colors border border-border-main"
                      >
                        <Search className="w-2.5 h-2.5" />
                        {s.title}
                      </a>
                    ))}
                  </div>
                )}
                
                <p className="text-[10px] text-text-muted font-bold opacity-50 px-1">
                  {format(m.timestamp, 'HH:mm')}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-4 ml-auto max-w-[85%] animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-brand">
              <RefreshCcw className="w-5 h-5 animate-spin" />
            </div>
            <div className="p-5 rounded-2xl bg-white border border-border-main rounded-tr-none space-y-2 w-48">
              <div className="h-2 bg-gray-200 rounded w-full" />
              <div className="h-2 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-border-main bg-white">
        <div className="relative max-w-4xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اسألني عن أسعار الوقود اليوم، أو آخر أخبار تويوتا، أو نصيحة صيانة..."
            className="w-full pl-24 pr-6 py-4 bg-gray-50 border border-border-main rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all text-sm font-medium"
          />
          <div className="absolute left-2 top-2 flex gap-2">
             <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className="rounded-xl px-6 h-12 shadow-lg shadow-brand/10"
              >
                {isLoading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">
           <div className="flex items-center gap-1.5 line-through decoration-brand/30">
              <MessageSquare className="w-3 h-3" />
              دردشة ذكية
           </div>
           <div className="flex items-center gap-1.5">
              <Search className="w-3 h-3" />
              بحث فورى في جوجل
           </div>
           <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" />
              تحقق من الأخبار
           </div>
        </div>
      </div>
    </div>
  );
}
