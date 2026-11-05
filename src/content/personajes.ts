import type { Personaje, PersonajeId } from './types';

/**
 * Personajes del recorrido. Las voces usan la síntesis del navegador hasta tener grabaciones;
 * tono y velocidad cambian poco a propósito, porque forzarlos hace sonar la voz a robot.
 */
export const personajes: Record<PersonajeId, Personaje> = {
  huellita: {
    id: 'huellita',
    nombre: 'Huellita',
    corto: 'Huellita',
    descripcion: 'La huella que dejó el primer explorador. Curiosa y animadora.',
    imagen: 'huellas',
    voz: { tono: 1.15, velocidad: 0.95 },
  },
  dunita: {
    id: 'dunita',
    nombre: 'Dunita, la zorrita del desierto',
    corto: 'Dunita',
    descripcion: 'Lista, de orejas enormes, sale de noche.',
    imagen: 'zorro',
    voz: { tono: 1.2, velocidad: 0.95 },
  },
  'don-camelio': {
    id: 'don-camelio',
    nombre: 'Don Camelio, el camello sabio',
    corto: 'Don Camelio',
    descripcion: 'Lento, paciente y un poco olvidadizo.',
    imagen: 'camello',
    voz: { tono: 0.9, velocidad: 0.85 },
  },
  'capitana-tortu': {
    id: 'capitana-tortu',
    nombre: 'Capitana Tortu, la tortuga marina',
    corto: 'Capitana Tortu',
    descripcion: 'Valiente y tranquila; usa sombrero de capitana.',
    imagen: 'tortuga',
    voz: { tono: 1.05, velocidad: 0.9 },
  },
  momo: {
    id: 'momo',
    nombre: 'Momo, el mono explorador',
    corto: 'Momo',
    descripcion: 'Inquieto y bromista; no se puede quedar quieto.',
    imagen: 'mono',
    voz: { tono: 1.2, velocidad: 1.0 },
  },
  tiburon: {
    id: 'tiburon',
    nombre: 'El Tiburón de Agua Salada',
    corto: 'El Tiburón',
    descripcion: 'Gruñón, pero nunca da miedo de verdad.',
    imagen: 'tiburon',
    voz: { tono: 0.85, velocidad: 0.9 },
  },
  medusas: {
    id: 'medusas',
    nombre: 'Las Medusas Cosquillas',
    corto: 'Las Medusas',
    descripcion: 'Juguetonas: si las tocas, ¡congélate 3 segundos!',
    imagen: 'medusa',
    voz: { tono: 1.25, velocidad: 1.0 },
  },
  cocodrilos: {
    id: 'cocodrilos',
    nombre: 'Los Cocodrilos del Río',
    corto: 'Los Cocodrilos',
    descripcion: 'Dormilones: hay que saltar sin despertarlos.',
    imagen: 'cocodrilo',
    voz: { tono: 0.85, velocidad: 0.85 },
  },
};
