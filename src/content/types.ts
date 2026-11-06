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

/** El guía de un ecosistema le entrega la pista al guía del siguiente. */
export interface Relevo {
  despedida: string;
  respuesta: string;
  siguienteGuia: PersonajeId;
}

/** Parada 3 del desierto: buscar objetos con pistas espaciales y armar el rompecabezas. */
export interface JuegoRally {
  tipo: 'rally';
  pistas: PistaRally[];
  /** Texto al reverso del rompecabezas: la pista del siguiente ecosistema. */
  reverso: string;
  relevo: Relevo;
}

export const DIETAS = ['herbivoro', 'carnivoro', 'omnivoro'] as const;
export type Dieta = (typeof DIETAS)[number];

export interface AnimalMarino {
  id: string;
  nombre: string;
  /** Para armar frases: «el tiburón», «la tortuga marina». */
  articulo: 'el' | 'la';
  imagen: Imagen;
  dieta: Dieta;
  /** Lo que come, en palabras para niños (se muestra en su tarjeta de alimento). */
  alimento: string;
  imagenAlimento: Imagen;
  /** Se lee al acertar su dieta. */
  explicacion: string;
}

/** Parada 1 del mar: siluetas, «¿qué comen?» y «¡A comer!». */
export interface JuegoSiluetas {
  tipo: 'siluetas';
  animales: AnimalMarino[];
  /** Tarjetas de alimento que no son de ningún animal del juego, para despistar. */
  otrosAlimentos: { nombre: string; imagen: Imagen }[];
}

/** Parada 2 del mar: cruzar el mar por la ruta A o la B y armar el mapa con las tarjetas. */
export interface JuegoMapaTesoro {
  tipo: 'mapa-tesoro';
  /** Una tarjeta por cruce; con todas se arma el mapa. */
  tarjetas: { nombre: string; imagen: Imagen }[];
  /** Lo que dice el mapa armado: las últimas pistas hacia la gran X. */
  mensajeMapa: string;
}

/** Parada 3 del mar: arrecife de medusas, cofre y pasaporte que abre el sobre «¿?». */
export interface JuegoTesoro {
  tipo: 'tesoro';
  /** Pasos para cruzar el arrecife. */
  pasos: number;
  segundosCongelado: number;
  /** La invitación que trae el sobre. */
  invitacion: string;
  relevo: Relevo;
}

export const SONIDOS_SELVA = ['mono', 'serpiente', 'rana', 'ave', 'jaguar'] as const;
export type SonidoSelva = (typeof SONIDOS_SELVA)[number];

/** Parada 1 de la selva: sonido misterioso y pausa activa «Despertamos como animales». */
export interface JuegoSonidos {
  tipo: 'sonido-misterioso';
  animales: {
    sonido: SonidoSelva;
    nombre: string;
    articulo: 'el' | 'la';
    imagen: Imagen;
    dato: string;
  }[];
  movimientos: { nombre: string; imagen: Imagen; accion: string }[];
  segundosMovimiento: number;
}

export const ESTACIONES = ['rio', 'serpientes', 'troncos', 'monos'] as const;
export type EstacionId = (typeof ESTACIONES)[number];
export const ORDENES_MONO = ['arriba', 'abajo', 'derecha', 'izquierda'] as const;
export type OrdenMono = (typeof ORDENES_MONO)[number];

/** Parada 2 de la selva: circuito de cuatro estaciones. */
export interface JuegoCircuito {
  tipo: 'circuito';
  estaciones: { id: EstacionId; titulo: string; imagen: Imagen; instruccion: string }[];
  /** Saltos que hay que dar para cruzar el río sin despertar a los cocodrilos. */
  saltosRio: number;
  conos: number;
  aros: number;
  ordenesMono: OrdenMono[];
}

export const FONDOS_CUENTO = ['amanecer', 'rugido', 'tormenta', 'sol', 'reunion'] as const;
export type FondoCuento = (typeof FONDOS_CUENTO)[number];

/** Parada 3 de la selva: cuento en escenas con su movimiento y la banda sonora de la tormenta. */
export interface JuegoCuento {
  tipo: 'cuento';
  titulo: string;
  escenas: {
    titulo: string;
    texto: string;
    movimiento: string;
    fondo: FondoCuento;
    figuras: Imagen[];
  }[];
}

export type Juego =
  | JuegoPelotaPreguntona
  | JuegoTiteres
  | JuegoRally
  | JuegoSiluetas
  | JuegoMapaTesoro
  | JuegoTesoro
  | JuegoSonidos
  | JuegoCircuito
  | JuegoCuento;
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
  /** Versión sentada o en silencio del reto de movimiento, para quien la necesite. */
  retoTranquilo: string;
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
