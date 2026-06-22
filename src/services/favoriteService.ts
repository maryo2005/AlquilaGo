import { supabase } from '../lib/supabaseClient';

/**
 * Obtener los IDs de propiedades favoritas del usuario
 */
export async function fetchFavorites(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('property_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }

  return (data || []).map((f) => f.property_id);
}

/**
 * Agregar una propiedad a favoritos
 */
export async function addFavorite(userId: string, propertyId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      property_id: propertyId,
    });

  if (error) {
    // Ignorar error de duplicado (ya es favorito)
    if (error.code === '23505') return;
    console.error('Error adding favorite:', error);
    throw error;
  }
}

/**
 * Quitar una propiedad de favoritos
 */
export async function removeFavorite(userId: string, propertyId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('property_id', propertyId);

  if (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}
