import type { Parada } from '../content/types';
import { h } from '../dom';
import { imagen } from '../imagenes';
import { rutas } from '../router';
import type { EstadoParada } from '../state/progreso';

const etiquetas: Record<EstadoParada, string> = {
  bloqueada: 'Bloqueada',
  disponible: '¡Lista para explorar!',
  completada: 'Completada',
};

/** Una parada en el camino de huellitas. Las bloqueadas no son enlaces. */
export function tarjetaParada(parada: Parada, estado: EstadoParada, posicion: number): HTMLElement {
  const figura =
    estado === 'completada' ? parada.sello.imagen : estado === 'bloqueada' ? 'candado' : 'huellas';
  const contenido = [
    h('span', { class: 'tarjeta-parada__numero', 'aria-hidden': 'true' }, posicion),
    h(
      'span',
      { class: 'tarjeta-parada__texto' },
      h('span', { class: 'tarjeta-parada__titulo' }, parada.titulo),
      h('span', { class: 'tarjeta-parada__estado' }, etiquetas[estado]),
    ),
    imagen(figura, { clase: 'tarjeta-parada__figura', carga: 'eager' }),
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
