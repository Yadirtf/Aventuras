import { burbuja, decir } from '../components/burbuja';
import { celebrar } from '../components/celebracion';
import type { JuegoTesoro } from '../content/types';
import { h, icono } from '../dom';
import { imagen, rutaImagen, type Imagen } from '../imagenes';
import { acierto, chapuzon, error, salto } from '../sonido';
import { relevo, temporizador } from './comunes';
import { lienzoDibujo } from './lienzo-dibujo';
import type { MontarJuego } from './tipos';

/** Cada cuánto suben o bajan los tentáculos. */
const RITMO_TENTACULOS_MS = 1300;
/** Cómo se avanza en el salón en cada paso, en orden. */
const MANERAS = ['arrastrándose', 'en cuclillas', 'en cámara lenta'];

const COLORES_HUELLA = [
  { nombre: 'rojo', color: '#e03131' },
  { nombre: 'naranja', color: '#f76707' },
  { nombre: 'verde', color: '#2f9e44' },
  { nombre: 'azul', color: '#1971c2' },
  { nombre: 'morado', color: '#7048e8' },
];
const SELLOS_MARINERO: { nombre: string; imagen: Imagen }[] = [
  { nombre: 'Ancla', imagen: 'ancla' },
  { nombre: 'Concha', imagen: 'concha' },
  { nombre: 'Estrella', imagen: 'estrella' },
  { nombre: 'Pez payaso', imagen: 'pez-tropical' },
];

