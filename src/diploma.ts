import { personajes } from './content';
import { PERSONAJES } from './content/types';
import { rutaImagen, type Imagen } from './imagenes';

/**
 * Diploma del explorador dibujado en un canvas: se ve en la pantalla final, se descarga
 * como imagen y se imprime (o se guarda en PDF desde el diálogo de impresión).
 * Proporción A4 apaisada para que llene la hoja.
 */

export const ANCHO_DIPLOMA = 2000;
export const ALTO_DIPLOMA = 1414;

export interface DatosDiploma {
  nombre: string;
  /** Sellos conseguidos, en el orden del recorrido. */
  sellos: { nombre: string; imagen: Imagen; ecosistema: 'desierto' | 'mar' | 'selva' }[];
  fecha: Date;
}

const COLOR_ECOSISTEMA = { desierto: '#e8590c', mar: '#1c7ed6', selva: '#2f9e44' };

function cargar(nombre: Imagen): Promise<HTMLImageElement | null> {
  return new Promise((resolver) => {
    const img = new Image();
    img.onload = () => resolver(img);
    img.onerror = () => resolver(null);
    img.src = rutaImagen(nombre);
  });
}

/** Espera las tipografías para que el canvas no las cambie por otras. */
async function fuentes(): Promise<void> {
  if (!('fonts' in document)) return;
  await Promise.all([
    document.fonts.load('800 100px "Baloo 2"'),
    document.fonts.load('700 40px Andika'),
    document.fonts.load('400 40px Andika'),
  ]).catch(() => undefined);
}

/** Dibuja la figura centrada en (x, y) dentro de un cuadrado de lado `lado`, sin deformarla. */
function figura(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  lado: number,
): void {
  if (!img) return;
  const escala = lado / Math.max(img.naturalWidth, img.naturalHeight);
  const w = img.naturalWidth * escala;
  const h = img.naturalHeight * escala;
  ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
}

export const fechaEnPalabras = (fecha: Date): string =>
  new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    fecha,
  );

/** Escribe un texto que se achica si no cabe en `ancho`. */
function texto(
  ctx: CanvasRenderingContext2D,
  contenido: string,
  x: number,
  y: number,
  { fuente, tamano, ancho }: { fuente: string; tamano: number; ancho: number },
): void {
  let t = tamano;
  ctx.font = fuente.replace('{t}', String(t));
  while (ctx.measureText(contenido).width > ancho && t > 20) {
    t -= 4;
    ctx.font = fuente.replace('{t}', String(t));
  }
  ctx.fillText(contenido, x, y);
}

export async function dibujarDiploma(
  lienzo: HTMLCanvasElement,
  datos: DatosDiploma,
): Promise<void> {
  const ctx = lienzo.getContext('2d');
  if (!ctx) return;
  const W = ANCHO_DIPLOMA;
  const H = ALTO_DIPLOMA;
  lienzo.width = W;
  lienzo.height = H;

  const [huellas, ...resto] = await Promise.all([
    cargar('huellas'),
    ...datos.sellos.map((s) => cargar(s.imagen)),
    ...PERSONAJES.map((id) => cargar(personajes[id].imagen)),
    fuentes().then(() => null),
  ]);
  const imgSellos = resto.slice(0, datos.sellos.length);
  const imgPersonajes = resto.slice(datos.sellos.length, datos.sellos.length + PERSONAJES.length);

  // Papel y marco con los colores de los tres ecosistemas.
  ctx.fillStyle = '#fffaf0';
  ctx.fillRect(0, 0, W, H);
  const marco = ctx.createLinearGradient(0, 0, W, H);
  marco.addColorStop(0, COLOR_ECOSISTEMA.desierto);
  marco.addColorStop(0.5, COLOR_ECOSISTEMA.mar);
  marco.addColorStop(1, COLOR_ECOSISTEMA.selva);
  ctx.lineWidth = 34;
  ctx.strokeStyle = marco;
  ctx.beginPath();
  ctx.roundRect(40, 40, W - 80, H - 80, 60);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.setLineDash([18, 14]);
  ctx.strokeStyle = '#d9c8f0';
  ctx.beginPath();
  ctx.roundRect(90, 90, W - 180, H - 180, 40);
  ctx.stroke();
  ctx.setLineDash([]);

  // Huellitas en las esquinas.
  for (const [x, y, giro] of [
    [170, 170, -0.4],
    [W - 170, 170, 0.4],
    [170, H - 170, -2.6],
    [W - 170, H - 170, 2.6],
  ] as const) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(giro);
    figura(ctx, huellas ?? null, 0, 0, 130);
    ctx.restore();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#4b1aa3';
  texto(ctx, 'DIPLOMA DEL EXPLORADOR', W / 2, 250, {
    fuente: '800 {t}px "Baloo 2", sans-serif',
    tamano: 104,
    ancho: W - 520,
  });
  ctx.fillStyle = '#5b5170';
  texto(ctx, 'El camino de las aventuras entrega con orgullo este diploma a', W / 2, 340, {
    fuente: '400 {t}px Andika, sans-serif',
    tamano: 42,
    ancho: W - 400,
  });

  // Nombre con el degradado del título de la portada.
  const degradado = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0);
  degradado.addColorStop(0, '#e2601b');
  degradado.addColorStop(0.5, '#0a63a8');
  degradado.addColorStop(1, '#18793a');
  ctx.fillStyle = degradado;
  texto(ctx, datos.nombre, W / 2, 500, {
    fuente: '800 {t}px "Baloo 2", sans-serif',
    tamano: 132,
    ancho: W - 400,
  });
  ctx.fillStyle = '#ffc83d';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 420, 530, 840, 12, 6);
  ctx.fill();

  ctx.fillStyle = '#2a1f3d';
  for (const [i, linea] of [
    'por recorrer el desierto, explorar el fondo del mar y descubrir los secretos',
    'de la selva con curiosidad, valentía y trabajo en equipo.',
  ].entries())
    texto(ctx, linea, W / 2, 620 + i * 58, {
      fuente: '400 {t}px Andika, sans-serif',
      tamano: 42,
      ancho: W - 360,
    });

  // Los sellos del pasaporte.
  const lado = 150;
  const paso = 178;
  const inicio = W / 2 - ((datos.sellos.length - 1) * paso) / 2;
  datos.sellos.forEach((s, i) => {
    const x = inicio + i * paso;
    const y = 880;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = COLOR_ECOSISTEMA[s.ecosistema];
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(x, y, lado / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    figura(ctx, imgSellos[i] ?? null, x, y, lado * 0.66);
    ctx.fillStyle = '#5b5170';
    texto(ctx, s.nombre, x, y + lado / 2 + 40, {
      fuente: '700 {t}px Andika, sans-serif',
      tamano: 26,
      ancho: paso - 8,
    });
  });

  // Los ocho personajes que acompañaron el viaje.
  const pasoP = 150;
  const inicioP = W / 2 - ((PERSONAJES.length - 1) * pasoP) / 2;
  imgPersonajes.forEach((img, i) => figura(ctx, img, inicioP + i * pasoP, 1145, 128));

  ctx.fillStyle = '#5b5170';
  ctx.textAlign = 'left';
  texto(ctx, fechaEnPalabras(datos.fecha), 300, 1280, {
    fuente: '700 {t}px Andika, sans-serif',
    tamano: 34,
    ancho: 600,
  });
  ctx.textAlign = 'right';
  texto(ctx, 'Corporación Everyday Home', W - 300, 1280, {
    fuente: '700 {t}px Andika, sans-serif',
    tamano: 34,
    ancho: 600,
  });
}
