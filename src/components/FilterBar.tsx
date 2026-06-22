import type { FC, ChangeEvent } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { trackEvent } from '../services/trackingService';
import { trujilloDistricts, trujilloTargets } from '../data/seedData';
import { Search, RotateCcw } from 'lucide-react';
import type { ContractType } from '../types/property';

export const FilterBar: FC = () => {
  const { filters, setFilters, resetFilters, filteredProperties, properties } = useApp();
  const { user } = useAuth();

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };


  const handleSelectChange = (
    field: 'propertyType' | 'contractType' | 'proximityTarget' | 'district',
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    trackEvent({
      eventName: 'filter_applied',
      userId: user?.id,
      metadata: { field, value }
    });
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const val = value === '' ? '' : Number(value);
    setFilters((prev) => ({ ...prev, [field]: val }));
  };

  const toggleContractType = (type: ContractType) => {
    const newType = filters.contractType === type ? 'all' : type;
    setFilters((prev) => ({
      ...prev,
      contractType: newType,
    }));
    trackEvent({
      eventName: 'filter_applied',
      userId: user?.id,
      metadata: { field: 'contractType', value: newType }
    });
  };

  return (
    <div className="w-full rounded-2xl border border-blue-50 bg-white p-4 shadow-sm md:p-6">
      {/* Primary Search Input Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Text Search */}
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por dirección, título o palabras clave (ej. amoblado, baño propio)..."
            value={filters.searchQuery}
            onChange={handleTextChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pr-4 pl-11 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Quick Contract Toggles */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Duración:</span>
          <button
            onClick={() => toggleContractType('monthly')}
            className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
              filters.contractType === 'monthly'
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-extrabold'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Solo Meses (Estudiantes/Doctores)
          </button>
          <button
            onClick={() => toggleContractType('yearly')}
            className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
              filters.contractType === 'yearly'
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-extrabold'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Por Años
          </button>
        </div>
      </div>

      {/* Advanced Filter Grid */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 border-t border-gray-50 pt-4">
        
        {/* Property Type Dropdown */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-left text-[10px] font-black uppercase tracking-wider text-gray-400">Tipo de Inmueble</label>
          <select
            value={filters.propertyType}
            onChange={(e) => handleSelectChange('propertyType', e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium text-gray-700 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="all">Cualquiera</option>
            <option value="room">Habitación</option>
            <option value="apartment">Departamento</option>
          </select>
        </div>

        {/* Proximity / Cercanía Dropdown */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-left text-[10px] font-black uppercase tracking-wider text-gray-400">Cercanía a Instituciones</label>
          <select
            value={filters.proximityTarget}
            onChange={(e) => handleSelectChange('proximityTarget', e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium text-gray-700 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="all">Todas las universidades / hospitales</option>
            
            <optgroup label="Universidades de Trujillo">
              {trujilloTargets.filter(t => t.type === 'university').map((target, idx) => (
                <option key={idx} value={target.name}>
                  {target.name.split(' (')[0]}
                </option>
              ))}
            </optgroup>

            <optgroup label="Hospitales / Centros Médicos">
              {trujilloTargets.filter(t => t.type === 'hospital').map((target, idx) => (
                <option key={idx} value={target.name}>
                  {target.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* District / Urb Dropdown */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-left text-[10px] font-black uppercase tracking-wider text-gray-400">Urbanización / Zona</label>
          <select
            value={filters.district}
            onChange={(e) => handleSelectChange('district', e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium text-gray-700 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="all">Toda la Ciudad</option>
            {trujilloDistricts.map((d, idx) => (
              <option key={idx} value={d}>Urb. {d}</option>
            ))}
          </select>
        </div>

        {/* Price Min Box */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-left text-[10px] font-black uppercase tracking-wider text-gray-400">Precio Mín (S/.)</label>
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium text-gray-700 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Price Max Box */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-left text-[10px] font-black uppercase tracking-wider text-gray-400">Precio Máx (S/.)</label>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium text-gray-700 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

      </div>

      {/* Statistics and Clean triggers */}
      <div className="mt-4 flex flex-col justify-between items-center border-t border-gray-50 pt-3 gap-2 sm:flex-row text-xs">
        <div className="text-gray-500 font-medium">
          Encontrados: <span className="font-extrabold text-blue-700">{filteredProperties.length}</span> anuncios activos de <span className="font-semibold text-gray-700">{properties.length}</span> totales
        </div>

        <div className="flex items-center space-x-2">
          {Object.values(filters).some((val) => val !== 'all' && val !== '') && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 font-bold text-gray-600 transition hover:bg-gray-50 hover:text-blue-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
