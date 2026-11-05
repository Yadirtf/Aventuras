import type { EcosistemaId } from '../content';
import { h, icono } from '../dom';

const TEXTOS: Record<EcosistemaId, string> = {
  desierto: 'Respiren como las dunas: suben… y bajan.',
  mar: 'Respiren como las olas: vienen… y van.',
  selva: 'Respiren como las hojas con el viento: suben… y bajan.',
};

/** Animación de respiración para el cierre de cada parada (3 respiraciones). */
export function rinconCalma(eco: EcosistemaId): HTMLElement {
  const guia = h('p', { class: 'calma__guia', 'aria-live': 'polite' }, TEXTOS[eco]);
  const circulo = h(
    'div',
    { class: 'calma__circulo', 'aria-hidden': 'true' },
    icono('meditacion', 'calma__figura'),
  );
  let temporizadores: number[] = [];

  const boton = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--secundario',
      onclick: () => {
        temporizadores.forEach(clearTimeout);
        temporizadores = [];
        boton.disabled = true;
        circulo.classList.add('calma__circulo--activo');
        const pasos = ['Inhala…', 'Exhala…', 'Inhala…', 'Exhala…', 'Inhala…', 'Exhala…'];
        pasos.forEach((texto, i) =>
          temporizadores.push(window.setTimeout(() => (guia.textContent = texto), i * 4000)),
        );
        temporizadores.push(
          window.setTimeout(() => {
            guia.textContent = '¡Muy bien! El cuerpo está tranquilo.';
            circulo.classList.remove('calma__circulo--activo');
            boton.disabled = false;
          }, pasos.length * 4000),
        );
      },
    },
    'Respirar juntos',
  );

  return h(
    'section',
    { class: `parada__bloque calma calma--${eco}` },
    h('h2', null, 'Rincón de calma'),
    circulo,
    guia,
    boton,
  );
}
