/**
 * Figuras 3D de la página. Los personajes vienen de Pixabay y de imágenes propias; el resto,
 * de Fluent Emoji 3D de Microsoft (MIT). Detalle en public/assets/3d/LICENCIA.md.
 * Se sirven desde /assets/3d/<nombre>.webp.
 */

export const IMAGENES = [
  'acrobata',
  'algas',
  'altavoz',
  'amanecer',
  'ancla',
  'aplauso',
  'arbol',
  'arcoiris',
  'banano',
  'boleto',
  'brujula',
  'burbujas',
  'cactus',
  'camaron',
  'camello',
  'campana',
  'candado',
  'candado-abierto',
  'cangrejo',
  'carpa',
  'cocodrilo',
  'concha',
  'confeti',
  'control',
  'coral',
  'crayon',
  'cronometro',
  'delfin',
  'documento',
  'elefante',
  'engranaje',
  'escoba',
  'estrella',
  'familia',
  'flor',
  'gema',
  'globo',
  'gota',
  'guardar',
  'hoja',
  'huellas',
  'impresora',
  'isla',
  'jaguar',
  'jirafa',
  'lagarto',
  'libro',
  'lluvia',
  'loro',
  'lupa',
  'mapa',
  'maracas',
  'mariposa',
  'mascara-buceo',
  'medalla',
  'meditacion',
  'medusa',
  'moneda',
  'mono',
  'musica',
  'nota',
  'nube',
  'ola',
  'oreja',
  'pajaro',
  'paleta',
  'palmera',
  'panuelo',
  'pelota',
  'perezoso',
  'perla',
  'pez',
  'pez-globo',
  'pez-tropical',
  'plancton',
  'pulpo',
  'rana',
  'rayo',
  'regalo',
  'reloj-arena',
  'roca',
  'rompecabezas',
  'serpiente',
  'sobre',
  'sol',
  'tambor',
  'teatro',
  'tiburon',
  'tigre',
  'tormenta',
  'tortuga',
  'trofeo',
  'tronco',
  'trueno',
  'viento',
  'zorro',
] as const;

export type Imagen = (typeof IMAGENES)[number];

export const esImagen = (valor: unknown): valor is Imagen =>
  typeof valor === 'string' && (IMAGENES as readonly string[]).includes(valor);

export const rutaImagen = (nombre: Imagen): string => `/assets/3d/${nombre}.webp`;

/**
 * Crea la etiqueta <img>. Sin `alt` la imagen es decorativa y los lectores de pantalla la ignoran.
 */
export function imagen(
  nombre: Imagen,
  {
    alt = '',
    clase = 'figura',
    carga = 'lazy',
    prioridad,
  }: {
    alt?: string;
    clase?: string;
    carga?: 'lazy' | 'eager';
    /** «baja» para figuras de adorno: así el texto aparece primero. */
    prioridad?: 'baja';
  } = {},
): HTMLImageElement {
  const img = document.createElement('img');
  img.src = rutaImagen(nombre);
  img.alt = alt;
  img.className = clase;
  img.width = 256;
  img.height = 256;
  img.loading = carga;
  img.decoding = 'async';
  if (prioridad === 'baja') img.fetchPriority = 'low';
  img.draggable = false;
  return img;
}
