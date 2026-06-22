import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Property } from '../types/property';
import { useApp } from '../context/AppContext';
import { MapPin, Info } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// Fix Leaflet issue with default marker icons by using Custom DivIcon with SVG
const createCustomMarker = (price: number, type: 'room' | 'apartment', isActive: boolean) => {
  const colorClass = type === 'room' ? 'from-emerald-500 to-teal-600 border-emerald-100' : 'from-blue-600 to-indigo-700 border-blue-100';
  const ringColor = type === 'room' ? 'bg-emerald-500/30' : 'bg-blue-500/30';
  const scale = isActive ? 'scale-110 ring-4 ring-blue-500/40 z-[1000]' : 'hover:scale-105';
  
  const html = `
    <div class="relative flex items-center justify-center transition-all duration-200 ${scale}">
      ${isActive ? `<div class="absolute -inset-2 rounded-full ${ringColor} animate-ping"></div>` : ''}
      <div class="flex items-center space-x-1 rounded-full bg-gradient-to-r ${colorClass} px-2.5 py-1 text-[10px] font-black text-white border-2 border-white shadow-md">
        <span>S/. ${price}</span>
      </div>
      <div class="absolute -bottom-1.5 h-2 w-2 rotate-45 border-r border-b border-white bg-indigo-700"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [60, 24],
    iconAnchor: [30, 24],
    popupAnchor: [0, -20]
  });
};

interface InteractiveMapProps {
  properties: Property[];
  onSelectProperty?: (id: string) => void;
}

export const InteractiveMap: FC<InteractiveMapProps> = ({ properties, onSelectProperty }) => {
  const { filters, setFilters, activePropertyId, setActivePropertyId } = useApp();
  const [mapMode, setMapMode] = useState<'streets' | 'zones'>('zones');
  const [leafletError, setLeafletError] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);

  // Keep track of the active property on streets map
  useEffect(() => {
    if (mapMode === 'streets' && mapInstanceRef.current && activePropertyId && properties.length > 0) {
      const activeProp = properties.find(p => p.id === activePropertyId);
      if (activeProp) {
        mapInstanceRef.current.setView([activeProp.lat, activeProp.lng], 15, { animate: true, duration: 1 });
      }
    }
  }, [activePropertyId, mapMode, properties]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapMode !== 'streets' || !mapContainerRef.current) {
      // Cleanup leaflet if switching away
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
      return;
    }

    try {
      // Trujillo coordinates: -8.115, -79.03
      if (!mapInstanceRef.current) {
        const trujilloCenter: L.LatLngExpression = [-8.115, -79.032];
        const map = L.map(mapContainerRef.current, {
          center: trujilloCenter,
          zoom: 13,
          zoomControl: false
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
        markersGroupRef.current = L.featureGroup().addTo(map);
      }

      const map = mapInstanceRef.current;
      const markersGroup = markersGroupRef.current;

      if (markersGroup) {
        markersGroup.clearLayers();
      }

      // Add pins
      properties.forEach((prop) => {
        if (!prop.lat || !prop.lng) return;

        const isActive = prop.id === activePropertyId;
        const icon = createCustomMarker(prop.price, prop.type, isActive);
        const marker = L.marker([prop.lat, prop.lng], { icon });

        // Tooltip or Popup
        marker.on('click', () => {
          if (onSelectProperty) {
            onSelectProperty(prop.id);
          } else {
            setActivePropertyId(prop.id);
          }
        });

        marker.bindTooltip(`
          <div class="p-1 font-sans">
            <p class="font-bold text-xs text-gray-800">${prop.title.substring(0, 30)}...</p>
            <p class="text-[10px] text-blue-600 font-bold">${prop.type === 'room' ? 'Habitación' : 'Departamento'} · S/. ${prop.price}</p>
          </div>
        `, { direction: 'top', offset: [0, -15] });

        if (markersGroup) {
          markersGroup.addLayer(marker);
        }
      });

      // Fit bounds if we have properties and no active property is selected
      if (properties.length > 0 && !activePropertyId && markersGroup && markersGroup.getLayers().length > 0) {
        map.fitBounds(markersGroup.getBounds(), { padding: [30, 30] });
      }

    } catch (err) {
      console.error('Error loading Leaflet map', err);
      setLeafletError(true);
      setMapMode('zones'); // fallback to SVG zone map
    }

    return () => {
      // no-op, handled by mode change hook
    };
  }, [properties, mapMode, activePropertyId]);

  // District statistics calculation
  const getDistrictCount = (district: string) => {
    return properties.filter(p => p.district === district).length;
  };

  const handleDistrictClick = (district: string) => {
    setFilters(prev => ({
      ...prev,
      district: prev.district === district ? 'all' : district
    }));
  };

  // Mock Vector SVG Trujillo Zones data
  // Coordinate simulation in stylized grid:
  // Centro Histórico is center, El Golf is bottom left, California is left, San Andrés is mid-left, Las Quintanas is top right, Primavera is top left, Monserrate is bottom right
  const districtsMap = [
    { name: 'Centro Histórico', cx: 160, cy: 160, r: 42, color: 'fill-amber-100 hover:fill-amber-200 stroke-amber-400', activeColor: 'fill-amber-300 stroke-amber-600 text-amber-950' },
    { name: 'El Golf', cx: 80, cy: 260, r: 45, color: 'fill-emerald-100 hover:fill-emerald-200 stroke-emerald-400', activeColor: 'fill-emerald-300 stroke-emerald-600 text-emerald-950' },
    { name: 'California', cx: 70, cy: 180, r: 35, color: 'fill-blue-100 hover:fill-blue-200 stroke-blue-400', activeColor: 'fill-blue-300 stroke-blue-600 text-blue-950' },
    { name: 'San Andrés', cx: 110, cy: 110, r: 40, color: 'fill-indigo-100 hover:fill-indigo-200 stroke-indigo-400', activeColor: 'fill-indigo-300 stroke-indigo-600 text-indigo-950' },
    { name: 'Las Quintanas', cx: 230, cy: 90, r: 38, color: 'fill-purple-100 hover:fill-purple-200 stroke-purple-400', activeColor: 'fill-purple-300 stroke-purple-600 text-purple-950' },
    { name: 'Monserrate', cx: 210, cy: 230, r: 38, color: 'fill-rose-100 hover:fill-rose-200 stroke-rose-400', activeColor: 'fill-rose-300 stroke-rose-600 text-rose-950' },
    { name: 'Primavera', cx: 160, cy: 50, r: 32, color: 'fill-sky-100 hover:fill-sky-200 stroke-sky-400', activeColor: 'fill-sky-300 stroke-sky-600 text-sky-950' }
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-inner">
      {/* Map Control Bar */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white p-3">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-bold text-gray-700">Mapa de Trujillo</span>
        </div>
        
        {/* Toggle Mode buttons */}
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          <button
            onClick={() => setMapMode('zones')}
            className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition ${
              mapMode === 'zones' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Zonas (Filtro)
          </button>
          <button
            onClick={() => {
              if (!leafletError) {
                setMapMode('streets');
              }
            }}
            disabled={leafletError}
            className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition disabled:opacity-40 ${
              mapMode === 'streets' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Calles (Leaflet)
          </button>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="relative flex-1 min-h-[350px]">
        {/* STREETS MAP (LEAFLET) */}
        <div 
          ref={mapContainerRef} 
          className={`h-full w-full transition-opacity duration-300 ${
            mapMode === 'streets' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none absolute inset-0'
          }`}
          style={{ height: '100%', minHeight: '350px' }}
        />

        {/* ZONES MAP (SVG) */}
        {mapMode === 'zones' && (
          <div className="flex h-full w-full flex-col items-center justify-center bg-white p-4">
            <div className="mb-2 text-center">
              <p className="text-xs font-bold text-gray-800">Mapa Geográfico de Distritos / Urb.</p>
              <p className="text-[10px] text-gray-500">Haz clic en una zona para filtrar los inmuebles disponibles</p>
            </div>
            
            <div className="relative flex-1 w-full max-w-[320px] aspect-square">
              {/* SVG Map Layout */}
              <svg viewBox="0 0 320 320" className="h-full w-full select-none">
                {/* Background Roads / Grids */}
                <line x1="80" y1="260" x2="160" y2="160" stroke="#f3f4f6" strokeWidth="4" />
                <line x1="70" y1="180" x2="160" y2="160" stroke="#f3f4f6" strokeWidth="4" />
                <line x1="110" y1="110" x2="160" y2="160" stroke="#f3f4f6" strokeWidth="4" />
                <line x1="160" y1="50" x2="160" y2="160" stroke="#f3f4f6" strokeWidth="4" />
                <line x1="230" y1="90" x2="160" y2="160" stroke="#f3f4f6" strokeWidth="4" />
                <line x1="210" y1="230" x2="160" y2="160" stroke="#f3f4f6" strokeWidth="4" />

                {/* Major Avenues representation */}
                <path d="M0,160 L320,160" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="3,3" />
                <path d="M160,0 L160,320" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="3,3" />
                <path d="M20,290 L290,20" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3,3" />

                {/* Circles representing zones */}
                {districtsMap.map((district) => {
                  const count = getDistrictCount(district.name);
                  const isActive = filters.district === district.name;
                  const colorClass = isActive ? district.activeColor : `${district.color} cursor-pointer`;
                  
                  return (
                    <g key={district.name} onClick={() => handleDistrictClick(district.name)} className="transition-transform duration-200">
                      {/* Outer Pulse glow if active */}
                      {isActive && (
                        <circle 
                          cx={district.cx} 
                          cy={district.cy} 
                          r={district.r + 4} 
                          className="fill-none stroke-blue-500/20 stroke-[3px] animate-pulse" 
                        />
                      )}
                      
                      {/* District Circle */}
                      <circle
                        cx={district.cx}
                        cy={district.cy}
                        r={district.r}
                        className={`${colorClass} transition-colors duration-200 stroke-[1.5px]`}
                      />

                      {/* Text details */}
                      <text
                        x={district.cx}
                        y={district.cy - 2}
                        textAnchor="middle"
                        className="text-[9px] font-black tracking-tight fill-gray-800"
                        style={{ pointerEvents: 'none' }}
                      >
                        {district.name.split(' ')[0]}
                      </text>

                      {/* Count badge */}
                      <g transform={`translate(${district.cx}, ${district.cy + 12})`}>
                        <rect
                          x="-12"
                          y="-6"
                          width="24"
                          height="12"
                          rx="4"
                          className={`${isActive ? 'fill-blue-800' : 'fill-gray-800'} transition-colors`}
                        />
                        <text
                          y="3"
                          textAnchor="middle"
                          className="text-[8px] font-black fill-white"
                          style={{ pointerEvents: 'none' }}
                        >
                          {count} {count === 1 ? 'Anun' : 'Anuns'}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            {/* Legend info */}
            <div className="mt-2 flex items-center space-x-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] text-blue-800">
              <Info className="h-3 w-3 flex-shrink-0" />
              <span>Haz clic en un círculo para aislar anuncios en esa urbanización.</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom status of active search */}
      <div className="bg-gray-100 p-2 text-center text-[10px] text-gray-500 border-t border-gray-200 flex items-center justify-between px-3">
        <span>Mostrando {properties.length} inmuebles georeferenciados</span>
        {filters.district !== 'all' && (
          <button 
            onClick={() => setFilters(prev => ({ ...prev, district: 'all' }))}
            className="font-bold text-blue-600 hover:underline"
          >
            Limpiar Filtro de Zona
          </button>
        )}
      </div>
    </div>
  );
};
