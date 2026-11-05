import { burbuja, decir } from '../components/burbuja';
import { celebrar } from '../components/celebracion';
import type { JuegoPelotaPreguntona } from '../content/types';
import { h, icono, sinMovimiento } from '../dom';
import { imagen } from '../imagenes';
import { palmada } from '../sonido';
import { LARGO_MAXIMO_NOTA } from '../state/store';
import { hablar } from '../voz';
import { personajes } from '../content';
import type { MontarJuego } from './tipos';
import { lienzoDibujo } from './lienzo-dibujo';

const RITMO_MS = 650;

/** Parada 1 del desierto: pelota preguntona, mural de ideas y dibujo «Mi desierto». */
export const pelotaPreguntona: MontarJuego<JuegoPelotaPreguntona> = ({
  juego,
  parada,
  store,
  alTerminar,
}) => {
  const respondidas = new Set<number>();
  let actual = 0;
  let intervalo = 0;

  // --- La pelota preguntona -------------------------------------------------------
  const estaciones = juego.preguntas.map((_, i) =>
    h(
      'li',
      { class: 'ronda__estacion', style: `--angulo: ${(360 / juego.preguntas.length) * i}deg` },
      h('span', { class: 'ronda__numero' }, i + 1),
    ),
  );
  const pelota = imagen('pelota', { clase: 'ronda__pelota', carga: 'eager' });
  const palmas = imagen('aplauso', { clase: 'ronda__palmas', carga: 'eager' });
  const ronda = h(
    'div',
    { class: 'ronda' },
    h('ol', { class: 'ronda__estaciones', 'aria-hidden': 'true' }, estaciones),
    pelota,
    palmas,
  );
  const guia = burbuja(
    'dunita',
    'Presionen «Empezar palmas» y aplaudan al ritmo. Cuando alguien diga «¡Alto!», la pelota se detiene en una pregunta.',
    { vivo: true },
  );

  const moverPelota = () => {
    const angulo = (360 / juego.preguntas.length) * actual;
    ronda.style.setProperty('--pelota', `${angulo}deg`);
    estaciones.forEach((e, i) => e.classList.toggle('ronda__estacion--pelota', i === actual));
  };

  const boton = h('button', { type: 'button', class: 'boton boton--huellita' }, 'Empezar palmas');
  boton.addEventListener('click', () => {
    if (intervalo) {
      window.clearInterval(intervalo);
      intervalo = 0;
      ronda.classList.remove('ronda--girando');
      boton.textContent = 'Empezar palmas';
      const pregunta = juego.preguntas[actual] ?? '';
      respondidas.add(actual);
      estaciones[actual]?.classList.add('ronda__estacion--hecha');
      decir(guia, `Pregunta ${actual + 1}: ${pregunta}`, 'pregunta');
      void hablar(pregunta, personajes.dunita);
      if (respondidas.size === juego.preguntas.length) {
        window.setTimeout(() => {
          decir(
            guia,
            '¡Respondieron todas las preguntas! Ahora peguen sus ideas en el mural.',
            'celebracion',
          );
          celebrar(ronda);
          alTerminar();
        }, 2500);
      }
      return;
    }
    ronda.classList.add('ronda--girando');
    boton.textContent = '¡Alto!';
    decir(guia, '¡Palmas, palmas! La pelota va saltando…', 'saludo');
    intervalo = window.setInterval(() => {
      // salta a una estación al azar distinta de la actual, preferiblemente sin responder
      const pendientes = juego.preguntas
        .map((_, i) => i)
        .filter((i) => i !== actual && !respondidas.has(i));
      const opciones =
        pendientes.length > 0
          ? pendientes
          : juego.preguntas.map((_, i) => i).filter((i) => i !== actual);
      actual = opciones[Math.floor(Math.random() * opciones.length)] ?? 0;
      moverPelota();
      palmada();
      if (!sinMovimiento()) {
        palmas.classList.remove('ronda__palmas--golpe');
        void palmas.offsetWidth;
        palmas.classList.add('ronda__palmas--golpe');
      }
    }, RITMO_MS);
  });
  moverPelota();

  // --- Mural del desierto ------------------------------------------------------------
  const clave = (columna: string) => `${parada.id}:${columna}`;
  const columnas = h('div', { class: 'mural__columnas' });
  const pintarMural = () =>
    columnas.replaceChildren(
      ...juego.columnas.map((c) =>
        h(
          'section',
          { class: 'mural__columna', 'aria-label': c.nombre },
          h('h4', null, icono(c.imagen), c.nombre),
          h(
            'ul',
            { class: 'mural__notas' },
            store.notas(clave(c.nombre)).map((nota, i) =>
              h(
                'li',
                { class: 'nota' },
                nota,
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'nota__quitar',
                    'aria-label': `Quitar «${nota}»`,
                    onclick: () => {
                      store.quitarNota(clave(c.nombre), i);
                      pintarMural();
                    },
                  },
                  '×',
                ),
              ),
            ),
          ),
        ),
      ),
    );
  pintarMural();

  const campo = h('input', {
    type: 'text',
    id: 'idea-mural',
    maxlength: LARGO_MAXIMO_NOTA,
    autocomplete: 'off',
    placeholder: 'Por ejemplo: hace mucho calor',
  });
  const formulario = h(
    'form',
    { class: 'mural__formulario', onsubmit: (e: Event) => e.preventDefault() },
    h('label', { for: 'idea-mural' }, 'Escriban una idea y elijan dónde pegarla:'),
    campo,
    h(
      'div',
      { class: 'mural__botones' },
      juego.columnas.map((c) =>
        h(
          'button',
          {
            type: 'submit',
            class: 'boton boton--chico',
            onclick: () => {
              if (!campo.value.trim()) {
                campo.focus();
                return;
              }
              store.agregarNota(clave(c.nombre), campo.value);
              campo.value = '';
              pintarMural();
              campo.focus();
            },
          },
          icono(c.imagen),
          c.nombre,
        ),
      ),
    ),
  );

  return h(
    'div',
    { class: 'juego juego--pelota' },
    h(
      'section',
      { class: 'juego__parte' },
      h('h3', null, icono('pelota'), 'La pelota preguntona'),
      guia,
      ronda,
      h('div', { class: 'juego__acciones' }, boton),
      h('p', { class: 'juego__progreso', 'aria-live': 'polite' }, ''),
    ),
    h(
      'section',
      { class: 'juego__parte mural' },
      h('h3', null, icono('nota'), 'El mural del desierto'),
      h('p', null, 'Aquí todas las ideas valen. No se corrige nada: ¡es lo que sabemos hoy!'),
      formulario,
      columnas,
    ),
    h(
      'section',
      { class: 'juego__parte' },
      h('h3', null, icono('paleta'), 'Mi desierto en un dibujo'),
      h('p', null, 'Dibujen el desierto que imaginan. Usen la arena y peguen animales y plantas.'),
      lienzoDibujo({
        nombreArchivo: 'mi-desierto',
        pegatinas: ['camello', 'zorro', 'lagarto', 'serpiente', 'cactus', 'sol', 'tortuga'],
      }),
    ),
  );
};
