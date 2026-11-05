import type { Personaje, PersonajeId } from './types';

/** Personajes del recorrido. Los iconos son provisionales hasta las ilustraciones de la fase 2. */
export const personajes: Record<PersonajeId, Personaje> = {
  huellita: {
    id: 'huellita',
    nombre: 'Huellita',
    descripcion: 'La huella que dejó el primer explorador. Curiosa y animadora.',
    icono: '🐾',
  },
  dunita: {
    id: 'dunita',
    nombre: 'Dunita, la zorrita del desierto',
    descripcion: 'Lista, de orejas enormes, sale de noche.',
    icono: '🦊',
  },
  'don-camelio': {
    id: 'don-camelio',
    nombre: 'Don Camelio, el camello sabio',
    descripcion: 'Lento, paciente y un poco olvidadizo.',
    icono: '🐪',
  },
  'capitana-tortu': {
    id: 'capitana-tortu',
    nombre: 'Capitana Tortu, la tortuga marina',
    descripcion: 'Valiente y tranquila; usa sombrero de capitana.',
    icono: '🐢',
  },
  momo: {
    id: 'momo',
    nombre: 'Momo, el mono explorador',
    descripcion: 'Inquieto y bromista; no se puede quedar quieto.',
    icono: '🐒',
  },
  tiburon: {
    id: 'tiburon',
    nombre: 'El Tiburón de Agua Salada',
    descripcion: 'Gruñón, pero nunca da miedo de verdad.',
    icono: '🦈',
  },
  medusas: {
    id: 'medusas',
    nombre: 'Las Medusas Cosquillas',
    descripcion: 'Juguetonas: si las tocas, ¡congélate 3 segundos!',
    icono: '🪼',
  },
  cocodrilos: {
    id: 'cocodrilos',
    nombre: 'Los Cocodrilos del Río',
    descripcion: 'Dormilones: hay que saltar sin despertarlos.',
    icono: '🐊',
  },
};
