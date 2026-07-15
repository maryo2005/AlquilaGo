-- ============================================
-- AlquilaGo - Perfil de Confianza Dual
-- Esquema de Tablas para el Sistema de Confianza
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- 1. Tabla de Perfiles de Usuario (Perfil Dual)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT DEFAULT '',
  dni TEXT DEFAULT '',
  phone_verified BOOLEAN DEFAULT FALSE,
  dni_verified BOOLEAN DEFAULT FALSE,
  dni_document_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 2. Tabla de Contact Leads (Registro de Contactos WhatsApp)
-- ============================================
CREATE TABLE IF NOT EXISTS contact_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'survey_sent', 'tenant_confirmed', 'owner_confirmed', 'confirmed', 'not_completed')),
  tenant_response TEXT
    CHECK (tenant_response IS NULL OR tenant_response IN ('yes_rented', 'just_chatted', 'not_completed')),
  owner_response TEXT
    CHECK (owner_response IS NULL OR owner_response IN ('yes_tenant', 'no')),
  survey_shown_at TIMESTAMPTZ,
  UNIQUE(tenant_id, owner_id, property_id)
);

-- ============================================
-- 3. Tabla de Reseñas (Reviews)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES contact_leads(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL
    CHECK (review_type IN ('tenant_review', 'owner_review', 'communication_only')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  -- Subcategorías para tenant_review (arrendador califica a inquilino)
  payment_punctuality INTEGER CHECK (payment_punctuality IS NULL OR (payment_punctuality >= 1 AND payment_punctuality <= 5)),
  property_care INTEGER CHECK (property_care IS NULL OR (property_care >= 1 AND property_care <= 5)),
  coexistence INTEGER CHECK (coexistence IS NULL OR (coexistence >= 1 AND coexistence <= 5)),
  -- Subcategorías para owner_review (inquilino califica a arrendador)
  property_maintenance INTEGER CHECK (property_maintenance IS NULL OR (property_maintenance >= 1 AND property_maintenance <= 5)),
  communication INTEGER CHECK (communication IS NULL OR (communication >= 1 AND communication <= 5)),
  agreement_respect INTEGER CHECK (agreement_respect IS NULL OR (agreement_respect >= 1 AND agreement_respect <= 5)),
  comment TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending_verification')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Un usuario solo puede dejar una reseña por lead
  UNIQUE(lead_id, reviewer_id)
);

-- ============================================
-- Índices para rendimiento
-- ============================================
CREATE INDEX IF NOT EXISTS idx_contact_leads_tenant ON contact_leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contact_leads_owner ON contact_leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_contact_leads_status ON contact_leads(status);
CREATE INDEX IF NOT EXISTS idx_contact_leads_created ON contact_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_type ON reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_reviews_lead ON reviews(lead_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas nuevas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- === USER_PROFILES ===

-- Lectura pública (cualquiera puede ver los perfiles)
CREATE POLICY "profiles_select_public" ON user_profiles
  FOR SELECT
  USING (true);

-- Solo el usuario puede insertar su propio perfil
CREATE POLICY "profiles_insert_own" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Solo el usuario puede actualizar su propio perfil
CREATE POLICY "profiles_update_own" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- === CONTACT_LEADS ===

-- Solo las partes involucradas pueden ver sus leads
CREATE POLICY "leads_select_own" ON contact_leads
  FOR SELECT
  USING (auth.uid() = tenant_id OR auth.uid() = owner_id);

-- Solo usuarios autenticados pueden crear leads (como inquilinos)
CREATE POLICY "leads_insert_tenant" ON contact_leads
  FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

-- Solo las partes pueden actualizar (para responder encuestas)
CREATE POLICY "leads_update_own" ON contact_leads
  FOR UPDATE
  USING (auth.uid() = tenant_id OR auth.uid() = owner_id);

-- === REVIEWS ===

-- Lectura pública de reseñas activas
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT
  USING (status = 'active' OR auth.uid() = reviewer_id OR auth.uid() = reviewee_id);

-- Solo usuarios autenticados pueden crear reseñas
CREATE POLICY "reviews_insert_authenticated" ON reviews
  FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- === STORAGE BUCKET para DNI ===

-- Crear bucket privado para documentos de identidad
INSERT INTO storage.buckets (id, name, public)
VALUES ('identity-documents', 'identity-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Solo el usuario autenticado puede subir su propio DNI
CREATE POLICY "dni_upload_own" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'identity-documents'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Solo el usuario puede ver su propio documento
CREATE POLICY "dni_select_own" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'identity-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- Función para crear perfil automáticamente al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, phone, dni, phone_verified, dni_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'dni', ''),
    FALSE,
    FALSE
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    display_name = EXCLUDED.display_name,
    phone = EXCLUDED.phone,
    dni = EXCLUDED.dni;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se dispara al crear un nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Nota: Si la tabla user_profiles ya existe, puedes ejecutar lo siguiente para migrarla:
-- ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
-- ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS dni TEXT DEFAULT '';

