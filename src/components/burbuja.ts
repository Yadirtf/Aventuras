import { personajes, type PersonajeId } from '../content';
import { h } from '../dom';
import { imagen } from '../imagenes';
import { hablar, hayVoz } from '../voz';
import { cambiarPose, figuraPersonaje, type Pose } from './personaje';

/**
 * Un personaje que habla: figura, burbuja con el subtítulo siempre visible y botón
 * «Escuchar» que lee el texto con la voz del personaje mientras la figura se mueve.
 */
export function burbuja(
  id: PersonajeId,
  texto: string,
  { pose = 'saludo', vivo = false }: { pose?: Pose; vivo?: boolean } = {},
): HTMLElement {
  const p = personajes[id];
  const figura = figuraPersonaje(id, { pose });
  const parrafo = h('p', { class: 'burbuja__frase' }, texto);

  const escuchar =
    hayVoz() &&
    h(
      'button',
      {
        type: 'button',
        class: 'burbuja__escuchar',
        'aria-label': `Escuchar a ${p.corto}`,
        onclick: async () => {
          figura.classList.add('personaje--hablando');
          await hablar(parrafo.textContent ?? '', p);
          figura.classList.remove('personaje--hablando');
        },
      },
      imagen('altavoz', { clase: 'icono', carga: 'eager' }),
      'Escuchar',
    );

  return h(
    'figure',
    { class: 'burbuja', 'data-personaje': id },
    figura,
    h(
      'blockquote',
      { class: 'burbuja__texto', ...(vivo ? { 'aria-live': 'polite' } : {}) },
      h('figcaption', { class: 'burbuja__autor' }, p.corto),
      parrafo,
      escuchar,
    ),
  );
}

/** Cambia lo que dice una burbuja ya pintada y, si se indica, la pose del personaje. */
export function decir(contenedor: HTMLElement, texto: string, pose?: Pose): void {
  const frase = contenedor.querySelector('.burbuja__frase');
  if (frase) frase.textContent = texto;
  if (pose) cambiarPose(contenedor.querySelector('.personaje'), pose);
}
