import { burbuja, decir } from '../components/burbuja';
import { celebrar } from '../components/celebracion';
import type { EstacionId, JuegoCircuito, OrdenMono } from '../content/types';
import { h, icono } from '../dom';
import { imagen } from '../imagenes';
import { acierto, chapuzon, error, salto } from '../sonido';
import { saltoDeAros } from './comunes';
import type { MontarJuego } from './tipos';

/** Cada estación recibe cómo avisar y qué hacer al terminarla. */
interface Estacion {
  avisar: (mensaje: string, pose?: 'celebracion' | 'pregunta') => void;
  listo: () => void;
}

/** Parada 2 de la selva: cuatro estaciones, una tras otra. */
export const circuito: MontarJuego<JuegoCircuito> = ({ juego, alTerminar }) => {
  let actual = 0;
  const hechas = new Set<number>();
  const momo = burbuja('momo', '', { pose: 'saludo', vivo: true });
  const panel = h('div', { class: 'circuito__panel' });
  const progreso = h('ol', { class: 'circuito__progreso', 'aria-label': 'Estaciones' });
  const siguiente = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--huellita',
      hidden: true,
      onclick: () => {
        actual += 1;
        pintar();
      },
    },
    'Siguiente estación',
  );

  const pintarProgreso = () =>
    progreso.replaceChildren(
      ...juego.estaciones.map((e, i) =>
        h(
          'li',
          {
            class: `circuito__paso${hechas.has(i) ? ' circuito__paso--hecho' : ''}${i === actual ? ' circuito__paso--actual' : ''}`,
            ...(i === actual ? { 'aria-current': 'step' } : {}),
          },
          imagen(e.imagen, { clase: 'icono', carga: 'eager' }),
          e.titulo,
        ),
      ),
    );

  const pintar = () => {
    const e = juego.estaciones[actual];
    if (!e) return;
    siguiente.hidden = true;
    pintarProgreso();
    decir(momo, e.instruccion, 'pregunta');
    const entorno: Estacion = {
      avisar: (m, pose) => decir(momo, m, pose),
      listo: () => {
        hechas.add(actual);
        acierto();
        pintarProgreso();
        if (actual < juego.estaciones.length - 1) {
          decir(momo, `¡Estación superada! ¡Uh, uh, ah, ah! Vamos a la siguiente.`, 'celebracion');
          siguiente.hidden = false;
          siguiente.focus();
          return;
        }
        decir(momo, '¡Superaron los cuatro retos! Llegaron al corazón de la selva.', 'celebracion');
        celebrar(parte);
        alTerminar();
      },
    };
    panel.replaceChildren(
      h(
        'h4',
        { class: 'circuito__titulo' },
        imagen(e.imagen, { clase: 'icono', carga: 'eager' }),
        e.titulo,
      ),
      ESTACIONES[e.id](juego, entorno),
    );
  };

  const parte = h(
    'section',
    { class: 'juego__parte circuito' },
    h('h3', null, icono('huellas'), 'El camino de los retos'),
    progreso,
    momo,
    panel,
    siguiente,
  );
  pintar();
  return h('div', { class: 'juego juego--circuito' }, parte);
};

const ESTACIONES: Record<EstacionId, (juego: JuegoCircuito, e: Estacion) => HTMLElement> = {
  rio: rioDeCocodrilos,
  serpientes: caminoDeSerpientes,
  troncos: (juego, e) =>
    h(
      'div',
      { class: 'troncos' },
      saltoDeAros({
        cantidad: juego.aros,
        figura: 'mono',
        etiqueta: 'Aro',
        alAvisar: (m) => e.avisar(m),
        alLlegar: e.listo,
      }).elemento,
    ),
  monos: monosExploradores,
};

// --- El río de los cocodrilos -------------------------------------------------------

