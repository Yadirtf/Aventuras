import { burbuja, decir } from '../components/burbuja';
import { celebrar } from '../components/celebracion';
import type { JuegoMapaTesoro } from '../content/types';
import { h, icono } from '../dom';
import { imagen } from '../imagenes';
import { acierto, chapuzon } from '../sonido';
import { saltoDeAros } from './comunes';
import type { MontarJuego } from './tipos';

/** Puntos de la línea en zigzag (ruta A), en un tablero de 100 × 60. */
const ZIGZAG: [number, number][] = [
  [6, 30],
  [20, 12],
  [36, 46],
  [52, 14],
  [68, 46],
  [84, 16],
  [95, 30],
];
const ANCHO = 100;
const ALTO = 60;
/** Distancia máxima a la línea antes de «caer al agua», en unidades del tablero. */
const TOLERANCIA = 5;
/** Avance de cada pulsación de flecha, como fracción de un tramo. */
const PASO_TECLADO = 0.25;

type Punto = { x: number; y: number };

/** Proyección de un punto sobre un tramo: dónde cae (0 a 1) y a qué distancia queda. */
function proyectar(p: Punto, a: [number, number], b: [number, number]) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.y - a[1]) * dy) / (dx * dx + dy * dy)));
  const x = a[0] + t * dx;
  const y = a[1] + t * dy;
  return { t, distancia: Math.hypot(p.x - x, p.y - y), x, y };
}

