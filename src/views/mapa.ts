import { ECOSISTEMAS, ecosistemas, paradasDe } from '../content';
import { burbuja } from '../components/burbuja';
import { tarjetaParada } from '../components/tarjeta-parada';
import type { Contexto, Vista } from '../contexto';
import { h, icono } from '../dom';
import { rutas } from '../router';
import { aventuraCompleta, estadoDeParada } from '../state/progreso';

export function mapa({ store, paradas }: Contexto): Vista {
  const completadas = store.completadas;
  const { modoDocente, explorador } = store.estado;
  const posicion = (id: string) => paradas.findIndex((p) => p.id === id) + 1;
  const terminado = aventuraCompleta(paradas, completadas);

  return {
    titulo: 'Mapa de exploración',
    tema: 'general',
    contenido: h(
      'section',
      { class: 'mapa' },
      h('h1', { tabindex: -1 }, 'Mapa de exploración'),
      burbuja(
        'huellita',
        `${explorador ? `¡Vamos, ${explorador}! ` : ''}Sigue las huellitas: cada parada que completes enciende la siguiente.`,
      ),
      h(
        'ol',
        { class: 'mapa__camino' },
        ECOSISTEMAS.map((id) => {
          const eco = ecosistemas[id];
          return h(
            'li',
            { class: `region region--${id}`, 'data-tema': id },
            h(
              'h2',
              { class: 'region__titulo' },
              icono(eco.icono),
              h('a', { href: rutas.ecosistema(id) }, eco.nombre),
            ),
            h(
              'ol',
              { class: 'region__paradas' },
              paradasDe(id).map((p) =>
                tarjetaParada(
                  p,
                  estadoDeParada(paradas, p.id, completadas, modoDocente),
                  posicion(p.id),
                ),
              ),
            ),
          );
        }),
      ),
      terminado || modoDocente
        ? h(
            'a',
            { class: 'boton boton--huellita mapa__final', href: rutas.final },
            icono('🏆'),
            'Aventura completada',
          )
        : h(
            'p',
            { class: 'mapa__meta' },
            icono('🏆'),
            ' Al final del camino te espera una sorpresa.',
          ),
    ),
  };
}
