export type MaintenanceType = 'oil' | 'tires' | 'brakes' | 'battery' | 'engine' | 'other';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  title: string;
  date: string;
  cost: number;
  odometer: number;
  notes?: string;
}

export interface Expense {
  id: string;
  vehicleId: string;
  category: 'fuel' | 'insurance' | 'registration' | 'cleaning' | 'other';
  date: string;
  amount: number;
  notes?: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  currentOdometer: number;
  color?: string;
}

export interface AppTheme {
  primary: string;
  primaryHover: string;
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  liters: number;
  cost: number;
  station?: string;
  isFullTank: boolean;
}

export interface MaintenanceReminder {
  id: string;
  vehicleId: string;
  type: MaintenanceType | 'insurance' | 'registration' | 'other';
  title: string;
  dueDate?: string;
  dueOdometer?: number;
  isCompleted: boolean;
}

export interface AppData {
  vehicles: Vehicle[];
  records: MaintenanceRecord[];
  expenses: Expense[];
  fuelRecords: FuelRecord[];
  reminders?: MaintenanceReminder[];
  breakdowns?: Breakdown[];
  theme?: AppTheme;
}

export type BreakdownCategory = 'engine' | 'transmission' | 'suspension' | 'electrical' | 'cooling' | 'brakes' | 'other';

export interface Breakdown {
  id: string;
  vehicleId: string;
  category: BreakdownCategory;
  description: string;
  date: string;
  cost: number;
  location?: string;
  repairedAt?: string;
  notes?: string;
}
