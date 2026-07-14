// Tipos para el Sistema de Perfil de Confianza Dual
// Interfaces y tipos para perfiles, leads, reseñas y verificación

// === Estados y enums ===

export type LeadStatus = 'pending' | 'survey_sent' | 'tenant_confirmed' | 'owner_confirmed' | 'confirmed' | 'not_completed';
export type TenantResponse = 'yes_rented' | 'just_chatted' | 'not_completed';
export type OwnerResponse = 'yes_tenant' | 'no';
export type ReviewType = 'tenant_review' | 'owner_review' | 'communication_only';
export type ReviewStatus = 'active' | 'pending_verification';

// === Interfaces principales ===

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  phoneVerified: boolean;
  dniVerified: boolean;
  dniDocumentUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactLead {
  id: string;
  tenantId: string;
  ownerId: string;
  propertyId: string;
  createdAt: string;
  status: LeadStatus;
  tenantResponse: TenantResponse | null;
  ownerResponse: OwnerResponse | null;
  surveyShownAt: string | null;
  // Campos joined (opcionales, para display)
  propertyTitle?: string;
  otherUserName?: string;
  otherUserAvatar?: string | null;
}

export interface Review {
  id: string;
  leadId: string;
  reviewerId: string;
  revieweeId: string;
  reviewType: ReviewType;
  rating: number;
  // Subcategorías de tenant_review
  paymentPunctuality: number | null;
  propertyCare: number | null;
  coexistence: number | null;
  // Subcategorías de owner_review
  propertyMaintenance: number | null;
  communication: number | null;
  agreementRespect: number | null;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  // Joined fields
  reviewerName?: string;
  reviewerAvatar?: string | null;
}

// === Perfil Dual (agregado para display) ===

export interface TenantCard {
  averageRating: number;
  totalReviews: number;
  avgPaymentPunctuality: number;
  avgPropertyCare: number;
  avgCoexistence: number;
  reviews: Review[];
}

export interface OwnerCard {
  averageRating: number;
  totalReviews: number;
  avgPropertyMaintenance: number;
  avgCommunication: number;
  avgAgreementRespect: number;
  reviews: Review[];
}

export interface DualTrustProfile {
  profile: UserProfile;
  tenantCard: TenantCard;
  ownerCard: OwnerCard;
  isVerified: boolean; // phone + DNI
}

// === Inputs para formularios ===

export interface ReviewFormInput {
  leadId: string;
  revieweeId: string;
  reviewType: ReviewType;
  rating: number;
  paymentPunctuality?: number;
  propertyCare?: number;
  coexistence?: number;
  propertyMaintenance?: number;
  communication?: number;
  agreementRespect?: number;
  comment: string;
}

export interface ProfileUpdateInput {
  displayName?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  phoneVerified?: boolean;
}

// === Encuesta de confirmación ===

export interface PendingSurvey {
  lead: ContactLead;
  role: 'tenant' | 'owner'; // rol del usuario actual en este lead
  daysAgo: number;
  propertyTitle: string;
  otherUserName: string;
}
