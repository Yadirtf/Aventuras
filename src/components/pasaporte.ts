import { h } from '../dom';
import { imagen } from '../imagenes';
import type { Contexto } from '../contexto';

/** Contenido del panel «Pasaporte del Explorador»: nombre y las 9 casillas de sello. */
export function pasaporte({ store, paradas }: Contexto, alReiniciar: () => void): HTMLElement {
  const completadas = store.completadas;
  const total = paradas.filter((p) => completadas.has(p.id)).length;

  return h(
    'div',
    { class: 'pasaporte' },
    h(
      'p',
      { class: 'pasaporte__nombre' },
      'Explorador: ',
      h('strong', null, store.estado.explorador || 'sin nombre todavía'),
    ),
    h('p', { class: 'pasaporte__cuenta' }, `${total} de ${paradas.length} sellos`),
    h(
      'ol',
      { class: 'pasaporte__sellos' },
      paradas.map((p, i) => {
        const tiene = completadas.has(p.id);
        return h(
          'li',
          { class: `sello ${tiene ? 'sello--puesto' : ''} sello--${p.ecosistema}` },
          tiene
            ? imagen(p.sello.imagen, { clase: 'sello__icono', carga: 'eager' })
            : h('span', { class: 'sello__numero', 'aria-hidden': 'true' }, i + 1),
          h('span', { class: 'sello__nombre' }, tiene ? p.sello.nombre : 'Sin sello'),
          h('span', { class: 'visualmente-oculto' }, `, ${p.titulo}`),
        );
      }),
    ),
    h(
      'button',
      {
        type: 'button',
        class: 'boton boton--secundario',
        onclick: () => {
          if (confirm('¿Borrar el nombre y los sellos para empezar con otro grupo?')) {
            store.empezarDeNuevo();
            alReiniciar();
          }
        },
      },
      'Empezar de nuevo',
    ),
  );
}
