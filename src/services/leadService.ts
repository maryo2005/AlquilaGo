import { supabase } from '../lib/supabaseClient';
import type { ContactLead, PendingSurvey, TenantResponse, OwnerResponse } from '../types/trustProfile';

const SURVEY_DELAY_DAYS = 5;

/**
 * Registra un nuevo lead cuando el inquilino hace clic en "Contactar por WhatsApp".
 * Si ya existe un lead para esta combinación, no crea uno duplicado.
 */
export async function createContactLead(
  tenantId: string,
  ownerId: string,
  propertyId: string
): Promise<ContactLead | null> {
  // No crear lead si inquilino y arrendador son la misma persona
  if (tenantId === ownerId) return null;

  const { data, error } = await supabase
    .from('contact_leads')
    .upsert(
      {
        tenant_id: tenantId,
        owner_id: ownerId,
        property_id: propertyId,
        status: 'pending'
      },
      { onConflict: 'tenant_id,owner_id,property_id', ignoreDuplicates: true }
    )
    .select()
    .single();

  if (error) {
    // Si es por duplicado, simplemente devolver null (lead ya existe)
    if (error.code === '23505' || error.code === 'PGRST116') return null;
    console.warn('Error al crear lead:', error.message);
    return null;
  }

  return data ? mapLeadRow(data) : null;
}

/**
 * Obtiene las encuestas pendientes para un usuario (leads con ≥5 días y sin respuesta).
 */
export async function fetchPendingSurveys(userId: string): Promise<PendingSurvey[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - SURVEY_DELAY_DAYS);

  // Buscar leads donde el usuario es parte y han pasado suficientes días
  const { data: leads, error } = await supabase
    .from('contact_leads')
    .select('*')
    .or(`tenant_id.eq.${userId},owner_id.eq.${userId}`)
    .lte('created_at', cutoffDate.toISOString())
    .in('status', ['pending', 'survey_sent', 'tenant_confirmed', 'owner_confirmed']);

  if (error) {
    console.warn('Error al obtener encuestas pendientes:', error.message);
    return [];
  }

  if (!leads || leads.length === 0) return [];

  // Filtrar: solo mostrar leads donde el usuario actual NO ha respondido aún
  const unrespondedLeads = leads.filter(lead => {
    if (lead.tenant_id === userId) {
      return lead.tenant_response === null;
    }
    if (lead.owner_id === userId) {
      return lead.owner_response === null;
    }
    return false;
  });

  if (unrespondedLeads.length === 0) return [];

  // Enriquecer con datos de propiedad y del otro usuario
  const surveys: PendingSurvey[] = [];

  for (const lead of unrespondedLeads) {
    const isUserTenant = lead.tenant_id === userId;
    const otherUserId = isUserTenant ? lead.owner_id : lead.tenant_id;

    // Obtener nombre de la propiedad
    const { data: property } = await supabase
      .from('properties')
      .select('title')
      .eq('id', lead.property_id)
      .single();

    // Obtener nombre del otro usuario
    const { data: otherProfile } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('id', otherUserId)
      .single();

    const createdDate = new Date(lead.created_at);
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    surveys.push({
      lead: mapLeadRow(lead),
      role: isUserTenant ? 'tenant' : 'owner',
      daysAgo,
      propertyTitle: property?.title || 'Propiedad',
      otherUserName: otherProfile?.display_name || 'Usuario'
    });
  }

  return surveys;
}

/**
 * Registra la respuesta del inquilino a la encuesta de confirmación.
 */
