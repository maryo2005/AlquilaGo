-- ============================================
-- AlquilaGo - Esquema de Base de Datos Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Tabla principal de propiedades
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  type TEXT NOT NULL CHECK (type IN ('room', 'apartment')),
  contract_type TEXT NOT NULL CHECK (contract_type IN ('monthly', 'yearly')),
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  images TEXT[] DEFAULT '{}',
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  area NUMERIC(10, 2) NOT NULL CHECK (area > 0),
  services TEXT[] DEFAULT '{}',
  phone TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de proximidades (relación 1:N con properties)
CREATE TABLE IF NOT EXISTS property_proximities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('university', 'hospital', 'other')),
  name TEXT NOT NULL,
  distance_min INTEGER NOT NULL CHECK (distance_min >= 0)
);

-- 3. Tabla de favoritos (relación N:N entre users y properties)
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- ============================================
-- Índices para rendimiento
-- ============================================
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_district ON properties(district);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_property_proximities_property ON property_proximities(property_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON favorites(property_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_proximities ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- === PROPERTIES ===

-- Lectura pública (cualquiera puede ver las propiedades)
CREATE POLICY "properties_select_public" ON properties
  FOR SELECT
  USING (true);

-- Solo el dueño puede insertar (debe estar autenticado)
CREATE POLICY "properties_insert_owner" ON properties
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Solo el dueño puede actualizar
CREATE POLICY "properties_update_owner" ON properties
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Solo el dueño puede eliminar
CREATE POLICY "properties_delete_owner" ON properties
  FOR DELETE
  USING (auth.uid() = owner_id);

-- === PROPERTY PROXIMITIES ===

-- Lectura pública
CREATE POLICY "proximities_select_public" ON property_proximities
  FOR SELECT
  USING (true);

-- Insertar solo si eres dueño de la propiedad
CREATE POLICY "proximities_insert_owner" ON property_proximities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Eliminar solo si eres dueño de la propiedad
CREATE POLICY "proximities_delete_owner" ON property_proximities
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- === FAVORITES ===

-- Solo ver tus propios favoritos
CREATE POLICY "favorites_select_own" ON favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Solo agregar favoritos como tú mismo
CREATE POLICY "favorites_insert_own" ON favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Solo eliminar tus propios favoritos
CREATE POLICY "favorites_delete_own" ON favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Storage Bucket para imágenes de propiedades
-- ============================================

-- Crear el bucket (ejecutar en SQL o hacerlo desde el dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Cualquier usuario autenticado puede subir imágenes
CREATE POLICY "property_images_upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
  );

-- Policy: Lectura pública de imágenes
CREATE POLICY "property_images_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'property-images');

-- Policy: Solo el que subió puede eliminar
CREATE POLICY "property_images_delete_own" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'property-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
