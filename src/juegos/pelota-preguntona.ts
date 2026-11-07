import { burbuja, decir } from '../components/burbuja';
import { celebrar } from '../components/celebracion';
import type { JuegoPelotaPreguntona } from '../content/types';
import { h, icono, sinMovimiento } from '../dom';
import { imagen } from '../imagenes';
import { palmada } from '../sonido';
import { LARGO_MAXIMO_NOTA, type Store } from '../state/store';
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

  // --- Mural de ideas ---------------------------------------------------------------
  const clave = (columna: string) => `${parada.id}:${columna}`;
  const columnas = h('div', { class: 'mural__columnas' });
  /** Idea que se está cambiando de columna (con el botón «Mover» o arrastrándola). */
  let moviendo: { columna: string; indice: number } | null = null;

  const mover = (hasta: string) => {
    if (!moviendo) return;
    store.moverNota(clave(moviendo.columna), moviendo.indice, clave(hasta));
    moviendo = null;
    pintarMural();
  };

  const pintarMural = () =>
    columnas.replaceChildren(
      ...juego.columnas.map((c) => {
        const columna = h(
          'section',
          { class: 'mural__columna', 'aria-label': c.nombre },
          h('h4', null, icono(c.imagen), c.nombre),
          h(
            'ul',
            { class: 'mural__notas' },
            store.notas(clave(c.nombre)).map((nota, i) => notaDelMural(c.nombre, nota, i)),
          ),
          moviendo &&
            moviendo.columna !== c.nombre &&
            h(
              'button',
              {
                type: 'button',
                class: 'boton boton--chico mural__pegar-aqui',
                onclick: () => mover(c.nombre),
              },
              `Pasar a ${c.nombre}`,
            ),
        );
        columna.addEventListener('dragover', (e) => e.preventDefault());
        columna.addEventListener('drop', (e) => {
          e.preventDefault();
          mover(c.nombre);
        });
        return columna;
      }),
    );

  const notaDelMural = (columna: string, nota: string, indice: number) => {
    const elegida = moviendo?.columna === columna && moviendo.indice === indice;
    const li = h(
      'li',
      { class: `nota${elegida ? ' nota--moviendo' : ''}`, draggable: 'true' },
      nota,
      h(
        'button',
        {
          type: 'button',
          class: 'nota__mover',
          'aria-label': `Cambiar de columna «${nota}»`,
          'aria-pressed': String(elegida),
          onclick: () => {
            moviendo = elegida ? null : { columna, indice };
            pintarMural();
          },
        },
        '⇄',
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'nota__quitar',
          'aria-label': `Quitar «${nota}»`,
          onclick: () => {
            store.quitarNota(clave(columna), indice);
            moviendo = null;
            pintarMural();
          },
        },
        '×',
      ),
    );
    li.addEventListener('dragstart', () => (moviendo = { columna, indice }));
    return li;
  };
  pintarMural();

  const campo = h('input', {
    type: 'text',
    id: 'idea-mural',
    maxlength: LARGO_MAXIMO_NOTA,
    autocomplete: 'off',
    placeholder: 'Por ejemplo: hace mucho calor',
  });
  const ayudaMural = h('p', { class: 'mural__ayuda', 'aria-live': 'polite' });
  const formulario = h(
    'form',
    {
      class: 'mural__formulario',
      // Con Enter no se pega en ninguna columna: cada idea va donde el grupo decida.
      onsubmit: (e: Event) => {
        e.preventDefault();
        ayudaMural.textContent = campo.value.trim()
          ? 'Ahora toquen la columna donde va esa idea.'
          : '';
      },
    },
    h('label', { for: 'idea-mural' }, 'Escriban una idea y elijan dónde pegarla:'),
    campo,
    h(
      'div',
      { class: 'mural__botones' },
      juego.columnas.map((c) =>
        h(
          'button',
          {
            type: 'button',
            class: 'boton boton--chico',
            onclick: () => {
              if (!campo.value.trim()) {
                ayudaMural.textContent = 'Primero escriban la idea.';
                campo.focus();
                return;
              }
              store.agregarNota(clave(c.nombre), campo.value);
              campo.value = '';
              ayudaMural.textContent = `Pegada en ${c.nombre}. Si quedó en otra columna, muévanla con ⇄.`;
              pintarMural();
              campo.focus();
            },
          },
          icono(c.imagen),
          c.nombre,
        ),
      ),
    ),
    ayudaMural,
  );

  // --- La cuerda de dibujos (el mural del salón) --------------------------------------
  const cuerda = cuerdaDeDibujos(parada.id, store);

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
      h('h3', null, icono('nota'), 'Las ideas del desierto'),
      h('p', null, 'Aquí todas las ideas valen. No se corrige nada: ¡es lo que sabemos hoy!'),
      formulario,
      columnas,
    ),
    h(
      'section',
      { class: 'juego__parte' },
      h('h3', null, icono('paleta'), 'Mi desierto en un dibujo'),
      h(
        'p',
        null,
        'Dibujen el desierto que imaginan. Usen la arena, peguen animales y plantas y, al terminar, cuelguen el dibujo en la cuerda del mural.',
      ),
      lienzoDibujo({
        nombreArchivo: 'mi-desierto',
        pegatinas: ['camello', 'zorro', 'lagarto', 'serpiente', 'cactus', 'sol', 'tortuga'],
        alColgar: (miniatura) => {
          store.colgarDibujo(parada.id, miniatura);
          cuerda.pintar();
          cuerda.elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
        },
      }),
    ),
    cuerda.elemento,
  );
};

