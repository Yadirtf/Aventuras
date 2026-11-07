import { burbuja, decir } from '../components/burbuja';
import { celebrar } from '../components/celebracion';
import type { JuegoRally } from '../content/types';
import { h, icono } from '../dom';
import { imagen, type Imagen } from '../imagenes';
import { acierto, error } from '../sonido';
import { rompecabezas } from './rompecabezas';
import type { MontarJuego } from './tipos';

/** Elementos fijos del paisaje que sirven de referencia para las pistas (no se buscan). */
const REFERENCIAS: { imagen: Imagen; x: number; y: number; tamano: number; nombre: string }[] = [
  { imagen: 'sol', x: 91, y: 9, tamano: 13, nombre: 'sol' },
  { imagen: 'roca', x: 17, y: 62, tamano: 13, nombre: 'roca' },
  { imagen: 'palmera', x: 66, y: 50, tamano: 20, nombre: 'palmera' },
  { imagen: 'nube', x: 34, y: 12, tamano: 12, nombre: 'nube' },
];

/** Objetos que despistan: se pueden tocar, pero no están en ninguna pista. */
const DISTRACTORES: { imagen: Imagen; x: number; y: number; nombre: string }[] = [
  { imagen: 'serpiente', x: 30, y: 84, nombre: 'serpiente' },
  { imagen: 'tortuga', x: 90, y: 60, nombre: 'tortuga' },
];

/** Piezas del rompecabezas: 3 columnas × 2 filas. */
const COLUMNAS = 3;
const FILAS = 2;

/** La imagen que se arma: el fondo del mar con figuras 3D. */
function escenaMar(): HTMLElement {
  const figuras: [Imagen, number, number, number][] = [
    ['ola', 6, 4, 26],
    ['tortuga', 40, 28, 30],
    ['pez', 74, 12, 22],
    ['pulpo', 70, 58, 26],
    ['coral', 8, 60, 30],
    ['concha', 44, 74, 16],
    ['delfin', 18, 22, 18],
    ['estrella', 88, 78, 12],
  ];
  return h(
    'div',
    { class: 'escena-mar', 'aria-hidden': 'true' },
    figuras.map(([img, x, y, t]) =>
      h(
        'span',
        { class: 'escena-mar__figura', style: `left:${x}%;top:${y}%;width:${t}%` },
        imagen(img, { carga: 'eager' }),
      ),
    ),
  );
}

/** Parada 3 del desierto: rally de pistas espaciales y rompecabezas del mar. */
export const rally: MontarJuego<JuegoRally> = ({ juego, alTerminar }) => {
  let actual = 0;
  const ganadas: number[] = [];

  const guia = burbuja('don-camelio', '', { pose: 'pregunta', vivo: true });
  const reverso = h('div', { class: 'rompecabezas__reverso', hidden: true });
  const puzzle = rompecabezas({
    columnas: COLUMNAS,
    filas: FILAS,
    escena: escenaMar,
    titulo: 'El rompecabezas misterioso',
    alCompletar: () => {
      reverso.hidden = false;
      reverso.replaceChildren(
        h('p', { class: 'rompecabezas__ayuda' }, 'Miren lo que dice al reverso:'),
        h('p', { class: 'rompecabezas__mensaje' }, icono('sobre'), juego.reverso),
        h(
          'div',
          { class: 'relevo' },
          burbuja('don-camelio', juego.relevo.despedida, { pose: 'celebracion' }),
          burbuja(juego.relevo.siguienteGuia, juego.relevo.respuesta, { pose: 'saludo' }),
        ),
      );
      celebrar(puzzle.elemento);
      alTerminar();
    },
  });
  puzzle.elemento.append(reverso);
  const { pieza } = puzzle;
  const contador = h('p', { class: 'rally__contador', 'aria-live': 'polite' });
  const bolsa = h('ol', { class: 'rally__bolsa', 'aria-label': 'Piezas ganadas' });

  const objetos = juego.pistas.map((p, i) =>
    h(
      'button',
      {
        type: 'button',
        class: 'rally__objeto',
        style: `left:${p.x}%;top:${p.y}%`,
        'aria-label': p.objeto,
        onclick: () => tocar(i),
      },
      imagen(p.imagen, { carga: 'eager' }),
    ),
  );

  const pintarPista = () => {
    const p = juego.pistas[actual];
    if (!p) return;
    decir(guia, `Pista ${actual + 1} de ${juego.pistas.length}: «${p.pista}»`, 'pregunta');
    contador.textContent = `Piezas: ${ganadas.length} de ${juego.pistas.length}`;
  };

  const tocar = (i: number) => {
    const p = juego.pistas[i];
    if (!p) return;
    if (i !== actual) {
      error();
      decir(
        guia,
        i < actual
          ? '¡Ese ya lo encontramos! Lean la pista otra vez.'
          : '¡Ese lo buscaremos después! Lean la pista otra vez.',
        'pregunta',
      );
      return;
    }
    acierto();
    objetos[i]?.classList.add('rally__objeto--encontrado');
    objetos[i]?.setAttribute('disabled', '');
    ganadas.push(i);
    bolsa.append(
      h(
        'li',
        { class: 'rally__pieza-ganada' },
        pieza(i),
        h('span', { class: 'visualmente-oculto' }, `Pieza ${ganadas.length}`),
      ),
    );
    actual += 1;
    if (actual < juego.pistas.length) {
      decir(
        guia,
        `¡Encontraron ${p.objeto === 'gota de agua' ? 'la' : 'el'} ${p.objeto}! Ganaron una pieza.`,
        'celebracion',
      );
      window.setTimeout(pintarPista, 1600);
    } else {
      decir(
        guia,
        '¡Encontraron todo! Ahora armen el rompecabezas con las seis piezas.',
        'celebracion',
      );
      contador.textContent = `Piezas: ${ganadas.length} de ${juego.pistas.length}`;
      puzzle.elemento.hidden = false;
      puzzle.elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const escena = h(
    'div',
    { class: 'escena-desierto' },
    h('div', { class: 'escena-desierto__oasis', 'aria-hidden': 'true' }),
    REFERENCIAS.map((r) =>
      h(
        'span',
        {
          class: 'escena-desierto__referencia',
          style: `left:${r.x}%;top:${r.y}%;width:${r.tamano}%`,
        },
        imagen(r.imagen, { alt: r.nombre, carga: 'eager' }),
      ),
    ),
    DISTRACTORES.map((d) =>
      h(
        'button',
        {
          type: 'button',
          class: 'rally__objeto',
          style: `left:${d.x}%;top:${d.y}%`,
          'aria-label': d.nombre,
          onclick: () => {
            error();
            decir(
              guia,
              `La ${d.nombre} no está en las pistas. ¡Lean la pista otra vez!`,
              'pregunta',
            );
          },
        },
        imagen(d.imagen, { carga: 'eager' }),
      ),
    ),
    objetos,
  );

  pintarPista();

  return h(
    'div',
    { class: 'juego juego--rally' },
    h(
      'section',
      { class: 'juego__parte' },
      h('h3', null, icono('lupa'), 'Rally de pistas'),
      guia,
      escena,
      contador,
      bolsa,
    ),
    puzzle.elemento,
  );
};
