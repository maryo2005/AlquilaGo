import type { FC, ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Property, FilterState, UserRole } from '../types/property';
import { useAuth } from './AuthContext';
import { fetchProperties as fetchPropertiesService, createProperty as createPropertyService, deleteProperty as deletePropertyService } from '../services/propertyService';
import { fetchFavorites as fetchFavoritesService, addFavorite, removeFavorite } from '../services/favoriteService';

interface AppContextType {
  properties: Property[];
  role: UserRole;
  favorites: string[];
  filters: FilterState;
  activePropertyId: string | null;
  loading: boolean;
  error: string | null;
  setRole: (role: UserRole) => void;
  setActivePropertyId: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  resetFilters: () => void;
  addProperty: (propertyData: Omit<Property, 'id' | 'views' | 'createdAt' | 'ownerId'>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  filteredProperties: Property[];
  refreshProperties: () => Promise<void>;
  requireAuth: () => boolean;
}

const defaultFilters: FilterState = {
  searchQuery: '',
  propertyType: 'all',
  contractType: 'all',
  proximityTarget: 'all',
  minPrice: '',
  maxPrice: '',
  district: 'all',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [role, setRoleState] = useState<UserRole>('tenant');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar propiedades desde Supabase
  const refreshProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPropertiesService();
      setProperties(data);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('No se pudieron cargar las propiedades. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar favoritos del usuario autenticado
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      const favIds = await fetchFavoritesService(user.id);
      setFavorites(favIds);
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  }, [user]);

  // Efecto inicial: cargar propiedades
  useEffect(() => {
    refreshProperties();
  }, [refreshProperties]);

  // Efecto: cargar favoritos cuando cambie el usuario
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Recuperar rol guardado
  useEffect(() => {
    const storedRole = localStorage.getItem('alquilago_role');
    if (storedRole && (storedRole === 'tenant' || storedRole === 'owner')) {
      setRoleState(storedRole as UserRole);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('alquilago_role', newRole);
  };

  /**
   * Verifica si el usuario está autenticado.
   * Retorna true si está logueado, false si no (y el componente debe mostrar AuthModal).
   */
  const requireAuth = (): boolean => {
    return !!user;
  };

  const toggleFavorite = async (id: string) => {
    if (!user) return; // requireAuth() debe llamarse antes

    const isFav = favorites.includes(id);

    // Optimistic update
    setFavorites((prev) =>
      isFav ? prev.filter((favId) => favId !== id) : [...prev, id]
    );

    try {
      if (isFav) {
        await removeFavorite(user.id, id);
      } else {
        await addFavorite(user.id, id);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Revertir el optimistic update
      setFavorites((prev) =>
        isFav ? [...prev, id] : prev.filter((favId) => favId !== id)
      );
    }
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const addProperty = async (propertyData: Omit<Property, 'id' | 'views' | 'createdAt' | 'ownerId'>) => {
    if (!user) throw new Error('Debe iniciar sesión para publicar');

    const newProperty = await createPropertyService(propertyData, user.id);
    setProperties((prev) => [newProperty, ...prev]);
  };

  const deleteProperty = async (id: string) => {
    if (!user) throw new Error('Debe iniciar sesión para eliminar');

    // Optimistic update
    const previousProperties = [...properties];
    setProperties((prev) => prev.filter((p) => p.id !== id));

    try {
      await deletePropertyService(id);
    } catch (err) {
      console.error('Error deleting property:', err);
      // Revertir
      setProperties(previousProperties);
      throw err;
    }

    // Limpiar favoritos y propiedad activa si aplica
    setFavorites((prev) => prev.filter((favId) => favId !== id));
    if (activePropertyId === id) {
      setActivePropertyId(null);
    }
  };

  // Filtrado en el frontend (mismo algoritmo que antes)
  const filteredProperties = properties.filter((p) => {
    // 1. Text Search query (title, description, address, district)
    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchText =
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q);
      if (!matchText) return false;
    }

    // 2. Property Type
    if (filters.propertyType !== 'all') {
      if (p.type !== filters.propertyType) return false;
    }

    // 3. Contract Type
    if (filters.contractType !== 'all') {
      if (p.contractType !== filters.contractType) return false;
    }

    // 4. District
    if (filters.district !== 'all') {
      if (p.district !== filters.district) return false;
    }

    // 5. Proximity Target (UNT, UPAO, etc)
    if (filters.proximityTarget !== 'all') {
      const matchProximity = p.proximity.some(
        (target) => target.name.toLowerCase().includes(filters.proximityTarget.toLowerCase())
      );
      if (!matchProximity) return false;
    }

    // 6. Min Price
    if (filters.minPrice !== '') {
      if (p.price < filters.minPrice) return false;
    }

    // 7. Max Price
    if (filters.maxPrice !== '') {
      if (p.price > filters.maxPrice) return false;
    }

    return true;
  });

  return (
    <AppContext.Provider
      value={{
        properties,
        role,
        favorites,
        filters,
        activePropertyId,
        loading,
        error,
        setRole,
        setActivePropertyId,
        toggleFavorite,
        setFilters,
        resetFilters,
        addProperty,
        deleteProperty,
        filteredProperties,
        refreshProperties,
        requireAuth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
