import { supabase } from '../lib/supabaseClient';
import type { Property } from '../types/property';
import type { PropertyRow, ProximityRow } from '../types/database';

/**
 * Transforma una fila de la DB (snake_case) al tipo Property del frontend (camelCase)
 */
function toProperty(row: PropertyRow, proximities: ProximityRow[]): Property {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    type: row.type,
    contractType: row.contract_type,
    address: row.address,
    district: row.district,
    proximity: proximities.map((p) => ({
      type: p.type,
      name: p.name,
      distanceMin: p.distance_min,
    })),
    lat: row.lat,
    lng: row.lng,
    images: row.images || [],
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area: Number(row.area),
    services: row.services || [],
    phone: row.phone,
    contactName: row.contact_name,
    views: row.views,
    isFeatured: row.is_featured,
    createdAt: row.created_at,
    ownerId: row.owner_id,
  };
}

/**
 * Obtener todas las propiedades con sus proximidades
 */
export async function fetchProperties(): Promise<Property[]> {
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (propError) {
    console.error('Error fetching properties:', propError);
    throw propError;
  }

  if (!properties || properties.length === 0) return [];

  // Obtener todas las proximidades de una vez
  const propertyIds = properties.map((p) => p.id);
  const { data: allProximities, error: proxError } = await supabase
    .from('property_proximities')
    .select('*')
    .in('property_id', propertyIds);

  if (proxError) {
    console.error('Error fetching proximities:', proxError);
    throw proxError;
  }

  // Agrupar proximidades por property_id
  const proxMap = new Map<string, ProximityRow[]>();
  (allProximities || []).forEach((p) => {
    const existing = proxMap.get(p.property_id) || [];
    existing.push(p);
    proxMap.set(p.property_id, existing);
  });

  return properties.map((row) => toProperty(row, proxMap.get(row.id) || []));
}

/**
 * Crear una nueva propiedad con sus proximidades
 */
export async function createProperty(
  data: Omit<Property, 'id' | 'views' | 'createdAt' | 'ownerId'>,
  ownerId: string
): Promise<Property> {
  // 1. Insertar la propiedad
  const { data: newProp, error: propError } = await supabase
    .from('properties')
    .insert({
      title: data.title,
      description: data.description,
      price: data.price,
      type: data.type,
      contract_type: data.contractType,
      address: data.address,
      district: data.district,
      lat: data.lat,
      lng: data.lng,
      images: data.images,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      services: data.services,
      phone: data.phone,
      contact_name: data.contactName,
      is_featured: data.isFeatured || false,
      owner_id: ownerId,
    })
    .select()
    .single();

  if (propError || !newProp) {
    console.error('Error creating property:', propError);
    throw propError || new Error('No se pudo crear la propiedad');
  }

  // 2. Insertar proximidades si hay
  let proximities: ProximityRow[] = [];
  if (data.proximity && data.proximity.length > 0) {
    const proxInserts = data.proximity.map((p) => ({
      property_id: newProp.id,
      type: p.type,
      name: p.name,
      distance_min: p.distanceMin,
    }));

    const { data: proxData, error: proxError } = await supabase
      .from('property_proximities')
      .insert(proxInserts)
      .select();

    if (proxError) {
      console.error('Error creating proximities:', proxError);
      // No lanzar error, la propiedad ya se creó
    } else {
      proximities = proxData || [];
    }
  }

  return toProperty(newProp, proximities);
}

/**
 * Eliminar una propiedad (RLS verifica que sea el dueño)
 */
export async function deleteProperty(propertyId: string): Promise<void> {
  // Las proximidades se eliminan automáticamente por ON DELETE CASCADE
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId);

  if (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
}

/**
 * Incrementar el contador de vistas de una propiedad
 */
export async function incrementViews(propertyId: string): Promise<void> {
  // Usamos rpc o un update directo. Como RLS no permite update a no-owners
  // para las vistas, usamos una llamada especial con el service role
  // Por ahora, hacemos un simple update que funcionará para propiedades del sistema (owner_id = null)
  const { error } = await supabase.rpc('increment_property_views' as never, {
    prop_id: propertyId,
  } as never);

  if (error) {
    // Silently fail - views increment is not critical
    console.warn('Could not increment views:', error.message);
  }
}
