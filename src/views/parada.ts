import {
  buscarParada,
  ecosistemas,
  paradasDe,
  type EcosistemaId,
  type Parada,
  type Paso,
  type RetoMovimiento,
} from '../content';
import { pantallasDe, type Pantalla, type RefPaso } from '../content/pantallas';
import { burbuja } from '../components/burbuja';
import { celebrar } from '../components/celebracion';
import { rinconCalma } from '../components/rincon-calma';
import type { Contexto, Vista } from '../contexto';
import { h, icono, sinMovimiento } from '../dom';
import { imagen } from '../imagenes';
import { montarJuego } from '../juegos';
import { rutas } from '../router';
import { golpeSello, pasarPantalla } from '../sonido';
import { estadoDeParada, siguienteParada } from '../state/progreso';
import { noEncontrada } from './no-encontrada';

export const ID_SELLO = 'sello-conseguido';

/** Lo que se recuerda de una huella en la entrada del historial (sobrevive a recargas). */
interface Recuerdo {
  parada: string;
  pantalla: number;
  /** El sello se acaba de poner: al volver a pintar, se enfoca el anuncio. */
  sellado?: boolean;
}

function recordar(r: Recuerdo): void {
  history.replaceState(r, '');
}

function recuerdoDe(id: string): Recuerdo | null {
  const r = history.state as Partial<Recuerdo> | null;
  return r && r.parada === id && typeof r.pantalla === 'number' ? (r as Recuerdo) : null;
}

/** El reto con el cuerpo: antes del juego (calentamiento) o después, a veces opcional. */
function bloqueMovimiento(m: RetoMovimiento): HTMLElement {
  return h(
    'section',
    {
      class: `parada__bloque parada__movimiento${m.opcional ? ' parada__movimiento--opcional' : ''}`,
    },
    h(
      'h3',
      null,
      icono('acrobata'),
      m.titulo ?? 'Reto de movimiento',
      m.opcional && h('span', { class: 'parada__etiqueta' }, 'Opcional'),
    ),
    m.opcional &&
      h(
        'p',
        { class: 'parada__nota' },
        'La docente decide si lo hacen hoy, según el tiempo y el ánimo del grupo.',
      ),
    h('p', null, m.texto),
    h(
      'p',
      { class: 'parada__tranquilo' },
      h('strong', null, 'Alternativa tranquila: '),
      m.tranquilo,
    ),
  );
}

/** Un paso de la planeación, tal como lo escribió la autora. */
function pasoPlaneacion(paso: Paso): HTMLElement {
  return h(
    'li',
    null,
    paso.titulo && h('strong', null, paso.titulo),
    h('p', null, paso.texto),
    paso.lista &&
      h(
        'ul',
        null,
        paso.lista.map((item) => h('li', null, item)),
      ),
  );
}

const MOMENTOS = { inicio: 'Inicio', desarrollo: 'Desarrollo', cierre: 'Cierre' } as const;

