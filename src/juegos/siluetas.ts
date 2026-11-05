import { burbuja, decir } from '../components/burbuja';
import { celebrar } from '../components/celebracion';
import type { AnimalMarino, Dieta, JuegoSiluetas } from '../content/types';
import { barajar, h, icono } from '../dom';
import { imagen, type Imagen } from '../imagenes';
import { acierto, error } from '../sonido';
import type { MontarJuego } from './tipos';

/** «el tiburón», «la tortuga marina». */
const conArticulo = (a: AnimalMarino) => `${a.articulo} ${a.nombre.toLowerCase()}`;

const mayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const DIETAS: Record<Dieta, { nombre: string; explicacion: string; imagen: Imagen }> = {
  herbivoro: { nombre: 'Herbívoro', explicacion: 'come plantas', imagen: 'algas' },
  carnivoro: { nombre: 'Carnívoro', explicacion: 'come carne', imagen: 'pez' },
  omnivoro: { nombre: 'Omnívoro', explicacion: 'come de todo', imagen: 'plancton' },
};

/** Parada 1 del mar: siluetas, «¿Qué comen?» y «¡A comer!», una tras otra. */
export const siluetas: MontarJuego<JuegoSiluetas> = ({ juego, alTerminar }) => {
  const comida = aComer(juego, alTerminar);
  const dietas = queComen(juego.animales, () => {
    comida.hidden = false;
    comida.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const sombras = sombrasDelMar(juego.animales, () => {
    dietas.hidden = false;
    dietas.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  dietas.hidden = true;
  comida.hidden = true;
  return h('div', { class: 'juego juego--siluetas' }, sombras, dietas, comida);
};

// --- Siluetas -----------------------------------------------------------------------

function sombrasDelMar(animales: AnimalMarino[], alTerminar: () => void): HTMLElement {
  let elegido: AnimalMarino | null = null;
  const ubicados = new Set<string>();
  const tortu = burbuja(
    'capitana-tortu',
    '¿A qué animal pertenece cada sombra? Toquen un animal y luego su sombra, o arrástrenlo hasta ella.',
    { pose: 'pregunta', vivo: true },
  );

  const huecos = barajar(animales).map((a, i) =>
    h(
      'button',
      {
        type: 'button',
        class: 'sombra',
        'data-animal': a.id,
        'aria-label': `Sombra ${i + 1}`,
        onclick: () => ubicar(a.id),
      },
      imagen(a.imagen, { clase: 'sombra__figura', carga: 'eager' }),
    ),
  );

  const fichas = animales.map((a) => {
    const b = h(
      'button',
      { type: 'button', class: 'ficha-animal', 'aria-pressed': 'false', 'data-animal': a.id },
      imagen(a.imagen, { clase: 'ficha-animal__figura', carga: 'eager' }),
      a.nombre,
    );
    arrastrable(b, {
      alTocar: () => elegir(a),
      alSoltar: (destino) => {
        elegir(a);
        const hueco = destino?.closest<HTMLElement>('.sombra');
        if (hueco?.dataset.animal) ubicar(hueco.dataset.animal);
      },
    });
    return b;
  });

  const elegir = (a: AnimalMarino) => {
    elegido = a;
    fichas.forEach((f) => f.setAttribute('aria-pressed', String(f.dataset.animal === a.id)));
  };

  const ubicar = (idSombra: string) => {
    if (!elegido) {
      decir(tortu, 'Primero elijan un animal de la bandeja.', 'pregunta');
      return;
    }
    if (ubicados.has(idSombra)) return;
    if (elegido.id !== idSombra) {
      error();
      decir(tortu, `Esa sombra no es de ${conArticulo(elegido)}. ¡Miren bien su forma!`);
      return;
    }
    acierto();
    ubicados.add(idSombra);
    const hueco = huecos.find((x) => x.dataset.animal === idSombra);
    hueco?.classList.add('sombra--descubierta');
    hueco?.setAttribute('aria-label', elegido.nombre);
    hueco?.setAttribute('disabled', '');
    fichas.find((f) => f.dataset.animal === idSombra)?.remove();
    const nombre = conArticulo(elegido);
    elegido = null;
    if (ubicados.size < animales.length) {
      decir(tortu, `¡Sí! Esa sombra es de ${nombre}. ¿Y las demás?`, 'celebracion');
      return;
    }
    decir(tortu, '¡Descubrieron todas las sombras! Ahora, ¿qué comerá cada uno?', 'celebracion');
    alTerminar();
  };

  return h(
    'section',
    { class: 'juego__parte' },
    h('h3', null, icono('lupa'), '¿De quién es esta sombra?'),
    tortu,
    h('div', { class: 'sombras' }, huecos),
    h('div', { class: 'bandeja-animales', 'aria-label': 'Animales' }, fichas),
  );
}

/**
 * Hace que un botón se pueda arrastrar con el dedo o el ratón. Un toque sin arrastrar
 * cuenta como clic (así también sirve el teclado: Enter o espacio).
 */
function arrastrable(
  boton: HTMLElement,
  { alTocar, alSoltar }: { alTocar: () => void; alSoltar: (destino: Element | null) => void },
): void {
  let inicio: { x: number; y: number } | null = null;
  let fantasma: HTMLElement | null = null;
  boton.addEventListener('click', alTocar);
  boton.addEventListener('pointerdown', (e) => {
    inicio = { x: e.clientX, y: e.clientY };
    boton.setPointerCapture(e.pointerId);
  });
  boton.addEventListener('pointermove', (e) => {
    if (!inicio) return;
    if (!fantasma && Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) > 10) {
      fantasma = boton.cloneNode(true) as HTMLElement;
      fantasma.classList.add('ficha-animal--fantasma');
      fantasma.setAttribute('aria-hidden', 'true');
      document.body.append(fantasma);
    }
    if (fantasma) {
      fantasma.style.left = `${e.clientX}px`;
      fantasma.style.top = `${e.clientY}px`;
    }
  });
  const terminar = (e: PointerEvent) => {
    inicio = null;
    if (!fantasma) return;
    fantasma.remove();
    fantasma = null;
    // El clic que sigue a un arrastre no debe volver a elegir.
    boton.addEventListener('click', (ev) => ev.stopImmediatePropagation(), {
      once: true,
      capture: true,
    });
    alSoltar(document.elementFromPoint(e.clientX, e.clientY));
  };
  boton.addEventListener('pointerup', terminar);
  boton.addEventListener('pointercancel', () => {
    fantasma?.remove();
    fantasma = null;
    inicio = null;
  });
}

// --- ¿Qué comen? --------------------------------------------------------------------

function queComen(animales: AnimalMarino[], alTerminar: () => void): HTMLElement {
  const resueltos = new Set<string>();
  const tortu = burbuja(
    'capitana-tortu',
    'Si comen plantas son herbívoros, si comen carne son carnívoros y si comen de todo son omnívoros. ¿Qué es cada uno?',
    { pose: 'pregunta', vivo: true },
  );

  const filas = animales.map((a) => {
    const tarjeta = h('div', { class: 'dieta__alimento', hidden: true });
    const botones = (Object.keys(DIETAS) as Dieta[]).map((d) =>
      h(
        'button',
        {
          type: 'button',
          class: `boton boton--chico boton--secundario dieta__opcion dieta__opcion--${d}`,
          onclick: () => {
            if (d !== a.dieta) {
              error();
              decir(
                tortu,
                `Mmm, ¿${conArticulo(a)} ${DIETAS[d].explicacion}? Piénsenlo otra vez.`,
                'pregunta',
              );
              return;
            }
            acierto();
            resueltos.add(a.id);
            botones.forEach((b) => (b.disabled = true));
            fila.classList.add('dieta--resuelta');
            tarjeta.hidden = false;
            tarjeta.replaceChildren(
              imagen(a.imagenAlimento, { clase: 'icono', carga: 'eager' }),
              h('span', null, h('strong', null, DIETAS[d].nombre), ` · ${a.alimento}`),
            );
            const ultimo = resueltos.size === animales.length;
            decir(
              tortu,
              ultimo
                ? `${a.explicacion} ¡Ya saben qué come cada uno! Vamos a comer…`
                : a.explicacion,
              'celebracion',
            );
            if (ultimo) alTerminar();
          },
        },
        imagen(DIETAS[d].imagen, { clase: 'icono', carga: 'eager' }),
        DIETAS[d].nombre,
      ),
    );
    const fila = h(
      'li',
      { class: 'dieta', 'data-animal': a.id },
      imagen(a.imagen, { clase: 'dieta__figura' }),
      h('strong', { class: 'dieta__nombre' }, a.nombre),
      h(
        'div',
        { class: 'dieta__opciones', role: 'group', 'aria-label': `¿Qué come ${conArticulo(a)}?` },
        botones,
      ),
      tarjeta,
    );
    return fila;
  });

  return h(
    'section',
    { class: 'juego__parte' },
    h('h3', null, icono('cangrejo'), '¿Qué comen?'),
    tortu,
    h('ul', { class: 'dietas' }, filas),
  );
}

// --- ¡A comer! ----------------------------------------------------------------------

function aComer(juego: JuegoSiluetas, alTerminar: () => void): HTMLElement {
  let elegido: AnimalMarino | null = null;
  let ocupado = false;
  const alimentados = new Set<string>();
  const tortu = burbuja(
    'capitana-tortu',
    'Elijan un animal y busquen su comida entre las tarjetas.',
    {
      pose: 'saludo',
      vivo: true,
    },
  );

  const alimentos = barajar([
    ...juego.animales.map((a) => ({ nombre: a.alimento, imagen: a.imagenAlimento, de: a.id })),
    ...juego.otrosAlimentos.map((o) => ({ ...o, de: '' })),
  ]);

  const animales = juego.animales.map((a) =>
    h(
      'button',
      {
        type: 'button',
        class: 'ficha-animal',
        'aria-pressed': 'false',
        'data-animal': a.id,
        onclick: () => {
          if (alimentados.has(a.id)) return;
          elegido = a;
          animales.forEach((b) =>
            b.setAttribute('aria-pressed', String(b.dataset.animal === a.id)),
          );
          decir(tortu, `¡A comer, ${a.nombre.toLowerCase()}! ¿Cuál tarjeta es su comida?`);
        },
      },
      imagen(a.imagen, { clase: 'ficha-animal__figura', carga: 'eager' }),
      a.nombre,
    ),
  );

  const cartas = alimentos.map((al, i) => {
    const carta = h(
      'button',
      { type: 'button', class: 'carta-comida', 'aria-label': `Tarjeta ${i + 1}` },
      h('span', { class: 'carta-comida__dorso', 'aria-hidden': 'true' }, icono('ola')),
      h(
        'span',
        { class: 'carta-comida__frente' },
        imagen(al.imagen, { clase: 'carta-comida__figura', carga: 'eager' }),
        al.nombre,
      ),
    );
    carta.addEventListener('click', () => {
      if (ocupado || carta.classList.contains('carta-comida--comida')) return;
      if (!elegido) {
        decir(tortu, 'Primero elijan qué animal va a comer.', 'pregunta');
        return;
      }
      carta.classList.add('carta-comida--volteada');
      carta.setAttribute('aria-label', al.nombre);
      if (al.de === elegido.id) {
        acierto();
        carta.classList.add('carta-comida--comida');
        carta.disabled = true;
        alimentados.add(elegido.id);
        const boton = animales.find((b) => b.dataset.animal === elegido?.id);
        boton?.classList.add('ficha-animal--lleno');
        boton?.setAttribute('aria-pressed', 'false');
        boton?.setAttribute('disabled', '');
        const nombre = conArticulo(elegido);
        elegido = null;
        if (alimentados.size < juego.animales.length) {
          decir(
            tortu,
            `¡Ñam! ${mayuscula(nombre)} encontró su comida. ¿Quién sigue?`,
            'celebracion',
          );
          return;
        }
        decir(tortu, '¡Todos los animales comieron! ¡Qué tripulación tan sabia!', 'celebracion');
        celebrar(parte);
        alTerminar();
        return;
      }
      error();
      decir(
        tortu,
        `${mayuscula(conArticulo(elegido))} no come ${al.nombre.toLowerCase()}. ¡Sigan buscando!`,
        'pregunta',
      );
      ocupado = true;
      window.setTimeout(() => {
        carta.classList.remove('carta-comida--volteada');
        carta.setAttribute('aria-label', `Tarjeta ${i + 1}`);
        ocupado = false;
      }, 1200);
    });
    return carta;
  });

  const parte = h(
    'section',
    { class: 'juego__parte' },
    h('h3', null, icono('pez-tropical'), '¡A comer!'),
    tortu,
    h('div', { class: 'bandeja-animales', 'aria-label': 'Animales con hambre' }, animales),
    h('div', { class: 'cartas-comida' }, cartas),
  );
  return parte;
}
