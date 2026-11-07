import { barajar, h, icono } from '../dom';
import { acierto, error } from '../sonido';

/**
 * Rompecabezas de una escena hecha con figuras: cada pieza muestra su porción de la escena.
 * Se arma tocando una pieza y luego su lugar (funciona con dedo, ratón y teclado).
 */
export function rompecabezas({
  columnas,
  filas,
  escena,
  titulo,
  alCompletar,
}: {
  columnas: number;
  filas: number;
  /** Crea la escena completa; se llama una vez por pieza. */
  escena: () => HTMLElement;
  titulo: string;
  alCompletar: () => void;
}): { elemento: HTMLElement; pieza: (indice: number) => HTMLElement } {
  const total = columnas * filas;

  const pieza = (indice: number): HTMLElement => {
    const recorte = h('span', { class: 'pieza__recorte', 'aria-hidden': 'true' }, escena());
    recorte.style.setProperty('--col', String(indice % columnas));
    recorte.style.setProperty('--fila', String(Math.floor(indice / columnas)));
    recorte.style.setProperty('--columnas', String(columnas));
    recorte.style.setProperty('--filas', String(filas));
    return recorte;
  };

  let elegida: number | null = null;
  const colocadas = new Set<number>();
  const bandeja = h('div', { class: 'rompecabezas__bandeja', 'aria-label': 'Piezas sueltas' });
  const tablero = h('div', { class: 'rompecabezas__tablero', style: `--columnas:${columnas}` });
  const ayuda = h(
    'p',
    { class: 'rompecabezas__ayuda', 'aria-live': 'polite' },
    'Toquen una pieza y luego el lugar donde va.',
  );

  const casillas = Array.from({ length: total }, (_, i) =>
    h('button', {
      type: 'button',
      class: 'rompecabezas__casilla',
      'aria-label': `Lugar ${i + 1}`,
      onclick: () => colocar(i),
    }),
  );
  tablero.append(...casillas);

  bandeja.append(
    ...barajar(Array.from({ length: total }, (_, i) => i)).map((i) => {
      const b = h(
        'button',
        {
          type: 'button',
          class: 'rompecabezas__pieza',
          'aria-label': `Pieza ${i + 1}`,
          'aria-pressed': 'false',
          'data-pieza': i,
        },
        pieza(i),
      );
      b.addEventListener('click', () => {
        elegida = i;
        bandeja
          .querySelectorAll('button')
          .forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        ayuda.textContent = 'Ahora toquen el lugar donde va esa pieza.';
      });
      return b;
    }),
  );

  const colocar = (lugar: number) => {
    if (elegida === null || colocadas.has(lugar)) return;
    if (elegida !== lugar) {
      error();
      ayuda.textContent = 'Esa pieza va en otro lugar. ¡Miren los bordes del dibujo!';
      return;
    }
    acierto();
    colocadas.add(lugar);
    const casilla = casillas[lugar];
    casilla?.replaceChildren(pieza(lugar));
    casilla?.setAttribute('disabled', '');
    casilla?.classList.add('rompecabezas__casilla--llena');
    bandeja.querySelector(`[data-pieza="${elegida}"]`)?.remove();
    elegida = null;
    ayuda.textContent = `Van ${colocadas.size} de ${total} piezas.`;
    if (colocadas.size === total) {
      tablero.classList.add('rompecabezas__tablero--completo');
      ayuda.textContent = '¡Rompecabezas completo!';
      alCompletar();
    }
  };

  const elemento = h(
    'section',
    { class: 'juego__parte rompecabezas', hidden: true },
    h('h3', null, icono('rompecabezas'), titulo),
    ayuda,
    tablero,
    bandeja,
  );
  return { elemento, pieza };
}
