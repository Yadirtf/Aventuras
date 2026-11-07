import { burbuja, decir } from '../components/burbuja';
import { celebrar } from '../components/celebracion';
import { ecosistemas } from '../content';
import type { Aterrizaje, EcosistemaNatural, JuegoGlobo, Senal } from '../content/types';
import { barajar, h, icono } from '../dom';
import { imagen, type Imagen } from '../imagenes';
import { acierto, error, fanfarria, musica, senal } from '../sonido';
import { temporizador } from './comunes';
import type { MontarJuego } from './tipos';

const INSTRUMENTO: Record<Senal, { nombre: string; imagen: Imagen }> = {
  tambor: { nombre: 'el tambor', imagen: 'tambor' },
  campana: { nombre: 'la campana', imagen: 'campana' },
  maracas: { nombre: 'las maracas', imagen: 'maracas' },
};

/**
 * Parada final: el gran viaje en globo. Despegue con boleto, tres vuelos en cámara lenta,
 * un aterrizaje por ecosistema (anunciado con su señal sonora) con su misión, y al volver
 * al globo, comparar los tres mundos antes de recibir el diploma.
 */
export const globo: MontarJuego<JuegoGlobo> = ({ juego, store, alTerminar }) => {
  const etapas = [
    'Despegue',
    ...juego.aterrizajes.map((a) => ecosistemas[a.ecosistema].nombre),
    'Regreso',
  ];
  let etapa = 0;
  let detenerMusica: (() => void) | null = null;
  const callar = () => {
    detenerMusica?.();
    detenerMusica = null;
  };

  const progreso = h('ol', { class: 'globo__progreso', 'aria-label': 'Etapas del viaje' });
  const panel = h('div', { class: 'globo__panel' });
  const parte = h(
    'section',
    { class: 'juego__parte globo' },
    h('h3', null, icono('globo'), 'El gran viaje en globo'),
    progreso,
    panel,
  );

  const pintarProgreso = () =>
    progreso.replaceChildren(
      ...etapas.map((nombre, i) =>
        h(
          'li',
          {
            class: `globo__etapa${i < etapa ? ' globo__etapa--hecha' : ''}${i === etapa ? ' globo__etapa--actual' : ''}`,
            ...(i === etapa ? { 'aria-current': 'step' } : {}),
          },
          nombre,
        ),
      ),
    );

  const mostrar = (...contenido: (HTMLElement | false)[]) => {
    callar();
    pintarProgreso();
    panel.replaceChildren(...contenido.filter((c): c is HTMLElement => c !== false));
    panel.querySelector<HTMLElement>('h4')?.setAttribute('tabindex', '-1');
    panel.querySelector<HTMLElement>('h4')?.focus({ preventScroll: true });
  };

  // --- Despegue -----------------------------------------------------------------------
  const despegue = () => {
    etapa = 0;
    mostrar(
      h('h4', { class: 'globo__titulo' }, 'Antes de despegar'),
      h(
        'div',
        { class: 'boleto' },
        imagen('boleto', { clase: 'boleto__figura', carga: 'eager' }),
        h(
          'div',
          null,
          h('p', { class: 'boleto__titulo' }, 'Boleto de viaje'),
          h(
            'p',
            null,
            'Pasajeros: ',
            h('strong', null, store.estado.explorador || 'los exploradores de segundo grado'),
          ),
          h('p', null, 'Destino: el desierto, el fondo del mar y la selva'),
        ),
      ),
      burbuja('huellita', 'Siéntense dentro del globo. Antes de despegar, cuéntenme:', {
        pose: 'pregunta',
      }),
      h(
        'ul',
        { class: 'globo__preguntas' },
        juego.preguntasDespegue.map((p) => h('li', null, p)),
      ),
      h(
        'div',
        { class: 'globo__acuerdos' },
        h('p', null, h('strong', null, 'Acuerdos del viaje:')),
        h(
          'ul',
          null,
          juego.acuerdos.map((a) => h('li', null, a)),
        ),
      ),
      h(
        'div',
        { class: 'juego__acciones' },
        h(
          'button',
          { type: 'button', class: 'boton boton--huellita boton--grande', onclick: () => vuelo(0) },
          icono('globo'),
          '¡Subir al globo y despegar!',
        ),
      ),
    );
  };

  // --- Vuelo y aterrizaje -----------------------------------------------------------------
  const vuelo = (indice: number) => {
    const destino = juego.aterrizajes[indice];
    if (!destino) return regreso();
    etapa = indice + 1;
    const reloj = temporizador(juego.segundosVuelo);
    const cielo = h(
      'div',
      { class: 'cielo', 'aria-hidden': 'true' },
      imagen('nube', { clase: 'cielo__nube cielo__nube--1', carga: 'eager' }),
      imagen('nube', { clase: 'cielo__nube cielo__nube--2', carga: 'eager' }),
      imagen('globo', { clase: 'cielo__globo', carga: 'eager' }),
    );
    const llegar = () => {
      reloj.detener();
      adivinarSenal(destino, indice);
    };
    mostrar(
      h('h4', { class: 'globo__titulo' }, `Vuelo ${indice + 1} de ${juego.aterrizajes.length}`),
      cielo,
      burbuja(
        'huellita',
        '¡Estamos volando! Muévanse en cámara lenta por el salón, como si flotaran en el aire. Cuando suene la señal, aterrizamos.',
        { pose: 'saludo' },
      ),
      h('div', { class: 'mimica__mesa' }, reloj.elemento),
      h(
        'div',
        { class: 'juego__acciones' },
        h(
          'button',
          {
            type: 'button',
            class: 'boton boton--huellita',
            onclick: (e: Event) => {
              (e.currentTarget as HTMLButtonElement).disabled = true;
              detenerMusica = musica('suave');
              reloj.empezar(llegar);
            },
          },
          `Volar ${juego.segundosVuelo} segundos`,
        ),
        h(
          'button',
          { type: 'button', class: 'boton boton--secundario', onclick: llegar },
          'Aterrizar ya',
        ),
      ),
    );
  };

  /** Suena la señal del aterrizaje y el grupo adivina a qué mundo llegó. */
  const adivinarSenal = (destino: Aterrizaje, indice: number) => {
    const guia = burbuja('huellita', '¡Escuchen la señal! ¿Dónde vamos a aterrizar?', {
      pose: 'pregunta',
      vivo: true,
    });
    const opciones = juego.aterrizajes.map((a) =>
      h(
        'button',
        {
          type: 'button',
          class: `globo__destino globo__destino--${a.ecosistema}`,
          onclick: () => {
            if (a.ecosistema !== destino.ecosistema) {
              error();
              decir(
                guia,
                `Esa no es la señal de ${ecosistemas[a.ecosistema].lugar}. ¡Escuchen otra vez!`,
                'pregunta',
              );
              return;
            }
            acierto();
            mision(destino, indice);
          },
        },
        imagen(ecosistemas[a.ecosistema].imagen, {
          clase: 'globo__destino-figura',
          carga: 'eager',
        }),
        h('span', null, ecosistemas[a.ecosistema].nombre),
        h(
          'span',
          { class: 'globo__destino-senal' },
          imagen(INSTRUMENTO[a.senal].imagen, { clase: 'icono', carga: 'eager' }),
          INSTRUMENTO[a.senal].nombre,
        ),
      ),
    );
    mostrar(
      h('h4', { class: 'globo__titulo' }, '¡Señal de aterrizaje!'),
      guia,
      h(
        'div',
        { class: 'juego__acciones' },
        h(
          'button',
          { type: 'button', class: 'boton boton--huellita', onclick: () => senal[destino.senal]() },
          icono('oreja'),
          'Escuchar la señal',
        ),
      ),
      h(
        'div',
        { class: 'globo__destinos', role: 'group', 'aria-label': '¿Dónde aterrizamos?' },
        opciones,
      ),
    );
    senal[destino.senal]();
  };

  // --- Misiones -----------------------------------------------------------------------------
  const mision = (a: Aterrizaje, indice: number) => {
    const eco = ecosistemas[a.ecosistema];
    const guia = burbuja(eco.guia, a.descripcion, { pose: 'saludo', vivo: true });
    const reloj = temporizador(a.minutos * 60);
    const pregunta = h(
      'div',
      { class: 'globo__pregunta', hidden: true },
      burbuja(eco.guia, a.pregunta, { pose: 'pregunta' }),
      h(
        'div',
        { class: 'juego__acciones' },
        h(
          'button',
          {
            type: 'button',
            class: 'boton boton--huellita boton--grande',
            onclick: () => vuelo(indice + 1),
          },
          icono('globo'),
          indice < juego.aterrizajes.length - 1
            ? '¡Volver al globo!'
            : '¡Volver al globo por última vez!',
        ),
      ),
    );
    const cumplida = () => {
      reloj.detener();
      callar();
      fanfarria();
      decir(guia, `¡Misión «${a.mision}» cumplida!`, 'celebracion');
      pregunta.hidden = false;
      celebrar(pregunta);
      pregunta.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const botonMusica =
      a.musica &&
      h(
        'button',
        { type: 'button', class: 'boton boton--secundario', 'aria-pressed': 'false' },
        icono('musica'),
        'Música',
      );
    botonMusica?.addEventListener('click', () => {
      if (detenerMusica) callar();
      else detenerMusica = musica(a.musica ?? 'suave');
      botonMusica.setAttribute('aria-pressed', String(detenerMusica !== null));
    });

    mostrar(
      h(
        'h4',
        { class: `globo__titulo globo__titulo--${a.ecosistema}` },
        imagen(eco.imagen, { clase: 'icono', carga: 'eager' }),
        `${eco.nombre}: misión «${a.mision}»`,
      ),
      guia,
      h(
        'div',
        { class: 'globo__reloj' },
        reloj.elemento,
        h(
          'div',
          { class: 'juego__acciones' },
          h(
            'button',
            { type: 'button', class: 'boton boton--secundario', onclick: () => reloj.empezar() },
            icono('cronometro'),
            `Empezar ${a.minutos} minutos`,
          ),
          botonMusica,
        ),
      ),
      a.modo === 'estatua'
        ? estatuaMusical(a, (fn) => (detenerMusica = fn), callar, cumplida)
        : recorrido(a, cumplida),
      pregunta,
    );
  };

  // --- Regreso: comparar los tres mundos ----------------------------------------------------
  const regreso = () => {
    etapa = etapas.length - 1;
    const columnas = new Map<EcosistemaNatural, HTMLElement>();
    const ayuda = h(
      'p',
      { class: 'rompecabezas__ayuda', 'aria-live': 'polite' },
      'Toquen una tarjeta y luego el mundo donde va.',
    );
    const final = h('div', { class: 'globo__final', hidden: true });
    let elegida: { boton: HTMLButtonElement; ecosistema: EcosistemaNatural } | null = null;
    let colocadas = 0;

    const tarjetas = barajar(juego.caracteristicas).map((c) => {
      const boton = h(
        'button',
        { type: 'button', class: 'globo__tarjeta', 'aria-pressed': 'false' },
        c.texto,
      );
      boton.addEventListener('click', () => {
        elegida = { boton, ecosistema: c.ecosistema };
        mazo
          .querySelectorAll('button')
          .forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
        ayuda.textContent = '¿En qué mundo pasa eso?';
      });
      return boton;
    });
    const mazo = h('div', { class: 'globo__mazo' }, tarjetas);

    const mundos = juego.aterrizajes.map((a) => {
      const eco = ecosistemas[a.ecosistema];
      const lista = h('ul', { class: 'globo__lista' });
      columnas.set(a.ecosistema, lista);
      return h(
        'button',
        {
          type: 'button',
          class: `globo__mundo globo__mundo--${a.ecosistema}`,
          onclick: () => {
            if (!elegida) {
              ayuda.textContent = 'Primero toquen una tarjeta.';
              return;
            }
            if (elegida.ecosistema !== a.ecosistema) {
              error();
              ayuda.textContent = `Mmm… eso no pasa en ${eco.lugar}. ¡Piénsenlo otra vez!`;
              return;
            }
            acierto();
            lista.append(h('li', null, elegida.boton.textContent ?? ''));
            elegida.boton.remove();
            elegida = null;
            colocadas += 1;
            ayuda.textContent = `Van ${colocadas} de ${juego.caracteristicas.length}.`;
            if (colocadas === juego.caracteristicas.length) terminar();
          },
        },
        h(
          'span',
          { class: 'globo__mundo-nombre' },
          imagen(eco.imagen, { clase: 'icono', carga: 'eager' }),
          eco.nombre,
        ),
        lista,
      );
    });

    const terminar = () => {
      ayuda.textContent = '¡Ordenaron todas las tarjetas!';
      final.hidden = false;
      final.replaceChildren(
        h(
          'p',
          { class: 'globo__semejanza' },
          icono('estrella'),
          h('span', null, h('strong', null, 'En los tres mundos: '), juego.semejanza),
        ),
        burbuja('huellita', juego.preguntaFinal, { pose: 'pregunta' }),
        h(
          'button',
          {
            type: 'button',
            class: 'boton boton--huellita boton--grande',
            onclick: (e: Event) => {
              (e.currentTarget as HTMLButtonElement).disabled = true;
              fanfarria();
              celebrar(parte);
              alTerminar();
            },
          },
          icono('medalla'),
          '¡Terminamos el viaje!',
        ),
      );
      celebrar(final);
    };

    mostrar(
      h('h4', { class: 'globo__titulo' }, '¡De vuelta en el globo!'),
      burbuja(
        'huellita',
        'Cuéntenme cuál fue su mundo favorito y qué animal representaron. Ahora, ¿en qué se diferencian los tres mundos? Ordenen las tarjetas.',
        { pose: 'celebracion' },
      ),
      ayuda,
      mazo,
      h('div', { class: 'globo__mundos' }, mundos),
      final,
    );
  };

  despegue();
  return h('div', { class: 'juego juego--globo' }, parte);
};

/** Misión con retos en orden: se marca cada uno cuando el grupo lo hace en el salón. */
function recorrido(a: Aterrizaje, alCumplir: () => void): HTMLElement {
  let hechos = 0;
  const pasos = a.pasos.map((p, i) => {
    const boton = h(
      'button',
      {
        type: 'button',
        class: 'boton boton--chico boton--huellita',
        disabled: i > 0,
        onclick: () => marcar(i),
      },
      '¡Hecho!',
    );
    return h(
      'li',
      { class: 'globo__paso' },
      imagen(p.imagen, { clase: 'globo__paso-figura', carga: 'eager' }),
      h('span', { class: 'globo__paso-texto' }, h('strong', null, `${i + 1}. `), p.texto),
      boton,
    );
  });
  const marcar = (i: number) => {
    if (i !== hechos) return;
    acierto();
    pasos[i]?.classList.add('globo__paso--hecho');
    pasos[i]?.querySelector('button')?.setAttribute('disabled', '');
    hechos += 1;
    const siguiente = pasos[hechos]?.querySelector('button');
    if (siguiente) {
      siguiente.disabled = false;
      siguiente.focus();
    } else alCumplir();
  };
  return h('ol', { class: 'globo__pasos' }, pasos);
}

/**
 * Estatua musical: mientras suena la música se imita al animal; cuando se detiene, ¡estatua!,
 * escondidos entre las plantas. Cada ronda cambia el animal.
 */
function estatuaMusical(
  a: Aterrizaje,
  alSonar: (detener: () => void) => void,
  callar: () => void,
  alCumplir: () => void,
): HTMLElement {
  let ronda = 0;
  let reloj = 0;
  const tarjeta = h('div', { class: 'movimiento estatua', 'aria-live': 'polite' });
  const pintar = (estado: 'listo' | 'bailando' | 'estatua') => {
    const p = a.pasos[ronda];
    if (!p) return;
    tarjeta.dataset.estado = estado;
    tarjeta.replaceChildren(
      imagen(p.imagen, { clase: 'movimiento__figura', carga: 'eager' }),
      h('p', { class: 'movimiento__nombre' }, `Ronda ${ronda + 1} de ${a.pasos.length}`),
      h(
        'p',
        { class: 'movimiento__accion' },
        estado === 'estatua' ? '¡ESTATUA! Quietos, escondidos entre las plantas.' : p.texto,
      ),
    );
  };
  const boton = h(
    'button',
    { type: 'button', class: 'boton boton--huellita boton--grande' },
    '▶ Música',
  );
  boton.addEventListener('click', () => {
    window.clearTimeout(reloj);
    if (tarjeta.dataset.estado === 'estatua') {
      ronda += 1;
      if (ronda >= a.pasos.length) {
        boton.disabled = true;
        alCumplir();
        return;
      }
    }
    pintar('bailando');
    // Rondas rápidas y lentas, como pide la misión.
    alSonar(musica(ronda % 2 === 0 ? 'animada' : 'suave'));
    boton.disabled = true;
    reloj = window.setTimeout(
      () => {
        if (!tarjeta.isConnected) return callar();
        callar();
        pintar('estatua');
        boton.disabled = false;
        boton.textContent =
          ronda < a.pasos.length - 1 ? '▶ Siguiente animal' : '¡Terminar la misión!';
      },
      5000 + Math.random() * 4000,
    );
  });
  pintar('listo');
  return h(
    'div',
    { class: 'estatua__mesa' },
    tarjeta,
    h('div', { class: 'juego__acciones' }, boton),
  );
}
