import React, { useState } from 'react';
import { 
  Car, 
  Wrench, 
  Fuel, 
  CreditCard, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  GitCompare, 
  AlertTriangle,
  Github,
  Globe,
  Plus,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onEnterApp: () => void;
  vehiclesCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, vehiclesCount }) => {
  const [activeTab, setActiveTab] = useState<'maint' | 'fuel' | 'export' | 'ai'>('maint');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      id: 'maint',
      title: 'سجلات الصيانة الدورية',
      desc: 'إضافة ومتابعة دقيقة لكل تفاصيل فحص وتغيير الزيت والفرامل والبطاريات ونظام التوجيه مع تحديد دقيق لمعدلات الاستهلاك والتكلفة.',
      icon: Wrench,
      badge: 'إدارة متكاملة',
      color: 'blue'
    },
    {
      id: 'fuel',
      title: 'مراقبة وحساب استهلاك الوقود',
      desc: 'تعرّف على كفاءة سيارتك ومعدل اللترات لكل 100 كم، مع دعم كامل للعملات المحلية وأنواع المحطات لتفادي هدر الموارد.',
      icon: Fuel,
      badge: 'إحصائيات متقدمة',
      color: 'emerald'
    },
    {
      id: 'export',
      title: 'المزامنة مع Google Workspace',
      desc: 'اضغط مرة واحدة للحصول على تقارير مالية تفصيلية ومشاركتها فورياً على Google Sheets و Google Docs بفضل التكامل المباشر والسلس.',
      icon: FileText,
      badge: 'تصدير لحظي',
      color: 'green'
    },
    {
      id: 'ai',
      title: 'مساعد ذكي مدعوم بالـ AI',
      desc: 'تحدّث مباشرة مع نظام الذكاء الاصطناعي (Gemini) ليقوم بتحليل سجلات مركبتك وتقديم توصيات مخصصة وحلول فورية للأعطال الشائعة.',
      icon: Sparkles,
      badge: 'ذكاء اصطناعي',
      color: 'indigo'
    }
  ];

  const showcaseMockup = {
    maint: (
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">تغيير زيت المحرك + الفلتر</p>
              <p className="text-xs text-gray-400 font-medium">هيونداي سوناتا 2023</p>
            </div>
          </div>
          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">٢٥٠ ر.س</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-50 p-2.5 rounded-lg">
            <span className="text-gray-400 block font-semibold">تاريخ الصيانة</span>
            <span className="font-bold text-gray-700">2026-06-10</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg">
            <span className="text-gray-400 block font-semibold">عداد المسافات</span>
            <span className="font-bold text-gray-700">45,200 كم</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="font-semibold">الصيانة القادمة الموصى بها في 55,000 كم</span>
        </div>
      </div>
    ),
    fuel: (
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Fuel className="w-4 h-4" />
            </div>
            <p className="font-bold text-gray-800 text-sm">كفاءة استهلاك الوقود</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 rounded-md">ممتاز</span>
        </div>
        <div className="h-20 flex items-end justify-between gap-2 px-2 pt-2">
          <div className="w-7 bg-emerald-100 h-1/3 rounded-t-sm" title="الرحلة 1"></div>
          <div className="w-7 bg-emerald-200 h-2/3 rounded-t-sm" title="الرحلة 2"></div>
          <div className="w-7 bg-emerald-300 h-1/2 rounded-t-sm" title="الرحلة 3"></div>
          <div className="w-7 bg-[#059669] h-[95%] rounded-t-sm" title="الحالية"></div>
        </div>
        <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100">
          <div className="text-right">
            <span className="text-gray-400 block font-semibold">معدل الاستهلاك</span>
            <span className="font-extrabold text-gray-700 text-sm">6.4 لتر / 100كم</span>
          </div>
          <div className="text-left font-semibold text-emerald-600">
            أوفر بـ ١٢٪ من الأسبوع الماضي
          </div>
        </div>
      </div>
    ),
    export: (
      <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] bg-green-50 text-green-700 font-extrabold px-2.5 py-1 rounded-sm uppercase tracking-wider">Google Sheets & Docs Connected</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
        </div>
        <p className="text-xs text-gray-400 font-semibold leading-relaxed">تصدير لحظي لكل التقارير، والفواتير، والأعطال لضبط الميزانية بأعلى مرونة:</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs p-2 bg-[#F6FDF9] rounded-lg border border-green-100">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-500 text-white text-[9px] font-bold flex items-center justify-center">S</span>
              <span className="font-bold text-gray-700">سجل_المصاريف_2026.xlsx</span>
            </div>
            <span className="text-[10px] text-green-600 font-bold">تم التحديث للتو</span>
          </div>
          <div className="flex items-center justify-between text-xs p-2 bg-[#F3F8FF] rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">D</span>
              <span className="font-bold text-gray-700">تقرير_الأعطال_التفصيلي.docx</span>
            </div>
            <span className="text-[10px] text-blue-600 font-bold">تم الإرسال</span>
          </div>
        </div>
      </div>
    ),
    ai: (
      <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide">المساعد الذكي للسيارات (Gemini)</p>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2 items-start text-xs">
            <div className="bg-gray-100 p-2 rounded-xl text-gray-700 max-w-[80%] rounded-tr-none font-medium">
              السيارة ترتفع درجة حرارتها عند الوقوف في الازدحام المروري فقط.
            </div>
          </div>
          <div className="flex gap-2 items-start justify-end text-xs">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-950 max-w-[85%] rounded-tl-none border border-indigo-100">
              <p className="font-bold mb-1 text-indigo-900">تحليل المساعد الذكي 🤖</p>
              قد يكون السبب مروحة التبريد الإضافية أو نقص سائل التبريد. يرجى فحص مروحة الرديتر والتأكد من عدم وجود تسريب لضمان سلامة المحرك.
            </div>
          </div>
        </div>
      </div>
    )
  };

  const steps = [
    {
      num: '١',
      title: 'إدراج المركبات',
      desc: 'سجل معلومات وموديل سيارتك، سنة الصنع، ورقم اللوحة والقرّاء الفعلي لعداد المسافات.'
    },
    {
      num: '٢',
      title: 'تدوين العمليات والمصاريف',
      desc: 'أدخل معلومات تعبئات الوقود وتواريخ تغيير الزيت، مع حفظ تكاليف التأمين والمصاريف المختلفة.'
    },
    {
      num: '٣',
      title: 'مراقبة وتصدير',
      desc: 'احصل على منحنيات بيانية حية، واطبع كشف حسابك، أو صدّره بضغطة زر إلى حساب Google الخاص بك.'
    }
  ];

  const faqs = [
    {
      q: 'هل كير مجاني بالكامل للاستخدام الشخصي؟',
      a: 'نعم، أوتو كير مجاني بالكامل للأفراد. يمكنك إدارة أسطول مركباتك وتتبع كل المصاريف مجاناً دون قيود أو رسوم مخفية.'
    },
    {
      q: 'كيف يمكنني ربط حساب Google وتصدير السجلات؟',
      a: 'من خلال شاشة "التقارير المالية"، ستجد زر "ربط حساب Google". بعد تسجيل الدخول الآمن، ستتمكن من تصدير تقارير الصيانة وجداول الاستهلاك والتحليلات فورياً إلى Google Sheets أو Google Docs لتكون بين يديك بأي وقت.'
    },
    {
      q: 'هل يمكنني إدارة أكثر من سيارة؟',
      a: 'بكل تأكيد! يدعم النظام فكرة "أسطول السيارات". يمكنك إضافة سيارات العائلة أو سيارات العمل وتتبع أرقام لوحاتها ومصاريفها وقراءات عداداتها بشكل مستقل، مع المقارنة أوتوماتيكياً من شاشة مقارنة الأداء.'
    },
    {
      q: 'كيف يفيدني المساعد الذكي المدعوم بالذكاء الاصطناعي؟',
      a: 'المساعد الذكي يقرأ ويفهم طبيعة الصيانة التي قمت بها لسيارتك. يمكنك محاورته وطرح الأسئلة مثل "متى يجب علي تغيير زيت الفرامل؟" أو شرح أي عرض تلاحظه في سيارتك ليقوم المساعد بصياغة نصائح وإرشادات وقائية ممتازة.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 font-sans relative overflow-x-hidden selection:bg-blue-100" dir="rtl">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40 -z-10 animate-pulse"></div>
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-30 -z-10"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-40 -z-10"></div>

      {/* Landing Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 px-6 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-500/10">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">أوتو كير</span>
            <span className="text-[10px] bg-blue-50 text-blue-600 font-black px-1.5 py-0.5 rounded mr-1">ذكي</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <a href="#features" className="hover:text-blue-600 transition-colors">المميزات</a>
          <a href="#how-it-works" className="hover:text-blue-600 transition-colors">طريقة العمل</a>
          <a href="#mockup" className="hover:text-blue-600 transition-colors">المظهر التفاعلي</a>
          <a href="#faqs" className="hover:text-blue-600 transition-colors">الأسئلة الشائعة</a>
          <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-full">١٠٠٪ مجاني</span>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={onEnterApp}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 flex items-center gap-1.5"
          >
            <span>دخول التطبيق</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-16 pt-16 pb-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7 space-y-8 text-right">
          <div className="inline-flex items-center gap-2 bg-blue-50/80 text-blue-700 px-4 py-2 rounded-full text-xs font-black border border-blue-100/45 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>نظام الإدارة الشامل والذكي للمركبات مجاناً</span>
          </div>

          <h2 className="text-4xl lg:text-[45px] lg:leading-[1.3] font-black text-slate-900 tracking-wide">
            أوتو كير: نظامك الرقمي المتكامل لإدارة <span className="text-blue-600 underline decoration-wavy decoration-emerald-400">وصيانة مركباتك</span>
          </h2>

          <p className="text-slate-500 text-sm md:text-base leading-loose font-medium max-w-2xl">
            تجنّب الأعطال المفاجئة وصيانة سيارتك بالطريقة الأمثل. تتبع استهلاك الوقود لحظياً، جدوّل مواعيد تغيير الزيت والفرامل، واطرح استفساراتك للمساعد الذكي AI، مع ميزة التصدير الفوري المباشر لـ Google Sheets و Google Docs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <button 
              onClick={onEnterApp}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-8 py-4.5 rounded-2xl transition-all shadow-xl shadow-blue-500/15 hover:shadow-blue-500/25 active:scale-[0.98] duration-200 text-center flex items-center justify-center gap-2"
            >
              <span>ابدأ الإدارة مجاناً الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <a 
              href="#features"
              className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-black px-8 py-4.5 rounded-2xl transition-all active:scale-[0.98] duration-200 text-center shadow-sm"
            >
              استكشف المزايا
            </a>
          </div>

          {/* Social / State Indicators */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-slate-500">لا يتطلب بطاقة ائتمان</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-slate-500">تكامل تام مع Google Workspace</span>
            </div>
            {vehiclesCount > 0 && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-100/60 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>لديك حالياً {vehiclesCount} سيارة مضافة داخل النظام!</span>
              </div>
            )}
          </div>
        </div>

        {/* Hero Interactive Showcase preview */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-blue-500/5 rounded-[2.5rem] rotate-3 -z-10"></div>
          <div className="bg-slate-900 text-gray-100 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">AutoCare OS Dashboard</span>
            </div>

            {/* Simulated Live dashboard elements */}
            <div className="space-y-4">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50 flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase mb-1">السيارة الحالية</span>
                  <p className="text-sm font-black text-white">تويوتا فورتشنر 2024</p>
                </div>
                <div className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-1 rounded-lg font-bold">
                  نشط 🟢
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
                  <span className="text-[9px] text-slate-300 block mb-1 font-semibold">إجمالي استهلاك الوقود</span>
                  <span className="text-sm font-extrabold text-white">٢٤٠ لتر</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
                  <span className="text-[9px] text-slate-300 block mb-1 font-semibold">فواتير ومصاريف</span>
                  <span className="text-sm font-extrabold text-blue-400">١,٢٥٠ ر.س</span>
                </div>
              </div>

              {/* Cool mini widget showing Google Sheets sync */}
              <div className="bg-[#107C41]/10 text-[#21A366] p-3 rounded-xl border border-[#107C41]/30 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#107C41] animate-ping"></span>
                  <span>متصل بـ Google Sheets</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
              
              {/* Premium Interactive elements inside landing preview */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/30 text-xs text-slate-300 leading-relaxed font-semibold">
                ✨ <span className="text-white">نصيحة المساعد الذكي:</span> كفاءة طرمبة الوقود تنخفض إذا سرت بالسيارة في خزان وقود فارغ دائماً. يرجى التعبئة قبل نزول المؤشر تحت ١/٤.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-slate-50 border-y border-slate-100 py-16 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <span className="text-3xl md:text-4xl font-black text-blue-600 block mb-2">٨,٤٥٠+</span>
            <span className="text-xs md:text-sm text-slate-500 font-bold">مركبة تم تدوين سجلاتها</span>
          </div>
          <div>
            <span className="text-3xl md:text-4xl font-black text-blue-600 block mb-2">١٢,٠٠٠+</span>
            <span className="text-xs md:text-sm text-slate-500 font-bold">تصدير لـ Google Sheets</span>
          </div>
          <div>
            <span className="text-3xl md:text-4xl font-black text-blue-600 block mb-2">٩٩.٨٪</span>
            <span className="text-xs md:text-sm text-slate-500 font-bold">نسبة رضاء السائقين</span>
          </div>
          <div>
            <span className="text-3xl md:text-4xl font-black text-blue-600 block mb-2">مجاني بالكامل</span>
            <span className="text-xs md:text-sm text-slate-500 font-bold">بدون أي تكاليف خفية</span>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section id="features" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">الخصائص الفعالة</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">كل ما تحتاجه لإدارة سيارتك في مكان واحد</h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed font-semibold">
            تم دمج كافة الميزات والتقنيات لتوفير رحلة مستخدم وبسيطة تغنيك عن تشتت الدفاتر وتطبيقات الملاحظات التقليدية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
               <Wrench className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-3">سجل الصيانة الذكي</h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              تتبع شامل لكل صيانة تقوم بها. زيت المحرك، الإطارات، تيل الفرامل، فحص البطارية مع تدوين الفواتير ومواعيد الفحص القادمة.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
               <Fuel className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-3">تحليل استهلاك الوقود</h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              حاسبة ذكية لاستهلاك الوقود تمنحك معدل اللترات لكل 100 كم، ومتوسط التكلفة الشهرية، وتحديد كفاءة القيادة.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
               <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-3">التكامل مع Google Docs & Sheets</h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              صدّر كافة البيانات والعمليات مباشرة وبلمسة واحدة إلى جداول بيانات مخصصة أو تقرير صيانة دوري أنيق في مستندات Google.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
               <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-3">مساعد Gemini الذكي بالذكاء الاصطناعي</h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              محادثة ذكية تفاعلية لفهم أي قلق بشأن مركبتك، قراءة سجل الصيانة لإفادتك بأفضل نصائح التوفير واستقرار المحرك.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
               <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-3">تجميع وتتبع الأعطال</h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              سجّل الأعطال الطارئة التي تعرضت لها ومستوى تكرارها وتكاليف إصلاحها لئلا تفاجئك المشكلة ذاتها مستقبلاً.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
               <GitCompare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-3">مقارنة كفاءة السيارات</h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              إذا كنت تملك أكثر من سيارة، قارن التكلفة الكلية للوقود والصيانة لكل سيارة لتحديد الموديل الأكثر اقتصادية والأكثر موثوقية.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Mockup Switcher Section */}
      <section id="mockup" className="py-20 bg-slate-50 border-y border-slate-100 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">استعراض حي وتفاعلي</span>
            <h2 className="text-3xl font-black text-slate-900">شاهد تفوق أوتو كير في لوحة التحكم</h2>
            <p className="text-slate-500 text-sm font-semibold">
              انقر على التبويبات أدناه لمشاهدة نماذج تفاعلية حية تصف جودة وجمال الواجهة والبيانات.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Tabs selector */}
            <div className="lg:col-span-5 space-y-3">
              {features.map(f => {
                const Icon = f.icon;
                const isSelected = activeTab === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveTab(f.id as any)}
                    className={`cursor-pointer w-full text-right p-5 rounded-2xl border transition-all text-sm font-bold flex items-center gap-4 ${
                      isSelected 
                        ? 'bg-white border-blue-500 shadow-md text-slate-900' 
                        : 'bg-transparent border-transparent hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-extrabold">{f.title}</p>
                        <span className={`text-[9px] px-2 py-0.5 rounded ${
                          isSelected ? 'bg-blue-50 text-blue-600 font-extrabold' : 'bg-slate-200 text-slate-600 font-semibold'
                        }`}>{f.badge}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold mt-1 font-normal line-clamp-1">{f.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Simulated interactive Screen */}
            <div className="lg:col-span-7 bg-white/50 p-4 rounded-3xl border border-slate-200 shadow-xl relative min-h-[300px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-md"
                >
                  {showcaseMockup[activeTab]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Stepper */}
      <section id="how-it-works" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">خطوات الانطلاق</span>
          <h2 className="text-3xl font-black text-slate-900">طريقة الاستخدام بثلاث خطوات بسيطة</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-100 -z-10"></div>
          {steps.map((s, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 text-center relative group shadow-sm">
              <div className="w-12 h-12 bg-blue-600 text-white font-extrabold text-lg rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform">
                {s.num}
              </div>
              <h3 className="font-extrabold text-slate-800 text-base mb-3">{s.title}</h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="py-20 bg-slate-50 border-t border-slate-100 px-6 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full font-bold">الأسئلة المتكررة</span>
            <h2 className="text-3xl font-black text-slate-900">هل لديك أي استفسار حول نظامنا؟</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="cursor-pointer w-full text-right p-5 flex justify-between items-center text-sm font-extrabold text-slate-800 hover:bg-slate-50/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-6 lg:px-16 py-20 max-w-7xl mx-auto">
        <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-16 text-center space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-30 -z-5"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 rounded-full blur-3xl opacity-20 -z-5"></div>

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto text-yellow-400">
               <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-2xl lg:text-3.5xl font-black leading-tight">
              ابدأ في صيانة وإدارة سياراتك بذكاء ووفر نفقاتك اليوم
            </h2>
            <p className="text-slate-300 text-sm font-semibold max-w-lg mx-auto leading-relaxed">
              انتقل الآن إلى لوحة التحكم وأضف سيارتك الأولى. تتبع نفقاتها مجاناً وبأعلى أمان للبيانات مع نظام أوتو كير دائم التطوير.
            </p>
            <button
              onClick={onEnterApp}
              className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-8 py-4 rounded-xl transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              <span>دخول لوحة التحكم والبدء مجاناً</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="border-t border-gray-100 py-12 px-6 lg:px-16 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-400 font-semibold">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white"><Car className="w-3.5 h-3.5" /></div>
          <span className="font-bold text-slate-700">أوتو كير © ٢٠٢٦</span>
        </div>
        <div>
          تصميم وبرمجة مبتكرة مدعومة بالذكاء الاصطناعي والإنتاجية الرقمية.
        </div>
        <div className="flex gap-6">
          <a href="#features" className="hover:text-blue-600">المميزات</a>
          <a href="#faqs" className="hover:text-blue-600">الأسئلة الشائعة</a>
          <span onClick={onEnterApp} className="cursor-pointer hover:text-blue-600">دخول التطبيق</span>
        </div>
      </footer>
    </div>
  );
};
