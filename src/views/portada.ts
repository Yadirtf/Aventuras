import { burbuja } from '../components/burbuja';
import type { Contexto, Vista } from '../contexto';
import { h, icono } from '../dom';
import { imagen, type Imagen } from '../imagenes';
import { rutas } from '../router';
import { LARGO_MAXIMO_NOMBRE } from '../state/store';

type Figura = [Imagen, number, number, number]; // imagen, x %, y %, ancho %

const PAISAJES: { clase: string; figuras: Figura[] }[] = [
  {
    clase: 'desierto',
    figuras: [
      ['sol', 8, 6, 26],
      ['cactus', 62, 38, 30],
      ['camello', 10, 50, 44],
      ['lagarto', 66, 74, 20],
    ],
  },
  {
    clase: 'mar',
    figuras: [
      ['pez', 60, 12, 26],
      ['tortuga', 16, 40, 44],
      ['pulpo', 60, 60, 28],
      ['coral', 6, 74, 22],
    ],
  },
  {
    clase: 'selva',
    figuras: [
      ['palmera', 50, 4, 44],
      ['loro', 8, 14, 26],
      ['mono', 14, 48, 40],
      ['rana', 64, 72, 22],
    ],
  },
];

/** Paisaje en tres partes con figuras 3D: desierto, mar y selva. */
export const paisaje = (): HTMLElement =>
  h(
    'div',
    { class: 'paisaje', 'aria-hidden': 'true' },
    PAISAJES.map((p, i) =>
      h(
        'div',
        { class: `paisaje__parte paisaje__parte--${p.clase}` },
        h('div', { class: 'paisaje__suelo' }),
        p.figuras.map(([img, x, y, ancho], j) =>
          h(
            'span',
            {
              class: 'paisaje__figura',
              style: `left:${x}%;top:${y}%;width:${ancho}%;--retraso:${(i * 4 + j) * 0.35}s`,
            },
            imagen(img, { carga: 'eager' }),
          ),
        ),
      ),
    ),
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
      { type: 'submit', class: 'boton boton--huellita boton--grande' },
      icono('huellas'),
      nombre ? 'Seguir la aventura' : 'Comenzar aventura',
    ),
  );

  return {
    titulo: 'Bienvenidos a la aventura',
    tema: 'general',
    contenido: h(
      'section',
      { class: 'portada' },
      h(
        'div',
        { class: 'portada__cabecera' },
        h(
          'h1',
          { class: 'portada__titulo', tabindex: -1 },
          h('span', { class: 'portada__titulo-chico' }, 'El camino de las'),
          h('span', { class: 'portada__titulo-grande' }, 'Aventuras'),
        ),
        h(
          'p',
          { class: 'portada__frase' },
          'Tres ecosistemas, muchas aventuras y un mundo por descubrir',
        ),
      ),
      paisaje(),
      h(
        'div',
        { class: 'portada__inicio' },
        burbuja(
          'huellita',
          nombre
            ? `¡Hola de nuevo, ${nombre}! Tu pasaporte te está esperando.`
            : '¡Hola! Soy Huellita. Antes de salir, escribe el nombre del explorador para su pasaporte.',
        ),
        formulario,
      ),
    ),
  };
}