/** Parada 2 del mar: cruzar por la ruta A o la B; cada cruce da una tarjeta del mapa. */
export const mapaTesoro: MontarJuego<JuegoMapaTesoro> = ({ juego, alTerminar }) => {
  let ganadas = 0;
  const tortu = burbuja(
    'capitana-tortu',
    'Elijan una ruta para cruzar el mar. ¡No toquen el agua del Tiburón!',
    { pose: 'pregunta', vivo: true },
  );
  const tarjetas = h('ol', { class: 'mapa__tarjetas', 'aria-label': 'Tarjetas del mapa' });
  const tablero = h('div', { class: 'mar-tablero' });
  const mapa = h('section', { class: 'juego__parte mapa-armado', hidden: true });

  const cruzar = () => {
    const tarjeta = juego.tarjetas[ganadas];
    if (!tarjeta) return;
    ganadas += 1;
    acierto();
    tarjetas.append(
      h(
        'li',
        { class: 'mapa__tarjeta' },
        imagen(tarjeta.imagen, { clase: 'icono', carga: 'eager' }),
        tarjeta.nombre,
      ),
    );
    elegirRuta.hidden = false;
    tablero.replaceChildren();
    if (ganadas < juego.tarjetas.length) {
      decir(
        tortu,
        `¡Llegaron a la isla segura! Ganaron la tarjeta «${tarjeta.nombre}». Faltan ${juego.tarjetas.length - ganadas}: ¡crucen otra vez!`,
        'celebracion',
      );
      return;
    }
    decir(
      tortu,
      '¡Tienen todas las tarjetas! Únanlas para armar el mapa del tesoro.',
      'celebracion',
    );
    elegirRuta.hidden = true;
    unir.hidden = false;
    unir.focus();
  };

  const avisar = (mensaje: string) => decir(tortu, mensaje);
  const caer = (mensaje: string) => {
    chapuzon();
    tablero.classList.add('mar-tablero--chapuzon');
    window.setTimeout(() => tablero.classList.remove('mar-tablero--chapuzon'), 600);
    decir(tortu, `¡Splash! ${mensaje}`, 'pregunta');
  };

  const rutaA = () => {
    let tramo = 0;
    let t = 0;
    const ficha = h(
      'button',
      {
        type: 'button',
        class: 'mar-tablero__ficha',
        'aria-label': 'Buzo. Arrástrenlo por la línea o usen las flechas derecha e izquierda.',
      },
      imagen('mascara-buceo', { carga: 'eager' }),
    );
    const pintar = () => {
      const a = ZIGZAG[tramo];
      const b = ZIGZAG[tramo + 1] ?? a;
      if (!a || !b) return;
      ficha.style.left = `${((a[0] + (b[0] - a[0]) * t) / ANCHO) * 100}%`;
      ficha.style.top = `${((a[1] + (b[1] - a[1]) * t) / ALTO) * 100}%`;
    };
    const avanzar = (nuevoT: number) => {
      t = nuevoT;
      while (t >= 0.98 && tramo < ZIGZAG.length - 2) {
        tramo += 1;
        t = 0;
      }
      pintar();
      if (tramo === ZIGZAG.length - 2 && t >= 0.98) cruzar();
    };
    const volverAlTramo = () => {
      t = 0;
      pintar();
    };

    let arrastrando = false;
    ficha.addEventListener('pointerdown', (e) => {
      arrastrando = true;
      ficha.setPointerCapture(e.pointerId);
    });
    ficha.addEventListener('pointermove', (e) => {
      if (!arrastrando) return;
      const caja = tablero.getBoundingClientRect();
      const p = {
        x: ((e.clientX - caja.left) / caja.width) * ANCHO,
        y: ((e.clientY - caja.top) / caja.height) * ALTO,
      };
      const a = ZIGZAG[tramo];
      const b = ZIGZAG[tramo + 1];
      if (!a || !b) return;
      const enTramo = proyectar(p, a, b);
      if (enTramo.distancia > TOLERANCIA) {
        arrastrando = false;
        volverAlTramo();
        caer(
          'Se salieron de la línea y tocaron el agua del Tiburón. Vuelvan al inicio de este tramo.',
        );
        return;
      }
      // Solo se avanza: retroceder no suma, pero tampoco tumba.
      if (enTramo.t > t) avanzar(enTramo.t);
    });
    const soltar = () => (arrastrando = false);
    ficha.addEventListener('pointerup', soltar);
    ficha.addEventListener('pointercancel', soltar);
    ficha.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        avanzar(Math.min(1, t + PASO_TECLADO));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        t = Math.max(0, t - PASO_TECLADO);
        pintar();
      }
    });

    tablero.replaceChildren(lineaZigzag(), ...islas(), ficha);
    pintar();
    avisar('Ruta A: lleven al buzo por la línea en zigzag con el dedo, el ratón o las flechas.');
    ficha.focus();
  };

  const rutaB = () => {
    const { elemento } = saltoDeAros({
      cantidad: 6,
      figura: 'mascara-buceo',
      etiqueta: 'Aro',
      alAvisar: avisar,
      alLlegar: cruzar,
    });
    const agua = h('button', {
      type: 'button',
      class: 'mar-tablero__agua',
      'aria-label': 'Agua del Tiburón',
      onclick: () => caer('¡Ese es el agua del Tiburón! Salten solo de aro en aro.'),
    });
    tablero.replaceChildren(agua, ...islas(), elemento);
    avisar('Ruta B: toquen los aros uno por uno, del primero al último, sin caer al agua.');
  };

  const elegirRuta = h(
    'div',
    { class: 'juego__acciones' },
    h(
      'button',
      { type: 'button', class: 'boton boton--huellita', onclick: rutaA },
      'Ruta A: la línea en zigzag',
    ),
    h(
      'button',
      { type: 'button', class: 'boton boton--huellita', onclick: rutaB },
      'Ruta B: los aros',
    ),
  );

  const unir = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--huellita boton--grande',
      hidden: true,
      onclick: () => {
        unir.hidden = true;
        mapa.hidden = false;
        mapa.replaceChildren(
          h('h3', null, icono('mapa'), '¡El mapa del tesoro!'),
          h(
            'div',
            { class: 'mapa-armado__dibujo' },
            juego.tarjetas.map((t, i) =>
              h(
                'span',
                { class: `mapa-armado__pieza mapa-armado__pieza--${i + 1}` },
                imagen(t.imagen, { clase: 'icono', carga: 'eager' }),
                t.nombre,
              ),
            ),
            h('span', { class: 'mapa-armado__x', 'aria-hidden': 'true' }, 'X'),
          ),
          h('p', { class: 'mapa-armado__mensaje' }, juego.mensajeMapa),
        );
        celebrar(mapa);
        mapa.scrollIntoView({ behavior: 'smooth', block: 'start' });
        alTerminar();
      },
    },
    icono('mapa'),
    'Unir las tarjetas',
  );

  return h(
    'div',
    { class: 'juego juego--mapa' },
    h(
      'section',
      { class: 'juego__parte' },
      h('h3', null, icono('tiburon'), 'El mar de los tiburones'),
      tortu,
      elegirRuta,
      tablero,
      tarjetas,
      unir,
    ),
    mapa,
  );
};

const NS = 'http://www.w3.org/2000/svg';

/** La cinta en zigzag sobre el agua, dibujada en SVG. */
function lineaZigzag(): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${ANCHO} ${ALTO}`);
  svg.setAttribute('class', 'mar-tablero__linea');
  svg.setAttribute('aria-hidden', 'true');
  const puntos = ZIGZAG.map(([x, y]) => `${x},${y}`).join(' ');
  for (const clase of ['borde', 'cinta']) {
    const linea = document.createElementNS(NS, 'polyline');
    linea.setAttribute('points', puntos);
    linea.setAttribute('class', `mar-tablero__${clase}`);
    svg.append(linea);
  }
  return svg;
}

const islas = (): HTMLElement[] => [
  h('span', { class: 'mar-tablero__isla mar-tablero__isla--inicio', 'aria-hidden': 'true' }),
  h(
    'span',
    { class: 'mar-tablero__isla mar-tablero__isla--fin', 'aria-hidden': 'true' },
    imagen('palmera', { carga: 'eager' }),
  ),
  h(
    'span',
    { class: 'mar-tablero__aleta', 'aria-hidden': 'true' },
    imagen('tiburon', { carga: 'eager' }),
  ),
];
