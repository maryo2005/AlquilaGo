// Tipos generados para la base de datos Supabase de AlquilaGo
// Estos tipos proporcionan tipado fuerte para todas las operaciones de DB

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          type: 'room' | 'apartment';
          contract_type: 'monthly' | 'yearly';
          address: string;
          district: string;
          lat: number;
          lng: number;
          images: string[];
          bedrooms: number;
          bathrooms: number;
          area: number;
          services: string[];
          phone: string;
          contact_name: string;
          views: number;
          is_featured: boolean;
          owner_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          type: 'room' | 'apartment';
          contract_type: 'monthly' | 'yearly';
          address: string;
          district: string;
          lat: number;
          lng: number;
          images?: string[];
          bedrooms?: number;
          bathrooms?: number;
          area: number;
          services?: string[];
          phone: string;
          contact_name: string;
          views?: number;
          is_featured?: boolean;
          owner_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          type?: 'room' | 'apartment';
          contract_type?: 'monthly' | 'yearly';
          address?: string;
          district?: string;
          lat?: number;
          lng?: number;
          images?: string[];
          bedrooms?: number;
          bathrooms?: number;
          area?: number;
          services?: string[];
          phone?: string;
          contact_name?: string;
          views?: number;
          is_featured?: boolean;
          owner_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      property_proximities: {
        Row: {
          id: string;
          property_id: string;
          type: 'university' | 'hospital' | 'other';
          name: string;
          distance_min: number;
        };
        Insert: {
          id?: string;
          property_id: string;
          type: 'university' | 'hospital' | 'other';
          name: string;
          distance_min: number;
        };
        Update: {
          id?: string;
          property_id?: string;
          type?: 'university' | 'hospital' | 'other';
          name?: string;
          distance_min?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'property_proximities_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          }
        ];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'favorites_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Tipos de conveniencia
export type PropertyRow = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type ProximityRow = Database['public']['Tables']['property_proximities']['Row'];
export type ProximityInsert = Database['public']['Tables']['property_proximities']['Insert'];
export type FavoriteRow = Database['public']['Tables']['favorites']['Row'];
