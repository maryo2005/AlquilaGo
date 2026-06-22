export type PropertyType = 'room' | 'apartment';
export type ContractType = 'monthly' | 'yearly';
export type ProximityType = 'university' | 'hospital' | 'other';

export interface ProximityInfo {
  type: ProximityType;
  name: string;
  distanceMin: number; // Distance in minutes walking/driving
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  contractType: ContractType;
  address: string;
  district: string;
  proximity: ProximityInfo[];
  lat: number;
  lng: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number; // in square meters
  services: string[]; // e.g. ["Wifi", "Amoblado", "Agua Caliente", "Lavandería", "Cochera", "Seguridad 24/7"]
  phone: string; // WhatsApp number
  contactName: string;
  views: number; // Simulated page views for owner's analytics
  isFeatured?: boolean;
  createdAt: string;
  ownerId?: string | null; // Supabase Auth user ID del propietario
}

export interface FilterState {
  searchQuery: string;
  propertyType: PropertyType | 'all';
  contractType: ContractType | 'all';
  proximityTarget: string | 'all'; // e.g. "UNT", "UPAO", "Hospital Regional", etc.
  minPrice: number | '';
  maxPrice: number | '';
  district: string | 'all';
}

export type UserRole = 'tenant' | 'owner';
