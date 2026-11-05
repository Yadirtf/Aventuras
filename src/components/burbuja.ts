import { personajes, type PersonajeId } from '../content';
import { h, icono } from '../dom';

/** Un personaje que habla. En la fase 2 se suma la voz y la animación. */
export function burbuja(personaje: PersonajeId, texto: string): HTMLElement {
  const p = personajes[personaje];
  return h(
    'figure',
    { class: 'burbuja' },
    icono(p.icono, 'burbuja__personaje'),
    h(
      'blockquote',
      { class: 'burbuja__texto' },
      h('p', null, texto),
      h('figcaption', { class: 'burbuja__autor' }, p.nombre),
    ),
  );
}
