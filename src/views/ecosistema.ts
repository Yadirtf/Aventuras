import { ecosistemas, paradasDe, personajes, type EcosistemaId } from '../content';
import { tarjetaParada } from '../components/tarjeta-parada';
import type { Contexto, Vista } from '../contexto';
import { h, icono } from '../dom';
import { rutas } from '../router';
import { estadoDeParada } from '../state/progreso';

/** Presentación de un ecosistema y sus tres paradas (sección 3 de doc1.txt). */
export function ecosistema({ store, paradas }: Contexto, id: EcosistemaId): Vista {
  const eco = ecosistemas[id];
  const { modoDocente } = store.estado;
  const completadas = store.completadas;

  return {
    titulo: eco.titulo,
    tema: id,
    contenido: h(
      'section',
      { class: 'ecosistema' },
      h('div', { class: 'ecosistema__ilustracion', 'aria-hidden': 'true' }, eco.icono),
      h('h1', { tabindex: -1 }, eco.titulo),
      h('p', { class: 'ecosistema__descripcion' }, eco.descripcion),
      h(
        'dl',
        { class: 'ecosistema__creditos' },
        h('dt', null, 'Guía'),
        h('dd', null, personajes[eco.guia].nombre),
        h('dt', null, 'Guía humana'),
        h('dd', null, eco.autora),
      ),
      h(
        'ol',
        { class: 'region__paradas' },
        paradasDe(id).map((p) =>
          tarjetaParada(
            p,
            estadoDeParada(paradas, p.id, completadas, modoDocente),
            paradas.indexOf(p) + 1,
          ),
        ),
      ),
      modoDocente &&
        h(
          'ul',
          { class: 'enlaces-docente' },
          paradasDe(id).map((p) =>
            h(
              'li',
              null,
              h(
                'a',
                { href: rutas.planeacion(id, p.numero) },
                icono('📄'),
                ` Ver planeación: ${p.titulo}`,
              ),
            ),
          ),
        ),
      h('a', { class: 'boton boton--secundario', href: rutas.mapa }, '← Volver al mapa'),
    ),
  };
}
