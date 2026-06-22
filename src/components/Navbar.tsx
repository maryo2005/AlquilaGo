import type { FC } from 'react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { Home, LayoutDashboard, PlusCircle, Menu, X, Users, Briefcase, LogIn, LogOut } from 'lucide-react';

export const Navbar: FC = () => {
  const { role, setRole, favorites } = useApp();
  const { user, signOut, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleRoleToggle = () => {
    setRole(role === 'tenant' ? 'owner' : 'tenant');
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setRole('tenant');
    setIsOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-blue-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-200">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
                ALQUILAGO
              </span>
              <span className="block text-[9px] font-semibold uppercase tracking-widest text-blue-500">
                Trujillo · Rent
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-8 md:flex">
            {role === 'tenant' ? (
              <>
                <a href="#buscar" className="text-sm font-medium text-gray-600 transition hover:text-blue-600">
                  Buscar Inmueble
                </a>
                <a href="#favoritos" className="relative text-sm font-medium text-gray-600 transition hover:text-blue-600">
                  Favoritos
                  {favorites.length > 0 && (
                    <span className="absolute -top-1.5 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {favorites.length}
                    </span>
                  )}
                </a>
                <a href="#zonas" className="text-sm font-medium text-gray-600 transition hover:text-blue-600">
                  Zonas Trujillo
                </a>
              </>
            ) : (
              <>
                <a href="#dashboard" className="flex items-center space-x-1.5 text-sm font-medium text-gray-600 transition hover:text-blue-600">
                  <LayoutDashboard className="h-4 w-4 text-blue-500" />
                  <span>Dashboard</span>
                </a>
                <a href="#anuncios" className="text-sm font-medium text-gray-600 transition hover:text-blue-600">
                  Mis Anuncios
                </a>
                <a href="#publicar" className="flex items-center space-x-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100">
                  <PlusCircle className="h-4 w-4" />
                  <span>Publicar Departamento</span>
                </a>
              </>
            )}
          </nav>

          {/* Role Selector & Profile */}
          <div className="hidden items-center space-x-4 md:flex">
            {/* Switch Role Button */}
            <button
              onClick={handleRoleToggle}
              className="flex items-center space-x-2 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 hover:border-gray-300"
            >
              {role === 'tenant' ? (
                <>
                  <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Modo Propietario</span>
                </>
              ) : (
                <>
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                  <span>Modo Inquilino</span>
                </>
              )}
            </button>

            {/* Auth / User Profile */}
            {authLoading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
            ) : user ? (
              <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
                <div className="h-9 w-9 flex items-center justify-center rounded-full border-2 border-blue-500 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm text-xs font-bold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-800 max-w-[120px] truncate">
                    {user.email}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-[10px] text-gray-500 hover:text-red-500 transition"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-200 transition hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={handleRoleToggle}
              className="flex items-center space-x-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-700 transition"
            >
              {role === 'tenant' ? <span>Propietario</span> : <span>Inquilino</span>}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-950 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pt-2 pb-4 shadow-inner md:hidden">
            <div className="space-y-1 pt-2 pb-3">
              {role === 'tenant' ? (
                <>
                  <a
                    href="#buscar"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  >
                    Buscar Inmueble
                  </a>
                  <a
                    href="#favoritos"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  >
                    Favoritos ({favorites.length})
                  </a>
                  <a
                    href="#zonas"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  >
                    Zonas Trujillo
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="#dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  >
                    Dashboard
                  </a>
                  <a
                    href="#anuncios"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  >
                    Mis Anuncios
                  </a>
                  <a
                    href="#publicar"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-blue-700 hover:bg-blue-50"
                  >
                    Publicar Departamento
                  </a>
                </>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 pb-2">
              {user ? (
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-blue-500 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-800 max-w-[160px] truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500">Cuenta verificada</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowAuthModal(true); setIsOpen(false); }}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3 text-sm font-bold text-white shadow-md"
                >
                  Iniciar Sesión / Registrarse
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};
