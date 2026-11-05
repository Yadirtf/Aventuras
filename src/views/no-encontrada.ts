import type { Vista } from '../contexto';
import { h, icono } from '../dom';
import { imagen } from '../imagenes';
import { rutas } from '../router';

export function noEncontrada(): Vista {
  return {
    titulo: 'Camino no encontrado',
    tema: 'general',
    contenido: h(
      'section',
      { class: 'no-encontrada' },
      h('h1', { tabindex: -1 }, '¡Uy! Este camino no existe'),
      imagen('brujula', { clase: 'figura-grande', carga: 'eager' }),
      h('p', null, 'Las huellitas no llegan hasta aquí. Volvamos al mapa.'),
      h(
        'a',
        { class: 'boton boton--huellita', href: rutas.mapa },
        icono('huellas'),
        'Volver al mapa',
      ),
    ),
  };
}
