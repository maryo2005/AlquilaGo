-- ============================================
-- AlquilaGo - Seed Data (Datos Iniciales)
-- Ejecutar DESPUÉS de schema.sql
-- ============================================

-- Insertar las 8 propiedades de demo (owner_id = NULL → propiedades del sistema)
INSERT INTO properties (id, title, description, price, type, contract_type, address, district, lat, lng, images, bedrooms, bathrooms, area, services, phone, contact_name, views, is_featured, owner_id, created_at)
VALUES
  (
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Habitación Ejecutiva Amoblada para Médicos y Residentes',
    'Habitación amplia con cama de 2 plazas, clóset empotrado, escritorio de trabajo y baño privado. Excelente iluminación natural y ventilación. Ubicada en zona residencial segura y tranquila, ideal para profesionales de la salud. Servicios incluidos en el precio (luz, agua caliente, internet de alta velocidad de 200 Mbps). Acceso a áreas comunes como cocina equipada y lavandería con secadora.',
    650, 'room', 'monthly',
    'Calle Los Cedros 342, Urb. California', 'California',
    -8.1325, -79.0412,
    ARRAY['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'],
    1, 1, 18,
    ARRAY['Wifi', 'Amoblado', 'Agua Caliente', 'Lavandería', 'Seguridad 24/7'],
    '+51948765432', 'Dra. María Elena Ramos',
    142, true, NULL, '2026-06-15T10:30:00Z'
  ),
  (
    'a1b2c3d4-0002-4000-8000-000000000002',
    'Moderno Departamento de Estreno frente a Parque - Ideal UPAO/UNT',
    'Departamento moderno de 3 dormitorios y 2 baños completos. Sala-comedor amplia con balcón y vista directa al parque. Cocina americana con reposteros altos y bajos, encimera de granito. Dormitorio principal con baño incorporado y walk-in closet. Ubicado en primer piso con cochera privada e ingreso independiente. Edificio con ascensor y vigilancia permanente.',
    1800, 'apartment', 'yearly',
    'Av. Larco 1245, Urb. San Andrés', 'San Andrés',
    -8.1255, -79.0398,
    ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'],
    3, 2, 95,
    ARRAY['Wifi', 'Cochera', 'Lavandería', 'Seguridad 24/7', 'Ascensor'],
    '+51952112233', 'Ing. Carlos Bermúdez',
    298, true, NULL, '2026-06-18T14:22:00Z'
  ),
  (
    'a1b2c3d4-0003-4000-8000-000000000003',
    'Habitación Económica para Estudiantes Universitarios',
    'Habitación amoblada ideal para estudiantes de pregrado. Cuenta con cama de 1.5 plazas, escritorio, silla y clóset. Baño compartido con otro estudiante. El alquiler incluye luz, agua, internet y el uso de la microondas en kitchenette común. Excelente ubicación a pocas cuadras de las puertas principales de la UNT, en calle cerrada con rejas de seguridad.',
    380, 'room', 'monthly',
    'Jr. San Martín 885, Las Quintanas (frente a UNT)', 'Las Quintanas',
    -8.1065, -79.0315,
    ARRAY['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'],
    1, 1, 12,
    ARRAY['Wifi', 'Amoblado', 'Agua Caliente'],
    '+51944556677', 'Sra. Clotilde Bazán',
    89, false, NULL, '2026-06-20T08:15:00Z'
  ),
  (
    'a1b2c3d4-0004-4000-8000-000000000004',
    'Mini-Departamento Amoblado Completo cerca al Hospital Regional',
    'Perfecto mini-departamento amoblado para médicos residentes o estudiantes de posgrado de medicina. Cuenta con 1 dormitorio principal con cama queen, sala de estar compacta, comedor pequeño, cocina equipada con refrigeradora y cocina de inducción, y baño completo privado con terma eléctrica. Ingreso totalmente independiente.',
    1100, 'apartment', 'monthly',
    'Urb. Primavera Calle Los Tulipanes H-12', 'Primavera',
    -8.0988, -79.0268,
    ARRAY['https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80'],
    1, 1, 45,
    ARRAY['Wifi', 'Amoblado', 'Agua Caliente', 'Lavandería'],
    '+51936123456', 'Dr. Fernando Medina',
    185, true, NULL, '2026-06-10T11:00:00Z'
  ),
  (
    'a1b2c3d4-0005-4000-8000-000000000005',
    'Exclusivo Penthouse Duplex en El Golf con Amplia Terraza',
    'Impresionante departamento duplex de 320 m² con acabados de super lujo. 3 amplios dormitorios, cada uno con baño privado y aire acondicionado. Sala principal a doble altura con chimenea ecológica. Enorme terraza privada con zona de parrilla BBQ y bar. Jacuzzi en el dormitorio principal. Dos cocheras paralelas. Seguridad del condominio las 24 horas.',
    3200, 'apartment', 'yearly',
    'Av. El Golf 450, Condominio Los Cocos', 'El Golf',
    -8.1405, -79.0482,
    ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    3, 4, 320,
    ARRAY['Wifi', 'Cochera', 'Lavandería', 'Seguridad 24/7', 'Ascensor', 'Amoblado'],
    '+51980809010', 'Inmobiliaria Premium Trujillo',
    412, false, NULL, '2026-06-12T09:40:00Z'
  ),
  (
    'a1b2c3d4-0006-4000-8000-000000000006',
    'Habitación Amoblada cerca a UPN y Hospital de Alta Complejidad',
    'Alquiler de habitación impecable en segundo piso. Diseñada especialmente para estudiantes de la UPN o enfermeros/médicos del Hospital de Alta Complejidad Virgen de la Puerta. Cuenta con internet fibra óptica, escritorio, clóset amplio y baño propio fuera de la habitación. Área común de lavandería con lavadora automática.',
    480, 'room', 'monthly',
    'Calle Anticona 645, Urb. San Isidro', 'San Andrés',
    -8.0915, -79.0422,
    ARRAY['https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'],
    1, 1, 15,
    ARRAY['Wifi', 'Amoblado', 'Agua Caliente', 'Lavandería'],
    '+51966778899', 'Lic. Julia Vásquez',
    110, false, NULL, '2026-06-19T16:45:00Z'
  ),
  (
    'a1b2c3d4-0007-4000-8000-000000000007',
    'Flat de 2 Dormitorios en Monserrate - Frente a UPAO',
    'Excelente departamento flat de 80m² ubicado en Urb. Monserrate, cruzando la avenida UPAO. Cuenta con 2 habitaciones con closets, 1.5 baños, sala comedor acogedora y cocina amoblada. Ubicación estratégica con fácil acceso a transporte, supermercados y restaurantes. Seguridad externa nocturna.',
    1250, 'apartment', 'monthly',
    'Calle Los Diamantes 567, Urb. Monserrate', 'Monserrate',
    -8.1278, -79.0452,
    ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=800&q=80'],
    2, 2, 80,
    ARRAY['Wifi', 'Agua Caliente', 'Lavandería'],
    '+51978456123', 'Sra. Teresa Alcántara',
    220, false, NULL, '2026-06-21T11:20:00Z'
  ),
  (
    'a1b2c3d4-0008-4000-8000-000000000008',
    'Habitación Premium en Centro Histórico - Estilo Republicano',
    'Viva en el corazón de Trujillo en una casona republicana completamente remodelada y adaptada para co-living estudiantil o profesional. Habitación enorme de techos altos con balcón colonial de cajón hacia la calle. Cuenta con baño privado de estreno, internet fibra óptica de 300mbps, cama King Size, clóset de pared completa y escritorio colonial de madera. Acceso a una hermosa cocina y patio central de la casona.',
    750, 'room', 'monthly',
    'Jr. Pizarro 420, Centro Histórico de Trujillo', 'Centro Histórico',
    -8.1122, -79.0289,
    ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    1, 1, 25,
    ARRAY['Wifi', 'Amoblado', 'Agua Caliente', 'Lavandería', 'Seguridad 24/7'],
    '+51912345678', 'Sr. Humberto Orbegoso',
    173, true, NULL, '2026-06-22T08:00:00Z'
  );

