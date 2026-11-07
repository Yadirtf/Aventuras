import { burbuja, decir } from '../components/burbuja';
import { celebrar } from '../components/celebracion';
import type { JuegoSonidos } from '../content/types';
import { barajar, h, icono } from '../dom';
import { imagen } from '../imagenes';
import { acierto, error, sonidoAnimal } from '../sonido';
import { temporizador } from './comunes';
import type { MontarJuego } from './tipos';

/** Parada 1 de la selva: primero la pausa activa «Despertamos como animales» y luego el sonido misterioso. */
export const sonidos: MontarJuego<JuegoSonidos> = ({ juego, alTerminar }) =>
  h(
    'div',
    { class: 'juego juego--sonidos' },
    despertamos(juego),
    sonidoMisterioso(juego, alTerminar),
  );

function sonidoMisterioso(juego: JuegoSonidos, alTerminar: () => void): HTMLElement {
  const orden = barajar(juego.animales);
  let ronda = 0;
  let resuelta = false;
  const momo = burbuja(
    'momo',
    '¡Shhh! Toquen «Escuchar el sonido» y adivinen qué animal de la selva es.',
    { pose: 'pregunta', vivo: true },
  );
  const contador = h('p', { class: 'sonidos__contador', 'aria-live': 'polite' });

  const escuchar = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--huellita boton--grande sonidos__escuchar',
      onclick: () => {
        const actual = orden[ronda];
        if (!actual) return;
        sonidoAnimal(actual.sonido);
        escuchar.classList.remove('sonidos__escuchar--sonando');
        void escuchar.offsetWidth;
        escuchar.classList.add('sonidos__escuchar--sonando');
      },
    },
    icono('oreja'),
    'Escuchar el sonido',
  );

  const siguiente = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--secundario',
      hidden: true,
      onclick: () => {
        ronda += 1;
        resuelta = false;
        siguiente.hidden = true;
        opciones.forEach((o) => o.classList.remove('sonidos__opcion--bien'));
        pintar();
        decir(momo, '¡Otro sonido misterioso! ¿Qué animal será?', 'pregunta');
        escuchar.focus();
      },
    },
    'Otro sonido',
  );

  const opciones = juego.animales.map((a) =>
    h(
      'button',
      {
        type: 'button',
        class: 'sonidos__opcion',
        'data-sonido': a.sonido,
        onclick: () => {
          const actual = orden[ronda];
          if (!actual || resuelta) return;
          if (a.sonido !== actual.sonido) {
            error();
            decir(
              momo,
              `Mmm, no suena como ${a.nombre.toLowerCase()}. ¡Escuchen otra vez!`,
              'pregunta',
            );
            return;
          }
          resuelta = true;
          acierto();
          opciones
            .find((o) => o.dataset.sonido === a.sonido)
            ?.classList.add('sonidos__opcion--bien');
          const ultima = ronda === orden.length - 1;
          decir(
            momo,
            `¡Era ${a.articulo} ${a.nombre.toLowerCase()}! ${a.dato} Ahora muévanse como ese animal.${ultima ? ' ¡Adivinaron todos los sonidos!' : ''}`,
            'celebracion',
          );
          contador.textContent = `Adivinados: ${ronda + 1} de ${orden.length}`;
          if (ultima) {
            celebrar(parte);
            alTerminar();
          } else siguiente.hidden = false;
        },
      },
      imagen(a.imagen, { clase: 'sonidos__figura', carga: 'eager' }),
      a.nombre,
    ),
  );

  const pintar = () => {
    contador.textContent = `Adivinados: ${ronda} de ${orden.length}`;
  };
  pintar();

  const parte = h(
    'section',
    { class: 'juego__parte' },
    h('h3', null, icono('oreja'), 'El sonido misterioso'),
    momo,
    h('div', { class: 'juego__acciones' }, escuchar, siguiente),
    h(
      'div',
      { class: 'sonidos__opciones', role: 'group', 'aria-label': '¿Qué animal es?' },
      opciones,
    ),
    contador,
  );
  return parte;
}

function despertamos(juego: JuegoSonidos): HTMLElement {
  let indice = 0;
  const reloj = temporizador(juego.segundosMovimiento);
  const tarjeta = h('div', { class: 'movimiento', 'aria-live': 'polite' });
  const pintar = () => {
    const m = juego.movimientos[indice];
    if (!m) return;
    tarjeta.replaceChildren(
      imagen(m.imagen, { clase: 'movimiento__figura', carga: 'eager' }),
      h('p', { class: 'movimiento__nombre' }, `${indice + 1}. ${m.nombre}`),
      h('p', { class: 'movimiento__accion' }, m.accion),
    );
    reloj.reiniciar();
  };
  const empezar = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--huellita',
      onclick: () =>
        reloj.empezar(() => {
          acierto();
          if (indice < juego.movimientos.length - 1) {
            indice += 1;
            pintar();
          }
        }),
    },
    '¡A moverse!',
  );
  const otro = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--secundario',
      onclick: () => {
        reloj.detener();
        indice = (indice + 1) % juego.movimientos.length;
        pintar();
      },
    },
    'Siguiente animal',
  );
  pintar();
  return h(
    'section',
    { class: 'juego__parte' },
    h('h3', null, icono('acrobata'), 'Despertamos como animales'),
    h(
      'p',
      null,
      `Pausa activa: cada animal dura ${juego.segundosMovimiento} segundos. Al terminar el tiempo pasa el siguiente.`,
    ),
    h('div', { class: 'mimica__mesa' }, tarjeta, reloj.elemento),
    h('div', { class: 'juego__acciones' }, empezar, otro),
  );
}
