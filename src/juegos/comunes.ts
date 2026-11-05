import { burbuja } from '../components/burbuja';
import type { PersonajeId, Relevo } from '../content/types';
import { h } from '../dom';
import { imagen, type Imagen } from '../imagenes';
import { salto } from '../sonido';

/** Piezas que comparten varios juegos: aros para saltar, temporizador y relevo de guías. */

/**
 * Aros para saltar de uno en uno (ruta B del mar y troncos de la selva). Cada aro es un
 * botón, así funciona con dedo, ratón y teclado; saltar a uno lejano no vale.
 */
export function saltoDeAros({
  cantidad,
  figura,
  etiqueta,
  alAvisar,
  alLlegar,
}: {
  cantidad: number;
  figura: Imagen;
  /** Nombre del aro para lectores de pantalla («Aro», «Tronco»). */
  etiqueta: string;
  alAvisar: (mensaje: string) => void;
  alLlegar: () => void;
}): { elemento: HTMLElement; reiniciar: () => void } {
  let actual = -1;
  const ficha = h('span', { class: 'aros__ficha', 'aria-hidden': 'true' }, imagen(figura));
  const posicion = (i: number) => ({
    x: 14 + (i * 72) / Math.max(1, cantidad - 1),
    y: i % 2 === 0 ? 62 : 34,
  });
  const mover = () => {
    const { x, y } = actual < 0 ? { x: 4, y: 50 } : posicion(actual);
    ficha.style.left = `${x}%`;
    ficha.style.top = `${y}%`;
  };

  const aros = Array.from({ length: cantidad }, (_, i) => {
    const { x, y } = posicion(i);
    return h('button', {
      type: 'button',
      class: 'aros__aro',
      style: `left:${x}%;top:${y}%`,
      'aria-label': `${etiqueta} ${i + 1}`,
      onclick: () => {
        if (i <= actual) return alAvisar('¡Ya están en ese! Salten al siguiente.');
        if (i > actual + 1)
          return alAvisar(`¡Ese está muy lejos! Salten al ${etiqueta.toLowerCase()} de al lado.`);
        actual = i;
        salto();
        aros[i]?.classList.add('aros__aro--pisado');
        mover();
        if (actual === cantidad - 1) alLlegar();
        else alAvisar(`¡Muy bien! Van ${actual + 1} de ${cantidad}.`);
      },
    });
  });

  const reiniciar = () => {
    actual = -1;
    aros.forEach((a) => a.classList.remove('aros__aro--pisado'));
    mover();
  };
  reiniciar();

  return { elemento: h('div', { class: 'aros' }, aros, ficha), reiniciar };
}

/**
 * Cuenta regresiva visible (anillo y número) con role=timer.
 * `alTerminar` se llama cuando llega a cero.
 */
export function temporizador(segundos: number): {
  elemento: HTMLElement;
  empezar: (alTerminar?: () => void) => void;
  detener: () => void;
  reiniciar: (s?: number) => void;
} {
  let total = segundos;
  let reloj = 0;
  const elemento = h(
    'div',
    { class: 'mimica__tiempo', role: 'timer', 'aria-live': 'off' },
    String(total),
  );
  const pintar = (quedan: number) => {
    elemento.textContent = String(quedan);
    elemento.style.setProperty('--avance', String(1 - quedan / total));
  };
  const detener = () => window.clearInterval(reloj);
  return {
    elemento,
    detener,
    reiniciar: (s = total) => {
      detener();
      total = s;
      pintar(total);
    },
    empezar: (alTerminar) => {
      detener();
      let quedan = total;
      pintar(quedan);
      reloj = window.setInterval(() => {
        quedan -= 1;
        pintar(quedan);
        if (quedan <= 0) {
          detener();
          alTerminar?.();
        }
      }, 1000);
    },
  };
}

/** El guía que se despide le entrega la pista al guía del siguiente ecosistema. */
export const relevo = (desde: PersonajeId, r: Relevo): HTMLElement =>
  h(
    'div',
    { class: 'relevo' },
    burbuja(desde, r.despedida, { pose: 'celebracion' }),
    burbuja(r.siguienteGuia, r.respuesta, { pose: 'saludo' }),
  );
