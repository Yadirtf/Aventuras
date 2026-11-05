/**
 * Figuras 3D de la página. Los personajes vienen de Pixabay y de imágenes propias; el resto,
 * de Fluent Emoji 3D de Microsoft (MIT). Detalle en public/assets/3d/LICENCIA.md.
 * Se sirven desde /assets/3d/<nombre>.webp.
 */

export const IMAGENES = [
  'acrobata',
  'altavoz',
  'ancla',
  'aplauso',
  'arbol',
  'banano',
  'boleto',
  'brujula',
  'burbujas',
  'cactus',
  'camello',
  'candado-abierto',
  'candado',
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
  'mariposa',
  'medalla',
  'meditacion',
  'medusa',
  'mono',
  'nota',
  'nube',
  'ola',
  'paleta',
  'palmera',
  'panuelo',
  'pelota',
  'pez-globo',
  'pez',
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
  'teatro',
  'tiburon',
  'tortuga',
  'trofeo',
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
  }: { alt?: string; clase?: string; carga?: 'lazy' | 'eager' } = {},
): HTMLImageElement {
  const img = document.createElement('img');
  img.src = rutaImagen(nombre);
  img.alt = alt;
  img.className = clase;
  img.width = 256;
  img.height = 256;
  img.loading = carga;
  img.decoding = 'async';
  img.draggable = false;
  return img;
}
