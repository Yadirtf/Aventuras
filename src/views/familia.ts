import { ecosistemas, personajes, type EcosistemaId } from '../content';
import type { Contexto, Vista } from '../contexto';
import { h, icono } from '../dom';
import { imagen } from '../imagenes';
import { rutas } from '../router';
import { noEncontrada } from './no-encontrada';

/** Tarjeta imprimible para llevar a casa al cerrar un ecosistema. */
export function familia({ store }: Contexto, id: EcosistemaId): Vista {
  const eco = ecosistemas[id];
  if (!eco.familia) return noEncontrada();
  const guia = personajes[eco.guia];

  return {
    titulo: `Tarjeta para la familia: ${eco.nombre}`,
    tema: id,
    contenido: h(
      'article',
      { class: 'familia' },
      h(
        'nav',
        { class: 'ficha__acciones no-imprimir', 'aria-label': 'Acciones de la tarjeta' },
        h('a', { class: 'boton boton--secundario', href: rutas.ecosistema(id) }, '← Volver'),
        h(
          'button',
          { type: 'button', class: 'boton boton--huellita', onclick: () => window.print() },
          icono('impresora'),
          'Imprimir tarjeta',
        ),
      ),
      h(
        'div',
        { class: 'familia__tarjeta' },
        h(
          'div',
          { class: 'familia__figuras', 'aria-hidden': 'true' },
          imagen(guia.imagen, { carga: 'eager' }),
          imagen('familia', { carga: 'eager' }),
        ),
        h(
          'p',
          { class: 'familia__para' },
          'Para la familia de: ',
          h('span', { class: 'familia__linea' }, store.estado.explorador || ' '),
        ),
        h('h1', { tabindex: -1 }, eco.familia.titulo),
        h(
          'ol',
          { class: 'familia__ideas' },
          eco.familia.ideas.map((idea) => h('li', null, idea)),
        ),
        h('p', { class: 'familia__escribir' }, 'Nuestra idea para cuidar el agua en casa:'),
        h('div', { class: 'familia__renglones', 'aria-hidden': 'true' }, h('span'), h('span')),
        h(
          'p',
          { class: 'familia__firma' },
          `Con cariño, ${guia.corto} y los exploradores de 2.° grado`,
        ),
      ),
    ),
  };
}
