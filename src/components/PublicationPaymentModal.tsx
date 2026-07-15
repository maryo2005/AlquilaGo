import type { FC } from 'react';
import { useState } from 'react';
import { CreditCard, QrCode, Lock, CheckCircle2, Loader2, X, Sparkles } from 'lucide-react';

interface PublicationPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: 'basic' | 'promo';
  isFeatured: boolean;
  onPaymentSuccess: () => Promise<void>;
}

export const PublicationPaymentModal: FC<PublicationPaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  isFeatured,
  onPaymentSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr'>('card');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [qrTxCode, setQrTxCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculo de precios
  const basePrice = plan === 'basic' ? 20 : 30;
  const extraPrice = isFeatured ? 10 : 0;
  const totalPrice = basePrice + extraPrice;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones basicas
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        setError('Número de tarjeta inválido (debe tener 16 dígitos).');
        return;
      }
      if (!expiry.includes('/')) {
        setError('Fecha de vencimiento inválida (formato MM/AA).');
        return;
      }
      if (cvv.length !== 3) {
        setError('Código CVV inválido (debe tener 3 dígitos).');
        return;
      }
    } else {
      if (qrTxCode.trim().length < 4) {
        setError('Ingresa el código de operación o de transferencia.');
        return;
      }
    }

    setLoading(true);

    try {
      // Simular procesamiento del pago
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Llamar al callback para guardar la propiedad en Supabase
      await onPaymentSuccess();
      
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Hubo un problema al procesar tu pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm transition-opacity duration-300">
        <div className="relative flex w-full max-w-md flex-col items-center rounded-2xl bg-white p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
          <div className="relative mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" style={{ animationDuration: '2s' }} />
          </div>

          <h3 className="text-lg font-black text-gray-900">¡Pago y Publicación Exitosa!</h3>
          <p className="mt-2 text-xs text-gray-500 max-w-sm">
            Tu pago de <span className="font-extrabold text-blue-700">S/. {totalPrice}.00</span> ha sido procesado correctamente. El anuncio ya se encuentra activo en el catálogo de Trujillo.
          </p>

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-md transition hover:-translate-y-0.5"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 text-left">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 px-6 py-6 text-white">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300" />
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-100">Pasarela de Pago Segura</span>
          </div>
          <h3 className="mt-1 text-base font-extrabold text-white">Completa tu publicación</h3>
          <p className="text-[11px] text-blue-100/80">Elige tu método de pago para activar tu anuncio en AlquilaGo.</p>
        </div>

        {/* Content */}
        <form onSubmit={handlePay} className="p-6 space-y-5">
          {/* Resumen de cobro */}
          <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100/50 text-xs">
            <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-2.5">Resumen del Pedido</h4>
            <div className="space-y-1.5 text-gray-600">
              <div className="flex justify-between">
                <span>
                  {plan === 'basic' ? 'Anuncio Básico Individual' : 'Promoción Nuevos Usuarios (2 Anuncios)'}
                </span>
                <span className="font-bold text-gray-800">S/. {basePrice}.00</span>
              </div>
              {isFeatured && (
                <div className="flex justify-between text-indigo-700 font-medium">
                  <span>Upgrade: Anuncio Destacado (+S/. 10/mes)</span>
                  <span className="font-bold">S/. 10.00</span>
                </div>
              )}
              <div className="border-t border-blue-200/50 my-2 pt-2 flex justify-between text-sm font-black text-blue-800">
                <span>Total a Pagar</span>
                <span>S/. {totalPrice}.00</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-2 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="flex rounded-xl bg-gray-150 p-1">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 flex items-center justify-center space-x-1.5 rounded-lg py-2.5 text-xs font-bold transition ${
                paymentMethod === 'card' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Tarjeta Débito/Crédito</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('qr')}
              className={`flex-1 flex items-center justify-center space-x-1.5 rounded-lg py-2.5 text-xs font-bold transition ${
                paymentMethod === 'qr' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              <QrCode className="h-4 w-4" />
              <span>Yape / Plin</span>
            </button>
          </div>

          {/* Cards Inputs */}
          {paymentMethod === 'card' && (
            <div className="space-y-3.5">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Número de Tarjeta</label>
                <input
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => {
                    // Formatear numeros de tarjeta en bloques de 4
                    const value = e.target.value.replace(/\D/g, '');
                    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
                    setCardNumber(formatted);
                  }}
                  className="rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Vencimiento</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length > 2) {
                        setExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
                      } else {
                        setExpiry(value);
                      }
                    }}
                    className="rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    maxLength={3}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    className="rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* QR / Yape / Plin Inputs */}
          {paymentMethod === 'qr' && (
            <div className="flex flex-col items-center text-center space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Escanea el QR de Pago</span>
              
              {/* Fake QR code visualization */}
              <div className="rounded-xl border-2 border-gray-150 p-2.5 bg-white relative group">
                <div className="h-32 w-32 bg-gray-100 flex items-center justify-center text-gray-400">
                  <QrCode className="h-20 w-20 text-gray-700" />
                </div>
                {/* Visual badge */}
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-[9px] font-black text-indigo-700 uppercase">Yape / Plin QR</span>
                  <span className="text-[11px] font-bold text-gray-700 mt-1">AlquilaGo Trujillo</span>
                </div>
              </div>

              <div className="w-full flex flex-col space-y-1 text-left mt-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Código de Operación / Transferencia</label>
                <input
                  type="text"
                  placeholder="Ingresa los 8 dígitos"
                  maxLength={12}
                  value={qrTxCode}
                  onChange={(e) => setQrTxCode(e.target.value)}
                  className="rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                  required
                />
              </div>
            </div>
          )}

          {/* Bottom Security Info */}
          <div className="flex items-center justify-center space-x-1 text-[9px] text-gray-400 mt-2">
            <Lock className="h-3 w-3 text-emerald-500" />
            <span>Encriptación SSL de 256 bits · Pago 100% Seguro</span>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-200 transition hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Procesando pago...</span>
              </>
            ) : (
              <span>Pagar y Publicar S/. {totalPrice}.00</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
