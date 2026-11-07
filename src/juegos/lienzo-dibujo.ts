import { h, icono } from '../dom';
import { imagen, rutaImagen, type Imagen } from '../imagenes';

const CRAYONES = [
  { nombre: 'café', color: '#7a4a21' },
  { nombre: 'naranja', color: '#f07b1d' },
  { nombre: 'amarillo', color: '#f7c600' },
  { nombre: 'verde', color: '#2f9e44' },
  { nombre: 'azul', color: '#1c7ed6' },
  { nombre: 'negro', color: '#222222' },
];

type Herramienta =
  { tipo: 'crayon'; color: string } | { tipo: 'arena' } | { tipo: 'pegatina'; imagen: Imagen };

/** Pasos que se pueden deshacer. */
const MAXIMO_DESHACER = 25;
/** Tamaño de la miniatura que se cuelga en la cuerda. */
const MINIATURA = { ancho: 320, alto: 200, calidad: 0.72 };

/**
 * Lienzo para dibujar con el dedo o el ratón: crayones, pincel de arena y pegatinas
 * de animales. Se puede deshacer paso a paso, descargar como imagen y, si la parada
 * tiene cuerda, colgar en ella una miniatura.
 */
export function lienzoDibujo({
  nombreArchivo,
  pegatinas,
  papel = ['#fff6dc', '#ffe2a8'],
  conArena = true,
  alDibujar,
  alColgar,
}: {
  nombreArchivo: string;
  pegatinas: Imagen[];
  /** Colores de arriba y de abajo del papel. */
  papel?: [string, string];
  conArena?: boolean;
  /** Se llama la primera vez que alguien dibuja o pega algo. */
  alDibujar?: () => void;
  /** Si se indica, aparece «Colgar en la cuerda» y recibe la miniatura en JPEG. */
  alColgar?: (miniatura: string) => void;
}): HTMLElement {
  const ANCHO = 960;
  const ALTO = 600;
  const lienzo = h('canvas', {
    class: 'lienzo__papel',
    width: ANCHO,
    height: ALTO,
    role: 'img',
    'aria-label': 'Lienzo de dibujo',
  });
  const ctx = lienzo.getContext('2d');
  let herramienta: Herramienta = { tipo: 'crayon', color: CRAYONES[0]?.color ?? '#000' };
  let ultimo: { x: number; y: number } | null = null;
  const historia: ImageData[] = [];

  const fondo = () => {
    if (!ctx) return;
    const cielo = ctx.createLinearGradient(0, 0, 0, ALTO);
    cielo.addColorStop(0, papel[0]);
    cielo.addColorStop(1, papel[1]);
    ctx.fillStyle = cielo;
    ctx.fillRect(0, 0, ANCHO, ALTO);
  };
  fondo();

  const deshacer = h(
    'button',
    { type: 'button', class: 'boton boton--secundario boton--chico', disabled: true },
    '↶ Deshacer',
  );
  /** Guarda cómo está el papel antes de cada cambio, para poder volver un paso atrás. */
  const recordar = () => {
    if (!ctx) return;
    historia.push(ctx.getImageData(0, 0, ANCHO, ALTO));
    if (historia.length > MAXIMO_DESHACER) historia.shift();
    deshacer.disabled = false;
  };
  deshacer.addEventListener('click', () => {
    const anterior = historia.pop();
    if (anterior) ctx?.putImageData(anterior, 0, 0);
    deshacer.disabled = historia.length === 0;
  });
  const borrarTodo = () => {
    recordar();
    fondo();
  };

  const punto = (e: PointerEvent) => {
    const caja = lienzo.getBoundingClientRect();
    return {
      x: ((e.clientX - caja.left) / caja.width) * ANCHO,
      y: ((e.clientY - caja.top) / caja.height) * ALTO,
    };
  };

  const arena = (x: number, y: number) => {
    if (!ctx) return;
    const tonos = ['#e9b96e', '#d9a256', '#f3cf8e', '#c98d3f'];
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 18;
      ctx.fillStyle = tonos[i % tonos.length] ?? '#e9b96e';
      ctx.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r, 2.5, 2.5);
    }
  };

  const trazo = (desde: { x: number; y: number }, hasta: { x: number; y: number }) => {
    if (!ctx) return;
    if (herramienta.tipo === 'arena') {
      const pasos = Math.max(1, Math.hypot(hasta.x - desde.x, hasta.y - desde.y) / 6);
      for (let i = 0; i <= pasos; i++)
        arena(
          desde.x + ((hasta.x - desde.x) * i) / pasos,
          desde.y + ((hasta.y - desde.y) * i) / pasos,
        );
      return;
    }
    if (herramienta.tipo !== 'crayon') return;
    ctx.strokeStyle = herramienta.color;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(desde.x, desde.y);
    ctx.lineTo(hasta.x, hasta.y);
    ctx.stroke();
  };

  const pegar = (nombre: Imagen, x: number, y: number) => {
    const img = new Image();
    img.onload = () => ctx?.drawImage(img, x - 70, y - 70, 140, 140);
    img.src = rutaImagen(nombre);
  };

  let dibujado = false;
  lienzo.addEventListener('pointerdown', (e) => {
    const p = punto(e);
    if (!dibujado) {
      dibujado = true;
      alDibujar?.();
    }
    recordar();
    if (herramienta.tipo === 'pegatina') {
      pegar(herramienta.imagen, p.x, p.y);
      return;
    }
    lienzo.setPointerCapture(e.pointerId);
    ultimo = p;
    trazo(p, p);
  });
  lienzo.addEventListener('pointermove', (e) => {
    if (!ultimo) return;
    const p = punto(e);
    trazo(ultimo, p);
    ultimo = p;
  });
  const soltar = () => (ultimo = null);
  lienzo.addEventListener('pointerup', soltar);
  lienzo.addEventListener('pointercancel', soltar);

  const botones: HTMLButtonElement[] = [];
  const opcion = (etiqueta: string, contenido: Node, elegir: Herramienta, clase = '') => {
    const b = h(
      'button',
      {
        type: 'button',
        class: `lienzo__herramienta ${clase}`,
        'aria-label': etiqueta,
        'aria-pressed': 'false',
      },
      contenido,
    );
    b.addEventListener('click', () => {
      herramienta = elegir;
      botones.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    });
    botones.push(b);
    return b;
  };

  const crayones = CRAYONES.map((c) =>
    opcion(
      `Crayón ${c.nombre}`,
      h('span', { class: 'lienzo__muestra', style: `background:${c.color}` }),
      {
        tipo: 'crayon',
        color: c.color,
      },
    ),
  );
  botones[0]?.setAttribute('aria-pressed', 'true');

  return h(
    'div',
    { class: 'lienzo' },
    h(
      'div',
      { class: 'lienzo__barra', role: 'toolbar', 'aria-label': 'Herramientas de dibujo' },
      crayones,
      conArena &&
        opcion('Pincel de arena', h('span', { class: 'lienzo__muestra lienzo__muestra--arena' }), {
          tipo: 'arena',
        }),
      pegatinas.map((p) =>
        opcion(`Pegatina ${p}`, imagen(p, { clase: 'icono', carga: 'eager' }), {
          tipo: 'pegatina',
          imagen: p,
        }),
      ),
    ),
    lienzo,
    h(
      'div',
      { class: 'juego__acciones' },
      deshacer,
      h(
        'button',
        { type: 'button', class: 'boton boton--secundario boton--chico', onclick: borrarTodo },
        icono('escoba'),
        'Borrar todo',
      ),
      alColgar &&
        h(
          'button',
          {
            type: 'button',
            class: 'boton boton--huellita boton--chico',
            onclick: () => {
              const copia = h('canvas', { width: MINIATURA.ancho, height: MINIATURA.alto });
              copia.getContext('2d')?.drawImage(lienzo, 0, 0, MINIATURA.ancho, MINIATURA.alto);
              alColgar(copia.toDataURL('image/jpeg', MINIATURA.calidad));
              // El papel queda limpio para el siguiente dibujo (y se puede deshacer).
              borrarTodo();
            },
          },
          icono('panuelo'),
          'Colgar en la cuerda',
        ),
      h(
        'button',
        {
          type: 'button',
          class: 'boton boton--secundario boton--chico',
          onclick: () => {
            const enlace = document.createElement('a');
            enlace.download = `${nombreArchivo}.png`;
            enlace.href = lienzo.toDataURL('image/png');
            enlace.click();
          },
        },
        icono('guardar'),
        'Guardar dibujo',
      ),
    ),
  );
}
