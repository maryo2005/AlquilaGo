import { supabase } from '../lib/supabaseClient';
import type { Review, ReviewFormInput } from '../types/trustProfile';

/**
 * Obtiene las reseñas recibidas por un usuario, filtradas por tipo.
 */
export async function fetchReviewsForUser(
  userId: string,
  reviewType?: 'tenant_review' | 'owner_review'
): Promise<Review[]> {
  let query = supabase
    .from('reviews')
    .select('*')
    .eq('reviewee_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (reviewType) {
    query = query.eq('review_type', reviewType);
  }

  const { data, error } = await query;

  if (error) {
    console.warn('Error al obtener reseñas:', error.message);
    return [];
  }

  return (data || []).map(mapReviewRow);
}

/**
 * Envía una nueva reseña. Valida que el lead permita calificación.
 */
export async function submitReview(
  reviewerId: string,
  input: ReviewFormInput
): Promise<Review> {
  // 1. Verificar que el lead existe y permite calificación
  const { data: lead, error: leadError } = await supabase
    .from('contact_leads')
    .select('*')
    .eq('id', input.leadId)
    .single();

  if (leadError) throw new Error('Lead no encontrado: ' + leadError.message);

  // Verificar que el reviewer es parte del lead
  if (lead.tenant_id !== reviewerId && lead.owner_id !== reviewerId) {
    throw new Error('No tienes permiso para calificar en este lead.');
  }

  // Determinar status de la reseña basado en el estado del lead
  let reviewStatus: 'active' | 'pending_verification' = 'active';

  if (input.reviewType === 'communication_only') {
    // Siempre permitido si hubo contacto
    reviewStatus = 'active';
  } else if (lead.status === 'confirmed') {
    // Match completo → reseña activa
    reviewStatus = 'active';
  } else if (lead.status === 'tenant_confirmed' || lead.status === 'owner_confirmed') {
    // Solo uno confirmó → pendiente de verificación
    reviewStatus = 'pending_verification';
  } else {
    throw new Error('Este lead no permite calificaciones todavía.');
  }

  // 2. Limitar rating para communication_only
  const rating = input.reviewType === 'communication_only'
    ? Math.min(input.rating, 3)
    : input.rating;

  // 3. Insertar reseña
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      lead_id: input.leadId,
      reviewer_id: reviewerId,
      reviewee_id: input.revieweeId,
      review_type: input.reviewType,
      rating,
      payment_punctuality: input.paymentPunctuality || null,
      property_care: input.propertyCare || null,
      coexistence: input.coexistence || null,
      property_maintenance: input.propertyMaintenance || null,
      communication: input.communication || null,
      agreement_respect: input.agreementRespect || null,
      comment: input.comment,
      status: reviewStatus
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Ya dejaste una reseña para este contacto.');
    }
    throw new Error('Error al publicar reseña: ' + error.message);
  }

  return mapReviewRow(data);
}

/**
 * Verifica si un usuario puede dejar una reseña en un lead específico.
 */
export async function canReview(
  leadId: string,
  reviewerId: string
): Promise<{ canReview: boolean; type: 'full' | 'communication_only' | 'none'; reason: string }> {
  // Verificar si ya existe reseña
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('lead_id', leadId)
    .eq('reviewer_id', reviewerId)
    .single();

  if (existingReview) {
    return { canReview: false, type: 'none', reason: 'Ya has dejado una reseña para este contacto.' };
  }

  // Obtener el lead
  const { data: lead, error } = await supabase
    .from('contact_leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (error || !lead) {
    return { canReview: false, type: 'none', reason: 'Lead no encontrado.' };
  }

  // Verificar que el usuario es parte del lead
  if (lead.tenant_id !== reviewerId && lead.owner_id !== reviewerId) {
    return { canReview: false, type: 'none', reason: 'No eres parte de este contacto.' };
  }

  // Determinar tipo de reseña permitida
  if (lead.status === 'confirmed') {
    return { canReview: true, type: 'full', reason: 'Match confirmado. Puedes dejar una calificación completa.' };
  }

  if (lead.status === 'tenant_confirmed' || lead.status === 'owner_confirmed') {
    return {
      canReview: true,
      type: 'full',
      reason: 'Solo una parte ha confirmado. Tu reseña quedará pendiente de verificación.'
    };
  }

  // Si alguien indicó "solo conversamos"
  const isUserTenant = lead.tenant_id === reviewerId;
  const userResponse = isUserTenant ? lead.tenant_response : lead.owner_response;

  if (userResponse === 'just_chatted' || lead.tenant_response === 'just_chatted') {
    return {
      canReview: true,
      type: 'communication_only',
      reason: 'Solo pueden calificar la comunicación (máximo 3 estrellas).'
    };
  }

  return { canReview: false, type: 'none', reason: 'Este lead no permite calificaciones todavía.' };
}

// === Helpers ===

function mapReviewRow(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    leadId: row.lead_id as string,
    reviewerId: row.reviewer_id as string,
    revieweeId: row.reviewee_id as string,
    reviewType: row.review_type as Review['reviewType'],
    rating: row.rating as number,
    paymentPunctuality: row.payment_punctuality as number | null,
    propertyCare: row.property_care as number | null,
    coexistence: row.coexistence as number | null,
    propertyMaintenance: row.property_maintenance as number | null,
    communication: row.communication as number | null,
    agreementRespect: row.agreement_respect as number | null,
    comment: row.comment as string,
    status: row.status as Review['status'],
    createdAt: row.created_at as string,
  };
}
