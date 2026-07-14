import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { DualTrustProfile, Review } from '../types/trustProfile';
import { fetchDualProfile } from '../services/profileService';
import { VerificationBadge } from './VerificationBadge';
import {
  X,
  Star,
  User,
  Home,
  Briefcase,
  Shield,
  Phone,
  CreditCard,
  Heart,
  MessageSquare,
  Handshake,
  Wrench,
  Calendar,
  Loader2,
  Award
} from 'lucide-react';

interface TrustProfileModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

type ActiveTab = 'tenant' | 'owner';

const StarDisplay: FC<{ rating: number; max?: number; size?: 'sm' | 'md' }> = ({
  rating,
  max = 5,
  size = 'sm'
}) => {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5';
  return (
    <div className="flex items-center space-x-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`${iconSize} ${
            i < Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );
};

const RatingBar: FC<{ label: string; value: number; icon: React.ReactNode }> = ({
  label,
  value,
  icon
}) => {
  const percentage = (value / 5) * 100;
  return (
    <div className="flex items-center space-x-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-gray-500 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-gray-600 truncate">{label}</span>
          <span className="text-[10px] font-black text-gray-800 ml-2">{value > 0 ? value.toFixed(1) : '—'}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 ease-out"
            style={{ width: value > 0 ? `${percentage}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
};

const ReviewCard: FC<{ review: Review }> = ({ review }) => {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 30) return `Hace ${days} días`;
    const months = Math.floor(days / 30);
    return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  };

  return (
    <div className="rounded-xl border border-gray-50 bg-gray-50/50 p-3.5 transition hover:border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold shadow-sm">
            {review.reviewerName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">{review.reviewerName || 'Usuario'}</p>
            <p className="text-[9px] text-gray-400 flex items-center space-x-1">
              <Calendar className="h-2.5 w-2.5" />
              <span>{timeAgo(review.createdAt)}</span>
            </p>
          </div>
        </div>
        <StarDisplay rating={review.rating} />
      </div>

      {review.comment && (
        <p className="mt-2.5 text-xs text-gray-600 leading-relaxed italic">
          "{review.comment}"
        </p>
      )}

      {review.reviewType === 'communication_only' && (
        <span className="mt-2 inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-600">
          <MessageSquare className="h-2.5 w-2.5" />
          <span>Solo comunicación</span>
        </span>
      )}
    </div>
  );
};

export const TrustProfileModal: FC<TrustProfileModalProps> = ({
  isOpen,
  userId,
  onClose
}) => {
  const [profile, setProfile] = useState<DualTrustProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('tenant');
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDualProfile(userId);
      setProfile(data);
    } catch (err) {
      setError('No se pudo cargar el perfil.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && userId) {
      loadProfile();
    }
  }, [isOpen, userId, loadProfile]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative flex h-full max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-gray-900 hover:scale-105 active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header: Profile Info */}
        <div className="relative flex-shrink-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 px-6 py-8 text-white overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/5 blur-xl" />

          {loading ? (
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 animate-pulse rounded-full bg-white/20" />
              <div className="space-y-2">
                <div className="h-5 w-32 animate-pulse rounded bg-white/20" />
                <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          ) : profile ? (
            <div className="relative z-10 flex items-center space-x-4">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white/30 bg-gradient-to-br from-white/20 to-white/5 text-2xl font-black text-white shadow-lg backdrop-blur-sm">
                  {profile.profile.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                {/* Verification check overlay */}
                {profile.isVerified && (
                  <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-white shadow-sm">
                    <Shield className="h-3 w-3 text-white fill-white" />
                  </div>
                )}
              </div>

              {/* Name & Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black text-white truncate">
                  {profile.profile.displayName}
                </h2>
                <div className="mt-1 flex items-center flex-wrap gap-2">
                  <VerificationBadge isVerified={profile.isVerified} size="sm" showLabel />
                  {profile.tenantCard.totalReviews + profile.ownerCard.totalReviews > 0 && (
                    <span className="inline-flex items-center space-x-1 rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold text-white/90 backdrop-blur-sm">
                      <Award className="h-2.5 w-2.5" />
                      <span>{profile.tenantCard.totalReviews + profile.ownerCard.totalReviews} reseñas</span>
                    </span>
                  )}
                </div>
                {profile.profile.bio && (
                  <p className="mt-1.5 text-[11px] text-white/70 line-clamp-2">{profile.profile.bio}</p>
                )}
              </div>
            </div>
          ) : null}

          {/* Verification Status Bar */}
          {!loading && profile && (
            <div className="relative z-10 mt-4 flex items-center space-x-4 rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm border border-white/10">
              <div className="flex items-center space-x-1.5">
                <CreditCard className={`h-3 w-3 ${profile.profile.dniVerified ? 'text-emerald-300' : 'text-white/40'}`} />
                <span className={`text-[10px] font-bold ${profile.profile.dniVerified ? 'text-emerald-300' : 'text-white/40'}`}>
                  DNI {profile.profile.dniVerified ? '✓' : 'Pendiente'}
                </span>
              </div>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center space-x-1.5">
                <Phone className={`h-3 w-3 ${profile.profile.phoneVerified ? 'text-emerald-300' : 'text-white/40'}`} />
                <span className={`text-[10px] font-bold ${profile.profile.phoneVerified ? 'text-emerald-300' : 'text-white/40'}`}>
                  Teléfono {profile.profile.phoneVerified ? '✓' : 'Pendiente'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-4 flex-shrink-0">
          <button
            onClick={() => setActiveTab('tenant')}
            className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-xs font-bold transition ${
              activeTab === 'tenant'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Ficha de Inquilino</span>
            {!loading && profile && profile.tenantCard.totalReviews > 0 && (
              <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-black text-blue-700">
                {profile.tenantCard.totalReviews}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('owner')}
            className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-xs font-bold transition ${
              activeTab === 'owner'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Ficha de Arrendador</span>
            {!loading && profile && profile.ownerCard.totalReviews > 0 && (
              <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-black text-indigo-700">
                {profile.ownerCard.totalReviews}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="mt-3 text-xs text-gray-500">Cargando perfil de confianza...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-red-500 font-bold">{error}</p>
              <button
                onClick={loadProfile}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Reintentar
              </button>
            </div>
          ) : profile ? (
            <>
              {/* === FICHA DE INQUILINO === */}
              {activeTab === 'tenant' && (
                <div className="space-y-5">
                  {/* Overall Rating */}
                  <div className="flex items-center space-x-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100/50">
                    <div className="text-center">
                      <span className="text-3xl font-black text-blue-700">
                        {profile.tenantCard.averageRating > 0
                          ? profile.tenantCard.averageRating.toFixed(1)
                          : '—'}
                      </span>
                      <StarDisplay rating={profile.tenantCard.averageRating} size="md" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-700">Calificación como Inquilino</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Basada en {profile.tenantCard.totalReviews} {profile.tenantCard.totalReviews === 1 ? 'reseña' : 'reseñas'} de arrendadores
                      </p>
                    </div>
                  </div>

                  {/* Subcategory Ratings */}
                  {profile.tenantCard.totalReviews > 0 && (
                    <div className="space-y-3">
                      <RatingBar
                        label="Puntualidad de pago"
                        value={profile.tenantCard.avgPaymentPunctuality}
                        icon={<CreditCard className="h-3.5 w-3.5" />}
                      />
                      <RatingBar
                        label="Cuidado de la propiedad"
                        value={profile.tenantCard.avgPropertyCare}
                        icon={<Home className="h-3.5 w-3.5" />}
                      />
                      <RatingBar
                        label="Convivencia"
                        value={profile.tenantCard.avgCoexistence}
                        icon={<Heart className="h-3.5 w-3.5" />}
                      />
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">
                      Comentarios de Arrendadores
                    </h4>
                    {profile.tenantCard.reviews.length > 0 ? (
                      <div className="space-y-2.5">
                        {profile.tenantCard.reviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
                        <User className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-xs font-bold text-gray-500">Sin reseñas como inquilino</p>
                        <p className="mt-1 text-[10px] text-gray-400">
                          Las reseñas aparecerán cuando un arrendador califique a este usuario.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === FICHA DE ARRENDADOR === */}
              {activeTab === 'owner' && (
                <div className="space-y-5">
                  {/* Overall Rating */}
                  <div className="flex items-center space-x-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border border-indigo-100/50">
                    <div className="text-center">
                      <span className="text-3xl font-black text-indigo-700">
                        {profile.ownerCard.averageRating > 0
                          ? profile.ownerCard.averageRating.toFixed(1)
                          : '—'}
                      </span>
                      <StarDisplay rating={profile.ownerCard.averageRating} size="md" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-700">Calificación como Arrendador</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Basada en {profile.ownerCard.totalReviews} {profile.ownerCard.totalReviews === 1 ? 'reseña' : 'reseñas'} de inquilinos
                      </p>
                    </div>
                  </div>

                  {/* Subcategory Ratings */}
                  {profile.ownerCard.totalReviews > 0 && (
                    <div className="space-y-3">
                      <RatingBar
                        label="Mantenimiento de propiedad"
                        value={profile.ownerCard.avgPropertyMaintenance}
                        icon={<Wrench className="h-3.5 w-3.5" />}
                      />
                      <RatingBar
                        label="Comunicación"
                        value={profile.ownerCard.avgCommunication}
                        icon={<MessageSquare className="h-3.5 w-3.5" />}
                      />
                      <RatingBar
                        label="Respeto a los acuerdos"
                        value={profile.ownerCard.avgAgreementRespect}
                        icon={<Handshake className="h-3.5 w-3.5" />}
                      />
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">
                      Comentarios de Inquilinos
                    </h4>
                    {profile.ownerCard.reviews.length > 0 ? (
                      <div className="space-y-2.5">
                        {profile.ownerCard.reviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
                        <Briefcase className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-xs font-bold text-gray-500">Sin reseñas como arrendador</p>
                        <p className="mt-1 text-[10px] text-gray-400">
                          Las reseñas aparecerán cuando un inquilino califique a este usuario.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
