import type { Juego, Parada } from '../content/types';
import type { Store } from '../state/store';
import { pelotaPreguntona } from './pelota-preguntona';
import { rally } from './rally';
import { titeres } from './titeres';

/** Pinta el juego de una parada según su tipo. */
export function montarJuego(
  juego: Juego,
  parada: Parada,
  store: Store,
  alTerminar: () => void,
): HTMLElement {
  const base = { parada, store, alTerminar };
  switch (juego.tipo) {
    case 'pelota-preguntona':
      return pelotaPreguntona({ ...base, juego });
    case 'titeres':
      return titeres({ ...base, juego });
    case 'rally':
      return rally({ ...base, juego });
  }
}
