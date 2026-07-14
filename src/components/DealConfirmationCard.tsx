import type { FC } from 'react';
import { useState } from 'react';
import type { PendingSurvey } from '../types/trustProfile';
import { submitTenantResponse, submitOwnerResponse } from '../services/leadService';
import { Home, UserCheck, MessageSquare, X, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

interface DealConfirmationCardProps {
  survey: PendingSurvey;
  onResponded: () => void;
}

/**
 * Tarjeta de encuesta de confirmación de trato.
 * Aparece tras 5 días del contacto WhatsApp para validar si se concretó el alquiler.
 */
export const DealConfirmationCard: FC<DealConfirmationCardProps> = ({
  survey,
  onResponded
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [responded, setResponded] = useState(false);
  const [responseText, setResponseText] = useState('');

  const handleTenantResponse = async (response: 'yes_rented' | 'just_chatted' | 'not_completed') => {
    setSubmitting(true);
    try {
      await submitTenantResponse(survey.lead.id, response);
      setResponded(true);
      setResponseText(
        response === 'yes_rented'
          ? '¡Genial! Cuando el arrendador confirme, podrás calificarlo.'
          : response === 'just_chatted'
          ? 'Gracias. Podrás calificar la comunicación.'
          : 'Entendido. ¡Suerte en tu búsqueda!'
      );
      setTimeout(onResponded, 2500);
    } catch (err) {
      console.error('Error al responder encuesta:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOwnerResponse = async (response: 'yes_tenant' | 'no') => {
    setSubmitting(true);
    try {
      await submitOwnerResponse(survey.lead.id, response);
      setResponded(true);
      setResponseText(
        response === 'yes_tenant'
          ? '¡Perfecto! Cuando el inquilino confirme, podrás calificarlo.'
          : 'Entendido. Gracias por tu respuesta.'
      );
      setTimeout(onResponded, 2500);
    } catch (err) {
      console.error('Error al responder encuesta:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Estado post-respuesta
  if (responded) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm transition-all duration-500">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">¡Respuesta registrada!</p>
            <p className="text-xs text-emerald-600 mt-0.5">{responseText}</p>
          </div>
        </div>
        {/* Confetti dots decoration */}
        <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-emerald-200/30 blur-xl" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 p-5 shadow-md transition-all duration-300 hover:shadow-lg">
      {/* Decorative background */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-100/40 blur-2xl" />
      <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-indigo-100/30 blur-xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200">
              {survey.role === 'tenant' ? (
                <Home className="h-5 w-5" />
              ) : (
                <UserCheck className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-600">
                  Confirmación de Trato
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">Hace {survey.daysAgo} días contactaste</p>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-5">
          {survey.role === 'tenant' ? (
            <>
              <h4 className="text-sm font-extrabold text-gray-800">
                ¿Lograste alquilar el cuarto de{' '}
                <span className="text-blue-700">{survey.otherUserName}</span>?
              </h4>
              <p className="mt-1 text-[11px] text-gray-500 flex items-center space-x-1">
                <Home className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="truncate">{survey.propertyTitle}</span>
              </p>
            </>
          ) : (
            <>
              <h4 className="text-sm font-extrabold text-gray-800">
                ¿Llegaste a un acuerdo con{' '}
                <span className="text-blue-700">{survey.otherUserName}</span>{' '}
                para tu propiedad?
              </h4>
              <p className="mt-1 text-[11px] text-gray-500 flex items-center space-x-1">
                <Home className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="truncate">{survey.propertyTitle}</span>
              </p>
            </>
          )}
        </div>

        {/* Buttons */}
        {submitting ? (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="ml-2 text-xs font-bold text-blue-600">Registrando respuesta...</span>
          </div>
        ) : survey.role === 'tenant' ? (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTenantResponse('yes_rented')}
              className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Sí, alquilé</span>
            </button>
            <button
              onClick={() => handleTenantResponse('just_chatted')}
              className="flex items-center space-x-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50 hover:border-gray-300"
            >
              <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
              <span>Solo conversamos</span>
            </button>
            <button
              onClick={() => handleTenantResponse('not_completed')}
              className="flex items-center space-x-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-500 transition hover:bg-gray-50"
            >
              <X className="h-3.5 w-3.5" />
              <span>No concretamos</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleOwnerResponse('yes_tenant')}
              className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Sí, es mi inquilino</span>
            </button>
            <button
              onClick={() => handleOwnerResponse('no')}
              className="flex items-center space-x-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-500 transition hover:bg-gray-50"
            >
              <X className="h-3.5 w-3.5" />
              <span>No</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