function rioDeCocodrilos(juego: JuegoCircuito, e: Estacion): HTMLElement {
  let saltos = 0;
  let reloj = 0;
  const cocodrilo = h(
    'div',
    { class: 'rio__cocodrilo', 'data-estado': 'dormido' },
    imagen('cocodrilo', { carga: 'eager' }),
    h('span', { class: 'rio__zzz', 'aria-hidden': 'true' }, 'Z z z'),
    h('span', { class: 'rio__ojos', 'aria-hidden': 'true' }, '¡Ojos abiertos!'),
  );
  const estado = h('p', { class: 'rio__estado', 'aria-live': 'polite' }, 'Los cocodrilos duermen.');
  const piedras = Array.from({ length: juego.saltosRio }, () =>
    h('span', { class: 'rio__piedra' }),
  );
  const ficha = h(
    'span',
    { class: 'rio__ficha', 'aria-hidden': 'true' },
    imagen('mono', { carga: 'eager' }),
  );

  const cambiar = () => {
    if (!cocodrilo.isConnected) return window.clearTimeout(reloj);
    const despierto = cocodrilo.dataset.estado === 'dormido';
    cocodrilo.dataset.estado = despierto ? 'despierto' : 'dormido';
    estado.textContent = despierto ? '¡Un cocodrilo abrió los ojos!' : 'Los cocodrilos duermen.';
    // Duermen más tiempo del que están despiertos, para que el reto sea posible.
    reloj = window.setTimeout(cambiar, despierto ? 1400 : 2200 + Math.random() * 1200);
  };
  reloj = window.setTimeout(cambiar, 2600);

  const mover = () => {
    ficha.style.left = `${((saltos + 0.5) / (juego.saltosRio + 1)) * 100}%`;
    piedras.forEach((p, i) => p.classList.toggle('rio__piedra--pisada', i < saltos));
  };
  mover();

  const saltar = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--huellita boton--grande',
      onclick: () => {
        if (cocodrilo.dataset.estado === 'despierto') {
          chapuzon();
          e.avisar(
            '¡Shhh! Ese cocodrilo está despierto. Esperen a que cierre los ojos.',
            'pregunta',
          );
          return;
        }
        saltos += 1;
        salto();
        mover();
        if (saltos === juego.saltosRio) {
          window.clearTimeout(reloj);
          saltar.disabled = true;
          e.listo();
        } else e.avisar(`¡Salto perfecto! Van ${saltos} de ${juego.saltosRio}.`, 'celebracion');
      },
    },
    '¡Saltar con los pies juntos!',
  );

  return h(
    'div',
    { class: 'rio' },
    h(
      'div',
      { class: 'rio__agua' },
      cocodrilo,
      h('div', { class: 'rio__piedras' }, piedras),
      ficha,
    ),
    estado,
    saltar,
  );
}

// --- El camino de las serpientes ----------------------------------------------------

function caminoDeSerpientes(juego: JuegoCircuito, e: Estacion): HTMLElement {
  let pasados = 0;
  let ultimoLado: 'izquierda' | 'derecha' | null = null;
  const conos = Array.from({ length: juego.conos }, () => h('li', { class: 'zigzag__cono' }));
  const serpiente = h(
    'span',
    { class: 'zigzag__serpiente', 'aria-hidden': 'true' },
    imagen('serpiente', { carga: 'eager' }),
  );
  const camino = h(
    'div',
    { class: 'zigzag' },
    h('ol', { class: 'zigzag__conos' }, conos),
    serpiente,
  );

  const mover = () => {
    serpiente.style.top = `${(pasados / juego.conos) * 100}%`;
    serpiente.dataset.lado = ultimoLado ?? 'centro';
  };
  mover();

  const pasar = (lado: 'izquierda' | 'derecha') => {
    if (pasados >= juego.conos) return;
    if (lado === ultimoLado) {
      error();
      e.avisar(
        `¡Así no es zigzag! El cono anterior lo pasaron por la ${lado}: este va por el otro lado.`,
        'pregunta',
      );
      return;
    }
    ultimoLado = lado;
    conos[pasados]?.classList.add(`zigzag__cono--${lado}`);
    pasados += 1;
    salto();
    mover();
    if (pasados === juego.conos) {
      botones.forEach((b) => (b.disabled = true));
      e.listo();
    } else e.avisar(`¡Sss! Cono ${pasados} por la ${lado}. ¿Y el siguiente?`, 'celebracion');
  };

  const botones = (['izquierda', 'derecha'] as const).map((lado) =>
    h(
      'button',
      { type: 'button', class: 'boton boton--secundario', onclick: () => pasar(lado) },
      lado === 'izquierda' ? '← Por la izquierda' : 'Por la derecha →',
    ),
  );

  return h(
    'div',
    {
      class: 'serpientes',
      tabindex: 0,
      'aria-label': 'Camino de conos. Flechas izquierda y derecha para pasar cada cono.',
      onkeydown: (ev: KeyboardEvent) => {
        if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
          ev.preventDefault();
          pasar(ev.key === 'ArrowLeft' ? 'izquierda' : 'derecha');
        }
      },
    },
    camino,
    h('div', { class: 'juego__acciones' }, botones),
  );
}

