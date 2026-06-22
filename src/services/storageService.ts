import { supabase } from '../lib/supabaseClient';

const BUCKET_NAME = 'property-images';

/**
 * Subir una imagen de propiedad a Supabase Storage
 * Las imágenes se organizan en carpetas por userId: {userId}/{timestamp}_{filename}
 * @returns La URL pública de la imagen subida
 */
export async function uploadPropertyImage(
  file: File,
  userId: string
): Promise<string> {
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${userId}/${timestamp}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/**
 * Eliminar una imagen del storage
 * @param imageUrl La URL pública de la imagen a eliminar
 */
export async function deletePropertyImage(imageUrl: string): Promise<void> {
  // Extraer el path del archivo de la URL
  const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
    // No lanzar error - eliminación de imagen no es crítica
  }
}

/**
 * Subir múltiples imágenes
 * @returns Array de URLs públicas
 */
export async function uploadMultipleImages(
  files: File[],
  userId: string
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadPropertyImage(file, userId));
  return Promise.all(uploadPromises);
}
