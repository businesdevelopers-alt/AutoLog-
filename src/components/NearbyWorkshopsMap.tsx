import React, { useState, useEffect, useRef } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  InfoWindow, 
  Pin, 
  useAdvancedMarkerRef 
} from '@vis.gl/react-google-maps';
import { 
  MapPin, 
  Wrench, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  Star, 
  Copy, 
  RefreshCw, 
  ExternalLink,
  SlidersHorizontal,
  Sparkles,
  Award,
  AlertCircle
} from 'lucide-react';

// Get Google Maps API key from injected environment
const API_KEY = (process.env.GOOGLE_MAPS_PLATFORM_KEY as string) || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.trim() !== '';

interface Workshop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  reviewsCount: number;
  type: 'general' | 'japanese' | 'european' | 'electrical' | 'rapid';
  typeName: string;
  phone: string;
  address: string;
  discountCode: string;
  benefits: string[];
  distance?: number; // Distance in km from user
}

// Fixed base workshops details that we will dynamically position around user's location
const BASE_WORKSHOPS: Omit<Workshop, 'lat' | 'lng'>[] = [
  {
    id: 'ws-1',
    name: 'مركز الفارس لصيانة السيارات اليابانية والكورية',
    rating: 4.8,
    reviewsCount: 312,
    type: 'japanese',
    typeName: 'ميكانيكا عامة (ياباني/كوري)',
    phone: '+966 50 123 4567',
    address: 'المنطقة الصناعية، مخرج 17',
    discountCode: 'AUTOCARE15',
    benefits: ['خصم 15% لمستخدمي أوتو كير', 'ضمان 30 يوم على قطع الغيار الميكانيكية', 'فحص مجاني تال للمحرك']
  },
  {
    id: 'ws-2',
    name: 'المركز الألماني المتكامل لصيانة السيارات الأوروبية',
    rating: 4.9,
    reviewsCount: 184,
    type: 'european',
    typeName: 'صيانة متقدمة (ألماني/أوروبي)',
    phone: '+966 55 987 6543',
    address: 'حي القيروان، طريق الملك فهد',
    discountCode: 'DEUTSCH10',
    benefits: ['خصم 10% على البرمجة والصيانة', 'مهندسون وفنيون معتمدون', 'جهاز فحص كمبيوتر مجاني']
  },
  {
    id: 'ws-3',
    name: 'ورشة القوة لتوضيب المحركات وناقل الحركة',
    rating: 4.6,
    reviewsCount: 256,
    type: 'general',
    typeName: 'توضيب كامل وجربكسات',
    phone: '+966 53 444 8888',
    address: 'صناعية العاصمة، شارع الفتح',
    discountCode: 'POWER20',
    benefits: ['فحص الجربكس مجاني', 'ضمان 6 أشهر على التوضيب', 'خصم معتمد للمشتركين']
  },
  {
    id: 'ws-4',
    name: 'مركز المحترف لإلكترونيات السيارات وفحص الكمبيوتر',
    rating: 4.7,
    reviewsCount: 145,
    type: 'electrical',
    typeName: 'كهرباء وإلكترونيات السيارات',
    phone: '+966 54 333 2211',
    address: 'حي الرمال، الشارع التجاري',
    discountCode: 'ELECTRO5',
    benefits: ['كشف مجاني على ظفيرة السيارة', 'حلول لجميع لمبات الأعطال والطبلون', 'ضمان على الأعمال الكهربائية']
  },
  {
    id: 'ws-5',
    name: 'سريع وسهل - مركز التغيير الخفيف والدوري',
    rating: 4.5,
    reviewsCount: 420,
    type: 'rapid',
    typeName: 'صيانة سريعة (زيوت/فلاتر/فرامل)',
    phone: '+966 56 777 9900',
    address: 'حي الياسمين، طريق أنس بن مالك',
    discountCode: 'QUICKCARE',
    benefits: ['تغيير الزيوت المعتمدة خلال ربع ساعة', 'فحص مجاني لجميع سوائل السيارة', 'خصم 15% على الفلتر الثاني']
  }
];

