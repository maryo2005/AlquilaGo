import type { FC, MouseEvent } from 'react';
import type { Property } from '../types/property';
import { useApp } from '../context/AppContext';
import { Heart, MapPin, BedDouble, Bath, Maximize2 } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect?: () => void;
}

export const PropertyCard: FC<PropertyCardProps> = ({ property, onSelect }) => {
  const { favorites, toggleFavorite, setActivePropertyId } = useApp();
  const isFavorite = favorites.includes(property.id);


  // Generate dynamic premium labels based on features and proximities
  const getBadges = () => {
    const badges: { text: string; bg: string; textCol: string }[] = [];
    
    // Type badge
    if (property.type === 'room') {
      badges.push({ text: 'Habitación', bg: 'bg-emerald-50 border border-emerald-100', textCol: 'text-emerald-700' });
    } else {
      badges.push({ text: 'Departamento', bg: 'bg-indigo-50 border border-indigo-100', textCol: 'text-indigo-700' });
    }

    // Proximity target badge
    const closeUniversity = property.proximity.find(pr => pr.type === 'university' && pr.distanceMin <= 5);
    const closeHospital = property.proximity.find(pr => pr.type === 'hospital' && pr.distanceMin <= 5);

    if (closeHospital) {
      badges.push({ 
        text: `Ideal Médicos (${closeHospital.distanceMin} min ${closeHospital.name.split(' ')[0]})`, 
        bg: 'bg-blue-50 border border-blue-100', 
        textCol: 'text-blue-700' 
      });
    } else if (closeUniversity) {
      badges.push({ 
        text: `Ideal Estudiantes (${closeUniversity.distanceMin} min ${closeUniversity.name.split(' ')[0]})`, 
        bg: 'bg-amber-50 border border-amber-100', 
        textCol: 'text-amber-700' 
      });
    } else if (property.proximity.length > 0) {
      const closest = property.proximity.reduce((prev, curr) => prev.distanceMin < curr.distanceMin ? prev : curr);
      badges.push({ 
        text: `A ${closest.distanceMin} min de ${closest.name.split(' ')[0]}`, 
        bg: 'bg-slate-50 border border-slate-100', 
        textCol: 'text-slate-600' 
      });
    }

    if (property.isFeatured) {
      badges.push({ text: 'Premium', bg: 'bg-gradient-to-r from-amber-500 to-orange-500', textCol: 'text-white font-bold border-0 shadow-sm shadow-amber-200' });
    }

    return badges;
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
    } else {
      setActivePropertyId(property.id);
    }
  };

  const handleFavoriteToggle = (e: MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-100 hover:shadow-lg cursor-pointer"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img 
          src={property.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'} 
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteToggle}
          className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition hover:scale-110 active:scale-95 ${
            isFavorite ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'
          }`}
        >
          <Heart className={`h-4.5 w-4.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Contract Type tag */}
        <div className="absolute bottom-3 left-3 rounded-lg bg-gray-900/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
          {property.contractType === 'monthly' ? 'Solo Meses' : 'Por Años'}
        </div>
      </div>

      {/* Info Container */}
      <div className="flex flex-1 flex-col p-4">
        {/* Badges */}
        <div className="mb-2.5 flex flex-wrap gap-1">
          {getBadges().map((badge, idx) => (
            <span 
              key={idx} 
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide ${badge.bg} ${badge.textCol}`}
            >
              {badge.text}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-bold text-gray-800 transition-colors group-hover:text-blue-700 min-h-[40px] text-left">
          {property.title}
        </h3>

        {/* Address */}
        <div className="mt-1 flex items-center space-x-1 text-gray-400">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="text-xs truncate text-left">{property.address}</span>
        </div>

        {/* Specifications */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 text-gray-500">
          <div className="flex items-center space-x-1">
            <BedDouble className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs">{property.bedrooms} {property.bedrooms === 1 ? 'Hab.' : 'Habs.'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs">{property.bathrooms} {property.bathrooms === 1 ? 'Baño' : 'Baños'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Maximize2 className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs">{property.area} m²</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
          <div className="text-left">
            <span className="text-[10px] block font-bold uppercase tracking-wider text-gray-400">Precio mensual</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-blue-700">S/. {property.price}</span>
              <span className="text-xs text-gray-500">/ mes</span>
            </div>
          </div>
          <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
            Ver Detalles
          </span>
        </div>
      </div>
    </div>
  );
};