/** Guía para la docente de una pantalla: los pasos de la planeación y atajos para guiar la clase. */
function guiaDocente(
  p: Parada,
  pantalla: Pantalla | null,
  numero: number,
  total: number,
  irA: (n: number) => void,
): HTMLElement {
  const pl = p.planeacion;
  const pasos = (pantalla?.docente ?? (['cierre:0', 'cierre:1'] as RefPaso[]))
    .map((ref) => {
      const [momento, i] = ref.split(':') as [keyof typeof MOMENTOS, string];
      const paso = pl[momento][Number(i)];
      return paso && { momento, paso };
    })
    .filter((x) => !!x);
  // Agrupa los pasos por momento de la clase, en el orden en que aparecen.
  const grupos = new Map<keyof typeof MOMENTOS, Paso[]>();
  for (const { momento, paso } of pasos)
    grupos.set(momento, [...(grupos.get(momento) ?? []), paso]);

  return h(
    'div',
    { class: 'guia-docente' },
    h(
      'p',
      { class: 'guia-docente__donde' },
      `Cómo guiar la pantalla ${numero} de ${total}: `,
      h('strong', null, pantalla?.titulo ?? 'El sello'),
    ),
    pantalla?.movimiento &&
      p.movimiento?.opcional &&
      h(
        'p',
        { class: 'guia-docente__aviso' },
        'Este reto de movimiento es opcional: ustedes deciden si lo hacen hoy.',
      ),
    [...grupos].map(([momento, lista]) => [
      h('h3', null, `${MOMENTOS[momento]} de la clase`),
      h('ol', { class: 'guia-docente__pasos' }, lista.map(pasoPlaneacion)),
    ]),
    h(
      'div',
      { class: 'guia-docente__acciones' },
      h(
        'a',
        {
          class: 'boton boton--secundario boton--chico',
          href: rutas.planeacion(p.ecosistema, p.numero),
        },
        icono('documento'),
        'Ver planeación completa',
      ),
      numero < total &&
        h(
          'button',
          {
            type: 'button',
            class: 'boton boton--secundario boton--chico',
            onclick: () => irA(total - 1),
          },
          icono('medalla'),
          'Ir directo al sello',
        ),
      numero > 1 &&
        h(
          'button',
          { type: 'button', class: 'boton boton--secundario boton--chico', onclick: () => irA(0) },
          '↺ Volver a la primera pantalla',
        ),
    ),
    numero === 1 &&
      h(
        'details',
        { class: 'guia-docente__plan' },
        h('summary', null, 'Objetivo, duración y materiales de la clase'),
        h(
          'dl',
          { class: 'guia-docente__datos' },
          h('dt', null, 'Objetivo'),
          h('dd', null, pl.objetivo),
          h('dt', null, 'Duración'),
          h('dd', null, pl.duracion),
          h('dt', null, 'Materiales'),
          h(
            'dd',
            null,
            h(
              'ul',
              null,
              pl.materiales.map((m) => h('li', null, m)),
            ),
          ),
        ),
      ),
  );
}

/** Diálogo lateral reutilizable (rincón de calma y guía docente). */
function dialogo(
  titulo: string,
  clase: string,
  cuerpo: () => HTMLElement,
): {
  elemento: HTMLDialogElement;
  abrir: () => void;
  cerrar: () => void;
} {
  const contenido = h('div', { class: 'panel__cuerpo' });
  const elemento = h(
    'dialog',
    { class: `panel ${clase}`, 'aria-label': titulo },
    h(
      'div',
      { class: 'panel__cabecera' },
      h('h2', null, titulo),
      h(
        'button',
        {
          type: 'button',
          class: 'boton-icono',
          'aria-label': 'Cerrar',
          onclick: () => elemento.close(),
        },
        '✕',
      ),
    ),
    contenido,
  );
  elemento.addEventListener('click', (e) => e.target === elemento && elemento.close());
  return {
    elemento,
    abrir: () => {
      contenido.replaceChildren(cuerpo());
      elemento.showModal();
    },
    cerrar: () => elemento.close(),
  };
}

/** Lo más que se reduce una pantalla; más chico ya no se lee bien desde el fondo del salón. */
const ESCALA_MINIMA = 0.7;

/**
 * Ajusta el tamaño del contenido para que quepa en la pantalla sin hacer scroll. Si aun
 * reducido no cabe (pantallas muy pequeñas), la pantalla se desplaza por dentro.
 */
function encajar(pantalla: HTMLElement): void {
  const interior = pantalla.firstElementChild as HTMLElement | null;
  if (!interior || pantalla.hidden || pantalla.clientHeight === 0) return;
  const aplicar = (escala: number) => {
    interior.style.zoom = escala < 1 ? escala.toFixed(3) : '';
    // Al reducir se compensa el ancho, para que el contenido siga usando toda la pantalla.
    interior.style.width = escala < 1 ? `${ancho / escala}px` : '';
  };
  interior.style.zoom = '';
  interior.style.width = '';
  const estilo = getComputedStyle(pantalla);
  const disponible =
    pantalla.clientHeight - parseFloat(estilo.paddingTop) - parseFloat(estilo.paddingBottom);
  const ancho = interior.clientWidth;
  const cabe = (escala: number) => {
    aplicar(escala);
    return interior.scrollHeight * escala <= disponible + 1;
  };
  if (cabe(1)) return;
  if (!cabe(ESCALA_MINIMA)) return; // ni así cabe: se desplaza por dentro
  // Búsqueda binaria de la escala más grande que cabe (al reducir, el contenido se reacomoda).
  let [bajo, alto] = [ESCALA_MINIMA, 1];
  for (let i = 0; i < 6; i++) {
    const medio = (bajo + alto) / 2;
    if (cabe(medio)) bajo = medio;
    else alto = medio;
  }
  aplicar(bajo);
}

