/**
 * Cómo se reparte cada huella (parada) en pantallas, para jugarla sin hacer scroll.
 *
 * Cada pantalla muestra solo lo necesario para ese momento de la clase: la llegada del guía,
 * el reto en pantalla, una o varias partes del juego (por su posición dentro del juego) o el
 * reto de movimiento. Después de la última pantalla siempre viene la del sello.
 *
 * `docente` señala los pasos de la planeación que acompañan esa pantalla («inicio:1» es el
 * segundo paso del inicio). Se muestran en la guía docente de esa pantalla.
 */

import type { Imagen } from '../imagenes';

export type Momento = 'inicio' | 'desarrollo' | 'cierre';
export type RefPaso = `${Momento}:${number}`;

export interface Pantalla {
  titulo: string;
  icono: Imagen;
  /** Saludo del guía y explicación del reto en pantalla. */
  llegada?: boolean;
  /** Partes del juego que se ven en esta pantalla, por su posición (0 = la primera). */
  partes?: number[];
  /** El reto de movimiento de la huella. */
  movimiento?: boolean;
  docente: RefPaso[];
}

export const PANTALLAS: Record<string, Pantalla[]> = {
  'desierto-1': [
    {
      titulo: 'Lo que sabemos del desierto',
      icono: 'pelota',
      llegada: true,
      partes: [0, 1],
      docente: ['inicio:0', 'inicio:1', 'inicio:2', 'inicio:3'],
    },
    {
      titulo: 'Mi desierto en un dibujo',
      icono: 'crayon',
      partes: [2],
      docente: ['desarrollo:0', 'desarrollo:1', 'desarrollo:3'],
    },
    {
      titulo: 'El mural del desierto',
      icono: 'sol',
      partes: [3],
      docente: ['desarrollo:2', 'cierre:0', 'cierre:1'],
    },
  ],
  'desierto-2': [
    {
      titulo: '¿Cómo se adaptan?',
      icono: 'camello',
      llegada: true,
      partes: [0],
      docente: ['inicio:0', 'inicio:1'],
    },
    { titulo: 'Mímica de 30 segundos', icono: 'cronometro', partes: [1], docente: ['inicio:1'] },
    {
      titulo: 'El teatrino del desierto',
      icono: 'teatro',
      partes: [2],
      docente: [
        'desarrollo:0',
        'desarrollo:1',
        'desarrollo:2',
        'desarrollo:3',
        'desarrollo:4',
        'desarrollo:5',
      ],
    },
    { titulo: '¿Mito o realidad?', icono: 'lupa', partes: [3], docente: ['cierre:0'] },
    {
      titulo: 'Estiramiento y respiración',
      icono: 'acrobata',
      movimiento: true,
      docente: ['cierre:1'],
    },
  ],
  'desierto-3': [
    {
      titulo: 'Rally de pistas',
      icono: 'brujula',
      llegada: true,
      partes: [0],
      docente: ['inicio:0', 'inicio:1', 'inicio:2', 'desarrollo:0', 'desarrollo:1', 'desarrollo:3'],
    },
    {
      titulo: 'El rompecabezas misterioso',
      icono: 'rompecabezas',
      partes: [1],
      docente: ['desarrollo:2', 'cierre:0'],
    },
    {
      titulo: 'Pasos de explorador',
      icono: 'acrobata',
      movimiento: true,
      docente: ['cierre:1', 'cierre:2'],
    },
  ],
  'mar-1': [
    {
      titulo: '¿De quién es esta sombra?',
      icono: 'pez',
      llegada: true,
      partes: [0],
      docente: ['inicio:0', 'inicio:1', 'inicio:2', 'desarrollo:0'],
    },
    { titulo: '¿Qué comen?', icono: 'camaron', partes: [1], docente: ['desarrollo:1'] },
    { titulo: '¡A comer!', icono: 'plancton', partes: [2], docente: ['desarrollo:2'] },
    { titulo: 'Reto de movimiento', icono: 'acrobata', movimiento: true, docente: ['cierre:0'] },
  ],
  'mar-2': [
    {
      titulo: 'Calentamiento de buzos',
      icono: 'mascara-buceo',
      llegada: true,
      movimiento: true,
      docente: ['inicio:0', 'inicio:1', 'desarrollo:0'],
    },
    { titulo: 'El cuento', icono: 'libro', partes: [0], docente: ['inicio:0', 'inicio:1'] },
    { titulo: 'El mapa de los circuitos', icono: 'mapa', partes: [1], docente: ['desarrollo:1'] },
    { titulo: 'El mar de los tiburones', icono: 'tiburon', partes: [2], docente: ['desarrollo:1'] },
    {
      titulo: 'El rompecabezas del mapa',
      icono: 'rompecabezas',
      partes: [3],
      docente: ['desarrollo:2', 'cierre:0', 'cierre:1'],
    },
  ],
  'mar-3': [
    {
      titulo: 'El arrecife de las medusas',
      icono: 'medusa',
      llegada: true,
      partes: [0],
      docente: ['inicio:0', 'inicio:1', 'desarrollo:0', 'desarrollo:1'],
    },
    { titulo: 'El cofre del tesoro', icono: 'gema', partes: [1], docente: ['desarrollo:2'] },
    {
      titulo: 'El pasaporte de viajero',
      icono: 'boleto',
      partes: [2],
      docente: ['desarrollo:3', 'cierre:0', 'cierre:1'],
    },
  ],
  'selva-1': [
    {
      titulo: 'Despertamos como animales',
      icono: 'mono',
      llegada: true,
      partes: [0],
      docente: ['inicio:0', 'inicio:1', 'inicio:2'],
    },
    {
      titulo: 'El sonido misterioso',
      icono: 'oreja',
      partes: [1],
      docente: ['desarrollo:0', 'desarrollo:1', 'cierre:0', 'cierre:1'],
    },
  ],
  'selva-2': [
    {
      titulo: 'Bienvenida a la selva',
      icono: 'palmera',
      llegada: true,
      docente: ['inicio:0', 'inicio:1'],
    },
    {
      titulo: 'El camino de los retos',
      icono: 'cocodrilo',
      partes: [0],
      docente: [
        'desarrollo:0',
        'desarrollo:1',
        'desarrollo:2',
        'desarrollo:3',
        'desarrollo:4',
        'desarrollo:5',
      ],
    },
    {
      titulo: 'Reto de movimiento',
      icono: 'acrobata',
      movimiento: true,
      docente: ['cierre:0', 'cierre:1'],
    },
  ],
  'selva-3': [
    { titulo: 'La selva despierta', icono: 'amanecer', llegada: true, docente: ['inicio:0'] },
    {
      titulo: 'Un día en la selva',
      icono: 'libro',
      partes: [0],
      docente: [
        'desarrollo:0',
        'desarrollo:1',
        'desarrollo:2',
        'desarrollo:3',
        'desarrollo:4',
        'desarrollo:5',
        'desarrollo:6',
      ],
    },
    {
      titulo: 'Reto de movimiento',
      icono: 'acrobata',
      movimiento: true,
      docente: ['cierre:0', 'cierre:1'],
    },
  ],
  'globo-1': [
    {
      titulo: '¡Al globo!',
      icono: 'boleto',
      llegada: true,
      docente: ['inicio:0', 'inicio:1', 'inicio:2'],
    },
    {
      titulo: 'El gran viaje en globo',
      icono: 'globo',
      partes: [0],
      docente: [
        'desarrollo:0',
        'desarrollo:1',
        'desarrollo:2',
        'desarrollo:3',
        'cierre:0',
        'cierre:1',
        'cierre:2',
      ],
    },
  ],
};

/** Pantallas por defecto para una parada sin reparto propio. */
export function pantallasDe(id: string, tieneMovimiento: boolean): Pantalla[] {
  return (
    PANTALLAS[id] ?? [
      { titulo: 'Llegada', icono: 'huellas', llegada: true, docente: ['inicio:0'] },
      { titulo: 'Reto en pantalla', icono: 'control', partes: [], docente: ['desarrollo:0'] },
      ...(tieneMovimiento
        ? [
            {
              titulo: 'Reto de movimiento',
              icono: 'acrobata',
              movimiento: true,
              docente: ['cierre:0'],
            } satisfies Pantalla,
          ]
        : []),
    ]
  );
}
