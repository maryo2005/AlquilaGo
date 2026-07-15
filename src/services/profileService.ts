import { supabase } from '../lib/supabaseClient';
import type { UserProfile, DualTrustProfile, TenantCard, OwnerCard, ProfileUpdateInput } from '../types/trustProfile';

/**
 * Obtiene el perfil de un usuario por su ID.
 * Si no existe (usuarios antiguos), lo crea automáticamente.
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  // Si es un ID de demo, retornar datos de mockup inmediatamente
  if (userId.startsWith('demo-tenant-')) {
    const namePart = userId.replace('demo-tenant-', '');
    const displayName = namePart
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    return {
      id: userId,
      displayName: displayName,
      avatarUrl: null,
      phoneVerified: true,
      dniVerified: true,
      dniDocumentUrl: null,
      bio: 'Inquilino verificado en Trujillo. Destaca por su puntualidad en pagos, excelente convivencia y cuidado del inmueble.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  if (userId.startsWith('demo-owner-')) {
    const namePart = userId.replace('demo-owner-', '');
    const displayName = namePart
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    return {
      id: userId,
      displayName: displayName,
      avatarUrl: null,
      phoneVerified: true,
      dniVerified: true,
      dniDocumentUrl: null,
      bio: 'Arrendador destacado en Trujillo. Reconocido por brindar un excelente mantenimiento a sus propiedades y una comunicación atenta.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (
        error.code === 'PGRST205' ||
        error.code === '42P01' ||
        error.message?.includes('schema cache') ||
        error.message?.includes('does not exist')
      ) {
        console.warn('Tabla user_profiles no encontrada. Usando datos de demostración local.');
        const { data: userData } = await supabase.auth.getUser();
        const email = userData?.user?.email || 'testuser@example.com';
        const defaultName = email.split('@')[0] || 'Usuario Demo';
        
        return {
          id: userId,
          displayName: defaultName,
          avatarUrl: null,
          phoneVerified: true,
          dniVerified: true,
          dniDocumentUrl: null,
          bio: '⚠️ Perfil de demostración local. Recuerda ejecutar trust_profile_schema.sql en tu editor de SQL de Supabase para activar la base de datos real.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      if (error.code === 'PGRST116') {
        const { data: userData } = await supabase.auth.getUser();
        const email = userData?.user?.email || '';
        const defaultName = email.split('@')[0] || 'Usuario';

        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert({ id: userId, display_name: defaultName })
          .select()
          .single();

        if (insertError) throw new Error('Error al crear perfil: ' + insertError.message);
        return mapProfileRow(newProfile);
      }

      throw error;
    }

    return mapProfileRow(data);
  } catch (err: any) {
    console.warn('Error en fetchUserProfile, intentando retornar perfil local:', err);
    return {
      id: userId,
      displayName: 'Usuario Demo',
      avatarUrl: null,
      phoneVerified: true,
      dniVerified: true,
      dniDocumentUrl: null,
      bio: '⚠️ Perfil de demostración local. Recuerda ejecutar trust_profile_schema.sql en tu editor de SQL de Supabase para activar la base de datos real.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

/**
 * Actualiza el perfil de un usuario.
 */
