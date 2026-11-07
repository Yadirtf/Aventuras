/** Tipos del contenido de la página. Cada parada se guarda como JSON en `paradas/`. */

import type { Imagen } from '../imagenes';

/**
 * Tramos del camino, en orden: los tres ecosistemas y el gran viaje en globo, que los recorre
 * de nuevo para compararlos. El globo se maneja como un tramo más (mapa, rutas, color y
 * planeación), aunque no es un ecosistema.
 */
export const ECOSISTEMAS = ['desierto', 'mar', 'selva', 'globo'] as const;
export type EcosistemaId = (typeof ECOSISTEMAS)[number];
/** Solo los tres ecosistemas naturales (sin el globo). */
export type EcosistemaNatural = Exclude<EcosistemaId, 'globo'>;

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
  /** Lo que dice cada animal del guion al subir al escenario, por su `id`. */
  dialogos: Record<string, string>;
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

/** Un cuento corto para leer en voz alta, párrafo por párrafo. */
export interface Cuento {
  titulo: string;
  autora: string;
  parrafos: string[];
}

/** Parada 2 del mar: cuento, cruzar el mar por la ruta A o la B y armar el mapa con las piezas. */
export interface JuegoMapaTesoro {
  tipo: 'mapa-tesoro';
  /** El cuento que se lee como provocación, para quienes todavía no leen. */
  cuento: Cuento;
  /** Una pieza del rompecabezas por cruce; con todas se arma el mapa (de 4 o 6). */
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

/**
 * Un trozo del cuento y la figura que se mueve mientras se lee (debe estar en la escena);
 * «todas» mueve a todas las figuras a la vez.
 */
export interface ParteCuento {
  texto: string;
  figura?: Imagen | 'todas';
}

/** Parada 3 de la selva: cuento en escenas con su movimiento y la banda sonora de la tormenta. */
export interface JuegoCuento {
  tipo: 'cuento';
  titulo: string;
  escenas: {
    titulo: string;
    partes: ParteCuento[];
    movimiento: string;
    fondo: FondoCuento;
    figuras: Imagen[];
  }[];
}

export const SENALES = ['tambor', 'campana', 'maracas'] as const;
export type Senal = (typeof SENALES)[number];

/** Un aterrizaje del globo: la señal que lo anuncia y la misión de movimiento del lugar. */
export interface Aterrizaje {
  ecosistema: EcosistemaNatural;
  senal: Senal;
  mision: string;
  descripcion: string;
  minutos: number;
  /** Retos de la misión, en orden (estaciones del recorrido o animales de la estatua musical). */
  pasos: { texto: string; imagen: Imagen }[];
  /** «recorrido»: se marca cada reto al terminarlo; «estatua»: música que se detiene. */
  modo: 'recorrido' | 'estatua';
  /** Música de fondo que la docente puede poner durante la misión. */
  musica?: 'suave' | 'animada';
  pregunta: string;
}

/** Una característica para comparar los ecosistemas al volver al globo. */
export interface Caracteristica {
  texto: string;
  ecosistema: EcosistemaNatural;
}

/** Parada final: el gran viaje en globo por los tres mundos. */
export interface JuegoGlobo {
  tipo: 'globo';
  preguntasDespegue: string[];
  acuerdos: string[];
  segundosVuelo: number;
  aterrizajes: Aterrizaje[];
  caracteristicas: Caracteristica[];
  /** Lo que tienen en común los tres ecosistemas. */
  semejanza: string;
  preguntaFinal: string;
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
  | JuegoCuento
  | JuegoGlobo;
export type TipoJuego = Juego['tipo'];

/** Lo que se hace con el cuerpo en el salón, además del juego en pantalla. */
export interface RetoMovimiento {
  /** Por defecto, «Reto de movimiento». */
  titulo?: string;
  texto: string;
  /** Versión sentada o en silencio, para quien la necesite. */
  tranquilo: string;
  /** Si es true, la docente decide si lo hace. */
  opcional?: boolean;
  /** Si es true, se hace antes del juego (calentamiento) y no al final. */
  antesDelJuego?: boolean;
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
  /** Algunas paradas no lo llevan: su cierre ya es tranquilo o el juego ya es de movimiento. */
  movimiento?: RetoMovimiento;
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
  /** Nombre del ecosistema: Desértico, Marino, Selvático. */
  nombre: string;
  /** El lugar en palabras de los niños: «el desierto», «el fondo del mar». */
  lugar: string;
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