export const NearbyWorkshopsMap: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 24.7136, // Default Riyadh
    lng: 46.6753
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [activeWorkshopId, setActiveWorkshopId] = useState<string | null>(null);
  const [infoWindowOpenId, setInfoWindowOpenId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // References inside map
  const mapRef = useRef<any>(null);

  // Calculate distance between two lat/lng in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('خاصية مشاركة الموقع الجغرافي ليست مدعومة بمستعرضك المختار.');
      generateWorkshopsAround({ lat: 24.7136, lng: 46.6753 });
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(coords);
        generateWorkshopsAround(coords);
        setIsGettingLocation(false);
      },
      (error) => {
        let msg = 'تعذر الحصول على موقعك الحالي. سيتم استخدام وسط المدينة الافتراضي.';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            msg = 'تم رفض إذن الوصول للموقع. يرجى تفعيل الموقع لعرض ورش قريبة منك، أو استخدام المظهر التقديري المتاح.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'بيانات الموقع غير متوفرة حالياً. جاري استخدام الموقع الافتراضي.';
            break;
          case error.TIMEOUT:
            msg = 'انتهت مهلة جلب الموقع. جاري الاستعانة بالموقع الافتراضي.';
            break;
        }
        setLocationError(msg);
        setIsGettingLocation(false);
        generateWorkshopsAround({ lat: 24.7136, lng: 46.6753 });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Dynamically position mock workshops around the center
  const generateWorkshopsAround = (center: { lat: number; lng: number }) => {
    // Generate deterministic offsets around current user coordinates
    const offsets = [
      { latOffset: 0.0075, lngOffset: 0.0094 },   // North-East
      { latOffset: -0.0091, lngOffset: 0.0051 },  // South-East
      { latOffset: 0.0042, lngOffset: -0.0108 },  // North-West
      { latOffset: -0.0064, lngOffset: -0.0076 }, // South-West
      { latOffset: 0.0015, lngOffset: 0.0062 }    // Center-East
    ];

    const generated = BASE_WORKSHOPS.map((base, idx) => {
      const offset = offsets[idx];
      const lat = center.lat + offset.latOffset;
      const lng = center.lng + offset.lngOffset;
      const distance = calculateDistance(center.lat, center.lng, lat, lng);
      return {
        ...base,
        lat,
        lng,
        distance
      };
    });

    setWorkshops(generated);
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredWorkshops = workshops.filter(w => {
    if (categoryFilter === 'all') return true;
    return w.type === categoryFilter;
  });

  const selectWorkshop = (w: Workshop) => {
    setActiveWorkshopId(w.id);
    setInfoWindowOpenId(w.id);
    
    // Zoom/pan map if possible
    if (mapRef.current) {
      mapRef.current.panTo({ lat: w.lat, lng: w.lng });
      mapRef.current.setZoom(14);
    }
    
    // Scroll to the detail card in the sidebar
    const el = document.getElementById(`workshop-card-${w.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Render a detailed setup guide if no valid API key is present
  if (!hasValidKey) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm text-right space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">تفعيل خريطة الورش المعتمدة التفاعلية</h3>
            <p className="text-xs text-text-muted font-bold">يتطلب هذا النظام إدخال مفتاح Google Maps API لتفعيل المزايا الجغرافية بالكامل.</p>
          </div>
        </div>

        <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 text-xs text-orange-950 font-bold leading-relaxed space-y-3">
          <p>🔧 تتيح لك الخريطة التفاعلية استعراض مواقع الورش المعتمدة حولك في المملكة العربية السعودية، الحصول على كوبونات الخصم، وتحديد الورشة الأنسب لكبينة سيارتك وعطلها الحالي.</p>
          
          <div className="bg-white p-4 rounded-xl border border-orange-200 space-y-2 text-slate-700">
            <p className="font-extrabold text-slate-800 underline">لتفعيل الخريطة وتصدير المفتاح الخاص بالخدمة:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-xs">
              <li>احصل على مفتاح مجاني من منصة جوجل: <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-extrabold">منصة Google Cloud Console</a></li>
              <li>انتقل إلى الإعدادات الذكية في تطبيق أوتو كير (⚙️ رمز الترس في أعلى القائمة الجانبية).</li>
              <li>اختر <span className="font-extrabold">Secrets</span> (الأسرار).</li>
              <li>أدخل الإسم المحدد: <code className="bg-orange-50 text-orange-800 px-1 py-0.5 rounded font-mono">GOOGLE_MAPS_PLATFORM_KEY</code> ثم اضغط Enter لإنشائها.</li>
              <li>ألصق مفتاح الواجهة الذي حصلت عليه من سحابة Google، ثم اضغط Enter لحفظه.</li>
            </ol>
            <p className="text-[10px] text-amber-600 font-extrabold mt-1">💡 النظام سيبدأ بالانتشار والتتبع التلقائي دون الحاجة لتحديث الصفحة!</p>
          </div>
        </div>

        {/* Temporary static mockup preview to keep user excited about the feature */}
        <div className="space-y-3">
          <p className="text-xs text-text-muted font-bold">مظهر تقريبي للشاشة التفاعلية عند تفعيل الخريطة:</p>
          <div className="h-64 rounded-2xl border bg-slate-50 border-gray-100 relative overflow-hidden flex items-center justify-center">
            <div className="text-center space-y-2 p-5 z-10">
              <MapPin className="w-8 h-8 text-blue-500 mx-auto animate-bounce" />
              <p className="text-xs font-extrabold text-slate-700">تواصل فوري — تتبع ٥ ورش صيانة معتمدة لقطع الغيار والمحركات</p>
              <p className="text-[10px] text-slate-400 font-semibold">بخصومات حصرية تصل لـ ١٥٪ وتوجيه مباشر عبر نظام الملاحة</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white opacity-40"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#eceff3] shadow-sm select-none" dir="rtl">
      {/* Top Bar Controls */}
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-blue-600" />
              الورش المعتمدة القريبة ومواقع الصيانة
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-bold mt-1">اكتشف ورش الصيانة الحاصلة على علامة الجودة وكوبونات خصم "أوتو كير"</p>
        </div>

        {/* Location Loader Details */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={getUserLocation}
            disabled={isGettingLocation}
            className="cursor-pointer flex items-center gap-1.5 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl border border-gray-200 transition-colors font-bold disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isGettingLocation ? 'animate-spin' : ''}`} />
            <span>{isGettingLocation ? 'جاري التحديد...' : 'تحديث موقعي'}</span>
          </button>
          
          <div className="text-[10px] font-bold text-slate-400 px-2.5 py-2 bg-gray-50 rounded-lg">
            📍 خط السير: <span className="text-slate-700">{userLocation.lat.toFixed(4)}، {userLocation.lng.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-xs font-black text-slate-500 flex items-center gap-1 shrink-0 ml-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          تصفية الورش:
        </span>
        {[
          { id: 'all', label: 'الجميع' },
          { id: 'japanese', label: 'ياباني/كوري' },
          { id: 'european', label: 'أوروبي' },
          { id: 'general', label: 'توضيب وميكانيكا' },
          { id: 'electrical', label: 'كهرباء وكمبيوتر' },
          { id: 'rapid', label: 'صيانة سريعة' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              categoryFilter === cat.id 
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                : 'bg-white border-gray-200 hover:border-gray-300 text-slate-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error Notice */}
      {locationError && (
        <div className="m-4 p-3.5 bg-amber-50 text-amber-800 text-xs font-bold rounded-2xl border border-amber-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Map Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        
        {/* Map view container (7 cols) */}
        <div className="lg:col-span-7 h-[420px] md:h-[450px] relative border-b lg:border-b-0 lg:border-l border-gray-100">
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={userLocation}
              center={userLocation}
              defaultZoom={13}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              onLoad={(mapInstance) => {
                mapRef.current = mapInstance;
              }}
            >
              {/* User Current Location Marker */}
              <AdvancedMarker position={userLocation} title="موقعك الحالي">
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-6 w-6 rounded-full bg-blue-500 opacity-40 animate-ping"></span>
                  <div className="relative h-4.5 w-4.5 rounded-full bg-blue-600 border-2 border-white shadow-xl"></div>
                </div>
              </AdvancedMarker>

              {/* Workshops Markers Mapping */}
              {filteredWorkshops.map((w) => (
                <AdvancedMarker 
                  key={w.id} 
                  position={{ lat: w.lat, lng: w.lng }}
                  onClick={() => selectWorkshop(w)}
                >
                  <div className={`p-1.5 rounded-xl border-2 shadow-md transition-all ${
                    activeWorkshopId === w.id 
                      ? 'bg-blue-600 border-white text-white scale-110' 
                      : 'bg-white border-blue-500 text-blue-600'
                  }`}>
                    <Wrench className="w-4 h-4" />
                  </div>
                </AdvancedMarker>
              ))}

              {/* Info Window */}
              {infoWindowOpenId && (() => {
                const w = workshops.find(item => item.id === infoWindowOpenId);
                if (!w) return null;
                return (
                  <InfoWindow 
                    position={{ lat: w.lat, lng: w.lng }}
                    onCloseClick={() => setInfoWindowOpenId(null)}
                  >
                    <div className="text-right p-1 max-w-[240px] font-sans" dir="rtl text-slate-900">
                      <div className="flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <p className="font-extrabold text-xs text-slate-900">{w.name}</p>
                      </div>
                      
                      <p className="text-[10px] text-blue-600 font-bold mb-1.5">★ {w.rating} ({w.reviewsCount} تقييم) — {w.distance?.toFixed(1)} كم</p>
                      
                      <div className="space-y-1 mb-2 text-[10px] text-slate-600 font-semibold line-clamp-2 leading-relaxed">
                        <p>📍 {w.address}</p>
                        <p>📞 {w.phone}</p>
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t pt-2 mt-1">
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-extrabold">كود: {w.discountCode}</span>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${w.lat},${w.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-blue-600 hover:underline flex items-center gap-0.5 font-bold shrink-0"
                        >
                          الملاحة <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </InfoWindow>
                );
              })()}
            </Map>
          </APIProvider>
        </div>

        {/* Sidebar list view (5 cols) */}
        <div className="lg:col-span-5 h-[420px] md:h-[450px] overflow-y-auto divide-y divide-gray-100 scroll-smooth">
          {filteredWorkshops.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2 h-full flex flex-col justify-center items-center">
              <MapPin className="w-8 h-8 opacity-40" />
              <p className="text-xs font-bold text-slate-500">لا توجد ورش مطابقة لهذا التصفية قريبة منك.</p>
              <button 
                onClick={() => setCategoryFilter('all')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                عرض كل الورش صيانة المعتمدة
              </button>
            </div>
          ) : (
            filteredWorkshops.map((w) => {
              const isActive = activeWorkshopId === w.id;
              return (
                <div 
                  key={w.id}
                  id={`workshop-card-${w.id}`}
                  onClick={() => selectWorkshop(w)}
                  className={`p-4 transition-all hover:bg-slate-50/70 cursor-pointer space-y-3 relative ${
                    isActive ? 'bg-blue-50/50 border-r-4 border-blue-600' : ''
                  }`}
                >
                  {/* Title and Rating */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <h4 className="text-xs font-extrabold text-slate-800 leading-tight">{w.name}</h4>
                      </div>
                      <span className="text-[10px] text-text-muted font-bold whitespace-nowrap">
                        {w.distance?.toFixed(1)} كم
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md font-bold">
                        {w.typeName}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span className="text-[10px] font-black text-slate-700">{w.rating}</span>
                        <span className="text-[9px] text-slate-400 font-semibold mt-0.5">({w.reviewsCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Vetted custom tags */}
                  <div className="space-y-1 font-semibold text-[10px] text-slate-500 leading-relaxed">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{w.address}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{w.phone}</span>
                    </p>
                  </div>

                  {/* Benefits tags */}
                  <div className="flex flex-wrap gap-1">
                    {w.benefits.slice(0, 2).map((benefit, i) => (
                      <span key={i} className="text-[9px] font-black text-slate-700 bg-gray-100 px-2 py-0.5 rounded">
                        • {benefit}
                      </span>
                    ))}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100/60 text-xs">
                    {/* Copy Discount Code */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-bold">كوبون خصم:</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(w.id, w.discountCode);
                        }}
                        className="cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-black flex items-center gap-1 transition-colors border border-emerald-100 text-[10px]"
                      >
                        <code>{w.discountCode}</code>
                        <Copy className="w-3 h-3 text-emerald-600" />
                        {copiedId === w.id && <span className="text-[9px] text-emerald-500 mr-1">تم النسخ!</span>}
                      </button>
                    </div>

                    {/* Navigation buttons */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${w.lat},${w.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-pointer flex items-center gap-1 text-slate-600 hover:text-blue-600 font-bold border border-gray-200 px-2.5 py-1 rounded-lg hover:border-blue-200 transition-all text-[10px] shadow-sm bg-white"
                    >
                      <Navigation className="w-3 h-3 text-blue-500" />
                      <span>الذهاب</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
