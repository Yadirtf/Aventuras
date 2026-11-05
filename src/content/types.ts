/** Tipos del contenido de la página. Cada parada se guarda como JSON en `paradas/`. */

export const ECOSISTEMAS = ['desierto', 'mar', 'selva'] as const;
export type EcosistemaId = (typeof ECOSISTEMAS)[number];

export const PERSONAJES = [
  'huellita',
  'dunita',
  'don-camelio',
  'capitana-tortu',
  'momo',
  'tiburon',
  'medusas',
  'cocodrilos',
] as const;
export type PersonajeId = (typeof PERSONAJES)[number];

/** Un paso de un momento de la clase: título opcional, texto y una lista opcional (preguntas, escenas…). */
export interface Paso {
  titulo?: string;
  texto: string;
  lista?: string[];
}

export interface Anexo {
  titulo: string;
  url?: string;
}

/** La planeación completa tal como la escribió su autora (Modo Docente). */
export interface Planeacion {
  tema: string;
  autora: string;
  docenteTutora: string | null;
  fecha: string | null;
  duracion: string;
  objetivo: string;
  inicio: Paso[];
  desarrollo: Paso[];
  cierre: Paso[];
  materiales: string[];
  tiempos: string;
  /** Puede estar vacío mientras la autora los define; entonces debe aparecer en `pendientes`. */
  indicadoresDeLogro: string[];
  observaciones: string[];
  anexos: Anexo[];
  /** Lo que falta en el documento original y hay que pedir a la autora. */
  pendientes: string[];
}

export interface Sello {
  nombre: string;
  /** Marcador provisional (emoji) hasta que la fase 2 entregue las ilustraciones. */
  icono: string;
}

/** Una parada del mapa: la experiencia en pantalla más su planeación. */
export interface Parada {
  id: string;
  ecosistema: EcosistemaId;
  numero: 1 | 2 | 3;
  titulo: string;
  guias: PersonajeId[];
  saludo: string;
  retoPantalla: string;
  retoMovimiento: string;
  sello: Sello;
  /** La pista que deja esta parada hacia la siguiente. */
  pista: string;
  planeacion: Planeacion;
}

export interface Ecosistema {
  id: EcosistemaId;
  nombre: string;
  titulo: string;
  descripcion: string;
  autora: string;
  guia: PersonajeId;
  icono: string;
}

export interface Personaje {
  id: PersonajeId;
  nombre: string;
  descripcion: string;
  icono: string;
}
