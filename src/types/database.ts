export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string | null
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          area: number
          bathrooms: number
          bedrooms: number
          contact_name: string
          contract_type: string
          created_at: string | null
          description: string
          district: string
          id: string
          images: string[] | null
          is_featured: boolean | null
          lat: number
          lng: number
          owner_id: string | null
          phone: string
          price: number
          services: string[] | null
          title: string
          type: string
          views: number | null
        }
        Insert: {
          address: string
          area: number
          bathrooms?: number
          bedrooms?: number
          contact_name: string
          contract_type: string
          created_at?: string | null
          description: string
          district: string
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          lat: number
          lng: number
          owner_id?: string | null
          phone: string
          price: number
          services?: string[] | null
          title: string
          type: string
          views?: number | null
        }
        Update: {
          address?: string
          area?: number
          bathrooms?: number
          bedrooms?: number
          contact_name?: string
          contract_type?: string
          created_at?: string | null
          description?: string
          district?: string
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          lat?: number
          lng?: number
          owner_id?: string | null
          phone?: string
          price?: number
          services?: string[] | null
          title?: string
          type?: string
          views?: number | null
        }
        Relationships: []
      }
      property_proximities: {
        Row: {
          distance_min: number
          id: string
          name: string
          property_id: string
          type: string
        }
        Insert: {
          distance_min: number
          id?: string
          name: string
          property_id: string
          type: string
        }
        Update: {
          distance_min?: number
          id?: string
          name?: string
          property_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_proximities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
          property_id: string | null
          session_id: string
          source_channel: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
          property_id?: string | null
          session_id: string
          source_channel?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
          property_id?: string | null
          session_id?: string
          source_channel?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          phone_verified: boolean
          dni_verified: boolean
          dni_document_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string
          avatar_url?: string | null
          phone_verified?: boolean
          dni_verified?: boolean
          dni_document_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          phone_verified?: boolean
          dni_verified?: boolean
          dni_document_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_leads: {
        Row: {
          id: string
          tenant_id: string
          owner_id: string
          property_id: string
          created_at: string
          status: string
          tenant_response: string | null
          owner_response: string | null
          survey_shown_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          owner_id: string
          property_id: string
          created_at?: string
          status?: string
          tenant_response?: string | null
          owner_response?: string | null
          survey_shown_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          owner_id?: string
          property_id?: string
          created_at?: string
          status?: string
          tenant_response?: string | null
          owner_response?: string | null
          survey_shown_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_leads_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          lead_id: string
          reviewer_id: string
          reviewee_id: string
          review_type: string
          rating: number
          payment_punctuality: number | null
          property_care: number | null
          coexistence: number | null
          property_maintenance: number | null
          communication: number | null
          agreement_respect: number | null
          comment: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          reviewer_id: string
          reviewee_id: string
          review_type: string
          rating: number
          payment_punctuality?: number | null
          property_care?: number | null
          coexistence?: number | null
          property_maintenance?: number | null
          communication?: number | null
          agreement_respect?: number | null
          comment?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          reviewer_id?: string
          reviewee_id?: string
          review_type?: string
          rating?: number
          payment_punctuality?: number | null
          property_care?: number | null
          coexistence?: number | null
          property_maintenance?: number | null
          communication?: number | null
          agreement_respect?: number | null
          comment?: string;
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "contact_leads"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Tipos de conveniencia
export type PropertyRow = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type ProximityRow = Database['public']['Tables']['property_proximities']['Row'];
export type ProximityInsert = Database['public']['Tables']['property_proximities']['Insert'];
export type FavoriteRow = Database['public']['Tables']['favorites']['Row'];
export type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];
export type ContactLeadRow = Database['public']['Tables']['contact_leads']['Row'];
export type ReviewRow = Database['public']['Tables']['reviews']['Row'];
