import type { ProximityType } from '../types/property';


export const trujilloDistricts = [
  'San Andrés',
  'California',
  'El Golf',
  'Las Quintanas',
  'Monserrate',
  'Centro Histórico',
  'Primavera'
];

export const trujilloTargets: { name: string; type: ProximityType }[] = [
  { name: 'UNT (Univ. Nacional de Trujillo)', type: 'university' },
  { name: 'UPAO (Univ. Privada Antenor Orrego)', type: 'university' },
  { name: 'UPN (Univ. Privada del Norte)', type: 'university' },
  { name: 'UCV (Univ. César Vallejo)', type: 'university' },
  { name: 'Hospital Regional Docente', type: 'hospital' },
  { name: 'Hospital Belén', type: 'hospital' },
  { name: 'Hospital de Alta Complejidad (Virgen de la Puerta)', type: 'hospital' }
];

// Las propiedades iniciales ahora se cargan desde Supabase (ver supabase/seed.sql)
// Este archivo solo exporta datos de referencia para los formularios.
