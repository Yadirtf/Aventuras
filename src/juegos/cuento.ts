import { burbuja, decir } from '../components/burbuja';
import { celebrar } from '../components/celebracion';
import type { JuegoCuento } from '../content/types';
import { h, icono, sinMovimiento } from '../dom';
import { imagen, type Imagen } from '../imagenes';
import { personajes } from '../content';
import { lluvia, trueno, viento } from '../sonido';
import { detenerVoz, hayVoz, leerEnOrden } from '../voz';
import type { MontarJuego } from './tipos';

const EFECTOS: { nombre: string; imagen: Imagen; sonar: () => void; clase: string }[] = [
  { nombre: 'Lluvia', imagen: 'lluvia', sonar: lluvia, clase: 'cuento__escena--lluvia' },
  { nombre: 'Viento', imagen: 'viento', sonar: viento, clase: 'cuento__escena--viento' },
  { nombre: 'Trueno', imagen: 'trueno', sonar: trueno, clase: 'cuento__escena--trueno' },
];

/** Parada 3 de la selva: el cuento en escenas, con su movimiento y la banda sonora de la tormenta. */
export const cuento: MontarJuego<JuegoCuento> = ({ juego, alTerminar }) => {
  let indice = 0;
  let terminado = false;
  const escena = h('div', { class: 'cuento__escena', role: 'img' });
  const narrador = burbuja('momo', '', { pose: 'saludo', vivo: true });
  const texto = h('p', { class: 'cuento__texto' });
  let figuras: HTMLElement[] = [];

  const leer = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--huellita',
      onclick: async () => {
        const e = juego.escenas[indice];
        if (!e) return;
        if (leer.getAttribute('aria-pressed') === 'true') {
          detenerVoz();
          return;
        }
        leer.setAttribute('aria-pressed', 'true');
        leer.textContent = '■ Detener';
        const frases = [...texto.querySelectorAll<HTMLElement>('.cuento__frase')];
        await leerEnOrden(
          e.partes.map((p) => ({ texto: p.texto, voz: personajes.momo })),
          (i) => {
            const parte = e.partes[i];
            frases.forEach((f, j) => f.classList.toggle('cuento__frase--leyendo', j === i));
            figuras.forEach((f) =>
              f.classList.toggle(
                'cuento__figura--activa',
                parte?.figura === 'todas' || f.dataset.figura === parte?.figura,
              ),
            );
          },
        );
        frases.forEach((f) => f.classList.remove('cuento__frase--leyendo'));
        figuras.forEach((f) => f.classList.remove('cuento__figura--activa'));
        leer.setAttribute('aria-pressed', 'false');
        leer.textContent = hayVoz() ? '▶ Leer la escena' : '▶ Mover las figuras';
      },
    },
    hayVoz() ? '▶ Leer la escena' : '▶ Mover las figuras',
  );
  const movimiento = h('p', { class: 'cuento__movimiento' });
  const contador = h('p', { class: 'cuento__contador' });
  const efectos = h('div', {
    class: 'cuento__efectos',
    role: 'group',
    'aria-label': 'Sonidos de la tormenta',
  });

  const efecto = (clase: string) => {
    escena.classList.remove(clase);
    void escena.offsetWidth;
    escena.classList.add(clase);
    window.setTimeout(() => escena.classList.remove(clase), 3000);
  };
  efectos.append(
    ...EFECTOS.map((ef) =>
      h(
        'button',
        {
          type: 'button',
          class: 'boton boton--secundario',
          onclick: () => {
            ef.sonar();
            if (!sinMovimiento()) efecto(ef.clase);
          },
        },
        imagen(ef.imagen, { clase: 'icono', carga: 'eager' }),
        ef.nombre,
      ),
    ),
  );

  const anterior = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--secundario',
      onclick: () => {
        indice -= 1;
        pintar();
      },
    },
    '← Anterior',
  );
  const siguiente = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--huellita',
      onclick: () => {
        if (indice < juego.escenas.length - 1) {
          indice += 1;
          pintar();
          return;
        }
        if (terminado) return;
        terminado = true;
        siguiente.disabled = true;
        decir(
          narrador,
          '¡Fin! Así termina un día de aventuras en la selva. ¡Ustedes le dieron vida con su cuerpo!',
          'celebracion',
        );
        celebrar(parte);
        alTerminar();
      },
    },
    'Siguiente →',
  );

  const pintar = () => {
    const e = juego.escenas[indice];
    if (!e) return;
    escena.className = `cuento__escena cuento__escena--${e.fondo}`;
    escena.setAttribute('aria-label', `Escena ${indice + 1}: ${e.titulo}`);
    detenerVoz();
    figuras = e.figuras.map((f, i) =>
      h(
        'span',
        {
          class: 'cuento__figura',
          'data-figura': f,
          style: `--i:${i};left:${8 + (i * 84) / Math.max(1, e.figuras.length - 1)}%`,
        },
        imagen(f, { carga: 'eager' }),
      ),
    );
    escena.replaceChildren(
      ...figuras,
      h('span', { class: 'cuento__gotas', 'aria-hidden': 'true' }),
    );
    texto.replaceChildren(
      ...e.partes.flatMap((p, i) => [
        i > 0 ? ' ' : '',
        h('span', { class: 'cuento__frase' }, p.texto),
      ]),
    );
    decir(
      narrador,
      indice === juego.escenas.length - 1
        ? '¡La última escena! Toquen «Leer la escena» y miren quién se mueve.'
        : 'Toquen «Leer la escena»: cada animal se mueve cuando lo nombro.',
      indice === juego.escenas.length - 1 ? 'celebracion' : 'saludo',
    );
    movimiento.replaceChildren(h('strong', null, '¡Muévanse! '), e.movimiento);
    contador.textContent = `Escena ${indice + 1} de ${juego.escenas.length}: ${e.titulo}`;
    efectos.hidden = e.fondo !== 'tormenta';
    anterior.disabled = indice === 0;
    siguiente.disabled = terminado;
    siguiente.textContent =
      indice === juego.escenas.length - 1 ? '¡Fin del cuento!' : 'Siguiente →';
  };
  pintar();

  const parte = h(
    'section',
    { class: 'juego__parte cuento' },
    h('h3', null, icono('libro'), juego.titulo),
    contador,
    h('div', { class: 'cuento__marco' }, escena),
    texto,
    h('div', { class: 'juego__acciones' }, leer),
    narrador,
    movimiento,
    efectos,
    h('div', { class: 'juego__acciones' }, anterior, siguiente),
  );
  return h('div', { class: 'juego juego--cuento' }, parte);
};
