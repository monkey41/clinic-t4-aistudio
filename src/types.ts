export type Language = 'en' | 'or' | 'bn' | 'sat';

export type DarkColorOption = 'ocean' | 'black' | 'babypink';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  qualification: string;
  experience: string;
  timing: string;
  fee: number;
  photo: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'medicines' | 'physio' | 'wellness' | 'babycare';
  price: number;
  originalPrice?: number;
  unit: string;
  inStock: boolean;
  image: string;
  description: string;
  isPhysio?: boolean;
}

export interface DoctorArrival {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  department: string;
  photo: string;
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  timing: string;
  note?: string;
  isUnannounced?: boolean;
  sentByAdminAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PathologyTest {
  id: string;
  name: string;
  category: string;
  price: number;
  parameters?: string;
}

export interface SpecialOffer {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  discountText: string;
  validUntil: string;
  category: 'doctor' | 'pathology' | 'pharmacy' | 'physio';
  promoCode?: string;
  originalPrice?: number;
  offerPrice?: number;
}

export interface BookingHistoryItem {
  id: string;
  type: 'doctor' | 'pathology';
  title: string;
  subtitle: string;
  dateLabel: string;
  timestamp: string;
  url: string;
  status: 'Visited Portal' | 'Booked';
}
