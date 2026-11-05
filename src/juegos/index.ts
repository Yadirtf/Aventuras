import type { Juego, Parada } from '../content/types';
import type { Store } from '../state/store';
import { circuito } from './circuito';
import { cuento } from './cuento';
import { mapaTesoro } from './mapa-tesoro';
import { pelotaPreguntona } from './pelota-preguntona';
import { rally } from './rally';
import { siluetas } from './siluetas';
import { sonidos } from './sonidos';
import { tesoro } from './tesoro';
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
    case 'siluetas':
      return siluetas({ ...base, juego });
    case 'mapa-tesoro':
      return mapaTesoro({ ...base, juego });
    case 'tesoro':
      return tesoro({ ...base, juego });
    case 'sonido-misterioso':
      return sonidos({ ...base, juego });
    case 'circuito':
      return circuito({ ...base, juego });
    case 'cuento':
      return cuento({ ...base, juego });
  }
}
