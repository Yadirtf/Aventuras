import type { Cuento, PersonajeId } from '../content';
import { personajes } from '../content';
import { h, icono } from '../dom';
import { detenerVoz, hayVoz, leerEnOrden } from '../voz';

/**
 * Un cuento para escuchar: se lee en voz alta párrafo por párrafo y el párrafo que suena
 * se resalta, para que quienes todavía no leen puedan seguirlo.
 */
export function lectura(cuento: Cuento, narrador: PersonajeId): HTMLElement {
  const parrafos = cuento.parrafos.map((p) => h('p', { class: 'lectura__parrafo' }, p));
  let leyendo = false;

  const boton = h('button', { type: 'button', class: 'boton boton--huellita' });
  const pintarBoton = () => {
    boton.replaceChildren(
      icono('altavoz'),
      leyendo ? 'Detener' : `Escuchar el cuento con ${personajes[narrador].corto}`,
    );
    boton.setAttribute('aria-pressed', String(leyendo));
  };
  pintarBoton();

  boton.addEventListener('click', async () => {
    if (leyendo) {
      detenerVoz();
      return;
    }
    leyendo = true;
    pintarBoton();
    await leerEnOrden(
      cuento.parrafos.map((texto) => ({ texto, voz: personajes[narrador] })),
      (i) => parrafos.forEach((p, j) => p.classList.toggle('lectura__parrafo--leyendo', i === j)),
    );
    parrafos.forEach((p) => p.classList.remove('lectura__parrafo--leyendo'));
    leyendo = false;
    pintarBoton();
  });

  return h(
    'article',
    { class: 'lectura' },
    h('h4', { class: 'lectura__titulo' }, cuento.titulo),
    h('p', { class: 'lectura__autora' }, `Cuento de ${cuento.autora}`),
    hayVoz()
      ? h('div', { class: 'juego__acciones' }, boton)
      : h(
          'p',
          { class: 'parada__nota' },
          'Este equipo no puede leer en voz alta: la docente lo lee.',
        ),
    parrafos,
  );
}
