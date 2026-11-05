import type { Parada } from '../content/types';
import { h, icono } from '../dom';
import { rutas } from '../router';
import type { EstadoParada } from '../state/progreso';

const etiquetas: Record<EstadoParada, string> = {
  bloqueada: 'Bloqueada',
  disponible: '¡Lista para explorar!',
  completada: 'Completada',
};

/** Una parada en el camino de huellitas. Las bloqueadas no son enlaces. */
export function tarjetaParada(parada: Parada, estado: EstadoParada, posicion: number): HTMLElement {
  const contenido = [
    h('span', { class: 'tarjeta-parada__numero', 'aria-hidden': 'true' }, posicion),
    h(
      'span',
      { class: 'tarjeta-parada__texto' },
      h('span', { class: 'tarjeta-parada__titulo' }, parada.titulo),
      h('span', { class: 'tarjeta-parada__estado' }, etiquetas[estado]),
    ),
    icono(estado === 'completada' ? parada.sello.icono : estado === 'bloqueada' ? '🔒' : '🐾'),
  ];
  const etiqueta = `Parada ${posicion}: ${parada.titulo}. ${etiquetas[estado]}`;

  return h(
    'li',
    { class: `tarjeta-parada tarjeta-parada--${estado}` },
    estado === 'bloqueada'
      ? h(
          'div',
          { class: 'tarjeta-parada__cuerpo', 'aria-label': etiqueta, role: 'img' },
          contenido,
        )
      : h(
          'a',
          {
            class: 'tarjeta-parada__cuerpo',
            href: rutas.parada(parada.ecosistema, parada.numero),
            'aria-label': etiqueta,
          },
          contenido,
        ),
  );
}
