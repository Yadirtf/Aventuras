import type { Juego, Parada } from '../content/types';
import { h } from '../dom';
import type { Store } from '../state/store';

type Base = { parada: Parada; store: Store; alTerminar: () => void };

/**
 * Elige el juego según su tipo. Cada ecosistema es un archivo aparte que el navegador
 * baja solo al llegar a una de sus paradas, para que la primera carga sea liviana.
 */
async function cargarJuego(juego: Juego, base: Base): Promise<HTMLElement> {
  switch (juego.tipo) {
    case 'pelota-preguntona':
      return (await import('./desierto')).pelotaPreguntona({ ...base, juego });
    case 'titeres':
      return (await import('./desierto')).titeres({ ...base, juego });
    case 'rally':
      return (await import('./desierto')).rally({ ...base, juego });
    case 'siluetas':
      return (await import('./mar')).siluetas({ ...base, juego });
    case 'mapa-tesoro':
      return (await import('./mar')).mapaTesoro({ ...base, juego });
    case 'tesoro':
      return (await import('./mar')).tesoro({ ...base, juego });
    case 'sonido-misterioso':
      return (await import('./selva')).sonidos({ ...base, juego });
    case 'circuito':
      return (await import('./selva')).circuito({ ...base, juego });
    case 'cuento':
      return (await import('./selva')).cuento({ ...base, juego });
  }
}

/** Pinta el juego de una parada. Mientras llega, se ve un aviso que luego se reemplaza. */
export function montarJuego(
  juego: Juego,
  parada: Parada,
  store: Store,
  alTerminar: () => void,
): HTMLElement {
  const espera = h(
    'div',
    { class: 'juego juego--cargando', role: 'status' },
    'Huellita está preparando el juego…',
  );
  cargarJuego(juego, { parada, store, alTerminar })
    .then((listo) => espera.replaceWith(listo))
    .catch(() => {
      espera.textContent =
        'No se pudo cargar el juego. Revisen la conexión y vuelvan a abrir esta parada.';
    });
  return espera;
}