/**
 * El mural del desierto: una cuerda con los dibujos colgados con pinzas, sobre un fondo de
 * sol y dunas. Se recorre «como en un museo», un dibujo a la vez.
 */
function cuerdaDeDibujos(
  paradaId: string,
  store: Store,
): { elemento: HTMLElement; pintar: () => void } {
  const lista = h('ol', { class: 'cuerda__dibujos' });
  const vacia = h(
    'p',
    { class: 'cuerda__vacia' },
    'Todavía no hay dibujos colgados. ¡Cuelguen el primero!',
  );
  const museo = h('div', { class: 'cuerda__museo', hidden: true, 'aria-live': 'polite' });
  let enMuseo = 0;

  const pintarMuseo = () => {
    const dibujos = store.dibujos(paradaId);
    const dibujo = dibujos[enMuseo];
    if (!dibujo) {
      museo.hidden = true;
      return;
    }
    museo.replaceChildren(
      h('img', { class: 'cuerda__museo-dibujo', src: dibujo, alt: `Dibujo ${enMuseo + 1}` }),
      h(
        'p',
        null,
        `Dibujo ${enMuseo + 1} de ${dibujos.length}. Mírenlo en silencio, como en un museo.`,
      ),
      h(
        'div',
        { class: 'juego__acciones' },
        h(
          'button',
          {
            type: 'button',
            class: 'boton boton--secundario boton--chico',
            disabled: enMuseo === 0,
            onclick: () => {
              enMuseo -= 1;
              pintarMuseo();
            },
          },
          '← Anterior',
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'boton boton--huellita boton--chico',
            onclick: () => {
              enMuseo += 1;
              if (enMuseo >= dibujos.length) museo.hidden = true;
              else pintarMuseo();
            },
          },
          enMuseo === dibujos.length - 1 ? 'Terminar el recorrido' : 'Siguiente →',
        ),
      ),
    );
  };

  const recorrer = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--secundario',
      onclick: () => {
        enMuseo = 0;
        museo.hidden = false;
        pintarMuseo();
      },
    },
    icono('lupa'),
    'Recorrer la galería',
  );

  const pintar = () => {
    const dibujos = store.dibujos(paradaId);
    vacia.hidden = dibujos.length > 0;
    recorrer.hidden = dibujos.length === 0;
    lista.replaceChildren(
      ...dibujos.map((dibujo, i) =>
        h(
          'li',
          { class: 'cuerda__dibujo', style: `--i:${i}` },
          h('span', { class: 'cuerda__pinza', 'aria-hidden': 'true' }),
          h('img', { src: dibujo, alt: `Dibujo ${i + 1} del mural`, width: 320, height: 200 }),
          h(
            'button',
            {
              type: 'button',
              class: 'nota__quitar cuerda__quitar',
              'aria-label': `Descolgar el dibujo ${i + 1}`,
              onclick: () => {
                store.descolgarDibujo(paradaId, i);
                pintar();
              },
            },
            '×',
          ),
        ),
      ),
    );
  };
  pintar();

  const elemento = h(
    'section',
    { class: 'juego__parte cuerda' },
    h('h3', null, icono('sol'), 'El mural del desierto'),
    h(
      'p',
      null,
      'Cada dibujo se cuelga con pinzas en la cuerda, bajo el gran sol y sobre las dunas. Al final, recorran la galería en fila y en silencio.',
    ),
    h(
      'div',
      { class: 'cuerda__pared' },
      h('span', { class: 'cuerda__sol', 'aria-hidden': 'true' }, imagen('sol', { carga: 'eager' })),
      h('span', { class: 'cuerda__soga', 'aria-hidden': 'true' }),
      lista,
      vacia,
      h('span', { class: 'cuerda__dunas', 'aria-hidden': 'true' }),
    ),
    h('div', { class: 'juego__acciones' }, recorrer),
    museo,
  );
  return { elemento, pintar };
}
