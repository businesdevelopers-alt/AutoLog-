/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Car, 
  Wrench, 
  CreditCard, 
  LayoutDashboard, 
  Plus, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  Fuel,
  Settings,
  ChevronRight,
  ChevronLeft,
  LayoutList,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  History,
  Palette,
  ArrowUpDown,
  Filter,
  Share2,
  Copy,
  Mail,
  ExternalLink,
  Bell,
  CheckCircle2,
  Search,
  Trash2,
  Printer,
  FileText,
  GitCompare,
  AlertTriangle,
  Zap,
  Thermometer,
  Cpu,
  Maximize,
  Disc,
  Droplets,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Legend,
  Brush,
  Cell,
  ReferenceLine
} from 'recharts';
import { format, subMonths, addMonths, isAfter, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { arSA } from 'date-fns/locale';

import { AppData, Vehicle, MaintenanceRecord, Expense, AppTheme, FuelRecord, MaintenanceReminder, Breakdown, BreakdownCategory } from './types';
import { MAINTENANCE_TYPES, EXPENSE_CATEGORIES, PREDEFINED_THEMES, BREAKDOWN_CATEGORIES } from './constants';
import { cn, formatCurrency, formatNumber } from './lib/utils';
import { Card, Button, Modal } from './components/UI';
import { MaintenanceSuggestions } from './components/MaintenanceSuggestions';

import { AIAssistant } from './components/AIAssistant';

const INITIAL_DATA: AppData = {
  vehicles: [],
  records: [],
  expenses: [],
  fuelRecords: [],
  reminders: [],
  breakdowns: [],
};

type View = 'dashboard' | 'vehicles' | 'records' | 'expenses' | 'fuel' | 'reports' | 'compare' | 'breakdowns' | 'settings' | 'ai-assistant';

export default function App() {
  const [data, setData] = React.useState<AppData>(() => {
    const saved = localStorage.getItem('autolog_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  // Modals state
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [sharingVehicleId, setSharingVehicleId] = useState<string | null>(null);

  // Report Filters
  const [reportConfig, setReportConfig] = useState({
    vehicleId: 'all',
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const [selectedComparisonIds, setSelectedComparisonIds] = useState<string[]>([]);
  const [suggestionVehicleId, setSuggestionVehicleId] = useState<string | null>(null);
  const [breakdownFilter, setBreakdownFilter] = useState<BreakdownCategory | 'all'>('all');

  // Sorting and Filtering State
  const [recordsSort, setRecordsSort] = useState<{ key: keyof MaintenanceRecord | 'vehicle'; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [recordsFilter, setRecordsFilter] = useState<string>('');
  
  const [expensesSort, setExpensesSort] = useState<{ key: keyof Expense | 'vehicle'; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [expensesFilter, setExpensesFilter] = useState<string>('');
  
  const [fuelSort, setFuelSort] = useState<{ key: keyof FuelRecord | 'vehicle'; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [fuelFilter, setFuelFilter] = useState<string>('');
  const [fuelUnit, setFuelUnit] = useState<'l100' | 'mpg'>('l100');
  const [breakdownViewMode, setBreakdownViewMode] = useState<'list' | 'calendar'>('list');
  const [currentBreakdownMonth, setCurrentBreakdownMonth] = useState(new Date());

  const [breakdownSort, setBreakdownSort] = useState<{ key: 'date' | 'cost' | 'category' | 'vehicle'; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [breakdownDateRange, setBreakdownDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [breakdownCostRange, setBreakdownCostRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

  useEffect(() => {
    if (data.vehicles.length > 0 && !suggestionVehicleId) {
      setSuggestionVehicleId(data.vehicles[0].id);
    }
  }, [data.vehicles]);

  // Handle shared link on load
  const [sharedData, setSharedData] = useState<{ vehicle: Vehicle; records: MaintenanceRecord[]; expenses: Expense[] } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedStr = params.get('share');
    if (sharedStr) {
      try {
        const decoded = JSON.parse(atob(sharedStr));
        setSharedData(decoded);
      } catch (e) {
        console.error('Failed to decode shared data', e);
      }
    }
  }, []);

  React.useLayoutEffect(() => {
    if (data.theme) {
      document.documentElement.style.setProperty('--brand', data.theme.primary);
      document.documentElement.style.setProperty('--brand-hover', data.theme.primaryHover);
    } else {
      document.documentElement.style.removeProperty('--brand');
      document.documentElement.style.removeProperty('--brand-hover');
    }
  }, [data.theme]);

  useEffect(() => {
    localStorage.setItem('autolog_data', JSON.stringify(data));
  }, [data]);

  const selectedVehicle = useMemo(() => 
    data.vehicles.find(v => v.id === selectedVehicleId) || null,
  [data.vehicles, selectedVehicleId]);

  // Derived Statistics
  const stats = useMemo(() => {
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalMaintenanceCost = data.records.reduce((sum, r) => sum + r.cost, 0);
    const totalFuelCost = (data.fuelRecords || []).reduce((sum, f) => sum + f.cost, 0);
    const lastMonthExpense = data.expenses
      .filter(e => isAfter(parseISO(e.date), subMonths(new Date(), 1)))
      .reduce((sum, e) => sum + e.amount, 0);
    
    return {
      totalVehicles: data.vehicles.length,
      totalSpend: totalExpenses + totalMaintenanceCost + totalFuelCost,
      lastMonthSpend: lastMonthExpense,
      maintCount: data.records.length,
    };
  }, [data]);

  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(new Date(), 5 - i);
      const monthStr = format(d, 'MMM', { locale: arSA });
      const monthKey = format(d, 'yyyy-MM');
      
      const monthlyExp = data.expenses
        .filter(e => e.date.startsWith(monthKey))
        .reduce((sum, e) => sum + e.amount, 0);
      
      const monthlyMaint = data.records
        .filter(r => r.date.startsWith(monthKey))
        .reduce((sum, r) => sum + r.cost, 0);

      return {
        name: monthStr,
        amount: monthlyExp + monthlyMaint,
      };
    });
    return months;
  }, [data]);

  const baseFilteredBreakdowns = useMemo(() => {
    return (data.breakdowns || []).filter(b => {
      if (breakdownDateRange.start && b.date < breakdownDateRange.start) return false;
      if (breakdownDateRange.end && b.date > breakdownDateRange.end) return false;
      if (breakdownCostRange.min && b.cost < (parseFloat(breakdownCostRange.min) || 0)) return false;
      if (breakdownCostRange.max && b.cost > (parseFloat(breakdownCostRange.max) || Infinity)) return false;
      return true;
    });
  }, [data.breakdowns, breakdownDateRange, breakdownCostRange]);

  const breakdownChartData = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(new Date(), 5 - i);
      const monthStr = format(d, 'MMM', { locale: arSA });
      const monthKey = format(d, 'yyyy-MM');
      
      const counts: any = { name: monthStr };
      Object.keys(BREAKDOWN_CATEGORIES).forEach(cat => {
        counts[cat] = baseFilteredBreakdowns
          .filter(b => b.date.startsWith(monthKey) && b.category === cat)
          .length;
      });
      
      return counts;
    });
    return months;
  }, [baseFilteredBreakdowns]);

  const processedBreakdowns = useMemo(() => {
    return [...baseFilteredBreakdowns].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (breakdownSort.key === 'vehicle') {
        aVal = data.vehicles.find(v => v.id === a.vehicleId)?.model || '';
        bVal = data.vehicles.find(v => v.id === b.vehicleId)?.model || '';
      } else if (breakdownSort.key === 'category') {
        aVal = BREAKDOWN_CATEGORIES[a.category].label;
        bVal = BREAKDOWN_CATEGORIES[b.category].label;
      } else {
        aVal = a[breakdownSort.key];
        bVal = b[breakdownSort.key];
      }

      if (aVal < bVal) return breakdownSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return breakdownSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [baseFilteredBreakdowns, data.vehicles, breakdownSort]);

  const breakdownSummary = useMemo(() => {
    const summary: Record<string, { count: number; totalCost: number }> = {};
    
    Object.keys(BREAKDOWN_CATEGORIES).forEach(cat => {
      summary[cat] = { count: 0, totalCost: 0 };
    });

    baseFilteredBreakdowns.forEach(b => {
      if (summary[b.category]) {
        summary[b.category].count += 1;
        summary[b.category].totalCost += b.cost;
      }
    });

    return summary;
  }, [baseFilteredBreakdowns]);

  const breakdownTotals = useMemo(() => {
    return (Object.values(breakdownSummary) as { count: number; totalCost: number }[]).reduce((acc, s) => ({
      count: acc.count + s.count,
      totalCost: acc.totalCost + s.totalCost
    }), { count: 0, totalCost: 0 });
  }, [breakdownSummary]);

  const categoryColors: Record<BreakdownCategory, string> = {
    engine: '#3B82F6',
    transmission: '#10B981',
    electrical: '#F59E0B',
    cooling: '#EF4444',
    suspension: '#8B5CF6',
    brakes: '#EC4899',
    other: '#6B7280'
  };

  const fuelComparisonData = useMemo(() => {
    return selectedComparisonIds.map(vId => {
      const v = data.vehicles.find(v => v.id === vId);
      const fuelRecords = (data.fuelRecords || []).filter(f => f.vehicleId === vId);
      
      let l100 = 0;
      let mpg = 0;
      
      if (fuelRecords.length >= 2) {
        const sorted = [...fuelRecords].sort((a,b) => a.odometer - b.odometer);
        const dist = sorted[sorted.length - 1].odometer - sorted[0].odometer;
        if (dist > 0) {
          const liters = sorted.slice(1).reduce((s, r) => s + r.liters, 0);
          l100 = (liters / (dist / 100));
          mpg = l100 > 0 ? (235.215 / l100) : 0;
        }
      }
      
      return {
        name: v?.model || '—',
        l100: parseFloat(l100.toFixed(2)),
        mpg: parseFloat(mpg.toFixed(2))
      };
    });
  }, [data.fuelRecords, selectedComparisonIds, data.vehicles]);

  const sortedRecords = useMemo(() => {
    let filtered = selectedVehicleId ? data.records.filter(r => r.vehicleId === selectedVehicleId) : [...data.records];
    
    if (recordsFilter) {
      const query = recordsFilter.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) || 
        (r.notes || '').toLowerCase().includes(query) ||
        data.vehicles.find(v => v.id === r.vehicleId)?.model.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (recordsSort.key === 'vehicle') {
        aVal = data.vehicles.find(v => v.id === a.vehicleId)?.model || '';
        bVal = data.vehicles.find(v => v.id === b.vehicleId)?.model || '';
      } else {
        aVal = a[recordsSort.key];
        bVal = b[recordsSort.key];
      }

      if (aVal < bVal) return recordsSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return recordsSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data.records, data.vehicles, selectedVehicleId, recordsSort, recordsFilter]);

  const sortedExpenses = useMemo(() => {
    let filtered = [...data.expenses];
    
    if (expensesFilter) {
      const query = expensesFilter.toLowerCase();
      filtered = filtered.filter(e => 
        (e.notes || '').toLowerCase().includes(query) ||
        EXPENSE_CATEGORIES[e.category].label.toLowerCase().includes(query) ||
        data.vehicles.find(v => v.id === e.vehicleId)?.model.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (expensesSort.key === 'vehicle') {
        aVal = data.vehicles.find(v => v.id === a.vehicleId)?.model || '';
        bVal = data.vehicles.find(v => v.id === b.vehicleId)?.model || '';
      } else {
        aVal = a[expensesSort.key];
        bVal = b[expensesSort.key];
      }

      if (aVal < bVal) return expensesSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return expensesSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data.expenses, data.vehicles, expensesSort, expensesFilter]);

  const sortedFuel = useMemo(() => {
    let filtered = [...(data.fuelRecords || [])];
    
    if (fuelFilter) {
      const query = fuelFilter.toLowerCase();
      filtered = filtered.filter(f => 
        (f.station || '').toLowerCase().includes(query) ||
        data.vehicles.find(v => v.id === f.vehicleId)?.model.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (fuelSort.key === 'vehicle') {
        aVal = data.vehicles.find(v => v.id === a.vehicleId)?.model || '';
        bVal = data.vehicles.find(v => v.id === b.vehicleId)?.model || '';
      } else {
        aVal = a[fuelSort.key];
        bVal = b[fuelSort.key];
      }

      if (aVal < bVal) return fuelSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return fuelSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data.fuelRecords, data.vehicles, fuelSort, fuelFilter]);

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle = { ...vehicle, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, vehicles: [...prev.vehicles, newVehicle] }));
    setIsVehicleModalOpen(false);
  };

  const addRecord = (record: Omit<MaintenanceRecord, 'id'>) => {
    const newRecord = { ...record, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, records: [...prev.records, newRecord] }));
    setIsRecordModalOpen(false);
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, expenses: [...prev.expenses, newExpense] }));
    setIsExpenseModalOpen(false);
  };

  const addFuelRecord = (record: Omit<FuelRecord, 'id'>) => {
    const newRecord = { ...record, id: crypto.randomUUID() };
    setData(prev => ({ 
      ...prev, 
      fuelRecords: [...(prev.fuelRecords || []), newRecord],
      vehicles: prev.vehicles.map(v => v.id === record.vehicleId ? { ...v, currentOdometer: Math.max(v.currentOdometer, record.odometer) } : v)
    }));
    setIsFuelModalOpen(false);
  };

  const addReminder = (reminder: Omit<MaintenanceReminder, 'id' | 'isCompleted'>) => {
    const newReminder = { ...reminder, id: crypto.randomUUID(), isCompleted: false };
    setData(prev => ({ ...prev, reminders: [...(prev.reminders || []), newReminder] }));
    setIsReminderModalOpen(false);
  };

  const toggleReminder = (id: string) => {
    setData(prev => ({
      ...prev,
      reminders: (prev.reminders || []).map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r)
    }));
  };

  const deleteReminder = (id: string) => {
    setData(prev => ({
      ...prev,
      reminders: (prev.reminders || []).filter(r => r.id !== id)
    }));
  };

  const addBreakdown = (breakdown: Omit<Breakdown, 'id'>) => {
    const newBreakdown = { ...breakdown, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, breakdowns: [...(prev.breakdowns || []), newBreakdown] }));
    setIsBreakdownModalOpen(false);
  };

  const deleteBreakdown = (id: string) => {
    if (confirm('هل أنت متأكد من حذف سجل العطل هذا؟')) {
      setData(prev => ({
        ...prev,
        breakdowns: (prev.breakdowns || []).filter(b => b.id !== id)
      }));
    }
  };

  const deleteVehicle = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المركبة وكل سجلاتها؟ / Are you sure you want to delete this vehicle and all its records?')) {
      setData(prev => ({
        vehicles: prev.vehicles.filter(v => v.id !== id),
        records: prev.records.filter(r => r.vehicleId !== id),
        expenses: prev.expenses.filter(e => e.vehicleId !== id),
        fuelRecords: (prev.fuelRecords || []).filter(f => f.vehicleId !== id),
        reminders: (prev.reminders || []).filter(r => r.vehicleId !== id),
        breakdowns: (prev.breakdowns || []).filter(b => b.vehicleId !== id),
      }));
      if (selectedVehicleId === id) setSelectedVehicleId(null);
    }
  };

  const generateReportText = (vehicleId: string) => {
    const vehicle = data.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return '';

    const records = data.records.filter(r => r.vehicleId === vehicleId).slice(0, 10);
    const expenses = data.expenses.filter(e => e.vehicleId === vehicleId).slice(0, 10);
    const fuel = (data.fuelRecords || []).filter(f => f.vehicleId === vehicleId).slice(0, 10);

    let report = `تقرير صيانة مركبة: ${vehicle.make} ${vehicle.model} (${vehicle.year})\n`;
    report += `رقم اللوحة: ${vehicle.licensePlate}\n`;
    report += `العداد الحالي: ${formatNumber(vehicle.currentOdometer)} كم\n\n`;

    if (records.length > 0) {
      report += `-- سجلات الصيانة الأخيرة --\n`;
      records.forEach(r => report += `• ${r.date}: ${r.title} (${formatCurrency(r.cost)})\n`);
      report += `\n`;
    }

    if (expenses.length > 0) {
      report += `-- المصاريف الأخرى --\n`;
      expenses.forEach(e => report += `• ${e.date}: ${EXPENSE_CATEGORIES[e.category].label} (${formatCurrency(e.amount)})\n`);
    }

    return report;
  };

  const handleShareEmail = (vehicleId: string) => {
    const report = generateReportText(vehicleId);
    const vehicle = data.vehicles.find(v => v.id === vehicleId);
    const subject = encodeURIComponent(`تقرير صيانة: ${vehicle?.make} ${vehicle?.model}`);
    const body = encodeURIComponent(report);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopyLink = (vehicleId: string) => {
    const vehicle = data.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    // Create a compact version of data to keep URL manageable
    const records = data.records.filter(r => r.vehicleId === vehicleId).slice(0, 5);
    const expenses = data.expenses.filter(e => e.vehicleId === vehicleId).slice(0, 5);
    
    const payload = JSON.stringify({ vehicle, records, expenses });
    const encoded = btoa(payload);
    const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    
    navigator.clipboard.writeText(url);
    alert('تم نسخ رابط التقرير إلى الحافظة');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900" dir="rtl">
      {/* Shared Report View Overlay */}
      <AnimatePresence>
        {sharedData && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background p-4 md:p-10 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto space-y-8">
              <header className="flex justify-between items-center border-b border-border-main pb-6">
                <div>
                  <h1 className="text-3xl font-bold text-text-main">تقرير صيانة مشارك</h1>
                  <p className="text-text-muted mt-1">تطبيق أوتو كير للمركبات</p>
                </div>
                <Button onClick={() => setSharedData(null)}>إغلاق التقرير</Button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="بيانات المركبة">
                  <div className="space-y-4">
                     <div className="flex justify-between">
                        <span className="text-text-muted font-bold text-xs uppercase">المركبة</span>
                        <span className="text-text-main font-bold">{sharedData.vehicle.make} {sharedData.vehicle.model}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-text-muted font-bold text-xs uppercase">سنة الصنع</span>
                        <span className="text-text-main font-bold">{sharedData.vehicle.year}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-text-muted font-bold text-xs uppercase">رقم اللوحة</span>
                        <span className="text-text-main font-bold">{sharedData.vehicle.licensePlate}</span>
                     </div>
                  </div>
                </Card>

                <Card title="ملخص العمليات">
                  <div className="space-y-4">
                     <div className="flex justify-between">
                        <span className="text-text-muted font-bold text-xs uppercase">إجمالي السجلات</span>
                        <span className="text-text-main font-bold">{sharedData.records.length} سجل</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-text-muted font-bold text-xs uppercase">التكلفة الإجمالية</span>
                        <span className="text-brand font-bold">
                          {formatCurrency(sharedData.records.reduce((s, r) => s + r.cost, 0))}
                        </span>
                     </div>
                  </div>
                </Card>
              </div>

              <Card title="سجل الصيانة" className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-[#F9FAFB] border-b border-border-main">
                    <tr>
                      <th className="p-4 font-bold text-[11px] text-text-muted uppercase">التاريخ</th>
                      <th className="p-4 font-bold text-[11px] text-text-muted uppercase">الخدمة</th>
                      <th className="p-4 font-bold text-[11px] text-text-muted uppercase text-left">التكلفة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sharedData.records.map(record => (
                      <tr key={record.id} className="border-b border-border-main text-sm">
                        <td className="p-4 font-semibold text-text-muted">{record.date}</td>
                        <td className="p-4 text-text-main font-bold">{record.title}</td>
                        <td className="p-4 text-left font-bold text-brand">{formatCurrency(record.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sidebar */}
      <aside className="w-72 bg-white border-l border-border-main hidden md:flex flex-col z-10">
        <div className="p-8">
          <div className="flex items-center gap-3 text-brand">
            <div className="w-8 h-8 bg-brand rounded-lg shadow-sm" />
            <span className="text-xl font-bold tracking-tight">أوتو كير</span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-6">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-4 px-4">القائمة الرئيسية</p>
            <div className="space-y-1">
              {[
                { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
                { id: 'vehicles', label: 'المركبات المضافة', icon: Car },
                { id: 'records', label: 'سجلات الصيانة', icon: Wrench },
                { id: 'expenses', label: 'المصاريف والفواتير', icon: CreditCard },
                { id: 'fuel', label: 'سجل الوقود', icon: Fuel },
                { id: 'reports', label: 'التقارير المالية', icon: FileText },
                { id: 'compare', label: 'مقارنة المركبات', icon: GitCompare },
                { id: 'breakdowns', label: 'سجل الأعطال', icon: AlertTriangle },
                { id: 'ai-assistant', label: 'المساعد الذكي', icon: Sparkles },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as View)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all group",
                    activeView === item.id 
                      ? "bg-[#EBF3FF] text-brand border border-blue-100" 
                      : "text-text-muted hover:bg-background hover:text-text-main"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 transition-colors", activeView === item.id ? "text-brand" : "text-text-muted group-hover:text-brand")} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
             <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-4 px-4">الإعدادات</p>
             <div className="space-y-1">
                <button 
                  onClick={() => setActiveView('settings')}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all group",
                    activeView === 'settings' 
                      ? "bg-[#EBF3FF] text-brand border border-blue-100" 
                      : "text-text-muted hover:bg-background hover:text-text-main"
                  )}
                >
                  <Settings className={cn("w-5 h-5 transition-colors", activeView === 'settings' ? "text-brand" : "text-text-muted group-hover:text-brand")} />
                  المظهر والإعدادات
                </button>
             </div>
          </div>
        </nav>

        <div className="p-6 border-t border-border-main">
          <div className="p-4 bg-background rounded-xl border border-border-main">
            <p className="text-[11px] text-text-muted font-bold uppercase mb-1">أسطول المركبات</p>
            <p className="text-xl font-bold text-text-main">{data.vehicles.length}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
        {/* Header */}
        <header className="h-20 bg-white border-b border-border-main flex items-center justify-between px-8 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-text-main">
              {activeView === 'dashboard' && 'لوحة التحكم المركزية'}
              {activeView === 'vehicles' && 'إدارة المركبات'}
              {activeView === 'records' && 'سجل الصيانة'}
              {activeView === 'expenses' && 'إدارة الفواتير'}
              {activeView === 'fuel' && 'سجل الوقود والاستهلاك'}
              {activeView === 'reports' && 'توليد التقارير'}
              {activeView === 'compare' && 'مقارنة أداء السيارات'}
              {activeView === 'breakdowns' && 'سجل الأعطال والإصلاحات'}
              {activeView === 'settings' && 'الإعدادات والمظهر'}
              {activeView === 'ai-assistant' && 'المساعد الذكي (AI)'}
            </h1>
            {selectedVehicle && (
              <p className="text-xs text-text-muted font-medium">المركبة الحالية: {selectedVehicle.make} {selectedVehicle.model}</p>
            )}
          </div>

          <div className="flex gap-3 print:hidden">
            {activeView === 'vehicles' && (
              <Button onClick={() => setIsVehicleModalOpen(true)}>
                <Plus className="w-4 h-4" />
                مركبة جديدة
              </Button>
            )}
            {activeView === 'fuel' && (
              <Button onClick={() => setIsFuelModalOpen(true)} disabled={data.vehicles.length === 0}>
                <Plus className="w-4 h-4" />
                تعبئة وقود
              </Button>
            )}
            {(activeView === 'records' || activeView === 'dashboard') && (
              <Button onClick={() => setIsRecordModalOpen(true)} disabled={data.vehicles.length === 0}>
                <Plus className="w-4 h-4" />
                صيانة جديدة
              </Button>
            )}
            {(activeView === 'expenses' || activeView === 'dashboard') && (
              <Button variant="outline" onClick={() => setIsExpenseModalOpen(true)} disabled={data.vehicles.length === 0}>
                <Plus className="w-4 h-4" />
                فاتورة جديدة
              </Button>
            )}
            {activeView === 'breakdowns' && (
              <Button onClick={() => setIsBreakdownModalOpen(true)} disabled={data.vehicles.length === 0}>
                <Plus className="w-4 h-4" />
                تسجيل عطل
              </Button>
            )}
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {activeView === 'dashboard' && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    label="إجمالي الإنفاق" 
                    value={formatCurrency(stats.totalSpend)} 
                    icon={TrendingUp} 
                    color="blue" 
                  />
                  <StatCard 
                    label="العمليات النشطة" 
                    value={stats.maintCount.toString()} 
                    icon={Wrench} 
                    color="blue" 
                  />
                  <StatCard 
                    label="أسطول المركبات" 
                    value={stats.totalVehicles.toString()} 
                    icon={Car} 
                    color="blue" 
                  />
                  <StatCard 
                    label="معدل الاستهلاك" 
                    value={(() => {
                      const records = (data.fuelRecords || []);
                      if (records.length < 2) return '—';
                      const dist = Math.max(...records.map(r => r.odometer)) - Math.min(...records.map(r => r.odometer));
                      if (dist <= 0) return '—';
                      const liters = records.sort((a,b) => a.odometer - b.odometer).slice(1).reduce((s, r) => s + r.liters, 0);
                      return (liters / (dist / 100)).toFixed(1) + ' لتر/100كم';
                    })()} 
                    icon={Fuel} 
                    color="blue" 
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Expense Chart */}
                  <Card 
                    className="lg:col-span-2" 
                    title="تحليل المصاريف" 
                    subtitle="آخر 6 أشهر من النشاط المالي"
                    icon={TrendingUp}
                  >
                    <div className="h-[320px] w-full pt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="var(--brand)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }} tickFormatter={(val) => `${val}`} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', direction: 'rtl' }}
                            formatter={(val: number) => [formatCurrency(val), 'القيمة']}
                          />
                          <Area type="monotone" dataKey="amount" stroke="var(--brand)" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Reminders Section */}
                  <Card 
                    title="التذكيرات والتنبيهات" 
                    subtitle="مواعيد وسجلات الصيانة القادمة"
                    icon={Bell}
                    extra={
                      <Button variant="ghost" size="icon" onClick={() => setIsReminderModalOpen(true)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    }
                  >
                    <div className="space-y-4">
                      {(data.reminders || []).filter(r => !r.isCompleted).length === 0 ? (
                        <div className="py-10 text-center">
                          <Bell className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-20" />
                          <p className="text-xs text-text-muted font-bold">لا يوجد تذكيرات حالية</p>
                          <Button 
                            variant="ghost" 
                            className="text-[10px] h-auto p-0 mt-2 text-brand"
                            onClick={() => setIsReminderModalOpen(true)}
                          >
                            أضف تذكيرك الأول
                          </Button>
                        </div>
                      ) : (
                        (data.reminders || [])
                          .filter(r => !r.isCompleted)
                          .sort((a,b) => {
                             if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                             return 0;
                          })
                          .slice(0, 5)
                          .map(reminder => {
                            const vehicle = data.vehicles.find(v => v.id === reminder.vehicleId);
                            const isOverdue = reminder.dueDate && new Date(reminder.dueDate) < new Date();
                            const isOdometerDue = reminder.dueOdometer && vehicle && vehicle.currentOdometer >= reminder.dueOdometer;

                            return (
                              <div key={reminder.id} className={cn(
                                "p-4 rounded-xl border flex flex-col gap-3 transition-all",
                                (isOverdue || isOdometerDue) ? "bg-red-50 border-red-100" : "bg-background border-border-main"
                              )}>
                                <div className="flex justify-between items-start">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-text-main truncate">{reminder.title}</p>
                                    <p className="text-[10px] font-bold text-text-muted uppercase">{vehicle?.make} {vehicle?.model}</p>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <button onClick={() => toggleReminder(reminder.id)} className="p-1 hover:text-green-600 transition-colors" title="تم الإنجاز">
                                       <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteReminder(reminder.id)} className="p-1 hover:text-red-600 transition-colors" title="حذف">
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-bold">
                                  {reminder.dueDate && (
                                    <div className={cn("flex items-center gap-1", isOverdue ? "text-red-600" : "text-text-muted")}>
                                      <Calendar className="w-3 h-3" />
                                      {reminder.dueDate}
                                    </div>
                                  )}
                                  {reminder.dueOdometer && (
                                    <div className={cn("flex items-center gap-1", isOdometerDue ? "text-red-600" : "text-text-muted")}>
                                      <Clock className="w-3 h-3" />
                                      {formatNumber(reminder.dueOdometer)} كم
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </Card>
                </div>

                {data.vehicles.length > 0 && (
                  <div className="grid grid-cols-1 gap-8">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Sparkles className="w-5 h-5 text-brand" />
                           <h2 className="text-lg font-bold text-text-main">الرؤى والتوصيات الذكية</h2>
                        </div>
                        {data.vehicles.length > 1 && (
                          <select 
                            value={suggestionVehicleId || ''} 
                            onChange={(e) => setSuggestionVehicleId(e.target.value)}
                            className="text-xs font-bold p-2 bg-white border border-border-main rounded-lg outline-none"
                          >
                            {data.vehicles.map(v => (
                              <option key={v.id} value={v.id}>{v.make} {v.model}</option>
                            ))}
                          </select>
                        )}
                     </div>
                     <MaintenanceSuggestions data={data} vehicleId={suggestionVehicleId || ''} />
                  </div>
                )}
              </>
            )}

            {activeView === 'vehicles' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.vehicles.map(vehicle => (
                  <motion.div 
                    key={vehicle.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="group hover:border-brand transition-all cursor-default h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-background text-brand rounded-xl flex items-center justify-center border border-border-main">
                          <Car className="w-6 h-6" />
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="hover:text-brand"
                            onClick={() => {
                              setSharingVehicleId(vehicle.id);
                              setIsShareModalOpen(true);
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="hover:text-[#DE350B]"
                            onClick={() => deleteVehicle(vehicle.id)}
                          >
                            <AlertCircle className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    <h3 className="text-lg font-bold text-text-main mb-1">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-text-muted text-sm font-semibold mb-6">
                      {vehicle.licensePlate} • {vehicle.year}
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-text-muted uppercase text-[10px]">العداد الحالي</span>
                        <span className="font-bold text-text-main">{formatNumber(vehicle.currentOdometer)} كم</span>
                      </div>
                      <div className="h-px bg-border-main" />
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-text-muted uppercase text-[10px]">إجمالي الإنفاق</span>
                        <span className="font-bold text-brand">
                          {formatCurrency(
                            data.expenses.filter(e => e.vehicleId === vehicle.id).reduce((s, e) => s + e.amount, 0) +
                            data.records.filter(r => r.vehicleId === vehicle.id).reduce((s, r) => s + r.cost, 0)
                          )}
                        </span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full text-xs" onClick={() => {
                       setSelectedVehicleId(vehicle.id);
                       setActiveView('records');
                    }}>
                      عرض الملف الكامل
                    </Button>
                  </Card>
                </motion.div>
                ))}
                
                {data.vehicles.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border border-border-main rounded-xl">
                     <div className="w-20 h-20 bg-background rounded-full border border-border-main flex items-center justify-center mb-6">
                       <Car className="w-10 h-10 text-text-muted" />
                     </div>
                     <h3 className="text-xl font-bold text-text-main">لم يتم إضافة مركبات</h3>
                     <p className="text-sm text-text-muted mt-2 mb-8">ابدأ بإضافة أول مركبة لتفعيل لوحة التحكم</p>
                     <Button onClick={() => setIsVehicleModalOpen(true)}>
                       إضافة مركبة الآن
                     </Button>
                  </div>
                )}
              </div>
            )}

            {activeView === 'records' && (
              <div className="space-y-6">
                <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-border-main scroll-mt-20">
                  <div className="relative flex-1">
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input 
                      type="text"
                      placeholder="بحث في سجلات الصيانة..."
                      value={recordsFilter}
                      onChange={(e) => setRecordsFilter(e.target.value)}
                      className="w-full pr-10 pl-4 py-2 text-sm bg-[#F9FAFB] border border-border-main rounded-lg outline-none focus:border-brand transition-all"
                    />
                  </div>
                  {selectedVehicleId && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedVehicleId(null)} className="text-xs">
                      إلغاء تصفية السيارة
                    </Button>
                  )}
                </div>

                <Card className="p-0 overflow-hidden" title="سجل الصيانة الميكانيكية">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-[#F9FAFB] border-b border-border-main">
                        <tr>
                          {[
                            { key: 'vehicle', label: 'المركبة' },
                            { key: 'type', label: 'نوع الخدمة' },
                            { key: 'title', label: 'وصف المهمة' },
                            { key: 'date', label: 'التاريخ', align: 'left' },
                            { key: 'cost', label: 'التكلفة', align: 'left' },
                          ].map((col) => (
                            <th 
                              key={col.key} 
                              className={cn(
                                "p-4 font-bold text-[11px] uppercase text-text-muted cursor-pointer hover:text-brand transition-colors",
                                col.align === 'left' ? "text-left" : "text-right"
                              )}
                              onClick={() => setRecordsSort(prev => ({
                                key: col.key as any,
                                direction: prev.key === col.key && prev.direction === 'asc' ? 'desc' : 'asc'
                              }))}
                            >
                              <div className={cn("flex items-center gap-2", col.align === 'left' ? "justify-start" : "justify-end")}>
                                {col.label}
                                <ArrowUpDown className={cn("w-3 h-3 opacity-50", recordsSort.key === col.key && "opacity-100 text-brand")} />
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0F2F5]">
                        {sortedRecords.map(record => (
                          <tr key={record.id} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="p-4 text-sm font-bold text-text-main">
                              {data.vehicles.find(v => v.id === record.vehicleId)?.model}
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-bold px-2 py-1 bg-[#EBF3FF] text-brand rounded">
                                {MAINTENANCE_TYPES[record.type].label}
                              </span>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-bold">{record.title}</p>
                              {record.notes && <p className="text-xs text-text-muted mt-0.5">{record.notes}</p>}
                            </td>
                            <td className="p-4 text-left font-semibold text-xs text-text-muted">{record.date}</td>
                            <td className="p-4 text-left font-bold text-sm text-text-main">{formatCurrency(record.cost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeView === 'fuel' && (
              <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.vehicles.map(vehicle => {
                      const consumption = (() => {
                        const records = (data.fuelRecords || [])
                          .filter(f => f.vehicleId === vehicle.id)
                          .sort((a, b) => a.odometer - b.odometer);
                        
                        if (records.length < 2) return null;
                        const dist = records[records.length - 1].odometer - records[0].odometer;
                        if (dist <= 0) return null;
                        const liters = records.slice(1).reduce((s, r) => s + r.liters, 0);
                        return (liters / (dist / 100)).toFixed(1);
                      })();

                      return (
                        <div key={vehicle.id} className="bg-white border border-border-main p-5 rounded-xl">
                          <p className="text-[10px] font-bold text-text-muted uppercase mb-1">{vehicle.make} {vehicle.model}</p>
                          <div className="flex items-end gap-2">
                             <p className="text-2xl font-bold text-text-main">{consumption || '—'}</p>
                             <p className="text-[10px] text-text-muted font-bold pb-1 uppercase">لتر / 100 كم</p>
                          </div>
                        </div>
                      );
                    })}
                 </div>

                 <div className="flex bg-white p-4 rounded-xl border border-border-main">
                  <div className="relative flex-1">
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input 
                      type="text"
                      placeholder="بحث في سجل الوقود (المحطة أو الموديل)..."
                      value={fuelFilter}
                      onChange={(e) => setFuelFilter(e.target.value)}
                      className="w-full pr-10 pl-4 py-2 text-sm bg-[#F9FAFB] border border-border-main rounded-lg outline-none focus:border-brand transition-all"
                    />
                  </div>
                </div>

                 <Card className="p-0 overflow-hidden" title="سجل استهلاك الوقود">
                    <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-[#F9FAFB] border-b border-border-main">
                        <tr>
                          {[
                            { key: 'vehicle', label: 'المركبة' },
                            { key: 'odometer', label: 'العداد' },
                            { key: 'liters', label: 'الكمية' },
                            { key: 'station', label: 'محطة الوقود' },
                            { key: 'date', label: 'التاريخ', align: 'left' },
                            { key: 'cost', label: 'التكلفة', align: 'left' },
                          ].map((col) => (
                            <th 
                              key={col.key} 
                              className={cn(
                                "p-4 font-bold text-[11px] uppercase text-text-muted cursor-pointer hover:text-brand transition-colors",
                                col.align === 'left' ? "text-left" : "text-right"
                              )}
                              onClick={() => setFuelSort(prev => ({
                                key: col.key as any,
                                direction: prev.key === col.key && prev.direction === 'asc' ? 'desc' : 'asc'
                              }))}
                            >
                              <div className={cn("flex items-center gap-2", col.align === 'left' ? "justify-start" : "justify-end")}>
                                {col.label}
                                <ArrowUpDown className={cn("w-3 h-3 opacity-50", fuelSort.key === col.key && "opacity-100 text-brand")} />
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0F2F5]">
                        {sortedFuel.map(fuel => (
                          <tr key={fuel.id} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="p-4 font-bold text-sm text-text-main">
                              {data.vehicles.find(v => v.id === fuel.vehicleId)?.model}
                            </td>
                            <td className="p-4 text-xs font-semibold text-text-muted">
                               {formatNumber(fuel.odometer)} كم
                            </td>
                            <td className="p-4 text-xs font-bold text-text-main">
                               {fuel.liters} لتر
                            </td>
                            <td className="p-4 text-xs text-text-muted font-medium">{fuel.station || '—'}</td>
                            <td className="p-4 text-left font-semibold text-xs text-text-muted">{fuel.date}</td>
                            <td className="p-4 text-left">
                               <span className="font-bold text-sm text-text-main">
                                 {formatCurrency(fuel.cost)}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
            {activeView === 'expenses' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Object.entries(EXPENSE_CATEGORIES).map(([key, category]) => {
                    const amount = data.expenses
                      .filter(e => e.category === key)
                      .reduce((s, e) => s + e.amount, 0);
                    return (
                      <div key={key} className="bg-white border border-border-main p-5 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                           <category.icon className="w-4 h-4 text-text-muted" />
                           <span className="text-[10px] font-bold text-text-muted uppercase">{category.label}</span>
                        </div>
                        <p className="text-lg font-bold text-text-main">{formatCurrency(amount)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex bg-white p-4 rounded-xl border border-border-main">
                  <div className="relative flex-1">
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input 
                      type="text"
                      placeholder="بحث في المصاريف والفواتير..."
                      value={expensesFilter}
                      onChange={(e) => setExpensesFilter(e.target.value)}
                      className="w-full pr-10 pl-4 py-2 text-sm bg-[#F9FAFB] border border-border-main rounded-lg outline-none focus:border-brand transition-all"
                    />
                  </div>
                </div>

                <Card className="p-0 overflow-hidden" title="آخر الفواتير والمصاريف">
                    <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-[#F9FAFB] border-b border-border-main">
                        <tr>
                          {[
                            { key: 'vehicle', label: 'المركبة' },
                            { key: 'category', label: 'التصنيف' },
                            { key: 'notes', label: 'ملاحظات' },
                            { key: 'date', label: 'التاريخ', align: 'left' },
                            { key: 'amount', label: 'قيمة الفاتورة', align: 'left' },
                          ].map((col) => (
                            <th 
                              key={col.key} 
                              className={cn(
                                "p-4 font-bold text-[11px] uppercase text-text-muted cursor-pointer hover:text-brand transition-colors",
                                col.align === 'left' ? "text-left" : "text-right"
                              )}
                              onClick={() => setExpensesSort(prev => ({
                                key: col.key as any,
                                direction: prev.key === col.key && prev.direction === 'asc' ? 'desc' : 'asc'
                              }))}
                            >
                              <div className={cn("flex items-center gap-2", col.align === 'left' ? "justify-start" : "justify-end")}>
                                {col.label}
                                <ArrowUpDown className={cn("w-3 h-3 opacity-50", expensesSort.key === col.key && "opacity-100 text-brand")} />
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0F2F5]">
                        {sortedExpenses.map(expense => (
                          <tr key={expense.id} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="p-4 font-bold text-sm text-text-main">
                              {data.vehicles.find(v => v.id === expense.vehicleId)?.model}
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-background border border-border-main rounded-md text-[10px] font-bold text-text-main">
                                {EXPENSE_CATEGORIES[expense.category].label}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-text-muted font-medium">{expense.notes || '—'}</td>
                            <td className="p-4 text-left font-semibold text-xs text-text-muted">{expense.date}</td>
                            <td className="p-4 text-left">
                               <span className="p-2 bg-[#E3FCEF] text-[#006644] rounded text-sm font-bold">
                                 {formatCurrency(expense.amount)}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeView === 'reports' && (
              <div className="space-y-8 print:p-0">
                <Card className="print:hidden" title="إعدادات التقرير" subtitle="حدد السيارة والفترة الزمنية لتوليد التقرير">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-text-muted uppercase mb-2">المركبة</label>
                       <select 
                         className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm"
                         value={reportConfig.vehicleId}
                         onChange={(e) => setReportConfig(prev => ({ ...prev, vehicleId: e.target.value }))}
                       >
                         <option value="all">كافة المركبات</option>
                         {data.vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.licensePlate})</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-text-muted uppercase mb-2">من تاريخ</label>
                       <input 
                         type="date" 
                         className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm"
                         value={reportConfig.startDate}
                         onChange={(e) => setReportConfig(prev => ({ ...prev, startDate: e.target.value }))}
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-text-muted uppercase mb-2">إلى تاريخ</label>
                       <input 
                         type="date" 
                         className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm"
                         value={reportConfig.endDate}
                         onChange={(e) => setReportConfig(prev => ({ ...prev, endDate: e.target.value }))}
                       />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end gap-3">
                     <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        طباعة / PDF
                     </Button>
                  </div>
                </Card>

                {/* Report Preview */}
                <div className="bg-white border border-border-main rounded-2xl p-10 mt-10 print:mt-0 print:border-none print:shadow-none print:p-0">
                   <div className="flex justify-between items-start mb-12 border-b border-border-main pb-8">
                      <div>
                         <div className="flex items-center gap-3 text-brand mb-4">
                           <div className="w-10 h-10 bg-brand rounded-lg shadow-sm" />
                           <span className="text-2xl font-bold tracking-tight">أوتو كير</span>
                         </div>
                         <h2 className="text-3xl font-bold text-text-main">تقرير الصيانة والمصاريف</h2>
                         <p className="text-text-muted mt-2 font-medium">الفترة من {reportConfig.startDate} إلى {reportConfig.endDate}</p>
                      </div>
                      <div className="text-left font-bold text-xs uppercase text-text-muted">
                         <p>تاريخ التوليد: {format(new Date(), 'yyyy-MM-dd')}</p>
                         <p className="mt-1">رقم المرجع: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                      </div>
                   </div>

                   {/* Filters Summary */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                      <div className="bg-[#F9FAFB] p-4 rounded-xl border border-border-main">
                         <p className="text-[10px] font-bold text-text-muted uppercase mb-1">المركبة المحددة</p>
                         <p className="text-sm font-bold text-text-main">
                           {reportConfig.vehicleId === 'all' ? 'كافة المركبات' : data.vehicles.find(v => v.id === reportConfig.vehicleId)?.model}
                         </p>
                      </div>
                      <div className="bg-[#F9FAFB] p-4 rounded-xl border border-border-main">
                         <p className="text-[10px] font-bold text-text-muted uppercase mb-1">إجمالي العمليات</p>
                         <p className="text-sm font-bold text-text-main">
                           {(() => {
                             const records = data.records.filter(r => (reportConfig.vehicleId === 'all' || r.vehicleId === reportConfig.vehicleId) && r.date >= reportConfig.startDate && r.date <= reportConfig.endDate);
                             const expenses = data.expenses.filter(e => (reportConfig.vehicleId === 'all' || e.vehicleId === reportConfig.vehicleId) && e.date >= reportConfig.startDate && e.date <= reportConfig.endDate);
                             return records.length + expenses.length;
                           })()} عملية
                         </p>
                      </div>
                      <div className="bg-[#F9FAFB] p-4 rounded-xl border border-border-main">
                         <p className="text-[10px] font-bold text-text-muted uppercase mb-1">إجمالي النفقات</p>
                         <p className="text-sm font-bold text-brand">
                           {formatCurrency((() => {
                             const recordsCost = data.records.filter(r => (reportConfig.vehicleId === 'all' || r.vehicleId === reportConfig.vehicleId) && r.date >= reportConfig.startDate && r.date <= reportConfig.endDate).reduce((s, r) => s + r.cost, 0);
                             const expensesCost = data.expenses.filter(e => (reportConfig.vehicleId === 'all' || e.vehicleId === reportConfig.vehicleId) && e.date >= reportConfig.startDate && e.date <= reportConfig.endDate).reduce((s, e) => s + e.amount, 0);
                             const fuelCost = (data.fuelRecords || []).filter(f => (reportConfig.vehicleId === 'all' || f.vehicleId === reportConfig.vehicleId) && f.date >= reportConfig.startDate && f.date <= reportConfig.endDate).reduce((s, f) => s + f.cost, 0);
                             return recordsCost + expensesCost + fuelCost;
                           })())}
                         </p>
                      </div>
                      <div className="bg-[#F9FAFB] p-4 rounded-xl border border-border-main">
                         <p className="text-[10px] font-bold text-text-muted uppercase mb-1">متوسط الصرف اليومي</p>
                         <p className="text-sm font-bold text-text-main">
                           {(() => {
                             const diff = (new Date(reportConfig.endDate).getTime() - new Date(reportConfig.startDate).getTime()) / (1000 * 60 * 60 * 24);
                             const total = (data.records.filter(r => (reportConfig.vehicleId === 'all' || r.vehicleId === reportConfig.vehicleId) && r.date >= reportConfig.startDate && r.date <= reportConfig.endDate).reduce((s, r) => s + r.cost, 0) + 
                                            data.expenses.filter(e => (reportConfig.vehicleId === 'all' || e.vehicleId === reportConfig.vehicleId) && e.date >= reportConfig.startDate && e.date <= reportConfig.endDate).reduce((s, e) => s + e.amount, 0) +
                                            (data.fuelRecords || []).filter(f => (reportConfig.vehicleId === 'all' || f.vehicleId === reportConfig.vehicleId) && f.date >= reportConfig.startDate && f.date <= reportConfig.endDate).reduce((s, f) => s + f.cost, 0));
                             return formatCurrency(total / (Math.max(1, diff)));
                           })()}
                         </p>
                      </div>
                   </div>

                   {/* Maintenance Table */}
                   <div className="mb-12">
                      <h3 className="text-lg font-bold text-text-main mb-6 border-r-4 border-brand pr-4">سجل العمليات التفصيلي</h3>
                      <div className="overflow-hidden border border-border-main rounded-xl">
                         <table className="w-full text-right text-sm">
                            <thead className="bg-[#F9FAFB] border-b border-border-main">
                               <tr>
                                  <th className="p-4 font-bold text-text-muted uppercase text-[10px]">المركبة</th>
                                  <th className="p-4 font-bold text-text-muted uppercase text-[10px]">التاريخ</th>
                                  <th className="p-4 font-bold text-text-muted uppercase text-[10px]">النوع / التصنيف</th>
                                  <th className="p-4 font-bold text-text-muted uppercase text-[10px]">التفاصيل</th>
                                  <th className="p-4 font-bold text-text-muted uppercase text-[10px] text-left">المبلغ</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F2F5]">
                               {[
                                 ...data.records.filter(r => (reportConfig.vehicleId === 'all' || r.vehicleId === reportConfig.vehicleId) && r.date >= reportConfig.startDate && r.date <= reportConfig.endDate).map(r => ({ ...r, categoryGroup: 'maintenance' })),
                                 ...data.expenses.filter(e => (reportConfig.vehicleId === 'all' || e.vehicleId === reportConfig.vehicleId) && e.date >= reportConfig.startDate && e.date <= reportConfig.endDate).map(e => ({ ...e, categoryGroup: 'expense' })),
                                 ...(data.fuelRecords || []).filter(f => (reportConfig.vehicleId === 'all' || f.vehicleId === reportConfig.vehicleId) && f.date >= reportConfig.startDate && f.date <= reportConfig.endDate).map(f => ({ ...f, categoryGroup: 'fuel' }))
                               ]
                               .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                               .map((item, idx) => {
                                  const vehicle = data.vehicles.find(v => v.id === item.vehicleId);
                                  return (
                                    <tr key={idx} className="hover:bg-[#F9FAFB]">
                                       <td className="p-4 font-semibold">{vehicle?.model}</td>
                                       <td className="p-4 text-text-muted font-medium">{item.date}</td>
                                       <td className="p-4">
                                          <span className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-bold",
                                            'type' in item ? "bg-blue-50 text-brand" : "bg-green-50 text-green-700"
                                          )}>
                                             {'type' in item ? MAINTENANCE_TYPES[item.type].label : ('category' in item ? EXPENSE_CATEGORIES[item.category].label : 'وقود')}
                                          </span>
                                       </td>
                                       <td className="p-4 text-text-muted">
                                          {'title' in item ? item.title : ('liters' in item ? `${item.liters} لتر - ${item.station || ''}` : item.notes || '—')}
                                       </td>
                                       <td className="p-4 text-left font-bold">{formatCurrency('cost' in item ? item.cost : ('amount' in item ? item.amount : 0))}</td>
                                    </tr>
                                  );
                               })}
                            </tbody>
                         </table>
                      </div>
                   </div>

                   {/* Footer */}
                   <div className="mt-20 pt-10 border-t border-border-main text-center">
                      <p className="text-xs text-text-muted">تم إنشاؤه عبر تطبيق أوتو كير - الحل الذكي لإدارة المركبات</p>
                      <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-bold">All rights reserved © 2026 AutoCare</p>
                   </div>
                </div>
              </div>
            )}

            {activeView === 'compare' && (
              <div className="space-y-8">
                <Card 
                  title="تحديد المركبات للمقارنة" 
                  subtitle="اختر مركبتين أو أكثر لعرض إحصائيات الأداء جنباً إلى جنب"
                  icon={GitCompare}
                  className="sticky top-0 z-10"
                  extra={
                    <div className="flex items-center gap-2">
                       {selectedComparisonIds.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedComparisonIds([])}
                            className="text-[10px] h-7 font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            مسح التحديد ({selectedComparisonIds.length})
                          </Button>
                       )}
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input 
                        type="text"
                        placeholder="ابحث عن مركبة بالاسم أو رقم اللوحة..."
                        className="w-full pl-4 pr-10 py-2.5 bg-background border border-border-main rounded-xl text-sm focus:ring-2 focus:ring-brand/20 outline-none transition-all font-medium"
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase();
                          // Local filtering logic could be added to state if needed, but for now we'll just show all or implement a local state
                          setRecordsFilter(val); // Reusing a general purpose filter state or could add a specific one
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                      {data.vehicles
                        .filter(v => 
                          v.make.toLowerCase().includes(recordsFilter.toLowerCase()) || 
                          v.model.toLowerCase().includes(recordsFilter.toLowerCase()) || 
                          v.licensePlate.toLowerCase().includes(recordsFilter.toLowerCase())
                        )
                        .map(v => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setSelectedComparisonIds(prev => 
                              prev.includes(v.id) ? prev.filter(id => id !== v.id) : [...prev, v.id]
                            );
                          }}
                          className={cn(
                            "group p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative text-center",
                            selectedComparisonIds.includes(v.id)
                              ? "border-brand bg-blue-50/50 ring-1 ring-brand"
                              : "border-border-main hover:border-brand/40 bg-white"
                          )}
                        >
                          <div className={cn(
                             "absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all scale-90 group-hover:scale-100",
                             selectedComparisonIds.includes(v.id) ? "bg-brand border-brand shadow-sm" : "bg-white border-border-main"
                          )}>
                            {selectedComparisonIds.includes(v.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-text-muted group-hover:bg-brand/10 group-hover:text-brand transition-colors mb-1">
                             <Car className="w-6 h-6" />
                          </div>

                          <div className="w-full min-w-0">
                            <p className={cn(
                              "text-xs font-black truncate leading-tight",
                              selectedComparisonIds.includes(v.id) ? "text-brand" : "text-text-main"
                            )}>{v.model}</p>
                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-1 truncate">{v.licensePlate}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {selectedComparisonIds.length < 2 && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-amber-800">
                        يرجى تحديد مركبتين على الأقل لبدء المقارنة الفورية وتحليل البيانات.
                      </p>
                    </div>
                  )}
                </Card>

                {selectedComparisonIds.length >= 2 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {selectedComparisonIds.map(vId => {
                      const v = data.vehicles.find(v => v.id === vId);
                      if (!v) return null;

                      const maintCost = data.records.filter(r => r.vehicleId === vId).reduce((s, r) => s + r.cost, 0);
                      const expenseCost = data.expenses.filter(e => e.vehicleId === vId).reduce((s, e) => s + e.amount, 0);
                      const fuelRecords = (data.fuelRecords || []).filter(f => f.vehicleId === vId);
                      const fuelCost = fuelRecords.reduce((s, f) => s + f.cost, 0);
                      const totalCost = maintCost + expenseCost + fuelCost;

                      // Fuel Efficiency
                      let l100 = 0;
                      let mpg = 0;
                      if (fuelRecords.length >= 2) {
                        const sorted = [...fuelRecords].sort((a,b) => a.odometer - b.odometer);
                        const dist = sorted[sorted.length - 1].odometer - sorted[0].odometer;
                        if (dist > 0) {
                          const liters = sorted.slice(1).reduce((s, r) => s + r.liters, 0);
                          l100 = liters / (dist / 100);
                          mpg = 235.215 / l100;
                        }
                      }

                      return (
                        <Card 
                          key={vId} 
                          title={`${v.make} ${v.model}`} 
                          subtitle={v.licensePlate}
                          className="border-t-4 border-t-brand"
                        >
                          <div className="space-y-6">
                            <div className="flex justify-between items-center py-2 border-b border-border-main border-dashed">
                              <span className="text-xs font-bold text-text-muted uppercase">إجمالي التكاليف</span>
                              <span className="text-sm font-black text-text-main">{formatCurrency(totalCost)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border-main border-dashed">
                              <span className="text-xs font-bold text-text-muted uppercase">تكاليف الصيانة</span>
                              <span className="text-sm font-bold text-text-main">{formatCurrency(maintCost)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border-main border-dashed">
                              <span className="text-xs font-bold text-text-muted uppercase">تكاليف الوقود</span>
                              <span className="text-sm font-bold text-text-main">{formatCurrency(fuelCost)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border-main border-dashed">
                              <span className="text-xs font-bold text-text-muted uppercase">كفاءة الوقود</span>
                              <div className="text-right">
                                <p className="text-sm font-bold text-brand">{l100 > 0 ? `${l100.toFixed(1)} لتر/100كم` : '—'}</p>
                                {mpg > 0 && <p className="text-[10px] font-bold text-green-600">{mpg.toFixed(1)} MPG</p>}
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border-main border-dashed">
                              <span className="text-xs font-bold text-text-muted uppercase">المسافة المقطوعة</span>
                              <span className="text-sm font-bold text-text-main">{formatNumber(v.currentOdometer)} كم</span>
                            </div>
                            
                            <div className="pt-4">
                               <p className="text-[10px] font-bold text-text-muted uppercase mb-3">توزيع التكاليف</p>
                               <div className="flex h-3 rounded-full overflow-hidden bg-background">
                                  <div 
                                    className="h-full bg-blue-500" 
                                    style={{ width: `${(maintCost / totalCost) * 100}%` }}
                                    title="صيانة"
                                  />
                                  <div 
                                    className="h-full bg-green-500" 
                                    style={{ width: `${(fuelCost / totalCost) * 100}%` }}
                                    title="وقود"
                                  />
                                  <div 
                                    className="h-full bg-amber-500" 
                                    style={{ width: `${(expenseCost / totalCost) * 100}%` }}
                                    title="مصاريف أخرى"
                                  />
                               </div>
                               <div className="flex gap-4 mt-3">
                                  <div className="flex items-center gap-1.5 basis-1/3">
                                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                     <span className="text-[9px] font-bold text-text-muted">صيانة</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 basis-1/3">
                                     <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                     <span className="text-[9px] font-bold text-text-muted">وقود</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 basis-1/3">
                                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                     <span className="text-[9px] font-bold text-text-muted">أخرى</span>
                                  </div>
                               </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {fuelComparisonData.some(d => d.l100 > 0) && (
                    <Card 
                      title="تحليل استهلاك الوقود" 
                      subtitle={fuelUnit === 'l100' ? "مقارنة معدلات الاستهلاك الفعلي (الأقل هو الأفضل في لتر/100كم)" : "مقارنة كفاءة الوقود (الأعلى هو الأفضل في MPG)"}
                      icon={Fuel}
                      extra={
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                          <button
                            onClick={() => setFuelUnit('l100')}
                            className={cn(
                              "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                              fuelUnit === 'l100' ? "bg-white text-brand shadow-sm" : "text-text-muted hover:text-text-main"
                            )}
                          >
                            L/100km
                          </button>
                          <button
                            onClick={() => setFuelUnit('mpg')}
                            className={cn(
                              "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                              fuelUnit === 'mpg' ? "bg-white text-green-600 shadow-sm" : "text-text-muted hover:text-text-main"
                            )}
                          >
                            MPG
                          </button>
                        </div>
                      }
                    >
                      <div className="h-[550px] w-full pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={fuelComparisonData} 
                            layout="vertical" 
                            margin={{ left: 30, right: 60, bottom: 20, top: 20 }}
                            barGap={8}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" opacity={0.4} />
                            <XAxis 
                              type="number" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }} 
                              domain={[0, 'dataMax + 2']}
                              label={{ value: fuelUnit === 'l100' ? 'لتر/100كم' : 'ميل/غالون (MPG)', position: 'bottom', offset: -10, fontSize: 10, fontWeight: 700, fill: 'var(--text-muted)' }}
                            />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 11, fill: 'var(--text-main)', fontWeight: 800 }} 
                              width={140}
                            />
                            <Tooltip 
                              content={(props) => (
                                <CustomFuelTooltip 
                                  {...props} 
                                  overallAverage={fuelComparisonData.length > 0 ? fuelComparisonData.reduce((acc, curr) => acc + curr.l100, 0) / fuelComparisonData.length : null} 
                                />
                              )}
                              cursor={{ fill: 'var(--brand)', fillOpacity: 0.05 }}
                              shared={true}
                              animationDuration={400}
                            />
                            <Legend 
                              verticalAlign="top" 
                              align="right" 
                              iconType="circle" 
                              wrapperStyle={{ paddingBottom: '40px', fontSize: '12px', fontWeight: '800' }} 
                            />
                            {fuelUnit === 'l100' ? (
                              <Bar 
                                dataKey="l100" 
                                name="استهلاك الوقود (لتر/100كم)" 
                                fill="var(--brand)" 
                                radius={[0, 6, 6, 0]} 
                                barSize={32}
                                animationBegin={300}
                                animationDuration={1500}
                              >
                                {fuelComparisonData.map((entry, index) => (
                                  <Cell key={`cell-l-${index}`} fillOpacity={0.9} />
                                ))}
                              </Bar>
                            ) : (
                              <Bar 
                                dataKey="mpg" 
                                name="كفاءة الوقود (MPG)" 
                                fill="#10B981" 
                                radius={[0, 6, 6, 0]} 
                                barSize={32}
                                animationBegin={300}
                                animationDuration={1500}
                              >
                                {fuelComparisonData.map((entry, index) => (
                                  <Cell key={`cell-m-${index}`} fillOpacity={0.9} />
                                ))}
                              </Bar>
                            )}
                            <ReferenceLine 
                              x={fuelComparisonData.reduce((acc, curr) => acc + (fuelUnit === 'l100' ? curr.l100 : curr.mpg), 0) / fuelComparisonData.length} 
                              stroke={fuelUnit === 'l100' ? "var(--brand)" : "#10B981"} 
                              strokeDasharray="5 5"
                              label={{ 
                                value: `المتوسط: ${(fuelComparisonData.reduce((acc, curr) => acc + (fuelUnit === 'l100' ? curr.l100 : curr.mpg), 0) / fuelComparisonData.length).toFixed(1)}`, 
                                position: 'top', 
                                fill: fuelUnit === 'l100' ? 'var(--brand)' : '#10B981', 
                                fontSize: 10, 
                                fontWeight: 'bold' 
                              }} 
                            />
                            <Brush 
                              dataKey="name" 
                              height={35} 
                              stroke="var(--brand)" 
                              fill="var(--background)"
                              gap={1}
                              travellerWidth={12}
                              className="text-[10px] font-bold"
                              tick={{ fontSize: 10, fill: 'var(--text-muted)', fontWeight: 700 }}
                              startIndex={0}
                              endIndex={Math.min(9, fuelComparisonData.length - 1)}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}

            {activeView === 'breakdowns' && (
              <div className="space-y-8">
                {/* Header with Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   <div>
                      <h2 className="text-2xl font-black text-text-main">تتبع الأعطال الفنية</h2>
                      <p className="text-sm font-bold text-text-muted">نظرة شاملة على سجلات الإصلاح والأعطال المفاجئة</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="flex bg-gray-100 p-1 rounded-xl border border-border-main self-start">
                        <button
                          onClick={() => setBreakdownViewMode('list')}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all",
                            breakdownViewMode === 'list' ? "bg-white text-brand shadow-sm" : "text-text-muted hover:text-text-main"
                          )}
                        >
                          <LayoutList className="w-4 h-4" />
                          <span>قائمة</span>
                        </button>
                        <button
                          onClick={() => setBreakdownViewMode('calendar')}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all",
                            breakdownViewMode === 'calendar' ? "bg-white text-brand shadow-sm" : "text-text-muted hover:text-text-main"
                          )}
                        >
                          <Calendar className="w-4 h-4" />
                          <span>تقويم</span>
                        </button>
                      </div>
                      <Button onClick={() => setIsBreakdownModalOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        <span>تسجيل عطل جديد</span>
                      </Button>
                   </div>
                </div>

                {/* Advanced Filters */}
                <div className="bg-white p-4 rounded-xl border border-border-main scroll-mt-20">
                   <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                         {/* Date Range */}
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-text-muted uppercase px-1">تصفية حسب التاريخ</label>
                            <div className="flex items-center gap-2">
                               <input 
                                 type="date"
                                 value={breakdownDateRange.start}
                                 onChange={(e) => setBreakdownDateRange(prev => ({ ...prev, start: e.target.value }))}
                                 className="flex-1 p-2 text-xs font-bold bg-gray-50 border border-border-main rounded-lg"
                               />
                               <span className="text-text-muted text-xs">إلى</span>
                               <input 
                                 type="date"
                                 value={breakdownDateRange.end}
                                 onChange={(e) => setBreakdownDateRange(prev => ({ ...prev, end: e.target.value }))}
                                 className="flex-1 p-2 text-xs font-bold bg-gray-50 border border-border-main rounded-lg"
                               />
                            </div>
                         </div>

                         {/* Cost Range */}
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-text-muted uppercase px-1">تصفية حسب التكلفة</label>
                            <div className="flex items-center gap-2">
                               <input 
                                 type="number"
                                 placeholder="الحد الأدنى"
                                 value={breakdownCostRange.min}
                                 onChange={(e) => setBreakdownCostRange(prev => ({ ...prev, min: e.target.value }))}
                                 className="flex-1 p-2 text-xs font-bold bg-gray-50 border border-border-main rounded-lg"
                               />
                               <input 
                                 type="number"
                                 placeholder="الحد الأعلى"
                                 value={breakdownCostRange.max}
                                 onChange={(e) => setBreakdownCostRange(prev => ({ ...prev, max: e.target.value }))}
                                 className="flex-1 p-2 text-xs font-bold bg-gray-50 border border-border-main rounded-lg"
                               />
                            </div>
                         </div>

                         {/* Sort */}
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-text-muted uppercase px-1">ترتيب حسب</label>
                            <div className="flex items-center gap-2">
                               <select 
                                 value={breakdownSort.key}
                                 onChange={(e) => setBreakdownSort(prev => ({ ...prev, key: e.target.value as any }))}
                                 className="flex-1 p-2 text-xs font-bold bg-gray-50 border border-border-main rounded-lg outline-none"
                               >
                                 <option value="date">التاريخ</option>
                                 <option value="cost">التكلفة</option>
                                 <option value="category">التصنيف</option>
                                 <option value="vehicle">المركبة</option>
                               </select>
                               <button 
                                 onClick={() => setBreakdownSort(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                                 className="p-2 bg-gray-50 border border-border-main rounded-lg text-brand hover:bg-brand/5 transition-colors"
                               >
                                 <ArrowUpDown className="w-4 h-4" />
                               </button>
                            </div>
                         </div>
                      </div>
                      
                      {(breakdownDateRange.start || breakdownDateRange.end || breakdownCostRange.min || breakdownCostRange.max) && (
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={() => {
                             setBreakdownDateRange({ start: '', end: '' });
                             setBreakdownCostRange({ min: '', max: '' });
                           }}
                           className="text-xs font-bold text-red-500"
                         >
                           إعادة تعيين المرشحات
                         </Button>
                      )}
                   </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard 
                    label="إجمالي حالات الأعطال" 
                    value={baseFilteredBreakdowns.length.toString() + ' حالات'} 
                    icon={AlertTriangle} 
                    color="orange" 
                  />
                  <StatCard 
                    label="إجمالي تكاليف الإصلاح" 
                    value={formatCurrency(baseFilteredBreakdowns.reduce((s, b) => s + b.cost, 0))} 
                    icon={CreditCard} 
                    color="orange" 
                  />
                  <StatCard 
                    label="أكثر الأعطال شيوعاً" 
                    value={(() => {
                      const counts: any = {};
                      baseFilteredBreakdowns.forEach(b => counts[b.category] = (counts[b.category] || 0) + 1);
                      const top = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0];
                      return top ? BREAKDOWN_CATEGORIES[top[0] as BreakdownCategory].label : '—';
                    })()} 
                    icon={Settings} 
                    color="orange" 
                  />
                </div>

                {/* Breakdown Frequency Chart & Summary */}
                {(data.breakdowns || []).length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card 
                      className="lg:col-span-2"
                      title="تكرار الأعطال حسب التصنيف" 
                      subtitle={breakdownFilter === 'all' ? "توزيع الأعطال خلال آخر 6 أشهر" : `عرض أعطال: ${BREAKDOWN_CATEGORIES[breakdownFilter].label}`}
                      icon={TrendingUp}
                      extra={breakdownFilter !== 'all' && (
                         <Button size="sm" variant="ghost" onClick={() => setBreakdownFilter('all')} className="text-[10px] h-7">
                            إلغاء التصفية
                         </Button>
                      )}
                    >
                      <div className="h-[300px] w-full pt-4 font-sans">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={breakdownChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }} 
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }}
                              allowDecimals={false}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '8px', 
                                border: '1px solid var(--border)', 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                direction: 'rtl'
                              }}
                              cursor={{ fill: 'rgba(0, 82, 204, 0.05)' }}
                            />
                            <Legend 
                              verticalAlign="top" 
                              align="right" 
                              iconType="circle"
                              wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold' }}
                              formatter={(value: string) => BREAKDOWN_CATEGORIES[value as BreakdownCategory]?.label || value}
                              onClick={(e: any) => setBreakdownFilter(e.dataKey)}
                              className="cursor-pointer"
                            />
                            <Bar dataKey="engine" name="محرك" fill="#3B82F6" radius={[4, 4, 0, 0]} stackId="a" onClick={() => setBreakdownFilter('engine')} className="cursor-pointer" />
                            <Bar dataKey="transmission" name="ناقل الحركة" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" onClick={() => setBreakdownFilter('transmission')} className="cursor-pointer" />
                            <Bar dataKey="electrical" name="كهرباء" fill="#F59E0B" radius={[4, 4, 0, 0]} stackId="a" onClick={() => setBreakdownFilter('electrical')} className="cursor-pointer" />
                            <Bar dataKey="cooling" name="نظام التبريد" fill="#EF4444" radius={[4, 4, 0, 0]} stackId="a" onClick={() => setBreakdownFilter('cooling')} className="cursor-pointer" />
                            <Bar dataKey="suspension" name="نظام التعليق" fill="#8B5CF6" radius={[4, 4, 0, 0]} stackId="a" onClick={() => setBreakdownFilter('suspension')} className="cursor-pointer" />
                            <Bar dataKey="brakes" name="الفرامل" fill="#EC4899" radius={[4, 4, 0, 0]} stackId="a" onClick={() => setBreakdownFilter('brakes')} className="cursor-pointer" />
                            <Bar dataKey="other" name="أعطال أخرى" fill="#6B7280" radius={[4, 4, 0, 0]} stackId="a" onClick={() => setBreakdownFilter('other')} className="cursor-pointer" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    <Card 
                      title="ملخص التكاليف" 
                      subtitle="إجمالي التكاليف حسب التصنيف"
                      icon={CreditCard}
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="text-text-muted border-b border-border font-bold">
                              <th className="pb-2">التصنيف</th>
                              <th className="pb-2 text-center">التكرار</th>
                              <th className="pb-2 text-left">إجمالي التكلفة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {(Object.keys(BREAKDOWN_CATEGORIES) as BreakdownCategory[]).map((key) => {
                              const cat = BREAKDOWN_CATEGORIES[key];
                              const s = breakdownSummary[key] || { count: 0, totalCost: 0 };
                              return (
                                <tr key={key} className={cn("hover:bg-brand/5 transition-colors cursor-pointer", breakdownFilter === key && "bg-brand/10")} onClick={() => setBreakdownFilter(key)}>
                                  <td className="py-3 font-bold text-text-main flex items-center gap-2 text-[10px]">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: categoryColors[key] }} />
                                    {cat.label}
                                  </td>
                                  <td className="py-3 text-center font-mono">{s.count}</td>
                                  <td className="py-3 text-left font-bold text-brand">{formatCurrency(s.totalCost)}</td>
                                </tr>
                              );
                            })}
                            <tr className="bg-brand/5 font-bold border-t-2 border-brand">
                              <td className="py-3 text-text-main uppercase text-[10px]">الإجمالي العام</td>
                              <td className="py-3 text-center font-mono">
                                {breakdownTotals.count}
                              </td>
                              <td className="py-3 text-left text-brand">
                                {formatCurrency(breakdownTotals.totalCost)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                   {(data.breakdowns || []).length === 0 ? (
                      <Card className="text-center py-20">
                         <AlertTriangle className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                         <h3 className="text-lg font-bold text-text-main">لا توجد أعطال مسجلة</h3>
                         <p className="text-text-muted mt-2 max-w-sm mx-auto font-medium">سجل الأعطال المفاجئة يساعدك في تتبع جودة المركبة وتكاليف الإصلاح غير المخطط لها.</p>
                         <Button onClick={() => setIsBreakdownModalOpen(true)} className="mt-6" variant="outline">تسجيل أول عطل</Button>
                      </Card>
                   ) : breakdownViewMode === 'calendar' ? (
                      <Card className="p-0 overflow-hidden">
                        <div className="p-4 border-b border-border-main flex items-center justify-between bg-gray-50/50">
                           <div className="flex items-center gap-4">
                              <button 
                                onClick={() => setCurrentBreakdownMonth(subMonths(currentBreakdownMonth, 1))}
                                className="w-10 h-10 rounded-xl border border-border-main bg-white hover:bg-gray-50 flex items-center justify-center text-brand transition-all shadow-sm"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                              <div className="text-center">
                                <h3 className="text-lg font-black text-text-main">{format(currentBreakdownMonth, 'MMMM yyyy', { locale: arSA })}</h3>
                                <p className="text-[10px] font-bold text-brand uppercase tracking-widest">تصفح سجلات الأعطال شهرياً</p>
                              </div>
                              <button 
                                onClick={() => setCurrentBreakdownMonth(addMonths(currentBreakdownMonth, 1))}
                                className="w-10 h-10 rounded-xl border border-border-main bg-white hover:bg-gray-50 flex items-center justify-center text-brand transition-all shadow-sm"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                           </div>
                           <Button variant="outline" size="sm" onClick={() => setCurrentBreakdownMonth(new Date())} className="text-xs font-bold">اليوم</Button>
                        </div>
                        
                        <div className="grid grid-cols-7 border-b border-border-main bg-gray-50/30">
                           {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
                              <div key={day} className="py-3 text-center text-[10px] font-black text-text-muted uppercase tracking-tighter border-l last:border-l-0 border-border-main">
                                 {day}
                              </div>
                           ))}
                        </div>

                        <div className="grid grid-cols-7 grid-rows-5 auto-rows-fr min-h-[600px]">
                           {(() => {
                              const monthStart = startOfMonth(currentBreakdownMonth);
                              const monthEnd = endOfMonth(monthStart);
                              const startDate = startOfWeek(monthStart);
                              const endDate = endOfWeek(monthEnd);
                              const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

                              return calendarDays.map((day) => {
                                 const dayBreakdowns = processedBreakdowns.filter(b => isSameDay(parseISO(b.date), day) && (breakdownFilter === 'all' || b.category === breakdownFilter));
                                 const isCurrentMonth = isSameMonth(day, monthStart);
                                 const isToday = isSameDay(day, new Date());

                                 return (
                                    <div 
                                      key={day.toString()} 
                                      className={cn(
                                        "min-h-[120px] p-2 border-l last:border-l-0 border-b border-border-main transition-colors relative flex flex-col gap-1",
                                        !isCurrentMonth ? "bg-gray-50/40 opacity-40" : "bg-white",
                                        isToday && "bg-brand/5 shadow-inner"
                                      )}
                                    >
                                       <span className={cn(
                                         "text-sm font-black w-7 h-7 flex items-center justify-center rounded-lg",
                                         isToday ? "bg-brand text-white shadow-lg" : isCurrentMonth ? "text-text-main" : "text-text-muted"
                                       )}>
                                          {format(day, 'd')}
                                       </span>

                                       <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar max-h-[80px]">
                                          {dayBreakdowns.map(b => {
                                             const vehicle = data.vehicles.find(v => v.id === b.vehicleId);
                                             const category = BREAKDOWN_CATEGORIES[b.category];
                                             return (
                                                <div 
                                                  key={b.id} 
                                                  className="p-1.5 rounded-lg border-r-4 text-[9px] font-bold shadow-sm transition-transform hover:scale-[1.02] cursor-pointer"
                                                  style={{ 
                                                    backgroundColor: `${categoryColors[b.category]}15`,
                                                    borderRightColor: categoryColors[b.category],
                                                    color: categoryColors[b.category]
                                                  }}
                                                  title={b.description}
                                                >
                                                   <p className="truncate opacity-80">{vehicle?.model}</p>
                                                   <p className="truncate font-black">{b.description}</p>
                                                </div>
                                             );
                                          })}
                                       </div>
                                    </div>
                                 );
                              });
                           })()}
                        </div>
                      </Card>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {(() => {
                           const filtered = processedBreakdowns.filter(b => breakdownFilter === 'all' || b.category === breakdownFilter);
                           
                           if (filtered.length === 0) {
                             return (
                               <div className="col-span-full py-12 text-center bg-background rounded-xl border border-dashed border-border-main">
                                 <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                                 <p className="text-sm font-bold text-text-muted">لا توجد سجلات تطابق هذه التصفية</p>
                                 <Button variant="ghost" size="sm" onClick={() => {
                                   setBreakdownFilter('all');
                                   setBreakdownDateRange({ start: '', end: '' });
                                   setBreakdownCostRange({ min: '', max: '' });
                                 }} className="mt-2 text-xs font-bold text-brand">إعادة تعيين الكل</Button>
                               </div>
                             );
                           }

                           return filtered.map(breakdown => {
                             const vehicle = data.vehicles.find(v => v.id === breakdown.vehicleId);
                             const category = BREAKDOWN_CATEGORIES[breakdown.category];
                             const CategoryIcon: any = { Zap, Thermometer, Cpu, Maximize, Settings, Disc, AlertTriangle }[category.icon] || AlertTriangle;

                             return (
                                <Card 
                                  key={breakdown.id} 
                                  title={breakdown.description} 
                                  subtitle={`${vehicle?.make} ${vehicle?.model} - ${breakdown.date}`}
                                  icon={CategoryIcon}
                                  extra={
                                     <button onClick={() => deleteBreakdown(breakdown.id)} className="text-red-500 hover:text-red-700 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                     </button>
                                  }
                                >
                                   <div className="space-y-4">
                                      <div className="flex justify-between items-center text-xs font-bold border-b border-border-main border-dashed pb-2">
                                         <span className="text-text-muted uppercase">التصنيف</span>
                                         <span className="text-text-main">{category.label}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-xs font-bold border-b border-border-main border-dashed pb-2">
                                         <span className="text-text-muted uppercase">تكلفة الإصلاح</span>
                                         <span className="text-brand">{formatCurrency(breakdown.cost)}</span>
                                      </div>
                                      {breakdown.repairedAt && (
                                         <div className="flex justify-between items-center text-xs font-bold border-b border-border-main border-dashed pb-2">
                                            <span className="text-text-muted uppercase">مكان الإصلاح</span>
                                            <span className="text-text-main">{breakdown.repairedAt}</span>
                                         </div>
                                      )}
                                      {breakdown.notes && (
                                         <div className="pt-2">
                                            <p className="text-[10px] font-bold text-text-muted uppercase mb-1">ملاحظات</p>
                                            <p className="text-xs text-text-muted italic leading-relaxed line-clamp-2">{breakdown.notes}</p>
                                         </div>
                                      )}
                                   </div>
                                </Card>
                             );
                           });
                         })()}
                      </div>
                   )}
                </div>
              </div>
            )}

            {activeView === 'ai-assistant' && (
              <AIAssistant />
            )}

            {activeView === 'settings' && (
              <div className="max-w-3xl space-y-8">
                <Card title="مظهر التطبيق" subtitle="تخصيص الألوان والسمة البصرية">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-text-main mb-4">اختر سمة لونية جاهزة:</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {PREDEFINED_THEMES.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setData(prev => ({ ...prev, theme: t }))}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border transition-all text-right",
                              data.theme?.primary === t.primary 
                                ? "border-brand bg-[#EBF3FF] ring-2 ring-brand ring-offset-2" 
                                : "border-border-main hover:border-brand"
                            )}
                          >
                            <div className="w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: t.primary }} />
                            <span className="text-sm font-bold text-text-main">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border-main">
                      <label className="block text-sm font-bold text-text-main mb-4">أو اختر لونك الخاص:</label>
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-xl border-2 border-border-main overflow-hidden cursor-pointer group">
                           <input 
                              type="color" 
                              value={data.theme?.primary || '#0052CC'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setData(prev => ({ 
                                  ...prev, 
                                  theme: { 
                                    primary: val, 
                                    primaryHover: val // Simplification
                                  } 
                                }));
                              }}
                              className="absolute inset-x-0 inset-y-0 w-24 h-24 -translate-x-4 -translate-y-4 cursor-pointer"
                           />
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/0 group-hover:bg-black/5 transition-colors">
                              <Palette className="w-6 h-6 text-white mix-blend-difference" />
                           </div>
                        </div>
                        <div className="flex-1">
                           <p className="text-sm font-bold text-text-main">لون التمييز المخصص</p>
                           <p className="text-xs text-text-muted mt-1">سيتم تطبيق هذا اللون على الأزرار والأيقونات والعناصر النشطة عبر التطبيق.</p>
                        </div>
                        {data.theme && (
                          <Button variant="ghost" className="text-xs" onClick={() => setData(prev => ({ ...prev, theme: undefined }))}>
                            إعادة الضبط
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="بيانات التطبيق" subtitle="إدارة البيانات المحلية">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-sm font-bold text-text-main">مسح جميع البيانات</p>
                         <p className="text-xs text-text-muted mt-1">سيؤدي هذا إلى حذف جميع المركبات والسجلات بشكل نهائي.</p>
                      </div>
                      <Button variant="danger" size="sm" onClick={() => {
                        if(confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
                          setData(INITIAL_DATA);
                          localStorage.removeItem('autolog_data');
                          window.location.reload();
                        }
                      }}>
                        مسح كافة البيانات
                      </Button>
                   </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="مشاركة سجلات المركبة">
        <div className="space-y-6">
           <p className="text-sm text-text-muted">اختر طريقة مشاركة سجلات الصيانة والمصاريف الخاصة بهذه المركبة:</p>
           
           <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => sharingVehicleId && handleShareEmail(sharingVehicleId)}
                className="flex items-center gap-4 p-4 rounded-xl border border-border-main hover:border-brand hover:bg-background transition-all group"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-brand group-hover:text-white transition-all">
                   <Mail className="w-5 h-5" />
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold text-text-main">إرسال عبر البريد الإلكتروني</p>
                   <p className="text-xs text-text-muted uppercase font-bold text-[10px]">تقرير نصي مفصل</p>
                </div>
              </button>

              <button 
                onClick={() => sharingVehicleId && handleCopyLink(sharingVehicleId)}
                className="flex items-center gap-4 p-4 rounded-xl border border-border-main hover:border-brand hover:bg-background transition-all group"
              >
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 group-hover:bg-brand group-hover:text-white transition-all">
                   <Copy className="w-5 h-5" />
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold text-text-main">نسخ رابط التقرير</p>
                   <p className="text-xs text-text-muted uppercase font-bold text-[10px]">رابط قابل للمشاركة وبصيغة الويب</p>
                </div>
              </button>

              {typeof navigator !== 'undefined' && navigator.share && (
                <button 
                  onClick={() => {
                    if (!sharingVehicleId) return;
                    const report = generateReportText(sharingVehicleId);
                    navigator.share({
                      title: 'سجل صيانة مركبة',
                      text: report,
                    });
                  }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border-main hover:border-brand hover:bg-background transition-all group"
                >
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-brand group-hover:text-white transition-all">
                     <ExternalLink className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-bold text-text-main">مشاركة عبر تطبيقات الجهاز</p>
                     <p className="text-xs text-text-muted uppercase font-bold text-[10px]">واتساب، رسائل، إلخ...</p>
                  </div>
                </button>
              )}
           </div>

           <div className="pt-4 border-t border-border-main">
              <p className="text-[10px] text-text-muted leading-relaxed">
                 ملاحظة: سيتم تضمين آخر 10 سجلات من الصيانة والمصاريف في الرابط المشارك لضمان سهولة الوصول.
              </p>
           </div>
        </div>
      </Modal>

      <Modal isOpen={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} title="إضافة مركبة جديدة">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          addVehicle({
            make: fd.get('make') as string,
            model: fd.get('model') as string,
            year: Number(fd.get('year')),
            licensePlate: fd.get('licensePlate') as string,
            currentOdometer: Number(fd.get('odometer')),
          });
        }}>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">الشركة المصنعة</label>
            <input name="make" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg focus:border-brand outline-none text-sm transition-all" required placeholder="مثلاً: تويوتا" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">الموديل</label>
            <input name="model" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg focus:border-brand outline-none text-sm transition-all" required placeholder="مثلاً: كامري" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">السنة</label>
              <input name="year" type="number" defaultValue={new Date().getFullYear()} className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg focus:border-brand outline-none text-sm transition-all" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">رقم اللوحة</label>
              <input name="licensePlate" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg focus:border-brand outline-none text-sm transition-all" required placeholder="أ ب ج 1234" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">قراءة العداد (كم)</label>
            <input name="odometer" type="number" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg focus:border-brand outline-none text-sm transition-all" required />
          </div>
          <Button className="w-full py-3 mt-4" type="submit">حفظ المركبة</Button>
        </form>
      </Modal>

      <Modal isOpen={isFuelModalOpen} onClose={() => setIsFuelModalOpen(false)} title="تسجيل تعبئة وقود">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          addFuelRecord({
            vehicleId: fd.get('vehicleId') as string,
            date: fd.get('date') as string,
            odometer: Number(fd.get('odometer')),
            liters: Number(fd.get('liters')),
            cost: Number(fd.get('cost')),
            station: fd.get('station') as string,
            isFullTank: true,
          });
        }}>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">المركبة</label>
            <select name="vehicleId" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required>
              {data.vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">التاريخ</label>
              <input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">قراءة العداد (كم)</label>
              <input name="odometer" type="number" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">الكمية (لتر)</label>
              <input name="liters" type="number" step="0.1" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">التكلفة الإجمالية (ر.س)</label>
              <input name="cost" type="number" step="0.01" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">محطة الوقود</label>
            <input name="station" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" placeholder="اختياري: اسم المحطة" />
          </div>
          <Button className="w-full py-3 mt-4" type="submit">تسجيل التعبئة</Button>
        </form>
      </Modal>

      <Modal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} title="إضافة تذكير صيانة">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          addReminder({
            vehicleId: fd.get('vehicleId') as string,
            title: fd.get('title') as string,
            type: fd.get('type') as any,
            dueDate: fd.get('dueDate') as string || undefined,
            dueOdometer: fd.get('dueOdometer') ? Number(fd.get('dueOdometer')) : undefined,
          });
        }}>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">المركبة</label>
            <select name="vehicleId" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required>
              {data.vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">مسمى التذكير</label>
            <input name="title" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required placeholder="مثلاً: تغيير زيت الفرامل" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">التصنيف</label>
            <select name="type" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required>
              <option value="oil">تغيير زيت</option>
              <option value="tires">إطارات</option>
              <option value="brakes">فرامل</option>
              <option value="insurance">تأمين</option>
              <option value="registration">فحص دوري / استمارة</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">تاريخ الاستحقاق</label>
              <input name="dueDate" type="date" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">عند عداد (كم)</label>
              <input name="dueOdometer" type="number" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" placeholder="اختياري" />
            </div>
          </div>
          <p className="text-[10px] text-text-muted">يمكنك تحديد التاريخ أو عداد المسافة أو كليهما. سيتم تنبيهك عند بلوغ أي منهما.</p>
          <Button className="w-full py-3 mt-4" type="submit">حفظ التذكير</Button>
        </form>
      </Modal>

      <Modal isOpen={isBreakdownModalOpen} onClose={() => setIsBreakdownModalOpen(false)} title="تسجيل عطل أو عطل مفاجئ">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          addBreakdown({
            vehicleId: fd.get('vehicleId') as string,
            category: fd.get('category') as any,
            description: fd.get('description') as string,
            date: fd.get('date') as string,
            cost: Number(fd.get('cost')),
            location: fd.get('location') as string || undefined,
            repairedAt: fd.get('repairedAt') as string || undefined,
            notes: fd.get('notes') as string || undefined,
          });
        }}>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">المركبة</label>
            <select name="vehicleId" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required>
              {data.vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">تصنيف العطل</label>
              <select name="category" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm">
                {Object.entries(BREAKDOWN_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">تاريخ الحدوث</label>
              <input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">وصف العطل</label>
            <input name="description" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required placeholder="مثلاً: سخونة مفاجئة في المحرك" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">تكلفة الإصلاح (ر.س)</label>
              <input name="cost" type="number" step="0.01" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">مكان الإصلاح</label>
              <input name="repairedAt" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" placeholder="اختياري: اسم الورشة" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">ملاحظات إضافية</label>
            <textarea name="notes" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm h-16" />
          </div>
          <Button className="w-full py-3 mt-4" type="submit">تسجيل العطل</Button>
        </form>
      </Modal>

      <Modal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} title="إضافة سجل صيانة">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          addRecord({
            vehicleId: fd.get('vehicleId') as string,
            type: fd.get('type') as any,
            title: fd.get('title') as string,
            date: fd.get('date') as string,
            cost: Number(fd.get('cost')),
            odometer: Number(fd.get('odometer')),
            notes: fd.get('notes') as string,
          });
          // Update current odometer of vehicle
          const vid = fd.get('vehicleId') as string;
          const odo = Number(fd.get('odometer'));
          setData(prev => ({
            ...prev,
            vehicles: prev.vehicles.map(v => v.id === vid ? { ...v, currentOdometer: Math.max(v.currentOdometer, odo) } : v)
          }));
        }}>
          <div>
            <label className="block text-xs font-bold text-[#6B778C] uppercase mb-1.5">المركبة</label>
            <select name="vehicleId" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required>
              {data.vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">نوع الخدمة</label>
              <select name="type" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm">
                {Object.entries(MAINTENANCE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">تاريخ الصيانة</label>
              <input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">وصف الخدمة</label>
            <input name="title" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required placeholder="مثلاً: صيانة دورية 20,000 كم" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">التكلفة (ر.س)</label>
              <input name="cost" type="number" step="0.01" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">قراءة العداد (كم)</label>
              <input name="odometer" type="number" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">ملاحظات الفني</label>
            <textarea name="notes" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm h-16" />
          </div>
          <Button className="w-full py-3 mt-4" type="submit">إتمام الإضافة</Button>
        </form>
      </Modal>

      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="إضافة فاتورة جديدة">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          addExpense({
            vehicleId: fd.get('vehicleId') as string,
            category: fd.get('category') as any,
            date: fd.get('date') as string,
            amount: Number(fd.get('amount')),
            notes: fd.get('notes') as string,
          });
        }}>
           <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">المركبة</label>
            <select name="vehicleId" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required>
              {data.vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">تصنيف الفاتورة</label>
              <select name="category" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm">
                {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">تاريخ الفاتورة</label>
              <input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">قيمة الفاتورة (ر.س)</label>
            <input name="amount" type="number" step="0.01" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">تفاصيل المصروف</label>
            <textarea name="notes" className="w-full p-2.5 bg-[#F9FAFB] border border-border-main rounded-lg outline-none text-sm h-16" />
          </div>
          <Button className="w-full py-3 mt-4" type="submit">إتمام الإضافة</Button>
        </form>
      </Modal>
    </div>
  );
}

const CustomFuelTooltip = ({ active, payload, label, overallAverage }: any) => {
  if (active && payload && payload.length) {
    const itemData = payload[0].payload;
    const l100 = itemData.l100;
    const mpg = itemData.mpg;

    const diffFromAvg = overallAverage && l100 ? ((l100 - overallAverage) / overallAverage) * 100 : null;
    const isBetterThanAvg = diffFromAvg !== null && diffFromAvg < 0;

    return (
      <div className="bg-white/95 backdrop-blur-sm p-5 border-2 border-border-main rounded-2xl shadow-xl rtl min-w-[260px] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4 border-b border-border-main pb-3">
          <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand shadow-sm">
            <Fuel className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-base text-text-main leading-tight truncate">{label}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">تحليل الكفاءة والمقارنة</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-100 shadow-sm">
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand shadow-sm" />
                <span className="text-[11px] font-bold text-text-muted uppercase">الاستهلاك</span>
             </div>
             <div className="text-right">
               <span className="text-sm font-black text-brand">
                  {l100 ? `${l100.toFixed(2)}` : '—'}
               </span>
               <span className="text-[9px] font-bold text-text-muted mr-1">لتر/100كم</span>
             </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-green-50/70 border border-green-100 shadow-sm">
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-sm" />
                <span className="text-[11px] font-bold text-text-muted uppercase">الكفاءة</span>
             </div>
             <div className="text-right">
               <span className="text-sm font-black text-[#10B981]">
                  {mpg ? `${mpg.toFixed(1)}` : '—'}
               </span>
               <span className="text-[9px] font-bold text-text-muted mr-1">MPG</span>
             </div>
          </div>

          {diffFromAvg !== null && (
            <div className={cn(
              "p-3 rounded-xl border flex flex-col gap-1 transition-colors",
              isBetterThanAvg ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
            )}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-text-muted uppercase">مقارنة بمتوسط المجموعة</span>
                <div className={cn(
                  "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold",
                  isBetterThanAvg ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                )}>
                  {isBetterThanAvg ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                  {Math.abs(diffFromAvg).toFixed(1)}%
                </div>
              </div>
              <p className={cn(
                "text-[9px] font-medium",
                isBetterThanAvg ? "text-emerald-700" : "text-red-700"
              )}>
                {isBetterThanAvg ? 'أكفأ من متوسط السيارات المحددة' : 'أقل كفاءة من متوسط المحددة'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-border-main border-dashed flex items-center gap-2">
          <AlertCircle className="w-3 h-3 text-text-muted" />
          <p className="text-[9px] text-text-muted font-medium italic text-center leading-tight">بناءً على تزويد الوقود لعداد المسافة الفعلي</p>
        </div>
      </div>
    );
  }
  return null;
};

function StatCard({ label, value, icon: Icon, color }: { 
  label: string; 
  value: string; 
  icon: React.ElementType; 
  color: 'blue' | 'green' | 'orange' | 'purple';
}) {
  return (
    <div className="bg-white border border-border-main p-6 rounded-xl hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">{label}</p>
          <h4 className="text-2xl font-bold text-text-main">{value}</h4>
        </div>
        <div className="p-3 rounded-lg bg-background text-brand group-hover:bg-[#EBF3FF] transition-colors">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
