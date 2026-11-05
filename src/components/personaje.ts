import { personajes, type PersonajeId } from '../content';
import { h } from '../dom';
import { imagen } from '../imagenes';

/** Poses de los personajes: se logran animando la figura 3D con CSS. */
export type Pose = 'saludo' | 'celebracion' | 'pregunta' | 'quieto';

export function figuraPersonaje(
  id: PersonajeId,
  {
    pose = 'quieto',
    tamano = 'mediano',
  }: { pose?: Pose; tamano?: 'chico' | 'mediano' | 'grande' } = {},
): HTMLElement {
  return h(
    'span',
    { class: `personaje personaje--${pose} personaje--${tamano}`, 'data-personaje': id },
    imagen(personajes[id].imagen, { clase: 'personaje__figura', carga: 'eager' }),
    pose === 'pregunta' && h('span', { class: 'personaje__globo', 'aria-hidden': 'true' }, '?'),
  );
}

/** Cambia la pose de una figura ya pintada (por ejemplo, celebrar un acierto). */
export function cambiarPose(figura: Element | null, pose: Pose): void {
  if (!(figura instanceof HTMLElement)) return;
  figura.className = figura.className.replace(
    /personaje--(saludo|celebracion|pregunta|quieto)/,
    `personaje--${pose}`,
  );
  figura.querySelector('.personaje__globo')?.remove();
  if (pose === 'pregunta')
    figura.append(h('span', { class: 'personaje__globo', 'aria-hidden': 'true' }, '?'));
}
