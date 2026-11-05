import type { Juego, Parada } from '../content/types';
import type { Store } from '../state/store';

export interface EntornoJuego<J extends Juego> {
  juego: J;
  parada: Parada;
  store: Store;
  /** Se llama una vez cuando el grupo termina el reto principal. */
  alTerminar: () => void;
}

export type MontarJuego<J extends Juego> = (entorno: EntornoJuego<J>) => HTMLElement;
