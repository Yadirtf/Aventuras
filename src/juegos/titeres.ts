import { burbuja, decir } from '../components/burbuja';
import { celebrar } from '../components/celebracion';
import type { AnimalTitere, EscenaTeatrino, JuegoTiteres } from '../content/types';
import { barajar, h, icono } from '../dom';
import { imagen } from '../imagenes';
import { personajes } from '../content';
import { acierto, error } from '../sonido';
import { hablar, hayVoz, leerEnOrden } from '../voz';
import type { MontarJuego } from './tipos';

/** Parada 2 del desierto: tarjetas, mímica, teatrino y «¿Mito o realidad?». */
export const titeres: MontarJuego<JuegoTiteres> = ({ juego, alTerminar }) =>
  h(
    'div',
    { class: 'juego juego--titeres' },
    tarjetas(juego.animales),
    mimica(juego.animales, juego.segundosMimica),
    teatrino(juego.animales, juego.escenas),
    mitoORealidad(juego, alTerminar),
  );

// --- Tarjetas que se voltean ---------------------------------------------------------

function tarjetas(animales: AnimalTitere[]): HTMLElement {
  return h(
    'section',
    { class: 'juego__parte' },
    h('h3', null, icono('lupa'), '¿Cómo se adaptan?'),
    h(
      'p',
      null,
      'Toquen cada tarjeta para descubrir cómo vive ese animal con tanto calor y tan poca agua.',
    ),
    h(
      'ul',
      { class: 'tarjetas' },
      animales.map((a) => {
        const boton = h(
          'button',
          { type: 'button', class: 'tarjeta', 'aria-pressed': 'false' },
          h(
            'span',
            { class: 'tarjeta__cara tarjeta__cara--frente' },
            imagen(a.imagen, { clase: 'tarjeta__figura' }),
            h('span', { class: 'tarjeta__nombre' }, a.nombre),
          ),
          h(
            'span',
            { class: 'tarjeta__cara tarjeta__cara--reverso' },
            h('strong', null, a.nombre),
            a.adaptacion,
          ),
        );
        boton.addEventListener('click', () =>
          boton.setAttribute('aria-pressed', String(boton.getAttribute('aria-pressed') !== 'true')),
        );
        return h('li', null, boton);
      }),
    ),
  );
}

// --- Mímica con temporizador ---------------------------------------------------------

function mimica(animales: AnimalTitere[], segundos: number): HTMLElement {
  let elegido: AnimalTitere | null = null;
  let reloj = 0;
  let mazo: AnimalTitere[] = [];

  const carta = h(
    'div',
    { class: 'mimica__carta mimica__carta--oculta', 'aria-live': 'polite' },
    h('span', null, '?'),
  );
  const tiempo = h(
    'div',
    { class: 'mimica__tiempo', role: 'timer', 'aria-live': 'off' },
    String(segundos),
  );
  const estado = h(
    'p',
    { class: 'mimica__estado', 'aria-live': 'polite' },
    'Sorteen un animal para el grupo que va a actuar.',
  );

  const mostrar = (visible: boolean) => {
    carta.classList.toggle('mimica__carta--oculta', !visible);
    carta.replaceChildren(
      visible && elegido
        ? h(
            'span',
            null,
            imagen(elegido.imagen, { clase: 'mimica__figura', alt: elegido.nombre }),
            elegido.nombre,
          )
        : h('span', null, '?'),
    );
  };

  const sortear = h('button', { type: 'button', class: 'boton boton--huellita' }, 'Sortear animal');
  const mirar = h(
    'button',
    { type: 'button', class: 'boton boton--secundario', disabled: true },
    'Mirar (solo actores)',
  );
  const empezar = h(
    'button',
    { type: 'button', class: 'boton boton--secundario', disabled: true },
    `Empezar ${segundos} segundos`,
  );
  const revelar = h(
    'button',
    { type: 'button', class: 'boton boton--secundario', disabled: true },
    '¡Revelar!',
  );

  sortear.addEventListener('click', () => {
    window.clearInterval(reloj);
    if (mazo.length === 0) mazo = barajar(animales);
    elegido = mazo.pop() ?? null;
    mostrar(false);
    tiempo.textContent = String(segundos);
    tiempo.style.setProperty('--avance', '0');
    estado.textContent = 'Los actores miran la carta en secreto. ¡Los demás cierran los ojos!';
    mirar.disabled = false;
    empezar.disabled = false;
    revelar.disabled = false;
  });
  let visible = false;
  mirar.addEventListener('click', () => {
    visible = !visible;
    mostrar(visible);
    mirar.textContent = visible ? 'Esconder' : 'Mirar (solo actores)';
  });
  empezar.addEventListener('click', () => {
    visible = false;
    mostrar(false);
    mirar.textContent = 'Mirar (solo actores)';
    let quedan = segundos;
    estado.textContent =
      '¡A actuar sin hablar! Los demás adivinan qué animal es y cómo se las arregla con el calor.';
    window.clearInterval(reloj);
    reloj = window.setInterval(() => {
      quedan -= 1;
      tiempo.textContent = String(quedan);
      tiempo.style.setProperty('--avance', String(1 - quedan / segundos));
      if (quedan <= 0) {
        window.clearInterval(reloj);
        estado.textContent = '¡Tiempo! ¿Qué animal era?';
        error();
      }
    }, 1000);
  });
  revelar.addEventListener('click', () => {
    window.clearInterval(reloj);
    mostrar(true);
    estado.textContent = elegido
      ? `¡Era el ${elegido.nombre.toLowerCase()}! ${elegido.adaptacion}`
      : '';
    acierto();
  });

  return h(
    'section',
    { class: 'juego__parte mimica' },
    h('h3', null, icono('teatro'), `Mímica de ${segundos} segundos`),
    h('div', { class: 'mimica__mesa' }, carta, tiempo),
    estado,
    h('div', { class: 'juego__acciones' }, sortear, mirar, empezar, revelar),
  );
}

