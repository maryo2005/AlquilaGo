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
      tracking_events: {
        Row: {
          id: string;
          created_at: string;
          session_id: string;
          user_id: string | null;
          event_name: string;
          property_id: string | null;
          source_channel: string;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          created_at?: string;
          session_id: string;
          user_id?: string | null;
          event_name: string;
          property_id?: string | null;
          source_channel?: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          created_at?: string;
          session_id?: string;
          user_id?: string | null;
          event_name?: string;
          property_id?: string | null;
          source_channel?: string;
          metadata?: Record<string, any>;
        };
        Relationships: [
          {
            foreignKeyName: 'tracking_events_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          }
        ];
      };
      user_profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          phone_verified: boolean;
          dni_verified: boolean;
          dni_document_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          avatar_url?: string | null;
          phone_verified?: boolean;
          dni_verified?: boolean;
          dni_document_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          phone_verified?: boolean;
          dni_verified?: boolean;
          dni_document_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_leads: {
        Row: {
          id: string;
          tenant_id: string;
          owner_id: string;
          property_id: string;
          created_at: string;
          status: string;
          tenant_response: string | null;
          owner_response: string | null;
          survey_shown_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          owner_id: string;
          property_id: string;
          created_at?: string;
          status?: string;
          tenant_response?: string | null;
          owner_response?: string | null;
          survey_shown_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          owner_id?: string;
          property_id?: string;
          created_at?: string;
          status?: string;
          tenant_response?: string | null;
          owner_response?: string | null;
          survey_shown_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'contact_leads_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'auth.users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'contact_leads_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'auth.users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'contact_leads_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          }
        ];
      };
      reviews: {
        Row: {
          id: string;
          lead_id: string;
          reviewer_id: string;
          reviewee_id: string;
          review_type: string;
          rating: number;
          payment_punctuality: number | null;
          property_care: number | null;
          coexistence: number | null;
          property_maintenance: number | null;
          communication: number | null;
          agreement_respect: number | null;
          comment: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          reviewer_id: string;
          reviewee_id: string;
          review_type: string;
          rating: number;
          payment_punctuality?: number | null;
          property_care?: number | null;
          coexistence?: number | null;
          property_maintenance?: number | null;
          communication?: number | null;
          agreement_respect?: number | null;
          comment?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          reviewer_id?: string;
          reviewee_id?: string;
          review_type?: string;
          rating?: number;
          payment_punctuality?: number | null;
          property_care?: number | null;
          coexistence?: number | null;
          property_maintenance?: number | null;
          communication?: number | null;
          agreement_respect?: number | null;
          comment?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'contact_leads';
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
export type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];
export type ContactLeadRow = Database['public']['Tables']['contact_leads']['Row'];
export type ReviewRow = Database['public']['Tables']['reviews']['Row'];
