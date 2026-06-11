import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Lightbulb, AlertTriangle, RefreshCw, Trash2, Clock } from 'lucide-react';
import { Card, Button } from './UI';
import { AppData } from '../types';
import { getProactiveSuggestions, Suggestion } from '../services/geminiService';
import { cn } from '../lib/utils';

interface MaintenanceSuggestionsProps {
  data: AppData;
  vehicleId: string;
}

const MaintenanceIcon = ({ 
  name, 
  priority, 
  className 
}: { 
  name: 'preventative' | 'educational' | 'dismiss' | 'snooze', 
  priority?: Suggestion['priority'],
  className?: string
}) => {
  switch (name) {
    case 'preventative':
      return (
        <AlertTriangle className={cn(
          "w-4 h-4",
          priority === 'high' ? "text-red-500" : "text-orange-500",
          className
        )} />
      );
    case 'educational':
      return <Lightbulb className={cn("w-4 h-4 text-blue-500", className)} />;
    case 'dismiss':
      return <Trash2 className={cn("w-3.5 h-3.5", className)} />;
    case 'snooze':
      return <Clock className={cn("w-3.5 h-3.5", className)} />;
    default:
      return null;
  }
};

export function MaintenanceSuggestions({ data, vehicleId }: MaintenanceSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('autolog_dismissed_suggestions');
    return saved ? JSON.parse(saved) : [];
  });
  const [snoozedUntil, setSnoozedUntil] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('autolog_snoozed_suggestions');
    return saved ? JSON.parse(saved) : {};
  });

  const getStableId = (s: Suggestion) => `${s.vehicleId}-${s.title}`;

  useEffect(() => {
    localStorage.setItem('autolog_dismissed_suggestions', JSON.stringify(dismissedIds));
  }, [dismissedIds]);

  useEffect(() => {
    localStorage.setItem('autolog_snoozed_suggestions', JSON.stringify(snoozedUntil));
  }, [snoozedUntil]);

  useEffect(() => {
    fetchSuggestions();
  }, [vehicleId]);

  const fetchSuggestions = async () => {
    if (!vehicleId) return;
    setLoading(true);
    try {
      const results = await getProactiveSuggestions(data, vehicleId);
      setSuggestions(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (s: Suggestion) => {
    const stableId = getStableId(s);
    setDismissedIds(prev => [...prev, stableId]);
  };

  const handleSnooze = (s: Suggestion) => {
    const stableId = getStableId(s);
    const until = Date.now() + (3 * 24 * 60 * 60 * 1000); // 3 days
    setSnoozedUntil(prev => ({ ...prev, [stableId]: until }));
  };

  const visibleSuggestions = useMemo(() => {
    const now = Date.now();
    return suggestions.filter(s => {
      const stableId = getStableId(s);
      if (dismissedIds.includes(stableId)) return false;
      const snoozeTime = snoozedUntil[stableId];
      if (snoozeTime && snoozeTime > now) return false;
      return true;
    });
  }, [suggestions, dismissedIds, snoozedUntil]);

  if (!vehicleId) return null;

  return (
    <Card 
      title="توصيات صيانة ذكية" 
      subtitle="نصائح استباقية مبنية على سجل مركبتك"
      icon={Sparkles}
      extra={
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={fetchSuggestions} 
          disabled={loading}
          className={cn(loading && "animate-spin")}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      }
    >
      <div className="space-y-4">
        {loading ? (
          <div className="py-10 text-center space-y-3">
             <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
             </div>
             <p className="text-xs text-text-muted font-bold">جاري تحليل بياناتك واستنباط التوصيات...</p>
          </div>
        ) : visibleSuggestions.length === 0 ? (
          <div className="py-10 text-center">
            <Lightbulb className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-20" />
            <p className="text-xs text-text-muted font-bold">لا توجد توصيات حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {visibleSuggestions.map((s) => (
              <div 
                key={s.id} 
                className={cn(
                  "p-4 rounded-xl border flex flex-col gap-2 transition-all relative group",
                  s.priority === 'high' ? "bg-red-50 border-red-100" : 
                  s.priority === 'medium' ? "bg-orange-50 border-orange-100" :
                  "bg-blue-50 border-blue-100"
                )}
              >
                <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 p-1 text-text-muted hover:text-red-500 hover:bg-red-50"
                    onClick={() => handleDismiss(s)}
                    title="تجاهل"
                  >
                    <MaintenanceIcon name="dismiss" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 p-1 text-text-muted hover:text-amber-500 hover:bg-amber-50"
                    onClick={() => handleSnooze(s)}
                    title="تأجيل (3 أيام)"
                  >
                    <MaintenanceIcon name="snooze" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 pl-14">
                  <MaintenanceIcon name={s.type} priority={s.priority} />
                  <h4 className="text-sm font-bold text-text-main">{s.title}</h4>
                </div>
                <p className="text-xs text-text-muted leading-relaxed font-medium">
                  {s.description}
                </p>
                <div className="mt-2 flex items-center justify-between">
                   <span className={cn(
                     "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                     s.priority === 'high' ? "bg-red-100 border-red-200 text-red-700" : 
                     s.priority === 'medium' ? "bg-orange-100 border-orange-200 text-orange-700" :
                     "bg-blue-100 border-blue-200 text-blue-700"
                   )}>
                      أولوية {s.priority === 'high' ? 'عالية' : s.priority === 'medium' ? 'متوسطة' : 'عادية'}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
