import type { Contexto, Vista } from '../contexto';
import { h, icono } from '../dom';
import { rutas } from '../router';
import { aventuraCompleta } from '../state/progreso';
import { paisaje } from './portada';

/** Pantalla de cierre (sección 4 de doc1.txt). La fase 6 suma el diploma y la celebración. */
export function final({ store, paradas }: Contexto): Vista {
  const completadas = store.completadas;
  const faltan = paradas.filter((p) => !completadas.has(p.id)).length;

  if (!aventuraCompleta(paradas, completadas) && !store.estado.modoDocente) {
    return {
      titulo: 'Aventura completada',
      tema: 'general',
      contenido: h(
        'section',
        { class: 'final' },
        h('h1', { tabindex: -1 }, '¡Todavía no termina la aventura!'),
        h('p', null, `Faltan ${faltan} ${faltan === 1 ? 'sello' : 'sellos'} en el pasaporte.`),
        h('a', { class: 'boton boton--huellita', href: rutas.mapa }, icono('🐾'), 'Volver al mapa'),
      ),
    };
  }

  const nombre = store.estado.explorador;
  return {
    titulo: '¡Felicitaciones, exploradores!',
    tema: 'general',
    contenido: h(
      'section',
      { class: 'final' },
      paisaje(),
      h('h1', { tabindex: -1 }, '¡Felicitaciones, exploradores!'),
      nombre && h('p', { class: 'final__nombre' }, nombre),
      h(
        'p',
        { class: 'final__mensaje' },
        '«Hemos recorrido el desierto, explorado el mundo marino y descubierto los secretos de la selva. ¡Nuestra aventura ha terminado!»',
      ),
      h(
        'ul',
        { class: 'final__sellos', 'aria-label': 'Sellos del pasaporte' },
        paradas.map((p) =>
          h(
            'li',
            { class: completadas.has(p.id) ? 'sello--puesto' : '' },
            icono(completadas.has(p.id) ? p.sello.icono : '·'),
            h(
              'span',
              { class: 'visualmente-oculto' },
              completadas.has(p.id) ? p.sello.nombre : 'Sin sello',
            ),
          ),
        ),
      ),
      h('a', { class: 'boton boton--secundario', href: rutas.mapa }, '← Volver al mapa'),
    ),
  };
}