// --- Teatrino ------------------------------------------------------------------------

/** Cada títere habla con un tono propio (cambios suaves, para que no suene a robot). */
const VOCES: Record<string, { voz: { tono: number; velocidad: number } }> = {
  camello: personajes['don-camelio'],
  zorro: personajes.dunita,
  lagarto: { voz: { tono: 1.2, velocidad: 1.05 } },
  serpiente: { voz: { tono: 0.95, velocidad: 0.85 } },
  tortuga: { voz: { tono: 1.0, velocidad: 0.8 } },
};
const vozDe = (animal: AnimalTitere) => VOCES[animal.id] ?? personajes.huellita;

interface TitereEnEscena {
  animal: AnimalTitere;
  x: number;
  dice: string;
}

function teatrino(animales: AnimalTitere[], escenas: EscenaTeatrino[]): HTMLElement {
  const elencos = escenas.map((): TitereEnEscena[] => []);
  let escena = 0;
  let seleccionado: TitereEnEscena | null = null;

  const narracion = h('div', { class: 'teatrino__narracion' });
  const escenario = h('div', { class: 'teatrino__escenario' });
  const dialogo = h('div', { class: 'teatrino__dialogo', 'aria-live': 'polite' });
  /** Sube el títere al escenario de la escena actual; si el guion le da una frase, la dice. */
  const subir = (a: AnimalTitere, { hablarAlSubir = true } = {}): TitereEnEscena | null => {
    const elenco = elencos[escena];
    const e = escenas[escena];
    if (!elenco || !e) return null;
    const ya = elenco.find((t) => t.animal.id === a.id);
    if (ya) return ya;
    if (elenco.length >= 5) return null;
    const t: TitereEnEscena = {
      animal: a,
      x: 12 + ((elenco.length * 19) % 80),
      dice: e.dialogos[a.id] ?? '',
    };
    elenco.push(t);
    seleccionado = t;
    pintar();
    if (hablarAlSubir && t.dice) void hablar(t.dice, vozDe(a));
    return t;
  };

  const representar = h(
    'button',
    { type: 'button', class: 'boton boton--huellita' },
    hayVoz() ? '▶ Representar la escena' : '▶ Subir a todos',
  );
  representar.addEventListener('click', async () => {
    const e = escenas[escena];
    const elenco = elencos[escena];
    if (!e || !elenco) return;
    elenco.length = 0;
    seleccionado = null;
    pintar();
    const actores = animales.filter((a) => e.dialogos[a.id]);
    representar.disabled = true;
    // Primero la narradora; luego cada títere sube justo cuando le toca hablar.
    await leerEnOrden(
      [
        { texto: e.narracion, voz: personajes['don-camelio'] },
        ...actores.map((a) => ({ texto: e.dialogos[a.id] ?? '', voz: vozDe(a) })),
      ],
      (i) => {
        const a = actores[i - 1];
        if (a) subir(a, { hablarAlSubir: false });
      },
    );
    representar.disabled = false;
  });

  const pestanas = h('div', {
    class: 'teatrino__pestanas',
    role: 'tablist',
    'aria-label': 'Escenas',
  });

  const pintar = () => {
    const e = escenas[escena];
    if (!e) return;
    narracion.replaceChildren(burbuja('don-camelio', e.narracion, { pose: 'quieto' }));
    representar.hidden = Object.keys(e.dialogos).length === 0;
    pestanas.replaceChildren(
      ...escenas.map((es, i) =>
        h(
          'button',
          {
            type: 'button',
            role: 'tab',
            class: 'teatrino__pestana',
            'aria-selected': String(i === escena),
            onclick: () => {
              escena = i;
              seleccionado = null;
              pintar();
            },
          },
          es.titulo.split(':')[0] ?? es.titulo,
        ),
      ),
    );
    const elenco = elencos[escena] ?? [];
    escenario.replaceChildren(
      h('h4', { class: 'teatrino__titulo' }, e.titulo),
      ...elenco.map((t) => titereEnEscenario(t)),
      ...(elenco.length === 0
        ? [
            h(
              'p',
              { class: 'teatrino__vacio' },
              Object.keys(e.dialogos).length > 0
                ? 'Suban los títeres de la caja: cada uno dirá su parte del guion.'
                : 'Suban los títeres de la caja e inventen qué dice cada uno.',
            ),
          ]
        : []),
    );
    pintarDialogo();
  };

  const titereEnEscenario = (t: TitereEnEscena): HTMLElement => {
    const el = h(
      'button',
      {
        type: 'button',
        class: `titere ${seleccionado === t ? 'titere--elegido' : ''}`,
        style: `left: ${t.x}%`,
        'aria-label': `${t.animal.nombre}${t.dice ? `: dice «${t.dice}»` : ''}. Flechas para moverlo.`,
      },
      t.dice && h('span', { class: 'titere__globo' }, t.dice),
      imagen(t.animal.imagen, { clase: 'titere__figura', carga: 'eager' }),
      h('span', { class: 'titere__palito', 'aria-hidden': 'true' }),
    );
    // Arrastrar con el dedo o el ratón.
    let arrastrando = false;
    let movido = false;
    el.addEventListener('pointerdown', (ev) => {
      arrastrando = true;
      movido = false;
      el.setPointerCapture(ev.pointerId);
    });
    el.addEventListener('pointermove', (ev) => {
      if (!arrastrando) return;
      const caja = escenario.getBoundingClientRect();
      const x = Math.min(92, Math.max(8, ((ev.clientX - caja.left) / caja.width) * 100));
      if (Math.abs(x - t.x) > 1) movido = true;
      t.x = x;
      el.style.left = `${x}%`;
    });
    el.addEventListener('pointerup', () => (arrastrando = false));
    el.addEventListener('click', () => {
      if (movido) return;
      seleccionado = t;
      pintar();
      dialogo.querySelector<HTMLElement>('button, input')?.focus();
    });
    el.addEventListener('keydown', (ev) => {
      if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
      ev.preventDefault();
      t.x = Math.min(92, Math.max(8, t.x + (ev.key === 'ArrowLeft' ? -5 : 5)));
      el.style.left = `${t.x}%`;
    });
    return el;
  };

  const pintarDialogo = () => {
    const e = escenas[escena];
    if (!e || !seleccionado) {
      dialogo.replaceChildren(
        h(
          'p',
          null,
          'Toquen un títere del escenario para elegir qué dice o para que hable otra vez.',
        ),
      );
      return;
    }
    const t = seleccionado;
    const otra = h('input', {
      type: 'text',
      id: 'frase-propia',
      maxlength: 60,
      placeholder: 'Escriban lo que dice',
      autocomplete: 'off',
    });
    const decirFrase = (frase: string) => {
      t.dice = frase;
      pintar();
      void hablar(frase, vozDe(t.animal));
    };
    dialogo.replaceChildren(
      h('p', null, h('strong', null, `¿Qué dice el ${t.animal.nombre.toLowerCase()}?`)),
      ...(t.dice && hayVoz()
        ? [
            h(
              'button',
              {
                type: 'button',
                class: 'boton boton--chico boton--huellita',
                onclick: () => void hablar(t.dice, vozDe(t.animal)),
              },
              imagen('altavoz', { clase: 'icono', carga: 'eager' }),
              '¡Que hable!',
            ),
          ]
        : []),
      h(
        'div',
        { class: 'teatrino__frases' },
        e.frases.map((f) =>
          h(
            'button',
            {
              type: 'button',
              class: 'boton boton--chico boton--secundario',
              onclick: () => decirFrase(f),
            },
            f,
          ),
        ),
      ),
      h(
        'form',
        {
          class: 'teatrino__propia',
          onsubmit: (ev: Event) => {
            ev.preventDefault();
            if (otra.value.trim()) decirFrase(otra.value.trim());
            else pintar();
          },
        },
        h('label', { for: 'frase-propia', class: 'visualmente-oculto' }, 'Frase propia'),
        otra,
        h('button', { type: 'submit', class: 'boton boton--chico' }, 'Decir'),
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'boton boton--chico boton--secundario',
          onclick: () => {
            const elenco = elencos[escena];
            if (elenco) elenco.splice(elenco.indexOf(t), 1);
            seleccionado = null;
            pintar();
          },
        },
        'Bajar del escenario',
      ),
    );
  };

  const caja = h(
    'div',
    { class: 'teatrino__caja', 'aria-label': 'Caja de títeres' },
    animales.map((a) =>
      h(
        'button',
        {
          type: 'button',
          class: 'teatrino__titere-caja',
          onclick: () => void subir(a),
        },
        imagen(a.imagen, { clase: 'icono' }),
        `Subir ${a.nombre.toLowerCase()}`,
      ),
    ),
  );

  pintar();
  return h(
    'section',
    { class: 'juego__parte teatrino' },
    h('h3', null, icono('teatro'), 'El teatrino del desierto'),
    pestanas,
    narracion,
    h('div', { class: 'juego__acciones' }, representar),
    escenario,
    dialogo,
    caja,
  );
}

