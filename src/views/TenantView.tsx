import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { trackEvent } from '../services/trackingService';
import { createContactLead } from '../services/leadService';
import { PropertyCard } from '../components/PropertyCard';
import { FilterBar } from '../components/FilterBar';
import { InteractiveMap } from '../components/InteractiveMap';
import { AuthModal } from '../components/AuthModal';
import { DealConfirmationCard } from '../components/DealConfirmationCard';
import { TrustProfileModal } from '../components/TrustProfileModal';
import { VerificationBadge } from '../components/VerificationBadge';
import {
  GraduationCap,
  Stethoscope,
  MapPin,
  X,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Heart,
  Check,
  AlertCircle,
  Loader2,
  Star,
  Shield
} from 'lucide-react';

export const TenantView: FC = () => {
  const {
    filteredProperties,
    activePropertyId,
    setActivePropertyId,
    properties,
    favorites,
    toggleFavorite,
    setFilters,
    loading,
    error,
    refreshProperties
  } = useApp();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [modalImageIdx, setModalImageIdx] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  // Pull pending surveys and refreshSurveys from context
  const { pendingSurveys, refreshSurveys } = useApp();

  // Active property details
  const activeProperty = properties.find((p) => p.id === activePropertyId);

  // Track room_profile_viewed
  useEffect(() => {
    if (activePropertyId) {
      trackEvent({
        eventName: 'room_profile_viewed',
        userId: user?.id,
        propertyId: activePropertyId
      });
    }
  }, [activePropertyId, user?.id]);

  // Fast filter triggers
  const triggerQuickFilter = (targetName: string) => {
    setFilters(prev => ({
      ...prev,
      proximityTarget: targetName,
      // Clear other conflicting filters for smooth UX
      district: 'all',
      propertyType: 'all'
    }));

    trackEvent({
      eventName: 'filter_applied',
      userId: user?.id,
      metadata: { action: 'quick_filter', targetName }
    });

    // Smooth scroll to results
    const element = document.getElementById('catalogo');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNextImage = (imagesLength: number) => {
    setModalImageIdx((prev) => (prev + 1) % imagesLength);
  };

  const handlePrevImage = (imagesLength: number) => {
    setModalImageIdx((prev) => (prev - 1 + imagesLength) % imagesLength);
  };

  // WhatsApp link generator
  const getWhatsAppLink = (phone: string, title: string, price: number) => {
    const formattedPhone = phone.replace('+', '').replace(/\s/g, '');
    const message = `Hola, vi su anuncio "${title}" en la plataforma ALQUILAGO (S/. ${price}/mes) y estoy interesado(a) en obtener más detalles y coordinar una visita. ¡Muchas gracias!`;
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
  };

  const handleContactClick = () => {
    if (activeProperty && user) {
      trackEvent({
        eventName: 'first_contact_initiated',
        userId: user?.id,
        propertyId: activePropertyId
      });

      // Register contact lead for the trust system
      if (activeProperty.ownerId) {
        createContactLead(user.id, activeProperty.ownerId, activeProperty.id)
          .catch(err => console.warn('Error creating lead:', err));
      }
    }
  };

  // Handle favorite toggle with auth check
  const handleFavoriteToggle = (propertyId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    toggleFavorite(propertyId);
  };

  return (
    <div className="flex flex-col text-gray-800">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 to-indigo-950 px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8">
        {/* Background decorative glowing circles */}
        <div className="absolute top-1/4 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-72 w-72 translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="mx-auto max-w-5xl text-center relative z-10">
          <span className="inline-flex items-center rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-bold tracking-wide text-blue-300 backdrop-blur-xs">
            Exclusivo para la Libertad, Trujillo
          </span>
          <h1 className="mt-6 font-sans text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.1]">
            Tu espacio ideal cerca a tu <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Universidad u Hospital
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-blue-100/80 md:text-base">
            Alquila habitaciones y departamentos en las mejores zonas de Trujillo (California, San Andrés, El Golf y más). Ideal para estudiantes de la UNT, UPAO, UPN y profesionales médicos de la región.
          </p>

          {/* Quick Hub Badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <span className="text-xs text-blue-200/60 font-bold uppercase tracking-wider block w-full mb-1">Buscar rápido en:</span>

            {/* UNT */}
            <button
              onClick={() => triggerQuickFilter('UNT')}
              className="flex items-center space-x-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition border border-white/10 hover:border-white/20 active:scale-95"
            >
              <GraduationCap className="h-4 w-4 text-blue-400" />
              <span>Cerca a UNT</span>
            </button>

            {/* UPAO */}
            <button
              onClick={() => triggerQuickFilter('UPAO')}
              className="flex items-center space-x-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition border border-white/10 hover:border-white/20 active:scale-95"
            >
              <GraduationCap className="h-4 w-4 text-indigo-400" />
              <span>Cerca a UPAO</span>
            </button>

            {/* UPN */}
            <button
              onClick={() => triggerQuickFilter('UPN')}
              className="flex items-center space-x-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition border border-white/10 hover:border-white/20 active:scale-95"
            >
              <GraduationCap className="h-4 w-4 text-sky-400" />
              <span>Cerca a UPN</span>
            </button>

            {/* Hospital Regional */}
            <button
              onClick={() => triggerQuickFilter('Hospital Regional')}
              className="flex items-center space-x-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition border border-white/10 hover:border-white/20 active:scale-95"
            >
              <Stethoscope className="h-4 w-4 text-emerald-400" />
              <span>Cerca al Hosp. Regional</span>
            </button>

            {/* Hospital Belén */}
            <button
              onClick={() => triggerQuickFilter('Hospital Belén')}
              className="flex items-center space-x-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition border border-white/10 hover:border-white/20 active:scale-95"
            >
              <Stethoscope className="h-4 w-4 text-teal-400" />
              <span>Cerca al Hosp. Belén</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main filters section */}
      <section id="buscar" className="mx-auto -mt-8 w-full max-w-7xl px-4 relative z-20">
        <FilterBar />
      </section>

      {/* Pending Surveys Section */}
      {!loading && !error && pendingSurveys.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            <h2 className="text-lg font-extrabold text-gray-800">Confirmaciones Pendientes</h2>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600">
              {pendingSurveys.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingSurveys.map((survey) => (
              <DealConfirmationCard
                key={survey.lead.id}
                survey={survey}
                onResponded={refreshSurveys}
              />
            ))}
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Cargando propiedades desde la base de datos...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-4 text-base font-bold text-red-700">Error de conexión</h3>
            <p className="mt-2 text-xs text-red-600">{error}</p>
            <button
              onClick={refreshProperties}
              className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Favorites Showcase (Visible if any favorite is selected) */}
      {!loading && !error && favorites.length > 0 && (
        <section id="favoritos" className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 text-left">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
            <h2 className="text-xl font-extrabold text-gray-800">Tus Favoritos Guardados</h2>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">
              {favorites.length}
            </span>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {properties
              .filter((p) => favorites.includes(p.id))
              .map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
          </div>
        </section>
      )}

      {/* Catalog & Map grid */}
      {!loading && !error && (
        <section id="catalogo" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          {/* Mobile toggles between list & map */}
          <div className="mb-4 flex justify-center md:hidden">
            <div className="flex rounded-xl bg-gray-100 p-1 shadow-inner">
              <button
                onClick={() => setActiveTab('list')}
                className={`rounded-lg px-6 py-2 text-xs font-bold transition ${
                  activeTab === 'list'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                Ver Lista
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`rounded-lg px-6 py-2 text-xs font-bold transition ${
                  activeTab === 'map'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                Ver Mapa
              </button>
            </div>
          </div>

          {/* Grid layout */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

            {/* Properties List Column */}
            <div className={`md:col-span-2 space-y-6 ${
              activeTab === 'list' ? 'block' : 'hidden md:block'
            }`}>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 text-left">
                <h2 className="text-xl font-extrabold text-gray-800">Inmuebles Disponibles</h2>
                <span className="text-xs text-gray-500 font-medium">Trujillo, La Libertad</span>
              </div>

              {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 px-4 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-base font-bold text-gray-700">No hay coincidencias en Trujillo</h3>
                  <p className="mt-2 text-xs text-gray-500 max-w-sm">
                    Prueba ampliando los filtros de precio, seleccionando "Cualquiera" en cercanías o limpiando la búsqueda.
                  </p>
                  <button
                    onClick={() => setFilters({
                      searchQuery: '',
                      propertyType: 'all',
                      contractType: 'all',
                      proximityTarget: 'all',
                      minPrice: '',
                      maxPrice: '',
                      district: 'all'
                    })}
                    className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Map Column */}
            <div className={`h-[500px] md:h-[650px] sticky top-24 ${
              activeTab === 'map' ? 'block' : 'hidden md:block'
            }`}>
              <InteractiveMap properties={filteredProperties} />
            </div>

          </div>
        </section>
      )}

      {/* Property Details Modal */}
      {activeProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs transition-opacity duration-300">
          <div className="relative flex h-full max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header Images */}
            <div className="relative h-48 w-full bg-gray-100 sm:h-56 md:h-64 flex-shrink-0">
              <img
                src={activeProperty.images[modalImageIdx] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'}
                alt={activeProperty.title}
                className="h-full w-full object-cover"
              />

              {/* Close Button */}
              <button
                onClick={() => {
                  setActivePropertyId(null);
                  setModalImageIdx(0);
                }}
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-xs transition hover:bg-white hover:text-gray-950 hover:scale-105 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Carousel Controls (Show if multiple images) */}
              {activeProperty.images.length > 1 && (
                <>
                  <button
                    onClick={() => handlePrevImage(activeProperty.images.length)}
                    className="absolute top-1/2 left-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-md backdrop-blur-xs hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleNextImage(activeProperty.images.length)}
                    className="absolute top-1/2 right-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-md backdrop-blur-xs hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* Image Counter Badge */}
                  <div className="absolute bottom-4 right-4 rounded-lg bg-gray-950/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                    {modalImageIdx + 1} / {activeProperty.images.length}
                  </div>
                </>
              )}

              {/* Price floating tag */}
              <div className="absolute bottom-4 left-4 rounded-xl bg-blue-700 px-4 py-2 shadow-lg text-white">
                <span className="text-[9px] block uppercase font-bold tracking-wider opacity-75">Mensualidad</span>
                <span className="text-xl font-black">S/. {activeProperty.price}</span>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 text-left">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                  {activeProperty.type === 'room' ? 'Habitación' : 'Departamento'}
                </span>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
                  {activeProperty.contractType === 'monthly' ? 'Solo Meses' : 'Contrato Anual'}
                </span>
                <button
                  onClick={() => handleFavoriteToggle(activeProperty.id)}
                  className={`ml-auto flex items-center space-x-1.5 text-xs font-bold transition ${
                    favorites.includes(activeProperty.id) ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(activeProperty.id) ? 'fill-current' : ''}`} />
                  <span>{favorites.includes(activeProperty.id) ? 'Guardado' : 'Guardar'}</span>
                </button>
              </div>

              {/* Title */}
              <h2 className="text-xl font-extrabold text-gray-900 md:text-2xl">
                {activeProperty.title}
              </h2>

              {/* Address */}
              <div className="mt-2 flex items-center space-x-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span>{activeProperty.address}, Trujillo</span>
              </div>

              {/* Technical Specifications Specs Grid */}
              <div className="mt-5 grid grid-cols-3 rounded-xl bg-gray-50 p-3.5 text-center text-xs text-gray-600">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Cuartos</span>
                  <span className="mt-1 block font-bold text-gray-800">{activeProperty.bedrooms} dorms.</span>
                </div>
                <div className="border-x border-gray-200">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Baños</span>
                  <span className="mt-1 block font-bold text-gray-800">{activeProperty.bathrooms} baños</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Área total</span>
                  <span className="mt-1 block font-bold text-gray-800">{activeProperty.area} m²</span>
                </div>
              </div>

              {/* Proximity / Cercanía list */}
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Cercanía Estratégica</h4>
                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {activeProperty.proximity.map((prox, idx) => (
                    <div key={idx} className="flex items-center space-x-2 rounded-lg bg-blue-50/50 p-2 text-xs">
                      {prox.type === 'university' ? (
                        <GraduationCap className="h-4.5 w-4.5 text-blue-600" />
                      ) : (
                        <Stethoscope className="h-4.5 w-4.5 text-emerald-600" />
                      )}
                      <div>
                        <span className="font-bold text-gray-700">{prox.name}</span>
                        <span className="block text-[10px] text-gray-500">A {prox.distanceMin} min en auto/caminando</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Descripción del Inmueble</h4>
                <p className="mt-2 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                  {activeProperty.description}
                </p>
              </div>

              {/* Included services */}
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Servicios Incluidos</h4>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {activeProperty.services.map((service, idx) => (
                    <span
                      key={idx}
                      className="flex items-center space-x-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                    >
                      <Check className="h-3 w-3 text-emerald-500 stroke-[3px]" />
                      <span>{service}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact area */}
              <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => {
                    const cleanName = activeProperty.contactName
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9]/g, '-');
                    const ownerId = activeProperty.ownerId || `demo-owner-${cleanName}`;
                    setProfileUserId(ownerId);
                    setShowProfileModal(true);
                  }}
                  className="text-left group flex items-start space-x-3 rounded-xl border border-gray-100 hover:border-blue-200 bg-gray-50/50 hover:bg-blue-50/20 p-3 transition cursor-pointer focus:outline-none w-full sm:w-auto"
                  title="Ver perfil de confianza del arrendador"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex-shrink-0">
                    {activeProperty.contactName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] block font-bold uppercase tracking-wider text-gray-400">Arrendador</span>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="text-sm font-extrabold text-gray-800 group-hover:text-blue-700 transition">
                        {activeProperty.contactName}
                      </span>
                      <VerificationBadge isVerified={true} size="sm" />
                    </div>
                    <span className="block text-[10px] text-gray-500 mt-0.5">
                      Ver Perfil de Confianza →
                    </span>
                  </div>
                </button>

                {/* WHATSAPP ACTION BUTTON */}
                <a
                  onClick={handleContactClick}
                  href={getWhatsAppLink(activeProperty.phone, activeProperty.title, activeProperty.price)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition hover:-translate-y-0.5 active:translate-y-0"
                >
                  <MessageSquare className="h-4.5 w-4.5 fill-current" />
                  <span>Contactar por WhatsApp</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Trust Profile Modal */}
      {profileUserId && (
        <TrustProfileModal
          isOpen={showProfileModal}
          userId={profileUserId}
          roleRestriction="owner"
          onClose={() => {
            setShowProfileModal(false);
            setProfileUserId(null);
          }}
        />
      )}

    </div>
  );
};
