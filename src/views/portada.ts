import { h, icono } from '../dom';
import { burbuja } from '../components/burbuja';
import type { Contexto, Vista } from '../contexto';
import { rutas } from '../router';
import { LARGO_MAXIMO_NOMBRE } from '../state/store';

/** Paisaje provisional en tres partes; la fase 2 lo reemplaza por la ilustración final. */
export const paisaje = (): HTMLElement =>
  h(
    'div',
    { class: 'paisaje', 'aria-hidden': 'true' },
    h('div', { class: 'paisaje__parte paisaje__parte--desierto' }, '☀️ 🌵 🐪 🦎'),
    h('div', { class: 'paisaje__parte paisaje__parte--mar' }, '🐢 🐠 🐙 🪸'),
    h('div', { class: 'paisaje__parte paisaje__parte--selva' }, '🌴 🐒 🦜 🐸'),
  );

export function portada({ store, router }: Contexto): Vista {
  const nombre = store.estado.explorador;
  const campo = h('input', {
    id: 'nombre-explorador',
    name: 'nombre',
    type: 'text',
    autocomplete: 'off',
    maxlength: LARGO_MAXIMO_NOMBRE,
    placeholder: 'Por ejemplo: Los Jaguares de 2.° A',
    value: nombre,
  });

  const formulario = h(
    'form',
    {
      class: 'portada__formulario',
      onsubmit: (e: Event) => {
        e.preventDefault();
        store.ponerNombre(campo.value);
        router.ir(rutas.mapa);
      },
    },
    h('label', { for: 'nombre-explorador' }, '¿Cómo se llama el explorador o el grupo?'),
    campo,
    h(
      'button',
      { type: 'submit', class: 'boton boton--huellita' },
      icono('🐾'),
      nombre ? 'Seguir la aventura' : 'Comenzar aventura',
    ),
  );

  return {
    titulo: 'Bienvenidos a la aventura',
    tema: 'general',
    contenido: h(
      'section',
      { class: 'portada' },
      paisaje(),
      h('h1', { class: 'portada__titulo', tabindex: -1 }, 'El camino de las aventuras'),
      h(
        'p',
        { class: 'portada__frase' },
        'Tres ecosistemas, muchas aventuras y un mundo por descubrir',
      ),
      burbuja(
        'huellita',
        nombre
          ? `¡Hola de nuevo, ${nombre}! Tu pasaporte te está esperando.`
          : '¡Hola! Soy Huellita. Antes de salir, escribe el nombre del explorador para su pasaporte.',
      ),
      formulario,
    ),
  };
}
