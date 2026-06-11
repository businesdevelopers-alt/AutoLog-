export const MAINTENANCE_TYPES = {
  oil: { label: 'تغيير زيت', icon: 'Droplets' },
  tires: { label: 'إطارات', icon: 'CircleDot' },
  brakes: { label: 'فرامل', icon: 'Disc' },
  battery: { label: 'بطارية', icon: 'Battery' },
  engine: { label: 'محرك', icon: 'Settings' },
  other: { label: 'صيانة أخرى', icon: 'Wrench' },
} as const;

export const EXPENSE_CATEGORIES = {
  fuel: { label: 'وقود', icon: 'Fuel' },
  insurance: { label: 'تأمين', icon: 'ShieldCheck' },
  registration: { label: 'تسجيل/تراخيص', icon: 'FileText' },
  cleaning: { label: 'غسيل/تنظيف', icon: 'Waves' },
  other: { label: 'مصاريف أخرى', icon: 'CreditCard' },
} as const;

export const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const PREDEFINED_THEMES = [
  { id: 'default', label: 'كلاسيكي (أزرق)', primary: '#0052CC', primaryHover: '#0047B3' },
  { id: 'forest', label: 'الغابة (أخضر)', primary: '#006644', primaryHover: '#004D33' },
  { id: 'racing', label: 'السباق (أحمر)', primary: '#DE350B', primaryHover: '#BF2600' },
  { id: 'midnight', label: 'منتصف الليل', primary: '#5243AA', primaryHover: '#403294' },
  { id: 'sunset', label: 'الغروب (برتقالي)', primary: '#FF8B00', primaryHover: '#E57D00' },
] as const;

export const BREAKDOWN_CATEGORIES = {
  engine: { label: 'محرك', icon: 'Settings' },
  transmission: { label: 'ناقل الحركة', icon: 'Cpu' },
  suspension: { label: 'نظام التعليق', icon: 'Maximize' },
  electrical: { label: 'كهرباء', icon: 'Zap' },
  cooling: { label: 'نظام التبريد', icon: 'Thermometer' },
  brakes: { label: 'الفرامل', icon: 'Disc' },
  other: { label: 'أعطال أخرى', icon: 'AlertTriangle' },
} as const;
