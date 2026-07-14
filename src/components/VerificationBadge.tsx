import type { FC } from 'react';
import { ShieldCheck } from 'lucide-react';

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Sello de verificación visual — check verde animado si el usuario ha validado
 * su identidad real (DNI + teléfono).
 */
export const VerificationBadge: FC<VerificationBadgeProps> = ({
  isVerified,
  size = 'sm',
  showLabel = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const badgeSizes = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2 py-0.5 text-[10px]',
    lg: 'px-2.5 py-1 text-xs'
  };

  if (!isVerified) {
    if (!showLabel) return null;
    return (
      <span className={`inline-flex items-center space-x-1 rounded-full bg-gray-100 text-gray-500 font-medium ${badgeSizes[size]}`}>
        <ShieldCheck className={`${sizeClasses[size]} opacity-40`} />
        <span>Sin verificar</span>
      </span>
    );
  }

  return (
    <span
      className={`group relative inline-flex items-center space-x-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold ${badgeSizes[size]} transition-all hover:bg-emerald-100 hover:shadow-sm cursor-default`}
      title="Identidad verificada: DNI y teléfono confirmados"
    >
      <span className="relative flex items-center justify-center">
        <ShieldCheck className={`${sizeClasses[size]} text-emerald-600`} />
        {/* Pulse animation */}
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" style={{ animationDuration: '3s' }} />
      </span>
      {showLabel && <span>Verificado</span>}

      {/* Tooltip on hover */}
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
        Identidad verificada ✓
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-gray-900" />
      </span>
    </span>
  );
};
