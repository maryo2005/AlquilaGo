import type { FC } from 'react';
import { useState } from 'react';
import type { ReviewFormInput, ReviewType } from '../types/trustProfile';
import { Star, Send, MessageCircle, Loader2 } from 'lucide-react';

interface ReviewFormProps {
  leadId: string;
  revieweeId: string;
  revieweeName: string;
  /** 'full' permite 1-5 estrellas con todas las categorías; 'communication_only' solo comunicación máx 3 */
  mode: 'full' | 'communication_only';
  /** Si es full, indica si el reviewer califica como arrendador (tenant_review) o inquilino (owner_review) */
  reviewType: ReviewType;
  onSubmit: (input: ReviewFormInput) => Promise<void>;
  onCancel: () => void;
}

const StarRating: FC<{
  value: number;
  onChange: (v: number) => void;
  max?: number;
  label: string;
}> = ({ value, onChange, max = 5, label }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex flex-col space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                star <= (hovered || value)
                  ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-xs font-bold text-gray-600">
          {value > 0 ? `${value}/${max}` : ''}
        </span>
      </div>
    </div>
  );
};

export const ReviewForm: FC<ReviewFormProps> = ({
  leadId,
  revieweeId,
  revieweeName,
  mode,
  reviewType,
  onSubmit,
  onCancel
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subcategorías
  const [paymentPunctuality, setPaymentPunctuality] = useState(0);
  const [propertyCare, setPropertyCare] = useState(0);
  const [coexistence, setCoexistence] = useState(0);
  const [propertyMaintenance, setPropertyMaintenance] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [agreementRespect, setAgreementRespect] = useState(0);

  const maxStars = mode === 'communication_only' ? 3 : 5;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Por favor selecciona una calificación general.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const input: ReviewFormInput = {
        leadId,
        revieweeId,
        reviewType: mode === 'communication_only' ? 'communication_only' : reviewType,
        rating: Math.min(rating, maxStars),
        comment,
        ...(reviewType === 'tenant_review' && mode === 'full' ? {
          paymentPunctuality: paymentPunctuality || undefined,
          propertyCare: propertyCare || undefined,
          coexistence: coexistence || undefined,
        } : {}),
        ...(reviewType === 'owner_review' && mode === 'full' ? {
          propertyMaintenance: propertyMaintenance || undefined,
          communication: communication || undefined,
          agreementRespect: agreementRespect || undefined,
        } : {}),
        ...(mode === 'communication_only' ? {
          communication: communication || undefined,
        } : {}),
      };

      await onSubmit(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar reseña.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTitleText = () => {
    if (mode === 'communication_only') return `Califica la comunicación con ${revieweeName}`;
    if (reviewType === 'tenant_review') return `Califica a ${revieweeName} como inquilino`;
    return `Califica a ${revieweeName} como arrendador`;
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg animate-in fade-in">
      {/* Header */}
      <div className="mb-5 flex items-center space-x-2 border-b border-gray-50 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
          <Star className="h-4.5 w-4.5 fill-current" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-gray-800">{getTitleText()}</h3>
          <p className="text-[10px] text-gray-500">
            {mode === 'communication_only'
              ? 'Solo puedes calificar la comunicación (máximo 3 ⭐)'
              : 'Tu reseña ayuda a construir confianza en la comunidad'
            }
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Calificación General */}
        <StarRating
          value={rating}
          onChange={setRating}
          max={maxStars}
          label="Calificación general"
        />

        {/* Subcategorías para tenant_review (modo full) */}
        {mode === 'full' && reviewType === 'tenant_review' && (
          <div className="rounded-xl bg-blue-50/50 p-4 space-y-3 border border-blue-100/50">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
              Detalle como Inquilino
            </span>
            <StarRating
              value={paymentPunctuality}
              onChange={setPaymentPunctuality}
              label="Puntualidad de pago"
            />
            <StarRating
              value={propertyCare}
              onChange={setPropertyCare}
              label="Cuidado de la propiedad"
            />
            <StarRating
              value={coexistence}
              onChange={setCoexistence}
              label="Convivencia"
            />
          </div>
        )}

        {/* Subcategorías para owner_review (modo full) */}
        {mode === 'full' && reviewType === 'owner_review' && (
          <div className="rounded-xl bg-indigo-50/50 p-4 space-y-3 border border-indigo-100/50">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
              Detalle como Arrendador
            </span>
            <StarRating
              value={propertyMaintenance}
              onChange={setPropertyMaintenance}
              label="Mantenimiento de la propiedad"
            />
            <StarRating
              value={communication}
              onChange={setCommunication}
              label="Comunicación"
            />
            <StarRating
              value={agreementRespect}
              onChange={setAgreementRespect}
              label="Respeto a los acuerdos"
            />
          </div>
        )}

        {/* Comunicación only */}
        {mode === 'communication_only' && (
          <div className="rounded-xl bg-emerald-50/50 p-4 space-y-3 border border-emerald-100/50">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>Solo comunicación</span>
            </span>
            <StarRating
              value={communication}
              onChange={setCommunication}
              max={3}
              label="¿Qué tan amable fue al responder?"
            />
          </div>
        )}

        {/* Comentario */}
        <div className="flex flex-col space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Comentario (opcional)
          </span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder={
              mode === 'communication_only'
                ? '¿Cómo fue la comunicación por WhatsApp?'
                : reviewType === 'tenant_review'
                ? 'Describe tu experiencia con este inquilino...'
                : 'Describe tu experiencia con este arrendador...'
            }
            className="rounded-xl border border-gray-200 p-3 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50 resize-none"
          />
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-50">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-200 transition hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Publicar Reseña</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