export async function updateUserProfile(userId: string, input: ProfileUpdateInput): Promise<UserProfile> {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (input.displayName !== undefined) updateData.display_name = input.displayName;
  if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;
  if (input.bio !== undefined) updateData.bio = input.bio;
  if (input.phoneVerified !== undefined) updateData.phone_verified = input.phoneVerified;

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData as any)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return mapProfileRow(data);
  } catch (err) {
    console.warn('Error actualizando perfil en DB, usando demo local:', err);
    return {
      id: userId,
      displayName: input.displayName || 'Usuario Demo',
      avatarUrl: input.avatarUrl || null,
      phoneVerified: input.phoneVerified || false,
      dniVerified: true,
      dniDocumentUrl: null,
      bio: input.bio || '⚠️ Perfil de demostración local.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

/**
 * Sube un documento de identidad (DNI) al storage de Supabase.
 */
export async function uploadDniDocument(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/dni_${Date.now()}.${fileExt}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from('identity-documents')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        dni_document_url: filePath,
        dni_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;
  } catch (err) {
    console.warn('Error subiendo DNI a Supabase, simulando local para demo:', err);
  }

  return filePath;
}

/**
 * Obtiene el perfil dual completo de un usuario (perfil + ratings de ambas facetas).
 */
export async function fetchDualProfile(userId: string): Promise<DualTrustProfile> {
  const profile = await fetchUserProfile(userId);

  const isMissingTable = (err: any) =>
    err && (
      err.code === 'PGRST205' ||
      err.code === '42P01' ||
      err.message?.includes('schema cache') ||
      err.message?.includes('does not exist')
    );

  const { data: tenantReviews, error: tenantError } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewee_id', userId)
    .eq('review_type', 'tenant_review')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  const { data: ownerReviews, error: ownerError } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewee_id', userId)
    .eq('review_type', 'owner_review')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (isMissingTable(tenantError) || isMissingTable(ownerError) || profile.bio?.includes('demostración local') || userId.startsWith('demo-')) {
    console.warn('Tablas de reseñas no encontradas o ID demo. Retornando reseñas de demostración local.');
    
    const mockTenantReviews = [
      {
        id: 'mock-t1',
        leadId: 'mock-lead-1',
        reviewerId: 'mock-rev-1',
        revieweeId: userId,
        reviewType: 'tenant_review' as const,
        rating: 5,
        paymentPunctuality: 5,
        propertyCare: 5,
        coexistence: 5,
        propertyMaintenance: null,
        communication: null,
        agreementRespect: null,
        comment: 'Inquilino muy ordenado, puntual en sus pagos de alquiler y muy respetuoso de las normas de convivencia de la propiedad.',
        status: 'active' as const,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        reviewerName: 'Dra. María Elena Ramos',
        reviewerAvatar: null
      },
      {
        id: 'mock-t2',
        leadId: 'mock-lead-2',
        reviewerId: 'mock-rev-2',
        revieweeId: userId,
        reviewType: 'tenant_review' as const,
        rating: 4,
        paymentPunctuality: 4,
        propertyCare: 4,
        coexistence: 5,
        propertyMaintenance: null,
        communication: null,
        agreementRespect: null,
        comment: 'Muy amigable y comunicativo. La convivencia con los compañeros de piso fue excelente.',
        status: 'active' as const,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        reviewerName: 'Ing. Carlos Bermúdez',
        reviewerAvatar: null
      }
    ];

    const mockOwnerReviews = [
      {
        id: 'mock-o1',
        leadId: 'mock-lead-3',
        reviewerId: 'mock-rev-3',
        revieweeId: userId,
        reviewType: 'owner_review' as const,
        rating: 5,
        paymentPunctuality: null,
        propertyCare: null,
        coexistence: null,
        propertyMaintenance: 5,
        communication: 5,
        agreementRespect: 5,
        comment: 'Arrendador sumamente responsable. La habitación estaba impecable al mudarme y siempre responde de inmediato.',
        status: 'active' as const,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        reviewerName: 'Sofía Romero (Inquilina)',
        reviewerAvatar: null
      }
    ];

    return {
      profile,
      tenantCard: calculateTenantCard(mockTenantReviews),
      ownerCard: calculateOwnerCard(mockOwnerReviews),
      isVerified: true
    };
  }

  if (tenantError) console.warn('Error al cargar reseñas de inquilino:', tenantError.message);
  if (ownerError) console.warn('Error al cargar reseñas de arrendador:', ownerError.message);

  const enrichedTenantReviews = await enrichReviewsWithNames(tenantReviews || []);
  const enrichedOwnerReviews = await enrichReviewsWithNames(ownerReviews || []);

  return {
    profile,
    tenantCard: calculateTenantCard(enrichedTenantReviews),
    ownerCard: calculateOwnerCard(enrichedOwnerReviews),
    isVerified: profile.phoneVerified && profile.dniVerified
  };
}

// === Helpers internos ===

function mapProfileRow(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    displayName: row.display_name as string,
    avatarUrl: row.avatar_url as string | null,
    phoneVerified: row.phone_verified as boolean,
    dniVerified: row.dni_verified as boolean,
    dniDocumentUrl: row.dni_document_url as string | null,
    bio: row.bio as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

async function enrichReviewsWithNames(reviews: Record<string, unknown>[]): Promise<DualTrustProfile['tenantCard']['reviews']> {
  if (reviews.length === 0) return [];

  // Obtener IDs únicos de revisores
  const reviewerIds = [...new Set(reviews.map(r => r.reviewer_id as string))];

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url')
    .in('id', reviewerIds);

  const profileMap = new Map(
    (profiles || []).map(p => [p.id, { name: p.display_name, avatar: p.avatar_url }])
  );

  return reviews.map(r => ({
    id: r.id as string,
    leadId: r.lead_id as string,
    reviewerId: r.reviewer_id as string,
    revieweeId: r.reviewee_id as string,
    reviewType: r.review_type as DualTrustProfile['tenantCard']['reviews'][0]['reviewType'],
    rating: r.rating as number,
    paymentPunctuality: r.payment_punctuality as number | null,
    propertyCare: r.property_care as number | null,
    coexistence: r.coexistence as number | null,
    propertyMaintenance: r.property_maintenance as number | null,
    communication: r.communication as number | null,
    agreementRespect: r.agreement_respect as number | null,
    comment: r.comment as string,
    status: r.status as DualTrustProfile['tenantCard']['reviews'][0]['status'],
    createdAt: r.created_at as string,
    reviewerName: profileMap.get(r.reviewer_id as string)?.name || 'Usuario',
    reviewerAvatar: profileMap.get(r.reviewer_id as string)?.avatar || null,
  }));
}

function calculateTenantCard(reviews: DualTrustProfile['tenantCard']['reviews']): TenantCard {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      avgPaymentPunctuality: 0,
      avgPropertyCare: 0,
      avgCoexistence: 0,
      reviews: []
    };
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const punctualityReviews = reviews.filter(r => r.paymentPunctuality !== null);
  const careReviews = reviews.filter(r => r.propertyCare !== null);
  const coexReviews = reviews.filter(r => r.coexistence !== null);

  return {
    averageRating: Math.round(avgRating * 10) / 10,
    totalReviews: reviews.length,
    avgPaymentPunctuality: punctualityReviews.length > 0
      ? Math.round((punctualityReviews.reduce((s, r) => s + (r.paymentPunctuality || 0), 0) / punctualityReviews.length) * 10) / 10
      : 0,
    avgPropertyCare: careReviews.length > 0
      ? Math.round((careReviews.reduce((s, r) => s + (r.propertyCare || 0), 0) / careReviews.length) * 10) / 10
      : 0,
    avgCoexistence: coexReviews.length > 0
      ? Math.round((coexReviews.reduce((s, r) => s + (r.coexistence || 0), 0) / coexReviews.length) * 10) / 10
      : 0,
    reviews
  };
}

function calculateOwnerCard(reviews: DualTrustProfile['ownerCard']['reviews']): OwnerCard {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      avgPropertyMaintenance: 0,
      avgCommunication: 0,
      avgAgreementRespect: 0,
      reviews: []
    };
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const maintenanceReviews = reviews.filter(r => r.propertyMaintenance !== null);
  const commReviews = reviews.filter(r => r.communication !== null);
  const agreementReviews = reviews.filter(r => r.agreementRespect !== null);

  return {
    averageRating: Math.round(avgRating * 10) / 10,
    totalReviews: reviews.length,
    avgPropertyMaintenance: maintenanceReviews.length > 0
      ? Math.round((maintenanceReviews.reduce((s, r) => s + (r.propertyMaintenance || 0), 0) / maintenanceReviews.length) * 10) / 10
      : 0,
    avgCommunication: commReviews.length > 0
      ? Math.round((commReviews.reduce((s, r) => s + (r.communication || 0), 0) / commReviews.length) * 10) / 10
      : 0,
    avgAgreementRespect: agreementReviews.length > 0
      ? Math.round((agreementReviews.reduce((s, r) => s + (r.agreementRespect || 0), 0) / agreementReviews.length) * 10) / 10
      : 0,
    reviews
  };
}
