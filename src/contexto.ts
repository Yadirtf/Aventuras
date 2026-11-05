import type { EcosistemaId, Parada } from './content/types';
import type { Router } from './router';
import type { Store } from './state/store';

/** Lo que cada vista necesita de la aplicación. */
export interface Contexto {
  store: Store;
  router: Router;
  paradas: readonly Parada[];
}

/** Lo que devuelve una vista: su título, su tema de color y el contenido. */
export interface Vista {
  titulo: string;
  tema: EcosistemaId | 'general';
  contenido: HTMLElement;
}