/** Parada 3 del mar: arrecife de las medusas, cofre y pasaporte que abre el sobre «¿?». */
export const tesoro: MontarJuego<JuegoTesoro> = ({ juego, store, alTerminar }) => {
  const sobre = sobreMisterioso(juego, store.estado.explorador, alTerminar);
  const cofre = cofreDelTesoro(() => {
    sobre.hidden = false;
    sobre.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const arrecife = arrecifeDeMedusas(juego, () => {
    cofre.hidden = false;
    cofre.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  cofre.hidden = true;
  sobre.hidden = true;
  return h('div', { class: 'juego juego--tesoro' }, arrecife, cofre, sobre);
};

// --- El arrecife de las medusas -----------------------------------------------------

function arrecifeDeMedusas(juego: JuegoTesoro, alTerminar: () => void): HTMLElement {
  let posicion = 0;
  let congelado = false;
  let latido = 0;
  const meta = juego.pasos;
  const medusas = burbuja(
    'medusas',
    '¡Ji, ji! Crucen el arrecife cuando nuestros tentáculos estén arriba. Si los rozan… ¡a congelarse!',
    { pose: 'saludo', vivo: true },
  );
  const reloj = temporizador(juego.segundosCongelado);
  reloj.elemento.hidden = true;

  // Las casillas con medusa alternan sus tentáculos; las demás son paso libre.
  const conMedusa = (i: number) => i > 0 && i < meta && i % 2 === 0;
  const casillas = Array.from({ length: meta + 1 }, (_, i) =>
    h(
      'li',
      {
        class: `arrecife__casilla${conMedusa(i) ? ' arrecife__casilla--medusa' : ''}`,
        ...(conMedusa(i) ? { 'data-tentaculo': i % 4 === 0 ? 'arriba' : 'abajo' } : {}),
      },
      conMedusa(i) &&
        h(
          'span',
          { class: 'arrecife__medusa', 'aria-hidden': 'true' },
          imagen('medusa', { carga: 'eager' }),
          h('span', { class: 'arrecife__tentaculo' }),
        ),
      i === meta && imagen('gema', { clase: 'arrecife__meta', carga: 'eager' }),
    ),
  );
  const buzo = h(
    'span',
    { class: 'arrecife__buzo', 'aria-hidden': 'true' },
    imagen('mascara-buceo', { carga: 'eager' }),
  );
  const estado = h('p', { class: 'arrecife__estado', 'aria-live': 'polite' });

  const pintar = () => {
    buzo.style.left = `${((posicion + 0.5) / (meta + 1)) * 100}%`;
    estado.textContent =
      posicion < meta
        ? `Paso ${posicion} de ${meta}. En el salón, avancen ${MANERAS[posicion % MANERAS.length] ?? ''}.`
        : '¡Cruzaron el arrecife!';
  };

  const alternar = () => {
    // Si ya se fue de la parada, se apaga el reloj.
    if (!buzo.isConnected) return window.clearInterval(latido);
    casillas.forEach((c) => {
      if (c.dataset.tentaculo)
        c.dataset.tentaculo = c.dataset.tentaculo === 'arriba' ? 'abajo' : 'arriba';
    });
  };

  const avanzar = () => {
    if (congelado || posicion >= meta) return;
    const siguiente = casillas[posicion + 1];
    if (siguiente?.dataset.tentaculo === 'abajo') {
      congelar();
      return;
    }
    posicion += 1;
    salto();
    pintar();
    if (posicion === meta) {
      window.clearInterval(latido);
      avanzarBoton.disabled = true;
      decir(
        medusas,
        '¡Lo lograron! Ni una cosquilla… bueno, casi. ¡Allá está la gran X!',
        'celebracion',
      );
      acierto();
      alTerminar();
    }
  };

  const congelar = () => {
    congelado = true;
    chapuzon();
    avanzarBoton.disabled = true;
    buzo.classList.add('arrecife__buzo--congelado');
    decir(
      medusas,
      `¡Cosquillas! Rozaron un tentáculo: congélense como estatuas ${juego.segundosCongelado} segundos.`,
      'celebracion',
    );
    reloj.elemento.hidden = false;
    reloj.reiniciar();
    reloj.empezar(() => {
      congelado = false;
      reloj.elemento.hidden = true;
      avanzarBoton.disabled = false;
      buzo.classList.remove('arrecife__buzo--congelado');
      decir(medusas, '¡Ya pueden moverse! Esperen a que suban los tentáculos.', 'pregunta');
      avanzarBoton.focus();
    });
  };

  const avanzarBoton = h(
    'button',
    { type: 'button', class: 'boton boton--huellita boton--grande', onclick: avanzar },
    icono('mascara-buceo'),
    'Avanzar un paso',
  );
  const empezar = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--secundario',
      onclick: () => {
        empezar.hidden = true;
        avanzarBoton.hidden = false;
        latido = window.setInterval(alternar, RITMO_TENTACULOS_MS);
        avanzarBoton.focus();
      },
    },
    'Empezar a cruzar',
  );
  avanzarBoton.hidden = true;

  const camino = h(
    'div',
    {
      class: 'arrecife',
      tabindex: 0,
      'aria-label': 'Arrecife de las medusas. Flecha derecha para avanzar.',
      onkeydown: (e: KeyboardEvent) => {
        if (e.key !== 'ArrowRight' || avanzarBoton.hidden) return;
        e.preventDefault();
        avanzar();
      },
    },
    h('ol', { class: 'arrecife__casillas' }, casillas),
    buzo,
  );
  pintar();

  return h(
    'section',
    { class: 'juego__parte' },
    h('h3', null, icono('medusa'), 'El arrecife de las medusas gigantes'),
    medusas,
    camino,
    estado,
    h('div', { class: 'juego__acciones' }, empezar, avanzarBoton, reloj.elemento),
  );
}

// --- El cofre -----------------------------------------------------------------------

function cofreDelTesoro(alTerminar: () => void): HTMLElement {
  const tortu = burbuja(
    'capitana-tortu',
    '¡La gran X! Aquí está el cofre del tesoro. ¿Lo abrimos?',
    {
      pose: 'pregunta',
      vivo: true,
    },
  );
  const cofre = h(
    'div',
    { class: 'cofre', 'aria-hidden': 'true' },
    h('span', { class: 'cofre__tapa' }),
    h('span', { class: 'cofre__caja' }),
    h('span', { class: 'cofre__brillo' }, imagen('medalla', { carga: 'eager' })),
  );
  const abrir = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--huellita boton--grande',
      onclick: () => {
        abrir.hidden = true;
        cofre.classList.add('cofre--abierto');
        celebrar(parte);
        decir(
          tortu,
          '¡Medallas del mar para toda la tripulación! Y en el fondo… un sobre con un candado mágico. Solo se abre si cada marinero arma su pasaporte de viajero.',
          'celebracion',
        );
        alTerminar();
      },
    },
    icono('candado-abierto'),
    'Abrir el cofre',
  );
  const parte = h(
    'section',
    { class: 'juego__parte' },
    h('h3', null, icono('gema'), 'El cofre del tesoro'),
    tortu,
    cofre,
    abrir,
  );
  return parte;
}

// --- El pasaporte de viajero y el sobre «¿?» ----------------------------------------

/** Huella dibujada en SVG para poder pintarla del color que elijan. */
function huella(color: string): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', 'pasaporte-viajero__huella');
  svg.setAttribute('aria-hidden', 'true');
  const partes: [number, number, number, number][] = [
    [50, 64, 22, 18],
    [24, 38, 9, 12],
    [41, 24, 9, 12],
    [59, 24, 9, 12],
    [76, 38, 9, 12],
  ];
  for (const [cx, cy, rx, ry] of partes) {
    const e = document.createElementNS(ns, 'ellipse');
    e.setAttribute('cx', String(cx));
    e.setAttribute('cy', String(cy));
    e.setAttribute('rx', String(rx));
    e.setAttribute('ry', String(ry));
    e.setAttribute('fill', color);
    svg.append(e);
  }
  return svg;
}