// --- Los monos exploradores ---------------------------------------------------------

const ORDENES: Record<OrdenMono, { frase: string; boton: string; tecla: string }> = {
  arriba: { frase: '¡Mono arriba!', boton: '↑ Arriba', tecla: 'ArrowUp' },
  abajo: { frase: '¡Mono abajo!', boton: '↓ Abajo', tecla: 'ArrowDown' },
  derecha: { frase: '¡Mono a la derecha!', boton: 'Derecha →', tecla: 'ArrowRight' },
  izquierda: { frase: '¡Mono a la izquierda!', boton: '← Izquierda', tecla: 'ArrowLeft' },
};

function monosExploradores(juego: JuegoCircuito, e: Estacion): HTMLElement {
  let indice = 0;
  const orden = h('p', { class: 'monos__orden', 'aria-live': 'assertive' });
  const mono = h(
    'div',
    { class: 'monos__escena' },
    h('span', { class: 'monos__mono', 'data-pose': 'centro' }, imagen('mono', { carga: 'eager' })),
  );
  const figura = mono.firstElementChild as HTMLElement;

  const pintar = () => {
    const o = juego.ordenesMono[indice];
    orden.textContent = o ? ORDENES[o].frase : '';
  };

  const responder = (o: OrdenMono) => {
    const pedida = juego.ordenesMono[indice];
    if (!pedida) return;
    if (o !== pedida) {
      error();
      e.avisar(
        o === 'derecha' || o === 'izquierda'
          ? `¡Ups! Esa es la ${o}. ¡Inténtenlo otra vez!`
          : '¡Ups! Escuchen bien lo que dice Momo.',
        'pregunta',
      );
      return;
    }
    figura.dataset.pose = o;
    salto();
    indice += 1;
    if (indice === juego.ordenesMono.length) {
      orden.textContent = '¡Monos expertos!';
      botones.forEach((b) => (b.disabled = true));
      e.listo();
      return;
    }
    e.avisar(`¡Eso! Van ${indice} de ${juego.ordenesMono.length}.`, 'celebracion');
    pintar();
  };

  const botones = (['izquierda', 'arriba', 'abajo', 'derecha'] as const).map((o) =>
    h(
      'button',
      {
        type: 'button',
        class: 'boton boton--secundario monos__boton',
        onclick: () => responder(o),
      },
      ORDENES[o].boton,
    ),
  );
  pintar();

  return h(
    'div',
    {
      class: 'monos',
      tabindex: 0,
      'aria-label': 'Sigan las órdenes de Momo con los botones o con las flechas del teclado.',
      onkeydown: (ev: KeyboardEvent) => {
        const o = (Object.keys(ORDENES) as OrdenMono[]).find((k) => ORDENES[k].tecla === ev.key);
        if (!o) return;
        ev.preventDefault();
        responder(o);
      },
    },
    orden,
    mono,
    h('div', { class: 'monos__botones' }, botones),
  );
}