// --- ¿Mito o realidad? ----------------------------------------------------------------

function mitoORealidad(juego: JuegoTiteres, alTerminar: () => void): HTMLElement {
  let indice = 0;
  let aciertos = 0;
  const camelio = burbuja('don-camelio', '', { pose: 'pregunta', vivo: true });
  const afirmacion = h('p', { class: 'mito__afirmacion' });
  const opciones = h('div', { class: 'mito__opciones' });
  const siguiente = h(
    'button',
    { type: 'button', class: 'boton boton--huellita', hidden: true },
    'Siguiente',
  );
  const parte = h(
    'section',
    { class: 'juego__parte mito' },
    h('h3', null, icono('camello'), '¿Mito o realidad?'),
    camelio,
    afirmacion,
    opciones,
    siguiente,
  );

  const mostrar = () => {
    const m = juego.mitos[indice];
    if (!m) return;
    decir(camelio, 'Mmm… déjenme recordar… ¿Esto es mito o realidad?', 'pregunta');
    afirmacion.textContent = `«${m.texto}»`;
    siguiente.hidden = true;
    opciones.replaceChildren(
      ...[
        { etiqueta: 'Mito', valor: false },
        { etiqueta: 'Realidad', valor: true },
      ].map(({ etiqueta, valor }) =>
        h(
          'button',
          {
            type: 'button',
            class: `boton mito__boton mito__boton--${valor ? 'realidad' : 'mito'}`,
            onclick: () => {
              const bien = valor === m.esRealidad;
              if (bien) {
                aciertos += 1;
                acierto();
              } else error();
              decir(
                camelio,
                `${bien ? '¡Bien pensado! ' : '¡Casi! '}${m.explicacion}`,
                bien ? 'celebracion' : 'pregunta',
              );
              opciones.querySelectorAll('button').forEach((b) => (b.disabled = true));
              siguiente.hidden = false;
              siguiente.textContent = indice < juego.mitos.length - 1 ? 'Siguiente' : 'Terminar';
              siguiente.focus();
            },
          },
          etiqueta,
        ),
      ),
    );
  };

  siguiente.addEventListener('click', () => {
    indice += 1;
    if (indice < juego.mitos.length) {
      mostrar();
      return;
    }
    afirmacion.textContent = '';
    opciones.replaceChildren();
    siguiente.hidden = true;
    decir(
      camelio,
      `¡Descubrieron ${aciertos} de ${juego.mitos.length}! Ya saben más que yo… y eso que soy un camello sabio.`,
      'celebracion',
    );
    celebrar(parte);
    alTerminar();
  });

  mostrar();
  return parte;
}
