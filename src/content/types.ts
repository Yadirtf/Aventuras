/** Tipos del contenido de la página. Cada parada se guarda como JSON en `paradas/`. */

import type { Imagen } from '../imagenes';

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
  imagen: Imagen;
}

// --- Juegos de las paradas (fases 3 a 5) -------------------------------------------

/** Parada 1 del desierto: la pelota se detiene en una pregunta y las ideas van al mural. */
export interface JuegoPelotaPreguntona {
  tipo: 'pelota-preguntona';
  preguntas: string[];
  columnas: { nombre: string; imagen: Imagen }[];
}

export interface AnimalTitere {
  id: string;
  nombre: string;
  imagen: Imagen;
  /** Cómo se adapta al calor y a la falta de agua (se lee al voltear la tarjeta). */
  adaptacion: string;
}

export interface EscenaTeatrino {
  titulo: string;
  narracion: string;
  /** Frases sugeridas para los títeres. Vacía = los niños inventan lo que dicen. */
  frases: string[];
}

export interface Afirmacion {
  texto: string;
  esRealidad: boolean;
  explicacion: string;
}

/** Parada 2 del desierto: tarjetas de animales, mímica, teatrino y «¿Mito o realidad?». */
export interface JuegoTiteres {
  tipo: 'titeres';
  animales: AnimalTitere[];
  segundosMimica: number;
  escenas: EscenaTeatrino[];
  mitos: Afirmacion[];
}

export interface PistaRally {
  objeto: string;
  imagen: Imagen;
  pista: string;
  /** Posición en la escena, en porcentaje desde la esquina superior izquierda. */
  x: number;
  y: number;
}

/** Parada 3 del desierto: buscar objetos con pistas espaciales y armar el rompecabezas. */
export interface JuegoRally {
  tipo: 'rally';
  pistas: PistaRally[];
  /** Texto al reverso del rompecabezas: la pista del siguiente ecosistema. */
  reverso: string;
  relevo: { despedida: string; respuesta: string; siguienteGuia: PersonajeId };
}

export type Juego = JuegoPelotaPreguntona | JuegoTiteres | JuegoRally;
export type TipoJuego = Juego['tipo'];

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
  /** El juego de la parada; mientras no exista se muestra «en construcción». */
  juego?: Juego;
}

/** Tarjeta imprimible para la familia al cerrar un ecosistema. */
export interface TarjetaFamilia {
  titulo: string;
  ideas: string[];
}

export interface Ecosistema {
  id: EcosistemaId;
  nombre: string;
  titulo: string;
  descripcion: string;
  autora: string;
  guia: PersonajeId;
  imagen: Imagen;
  /** Figuras que decoran su paisaje. */
  paisaje: Imagen[];
  familia?: TarjetaFamilia;
}

export interface Personaje {
  id: PersonajeId;
  nombre: string;
  /** Nombre corto para los diálogos. */
  corto: string;
  descripcion: string;
  imagen: Imagen;
  /** Ajustes de la voz del navegador: tono (0 a 2) y velocidad (0,5 a 2). */
  voz: { tono: number; velocidad: number };
}