/**
 * Una huella del camino (parada), contada en pantallas: cada momento de la clase ocupa una
 * pantalla completa, sin scroll, y al final Huellita estampa el sello en el pasaporte.
 */
export function parada(ctx: Contexto, eco: EcosistemaId, numero: number): Vista {
  const p = buscarParada(eco, numero);
  if (!p) return noEncontrada();

  const { store, paradas } = ctx;
  const { modoDocente } = store.estado;
  const estado = estadoDeParada(paradas, p.id, store.completadas, modoDocente);
  const posicion = paradas.indexOf(p) + 1;
  const delTramo = paradasDe(eco).length;
  const siguiente = siguienteParada(paradas, p.id);
  const [guia = 'huellita'] = p.guias;
  const ecosistema = ecosistemas[eco];

  const miga = h(
    'p',
    { class: 'parada__miga' },
    h('a', { href: rutas.ecosistema(eco) }, ecosistema.nombre),
    ` · Huella ${posicion} de ${paradas.length}`,
  );

  if (estado === 'bloqueada') {
    return {
      titulo: p.titulo,
      tema: eco,
      contenido: h(
        'section',
        { class: 'parada parada--bloqueada' },
        h('header', { class: 'parada__encabezado' }, miga, h('h1', { tabindex: -1 }, p.titulo)),
        burbuja(
          'huellita',
          '¡Esta huella todavía está dormida! Completa la anterior para despertarla.',
          { pose: 'pregunta' },
        ),
        h(
          'a',
          { class: 'boton boton--huellita', href: rutas.mapa },
          icono('huellas'),
          'Volver al mapa',
        ),
      ),
    };
  }

  const completada = estado === 'completada';
  const idHuella = p.id;
  const pantallas = pantallasDe(p.id, !!p.movimiento);
  const total = pantallas.length + 1; // + la pantalla del sello
  const recuerdo = recuerdoDe(p.id);
  let actual = Math.min(recuerdo?.pantalla ?? 0, total - 1);
  let juegoTerminado = completada;

  // --- Pantallas de contenido --------------------------------------------------------

  /** Dónde va cada parte del juego cuando termine de cargar. */
  const destinos = new Map<number, HTMLElement>();
  let primeraConJuego: HTMLElement | null = null;
  let ultimaConJuego: HTMLElement | null = null;

  const secciones = pantallas.map((pt, i) => {
    const contenido: (HTMLElement | false | undefined)[] = [];
    const soloLlegada = pt.llegada && !pt.partes && !pt.movimiento;

    if (pt.llegada) {
      contenido.push(
        h(
          'div',
          { class: `pantalla__llegada${soloLlegada ? ' pantalla__llegada--grande' : ''}` },
          burbuja(guia, p.saludo),
          h(
            'div',
            { class: 'pantalla__reto' },
            h('h3', null, icono('control'), 'Reto en pantalla'),
            h('p', null, p.retoPantalla),
          ),
        ),
      );
    }
    if (pt.movimiento && p.movimiento) contenido.push(bloqueMovimiento(p.movimiento));
    if (pt.partes) {
      const caja = h('div', { class: 'pantalla__partes juego' });
      pt.partes.forEach((n) => destinos.set(n, caja));
      if (p.juego) {
        caja.append(
          h(
            'div',
            { class: 'juego juego--cargando', role: 'status' },
            'Huellita está preparando el juego…',
          ),
        );
      }
      primeraConJuego ??= caja;
      ultimaConJuego = caja;
      contenido.push(
        caja,
        h(
          'div',
          { class: 'pantalla__espera', hidden: true },
          imagen('huellas', { clase: 'pantalla__espera-figura', carga: 'eager' }),
          h('p', null, 'Esta parte se abre cuando terminen la anterior.'),
          h(
            'button',
            { type: 'button', class: 'boton boton--secundario', onclick: () => irA(i - 1) },
            '← Ir a la parte anterior',
          ),
        ),
      );
    }
    return h(
      'section',
      {
        class: `pantalla${pt.partes ? ' pantalla--juego' : ''}${pt.movimiento && !pt.partes ? ' pantalla--movimiento' : ''}`,
        'aria-labelledby': `pantalla-${i}`,
        hidden: i !== actual,
      },
      h(
        'div',
        { class: 'pantalla__interior' },
        h(
          'h2',
          { class: 'pantalla__titulo', id: `pantalla-${i}`, tabindex: -1 },
          icono(pt.icono),
          pt.titulo,
        ),
        contenido,
      ),
    );
  });

  // Si ninguna pantalla recibe el juego (o la parada aún no lo tiene), va en la última de contenido.
  if (!primeraConJuego) {
    const caja = h('div', { class: 'pantalla__partes juego' });
    secciones.at(-1)?.firstElementChild?.append(caja);
    primeraConJuego = caja;
    ultimaConJuego = caja;
  }

  // --- El juego: se carga una vez y sus partes se reparten en las pantallas -----------

  /** Pantallas cuyas partes siguen escondidas hasta terminar la anterior. */
  const actualizarEsperas = () => {
    secciones.forEach((s) => {
      const caja = s.querySelector<HTMLElement>('.pantalla__partes');
      const espera = s.querySelector<HTMLElement>('.pantalla__espera');
      if (!caja || !espera) return;
      const partes = [...caja.querySelectorAll<HTMLElement>(':scope > .juego__parte')];
      const dormida = partes.length > 0 && partes.every((x) => x.hidden);
      if (espera.hidden === dormida) espera.hidden = !dormida;
      caja.classList.toggle('pantalla__partes--dormida', dormida);
    });
  };

  const repartir = (juego: HTMLElement) => {
    const cajaCarga = primeraConJuego;
    const partes = [...juego.querySelectorAll<HTMLElement>(':scope > .juego__parte')];
    // El aviso de carga ya fue reemplazado por el juego: se saca de su lugar.
    const clase = juego.className;
    partes.forEach((parte, n) => {
      const caja = destinos.get(n) ?? ultimaConJuego ?? cajaCarga;
      caja?.append(parte);
    });
    for (const caja of new Set([...destinos.values(), cajaCarga, ultimaConJuego])) {
      if (!caja) continue;
      caja.className = `pantalla__partes ${clase}`;
      caja.querySelector(':scope > .juego--cargando')?.remove();
      caja.dataset.partes = String(caja.querySelectorAll(':scope > .juego__parte').length);
    }
    // Si la única parte de una pantalla se llama igual que la pantalla, basta con un título.
    secciones.forEach((sec, i) => {
      const titulos = [...sec.querySelectorAll(':scope .juego__parte > h3')];
      const [unico] = titulos;
      if (titulos.length === 1 && unico?.textContent?.trim() === pantallas[i]?.titulo)
        sec.classList.add('pantalla--titulo-repetido');
    });
    if (juego.children.length === 0) juego.remove();
    else cajaCarga?.prepend(juego); // juegos que no se dividen en partes
    actualizarEsperas();
    // Cuando una parte se abre, se avisa que ya pueden seguir.
    new MutationObserver((cambios) => {
      actualizarEsperas();
      for (const c of cambios) {
        const parte = c.target as HTMLElement;
        if (parte.classList.contains('pantalla__espera') || parte.hidden) continue;
        const dondeEsta = secciones.findIndex((s) => s.contains(parte));
        // Como antes la página bajaba sola hasta la parte nueva, ahora se pasa a su pantalla.
        if (dondeEsta === actual + 1) {
          animarSiguiente();
          const desde = actual;
          window.setTimeout(() => actual === desde && irA(dondeEsta), 1600);
        }
      }
      encajarActual();
    }).observe(raiz, { attributes: true, attributeFilter: ['hidden'], subtree: true });
    encajarActual();
  };

  const juego =
    p.juego &&
    montarJuego(
      p.juego,
      p,
      store,
      () => {
        juegoTerminado = true;
        if (!completada) {
          pasos.at(-1)?.classList.add('huella__paso--listo');
          animarSiguiente();
        }
      },
      repartir,
    );
  if (juego) {
    // montarJuego devuelve un aviso que se reemplaza solo; se coloca donde va la primera parte.
    primeraConJuego.querySelector(':scope > .juego--cargando')?.replaceWith(juego);
  } else {
    primeraConJuego.append(
      h(
        'div',
        { class: 'en-construccion', role: 'note' },
        icono('rompecabezas'),
        'Este juego se está construyendo. Por ahora, hagan el reto en el salón.',
      ),
    );
  }

  // --- Pantalla del sello ---------------------------------------------------------------

  const marca = h(
    'div',
    { class: 'sello-marca', 'aria-hidden': 'true' },
    imagen(p.sello.imagen, { clase: 'sello-marca__figura', carga: 'eager' }),
    h('span', { class: 'sello-marca__nombre' }, p.sello.nombre),
    h('span', { class: 'sello-marca__fecha' }, `Huella ${posicion}`),
  );
  const sellador = h(
    'div',
    { class: 'sellador', 'aria-hidden': 'true' },
    h('span', { class: 'sellador__mango' }),
    h('span', { class: 'sellador__cuello' }),
    h('span', { class: 'sellador__base' }, imagen(p.sello.imagen, { carga: 'eager' })),
  );
  const escena = h(
    'div',
    { class: `sello-escena${completada ? ' sello-escena--puesto' : ''}` },
    h(
      'div',
      { class: 'sello-escena__hoja' },
      h('span', { class: 'sello-escena__titulo' }, 'Pasaporte del Explorador'),
      h('span', { class: 'sello-escena__hueco' }, marca),
      h('span', { class: 'sello-escena__tinta', 'aria-hidden': 'true' }),
    ),
    sellador,
  );

  const sellar = () => {
    botonSello.disabled = true;
    const final = () => {
      recordar({ parada: p.id, pantalla: total - 1, sellado: true });
      store.completar(p.id); // vuelve a pintar la huella, ya sellada
    };
    if (sinMovimiento()) {
      golpeSello();
      celebrar(pantallaSello);
      final();
      return;
    }
    escena.classList.add('sello-escena--sellando');
    window.setTimeout(() => {
      golpeSello();
      escena.classList.add('sello-escena--marcada');
    }, 820);
    window.setTimeout(() => celebrar(pantallaSello), 1000);
    window.setTimeout(final, 2300);
  };

  const botonSello = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--huellita boton--grande',
      onclick: sellar,
    },
    imagen(p.sello.imagen, { clase: 'icono', carga: 'eager' }),
    '¡Lo logramos! Poner el sello',
  );

  const pantallaSello = h(
    'section',
    {
      class: `pantalla pantalla--sello${completada ? ' pantalla--sellada' : ''}`,
      'aria-labelledby': completada ? ID_SELLO : `pantalla-${total - 1}`,
      hidden: actual !== total - 1,
    },
    h(
      'div',
      { class: 'pantalla__interior pantalla__interior--sello' },
      escena,
      completada
        ? h(
            'div',
            { class: 'pantalla__sello-texto' },
            h(
              'h2',
              { id: ID_SELLO, class: 'pantalla__titulo', tabindex: -1 },
              `¡Sello «${p.sello.nombre}» conseguido!`,
            ),
            h(
              'div',
              { class: 'pista' },
              h('h3', null, icono('sobre'), 'Pista para la siguiente aventura'),
              h('p', null, p.pista),
            ),
            h(
              'div',
              { class: 'parada__siguiente' },
              h(
                'a',
                { class: 'boton boton--secundario boton--grande', href: rutas.mapa },
                icono('mapa'),
                'Ir al mapa',
              ),
              siguiente
                ? h(
                    'a',
                    {
                      class: 'boton boton--huellita boton--grande',
                      href: rutas.parada(siguiente.ecosistema, siguiente.numero),
                    },
                    icono('huellas'),
                    'Siguiente huellita',
                  )
                : h(
                    'a',
                    { class: 'boton boton--huellita boton--grande', href: rutas.final },
                    icono('trofeo'),
                    'Ver el final de la aventura',
                  ),
              numero === delTramo &&
                ecosistema.familia &&
                h(
                  'a',
                  { class: 'boton boton--secundario', href: rutas.familia(eco) },
                  icono('familia'),
                  'Tarjeta para la familia',
                ),
            ),
          )
        : h(
            'div',
            { class: 'pantalla__sello-texto' },
            h(
              'h2',
              { id: `pantalla-${total - 1}`, class: 'pantalla__titulo', tabindex: -1 },
              icono('medalla'),
              `¡Terminamos la huella ${posicion}!`,
            ),
            h(
              'p',
              { class: 'pantalla__sello-ayuda' },
              `Cuando terminen los retos, Huellita pone el sello «${p.sello.nombre}» en el pasaporte.`,
            ),
            botonSello,
          ),
    ),
  );

  const todas = [...secciones, pantallaSello];

  // --- Barra de pasos, pie y diálogos ---------------------------------------------------

  const pasos = todas.map((_, i) =>
    h(
      'li',
      { class: 'huella__paso' },
      h(
        'button',
        {
          type: 'button',
          class: 'huella__punto',
          'data-sonido': 'pantalla',
          'aria-label': `Pantalla ${i + 1} de ${total}: ${pantallas[i]?.titulo ?? 'El sello'}`,
          onclick: () => irA(i),
        },
        i === total - 1
          ? imagen(p.sello.imagen, { clase: 'huella__punto-figura', carga: 'eager' })
          : imagen(pantallas[i]?.icono ?? 'huellas', {
              clase: 'huella__punto-figura',
              carga: 'eager',
            }),
      ),
    ),
  );

  const calma = dialogo('Rincón de calma', 'panel--calma', () => rinconCalma(eco));
  const docente = dialogo('Guía docente', 'panel--docente', () =>
    guiaDocente(p, pantallas[actual] ?? null, actual + 1, total, (n) => {
      docente.cerrar();
      irA(n);
    }),
  );

  const anterior = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--secundario huella__anterior',
      'data-sonido': 'pantalla-atras',
      onclick: () => irA(actual - 1),
    },
    '← Anterior',
  );
  const etiquetaSiguiente = h('span', { class: 'huella__siguiente-texto' });
  const botonSiguiente = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--huellita huella__siguiente',
      'data-sonido': 'pantalla',
      onclick: () => irA(actual + 1),
    },
    etiquetaSiguiente,
    h('span', { class: 'huella__siguiente-corto', 'aria-hidden': 'true' }, 'Siguiente'),
    h('span', { class: 'huella__flecha', 'aria-hidden': 'true' }, '→'),
  );

  const pie = h(
    'nav',
    { class: 'huella__pie', 'aria-label': 'Pantallas de la huella' },
    h(
      'div',
      { class: 'huella__pie-grupo' },
      h(
        'a',
        { class: 'boton boton--secundario huella__mapa', href: rutas.mapa },
        icono('mapa'),
        h('span', { class: 'huella__pie-etiqueta' }, 'Mapa'),
      ),
      anterior,
    ),
    h(
      'div',
      { class: 'huella__pie-grupo huella__pie-grupo--centro' },
      h(
        'button',
        { type: 'button', class: 'boton boton--secundario huella__calma', onclick: calma.abrir },
        icono('meditacion'),
        h('span', { class: 'huella__pie-etiqueta' }, 'Rincón de calma'),
      ),
      modoDocente &&
        h(
          'button',
          { type: 'button', class: 'boton boton--docente', onclick: docente.abrir },
          icono('documento'),
          h('span', { class: 'huella__pie-etiqueta' }, 'Guía docente'),
        ),
    ),
    h('div', { class: 'huella__pie-grupo huella__pie-grupo--fin' }, botonSiguiente),
  );

  const escenario = h('div', { class: 'huella__escenario' }, todas);

  const raiz = h(
    'section',
    { class: 'huella parada', 'data-huella': p.id },
    h(
      'header',
      { class: 'huella__cabecera' },
      h('div', { class: 'huella__titulos' }, miga, h('h1', { tabindex: -1 }, p.titulo)),
      h('ol', { class: 'huella__pasos', 'aria-label': 'Pantallas de esta huella' }, pasos),
    ),
    escenario,
    pie,
    calma.elemento,
    docente.elemento,
  );

  // --- Navegación entre pantallas -------------------------------------------------------

  function animarSiguiente(): void {
    botonSiguiente.classList.remove('boton--latido');
    void botonSiguiente.offsetWidth;
    botonSiguiente.classList.add('boton--latido');
  }

  function encajarActual(): void {
    const s = todas[actual];
    if (s) encajar(s);
  }

  function pintarCromo(): void {
    pasos.forEach((paso, i) => {
      paso.classList.toggle('huella__paso--actual', i === actual);
      paso.classList.toggle('huella__paso--hecho', i < actual || (i === total - 1 && completada));
      paso.querySelector('button')?.setAttribute('aria-current', i === actual ? 'step' : 'false');
    });
    anterior.hidden = actual === 0;
    const enSello = actual === total - 1;
    botonSiguiente.hidden = enSello;
    etiquetaSiguiente.textContent =
      actual === total - 2 ? 'Ir al sello' : `Siguiente: ${pantallas[actual + 1]?.titulo ?? ''}`;
    if (actual === total - 2 && juegoTerminado && !completada) animarSiguiente();
    else botonSiguiente.classList.remove('boton--latido');
  }

  function irA(n: number): void {
    const destino = Math.max(0, Math.min(total - 1, n));
    if (destino === actual) return;
    const adelante = destino > actual;
    const saliente = todas[actual];
    const entrante = todas[destino];
    if (!saliente || !entrante) return;
    pasarPantalla(adelante);
    actual = destino;
    recordar({ parada: idHuella, pantalla: actual });

    const lado = adelante ? 'adelante' : 'atras';
    todas.forEach((s) =>
      s.classList.remove(
        'pantalla--sale',
        'pantalla--entra',
        'pantalla--adelante',
        'pantalla--atras',
      ),
    );
    if (sinMovimiento()) {
      saliente.hidden = true;
    } else {
      saliente.classList.add('pantalla--sale', `pantalla--${lado}`);
      window.setTimeout(() => {
        if (todas[actual] !== saliente) saliente.hidden = true;
        saliente.classList.remove('pantalla--sale', 'pantalla--adelante', 'pantalla--atras');
      }, 420);
      entrante.classList.add('pantalla--entra', `pantalla--${lado}`);
    }
    entrante.hidden = false;
    escenario.scrollTop = 0;
    entrante.scrollTop = 0;
    encajar(entrante);
    pintarCromo();
    entrante.querySelector<HTMLElement>('.pantalla__titulo')?.focus({ preventScroll: true });
  }

  pintarCromo();

  // Al montar: encajar, escuchar cambios de tamaño y, si se acaba de sellar, anunciarlo.
  const alMontar = () => {
    if (!raiz.isConnected) return;
    encajarActual();
    let pendiente = 0;
    const reencajar = () => {
      cancelAnimationFrame(pendiente);
      pendiente = requestAnimationFrame(encajarActual);
    };
    const observador = new ResizeObserver(reencajar);
    observador.observe(escenario);
    todas.forEach((s) => s.firstElementChild && observador.observe(s.firstElementChild));
    if (recuerdo?.sellado) {
      recordar({ parada: p.id, pantalla: actual });
      document.getElementById(ID_SELLO)?.focus({ preventScroll: true });
    }
  };
  requestAnimationFrame(alMontar);

  return {
    titulo: p.titulo,
    tema: eco,
    contenido: raiz,
  };
}
