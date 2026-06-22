-- Script para crear la tabla de tracking de eventos (Momento Aha)

-- 1. Crear la tabla
CREATE TABLE tracking_events (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_name TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    source_channel TEXT DEFAULT 'web',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- 3. Políticas
-- Permitir insertar a cualquier persona (incluso anónimos, importante para el funnel de adquisición)
CREATE POLICY "Enable insert for everyone" 
ON tracking_events FOR INSERT 
WITH CHECK (true);

-- Solo usuarios autenticados pueden ver SUS PROPIOS eventos (o administradores podrían ver todos, pero por defecto lo cerramos)
CREATE POLICY "Enable select for users based on user_id" 
ON tracking_events FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Crear índice en event_name y session_id para consultas analíticas rápidas
CREATE INDEX idx_tracking_event_name ON tracking_events(event_name);
CREATE INDEX idx_tracking_session_id ON tracking_events(session_id);