export async function submitTenantResponse(
  leadId: string,
  response: TenantResponse
): Promise<void> {
  const { data: lead, error: fetchError } = await supabase
    .from('contact_leads')
    .select('owner_response, status')
    .eq('id', leadId)
    .single();

  if (fetchError) throw new Error('Error al obtener lead: ' + fetchError.message);

  // Determinar nuevo status
  let newStatus = 'tenant_confirmed';
  if (response === 'not_completed') {
    newStatus = 'not_completed';
  } else if (response === 'yes_rented' && lead.owner_response === 'yes_tenant') {
    newStatus = 'confirmed'; // ¡MATCH!
  } else if (response === 'yes_rented' && lead.owner_response === null) {
    newStatus = 'tenant_confirmed';
  } else if (response === 'just_chatted') {
    newStatus = lead.owner_response === 'no' ? 'not_completed' : 'tenant_confirmed';
  }

  const { error } = await supabase
    .from('contact_leads')
    .update({
      tenant_response: response,
      status: newStatus,
      survey_shown_at: new Date().toISOString()
    })
    .eq('id', leadId);

  if (error) throw new Error('Error al registrar respuesta: ' + error.message);
}

/**
 * Registra la respuesta del arrendador a la encuesta de confirmación.
 */
export async function submitOwnerResponse(
  leadId: string,
  response: OwnerResponse
): Promise<void> {
  const { data: lead, error: fetchError } = await supabase
    .from('contact_leads')
    .select('tenant_response, status')
    .eq('id', leadId)
    .single();

  if (fetchError) throw new Error('Error al obtener lead: ' + fetchError.message);

  // Determinar nuevo status
  let newStatus = 'owner_confirmed';
  if (response === 'no') {
    newStatus = lead.tenant_response === 'not_completed' ? 'not_completed' : 'owner_confirmed';
  } else if (response === 'yes_tenant' && lead.tenant_response === 'yes_rented') {
    newStatus = 'confirmed'; // ¡MATCH!
  } else if (response === 'yes_tenant' && lead.tenant_response === null) {
    newStatus = 'owner_confirmed';
  }

  const { error } = await supabase
    .from('contact_leads')
    .update({
      owner_response: response,
      status: newStatus,
      survey_shown_at: new Date().toISOString()
    })
    .eq('id', leadId);

  if (error) throw new Error('Error al registrar respuesta: ' + error.message);
}

/**
 * Obtiene leads donde la calificación está desbloqueada para el usuario.
 */
export async function fetchReviewableLeads(userId: string): Promise<ContactLead[]> {
  // Leads confirmados (match) donde el usuario no ha dejado reseña aún
  const { data: confirmedLeads, error } = await supabase
    .from('contact_leads')
    .select('*')
    .or(`tenant_id.eq.${userId},owner_id.eq.${userId}`)
    .in('status', ['confirmed', 'tenant_confirmed', 'owner_confirmed', 'not_completed']);

  if (error) {
    console.warn('Error al obtener leads calificables:', error.message);
    return [];
  }

  if (!confirmedLeads) return [];

  // Verificar cuáles no tienen reseña del usuario aún
  const { data: existingReviews } = await supabase
    .from('reviews')
    .select('lead_id')
    .eq('reviewer_id', userId);

  const reviewedLeadIds = new Set((existingReviews || []).map(r => r.lead_id));

  return confirmedLeads
    .filter(lead => !reviewedLeadIds.has(lead.id))
    .filter(lead => {
      // Solo permitir reseña si el lead tiene alguna confirmación
      if (lead.status === 'confirmed') return true;
      // Permitir communication_only si conversaron
      const isUserTenant = lead.tenant_id === userId;
      if (isUserTenant && lead.tenant_response === 'just_chatted') return true;
      if (!isUserTenant && lead.owner_response === 'no' && lead.tenant_response === 'just_chatted') return true;
      // Solo uno confirmó: permitir con status pendiente
      if (lead.status === 'tenant_confirmed' || lead.status === 'owner_confirmed') return true;
      return false;
    })
    .map(mapLeadRow);
}

// === Helpers ===

function mapLeadRow(row: Record<string, unknown>): ContactLead {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    ownerId: row.owner_id as string,
    propertyId: row.property_id as string,
    createdAt: row.created_at as string,
    status: row.status as ContactLead['status'],
    tenantResponse: row.tenant_response as ContactLead['tenantResponse'],
    ownerResponse: row.owner_response as ContactLead['ownerResponse'],
    surveyShownAt: row.survey_shown_at as string | null,
  };
}
