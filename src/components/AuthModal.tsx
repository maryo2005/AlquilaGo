import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, UserPlus, LogIn, Loader2, AlertCircle, CheckCircle, User, Phone, CreditCard } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setPhone('');
    setDni('');
    setError(null);
    setSuccessMessage(null);
  };

  const handleTabSwitch = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    resetForm();
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await signIn(email, password);

    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    resetForm();
    onClose();
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError('Por favor, ingrese su nombre completo');
      return;
    }

    if (!dni.trim() || dni.length < 8) {
      setError('Por favor, ingrese un documento de identidad válido (mínimo 8 caracteres)');
      return;
    }

    if (!phone.trim() || phone.length < 9) {
      setError('Por favor, ingrese un número de celular válido (mínimo 9 dígitos)');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    const { error: authError } = await signUp(email, password, displayName, phone, dni);

    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    setSuccessMessage('¡Cuenta creada! Revisa tu correo para confirmar tu registro.');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-center text-white">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-xl" />
          <div className="absolute bottom-0 right-0 h-20 w-20 translate-x-1/4 translate-y-1/4 rounded-full bg-white/10 blur-xl" />

          <button
            onClick={() => { resetForm(); onClose(); }}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>

          <h2 className="relative text-2xl font-black tracking-tight">
            {activeTab === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h2>
          <p className="relative mt-1.5 text-sm text-blue-100">
            {activeTab === 'login'
              ? 'Inicia sesión para acceder a tus favoritos y publicaciones'
              : 'Regístrate para publicar propiedades y guardar favoritos'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => handleTabSwitch('login')}
            className={`flex-1 py-3.5 text-xs font-bold tracking-wide transition ${
              activeTab === 'login'
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <LogIn className="mr-1.5 inline h-3.5 w-3.5" />
            INICIAR SESIÓN
          </button>
          <button
            onClick={() => handleTabSwitch('register')}
            className={`flex-1 py-3.5 text-xs font-bold tracking-wide transition ${
              activeTab === 'register'
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <UserPlus className="mr-1.5 inline h-3.5 w-3.5" />
            REGISTRARSE
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 flex items-center space-x-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-semibold text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-4 flex items-center space-x-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-xs font-semibold text-emerald-700">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {/* Campos de Registro */}
            {activeTab === 'register' && (
              <>
                {/* Nombre Completo */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Juan Pérez"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                    />
                  </div>
                </div>

                {/* Documento de Identidad */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Documento de Identidad (DNI/CE)</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="12345678"
                      value={dni}
                      onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                    />
                  </div>
                </div>

                {/* Celular */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Número de Celular</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      placeholder="987654321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                />
              </div>
            </div>

            {/* Confirm Password (only register) */}
            {activeTab === 'register' && (
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : activeTab === 'login' ? (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Iniciar Sesión</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Crear Cuenta</span>
                </>
              )}
            </button>
          </form>

          {/* Footer helper text */}
          <p className="mt-5 text-center text-[11px] text-gray-400">
            {activeTab === 'login' ? (
              <>
                ¿No tienes cuenta?{' '}
                <button onClick={() => handleTabSwitch('register')} className="font-bold text-blue-600 hover:underline">
                  Regístrate aquí
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button onClick={() => handleTabSwitch('login')} className="font-bold text-blue-600 hover:underline">
                  Inicia sesión
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
