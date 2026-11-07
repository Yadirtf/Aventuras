import { ECOSISTEMAS, ecosistemas, paradasDe } from '../content';
import { burbuja } from '../components/burbuja';
import { tarjetaParada } from '../components/tarjeta-parada';
import type { Contexto, Vista } from '../contexto';
import { h, icono } from '../dom';
import { imagen } from '../imagenes';
import { rutas } from '../router';
import { aventuraCompleta, estadoDeParada } from '../state/progreso';

export function mapa({ store, paradas }: Contexto): Vista {
  const completadas = store.completadas;
  const { modoDocente, explorador } = store.estado;
  const posicion = (id: string) => paradas.findIndex((p) => p.id === id) + 1;
  const terminado = aventuraCompleta(paradas, completadas);
  const hechas = paradas.filter((p) => completadas.has(p.id)).length;

  // La meta del camino va junto al gran viaje en globo, que es la última parada.
  const meta =
    terminado || modoDocente
      ? h(
          'a',
          { class: 'boton boton--huellita boton--grande mapa__final', href: rutas.final },
          icono('trofeo'),
          'Aventura completada',
        )
      : h(
          'p',
          { class: 'mapa__meta' },
          icono('regalo'),
          'Al final del camino te espera una sorpresa.',
        );

  return {
    titulo: 'Mapa de exploración',
    tema: 'general',
    contenido: h(
      'section',
      { class: 'mapa' },
      h(
        'header',
        { class: 'mapa__cabecera' },
        h(
          'div',
          { class: 'mapa__titulos' },
          h('h1', { tabindex: -1 }, icono('mapa', 'icono icono--titulo'), 'Mapa de exploración'),
          h(
            'div',
            {
              class: 'mapa__progreso',
              role: 'progressbar',
              'aria-label': 'Huellas completadas',
              'aria-valuemin': 0,
              'aria-valuemax': paradas.length,
              'aria-valuenow': hechas,
            },
            h('span', { class: 'mapa__barra', style: `--avance:${hechas / paradas.length}` }),
            h('span', { class: 'mapa__cuenta' }, `${hechas} de ${paradas.length} huellas`),
          ),
        ),
        burbuja(
          'huellita',
          `${explorador ? `¡Vamos, ${explorador}! ` : ''}Sigue las huellitas: cada parada que completes enciende la siguiente.`,
        ),
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
              'div',
              { class: 'region__cabecera' },
              h(
                'div',
                { class: 'region__figuras', 'aria-hidden': 'true' },
                eco.paisaje.slice(0, 3).map((img) => imagen(img)),
              ),
              h(
                'h2',
                { class: 'region__titulo' },
                h(
                  'a',
                  { href: rutas.ecosistema(id) },
                  eco.nombre,
                  h('span', { class: 'region__lugar' }, eco.lugar),
                ),
              ),
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
            id === 'globo' && meta,
          );
        }),
      ),
    ),
  };
}