-- Insertar proximidades para cada propiedad
INSERT INTO property_proximities (property_id, type, name, distance_min) VALUES
  -- Prop 1
  ('a1b2c3d4-0001-4000-8000-000000000001', 'university', 'UPAO (Univ. Privada Antenor Orrego)', 5),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'hospital', 'Hospital Regional Docente', 12),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'university', 'UNT (Univ. Nacional de Trujillo)', 8),
  -- Prop 2
  ('a1b2c3d4-0002-4000-8000-000000000002', 'university', 'UPAO (Univ. Privada Antenor Orrego)', 3),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'university', 'UNT (Univ. Nacional de Trujillo)', 5),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'hospital', 'Hospital Belén', 7),
  -- Prop 3
  ('a1b2c3d4-0003-4000-8000-000000000003', 'university', 'UNT (Univ. Nacional de Trujillo)', 2),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'hospital', 'Hospital Regional Docente', 6),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'university', 'UPN (Univ. Privada del Norte)', 15),
  -- Prop 4
  ('a1b2c3d4-0004-4000-8000-000000000004', 'hospital', 'Hospital Regional Docente', 4),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'university', 'UNT (Univ. Nacional de Trujillo)', 5),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'hospital', 'Hospital de Alta Complejidad (Virgen de la Puerta)', 12),
  -- Prop 5
  ('a1b2c3d4-0005-4000-8000-000000000005', 'university', 'UPAO (Univ. Privada Antenor Orrego)', 8),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'hospital', 'Hospital Belén', 15),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'other', 'Golf y Country Club Trujillo', 1),
  -- Prop 6
  ('a1b2c3d4-0006-4000-8000-000000000006', 'university', 'UPN (Univ. Privada del Norte)', 4),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'hospital', 'Hospital de Alta Complejidad (Virgen de la Puerta)', 7),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'university', 'UNT (Univ. Nacional de Trujillo)', 12),
  -- Prop 7
  ('a1b2c3d4-0007-4000-8000-000000000007', 'university', 'UPAO (Univ. Privada Antenor Orrego)', 2),
  ('a1b2c3d4-0007-4000-8000-000000000007', 'university', 'UNT (Univ. Nacional de Trujillo)', 7),
  ('a1b2c3d4-0007-4000-8000-000000000007', 'hospital', 'Hospital Belén', 9),
  -- Prop 8
  ('a1b2c3d4-0008-4000-8000-000000000008', 'hospital', 'Hospital Belén', 3),
  ('a1b2c3d4-0008-4000-8000-000000000008', 'university', 'UNT (Univ. Nacional de Trujillo)', 6),
  ('a1b2c3d4-0008-4000-8000-000000000008', 'university', 'UPAO (Univ. Privada Antenor Orrego)', 10);
