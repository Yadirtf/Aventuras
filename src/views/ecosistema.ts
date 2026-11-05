import { ecosistemas, paradasDe, personajes, type EcosistemaId } from '../content';
import { tarjetaParada } from '../components/tarjeta-parada';
import type { Contexto, Vista } from '../contexto';
import { h, icono } from '../dom';
import { imagen } from '../imagenes';
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
      h(
        'div',
        { class: `ecosistema__ilustracion ecosistema__ilustracion--${id}`, 'aria-hidden': 'true' },
        eco.paisaje.map((img, i) =>
          h(
            'span',
            { class: 'ecosistema__figura', style: `--i:${i}` },
            imagen(img, { carga: 'eager' }),
          ),
        ),
      ),
      h('h1', { tabindex: -1 }, eco.titulo),
      h('p', { class: 'ecosistema__descripcion' }, eco.descripcion),
      h(
        'dl',
        { class: 'ecosistema__creditos' },
        h('dt', null, 'Guía'),
        h(
          'dd',
          null,
          imagen(personajes[eco.guia].imagen, { clase: 'icono' }),
          personajes[eco.guia].nombre,
        ),
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
      eco.familia &&
        h(
          'a',
          { class: 'boton boton--secundario', href: rutas.familia(id) },
          icono('familia'),
          'Tarjeta para la familia',
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
                icono('documento'),
                `Ver planeación: ${p.titulo}`,
              ),
            ),
          ),
        ),
      h('a', { class: 'boton boton--secundario', href: rutas.mapa }, '← Volver al mapa'),
    ),
  };
}