function sobreMisterioso(
  juego: JuegoTesoro,
  explorador: string,
  alTerminar: () => void,
): HTMLElement {
  let color: string | null = null;
  let sello: (typeof SELLOS_MARINERO)[number] | null = null;
  let dibujo = false;

  const nombre = h('input', {
    type: 'text',
    id: 'pasaporte-nombre',
    maxlength: 30,
    autocomplete: 'off',
    value: explorador,
  });
  const vista = h('div', { class: 'pasaporte-viajero', 'aria-live': 'polite' });
  const aviso = h('p', { class: 'pasaporte-viajero__aviso', 'aria-live': 'polite' });

  const pintarVista = () =>
    vista.replaceChildren(
      h('p', { class: 'pasaporte-viajero__titulo' }, 'Pasaporte de viajero'),
      h('p', { class: 'pasaporte-viajero__nombre' }, nombre.value.trim() || 'Nombre del marinero'),
      h(
        'div',
        { class: 'pasaporte-viajero__marcas' },
        color ? huella(color) : h('span', { class: 'pasaporte-viajero__vacio' }, 'Huella'),
        sello
          ? imagen(sello.imagen, {
              clase: 'pasaporte-viajero__sello',
              alt: `Sello: ${sello.nombre}`,
            })
          : h('span', { class: 'pasaporte-viajero__vacio' }, 'Sello'),
      ),
    );
  nombre.addEventListener('input', pintarVista);

  const grupo = <T>(
    etiqueta: string,
    opciones: T[],
    contenido: (o: T) => (Node | string)[],
    nombreDe: (o: T) => string,
    alElegir: (o: T) => void,
  ) => {
    const botones = opciones.map((o) =>
      h(
        'button',
        {
          type: 'button',
          class: 'opcion-pasaporte',
          'aria-pressed': 'false',
          'aria-label': nombreDe(o),
          onclick: (e: Event) => {
            botones.forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget)));
            alElegir(o);
            pintarVista();
          },
        },
        ...contenido(o),
      ),
    );
    return h(
      'div',
      { class: 'opciones-pasaporte', role: 'group', 'aria-label': etiqueta },
      botones,
    );
  };

  const candado = imagen('candado', {
    clase: 'sobre__candado',
    alt: 'Candado cerrado',
    carga: 'eager',
  });
  const carta = h('div', { class: 'sobre__carta', hidden: true });

  const abrirCandado = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--huellita boton--grande',
      onclick: () => {
        const falta = [
          !nombre.value.trim() && 'escribir el nombre',
          !color && 'elegir el color de la huella',
          !sello && 'elegir un sello de marinero',
          !dibujo && 'hacer un dibujo',
        ].filter(Boolean);
        if (falta.length > 0) {
          error();
          aviso.textContent = `El candado sigue cerrado. Falta: ${falta.join(', ')}.`;
          return;
        }
        aviso.textContent = '¡Clic! El candado mágico se abrió.';
        candado.src = rutaImagen('candado-abierto');
        candado.alt = 'Candado abierto';
        abrirCandado.hidden = true;
        carta.hidden = false;
        carta.replaceChildren(
          h('p', { class: 'sobre__interrogacion', 'aria-hidden': 'true' }, '¿?'),
          h('p', { class: 'sobre__invitacion' }, juego.invitacion),
          relevo('capitana-tortu', juego.relevo),
        );
        celebrar(parte);
        alTerminar();
      },
    },
    icono('candado-abierto'),
    'Abrir el candado',
  );

  pintarVista();
  const parte = h(
    'section',
    { class: 'juego__parte' },
    h('h3', null, icono('sobre'), 'El pasaporte de viajero'),
    h('p', null, 'Armen su pasaporte para abrir el candado mágico del sobre.'),
    h(
      'div',
      { class: 'editor-pasaporte' },
      h(
        'div',
        { class: 'editor-pasaporte__campos' },
        h('label', { for: 'pasaporte-nombre' }, 'Nombre del marinero'),
        nombre,
        h('p', { class: 'editor-pasaporte__etiqueta' }, 'Color de la huella'),
        grupo(
          'Color de la huella',
          COLORES_HUELLA,
          (c) => [h('span', { class: 'opcion-pasaporte__color', style: `background:${c.color}` })],
          (c) => `Huella ${c.nombre}`,
          (c) => (color = c.color),
        ),
        h('p', { class: 'editor-pasaporte__etiqueta' }, 'Sello de marinero'),
        grupo(
          'Sello de marinero',
          SELLOS_MARINERO,
          (s) => [imagen(s.imagen, { clase: 'icono', carga: 'eager' })],
          (s) => `Sello ${s.nombre}`,
          (s) => (sello = s),
        ),
      ),
      vista,
    ),
    h('p', { class: 'editor-pasaporte__etiqueta' }, 'Lo que más me gustó del océano'),
    lienzoDibujo({
      nombreArchivo: 'mi-pasaporte-del-mar',
      pegatinas: ['pez-tropical', 'tortuga', 'pulpo', 'concha', 'estrella'],
      papel: ['#e7f5ff', '#a5d8ff'],
      conArena: false,
      alDibujar: () => (dibujo = true),
    }),
    h('div', { class: 'sobre' }, candado, h('span', { class: 'sobre__titulo' }, 'Sobre «¿?»')),
    aviso,
    abrirCandado,
    carta,
  );
  return parte;
}
