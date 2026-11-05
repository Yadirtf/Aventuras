import { h } from '../dom';
import type { Store } from '../state/store';

function interruptor(
  etiqueta: string,
  ayuda: string,
  activo: boolean,
  alCambiar: (activo: boolean) => void,
): HTMLElement {
  const id = `op-${etiqueta.toLowerCase().replace(/\s+/g, '-')}`;
  return h(
    'div',
    { class: 'interruptor' },
    h('input', {
      type: 'checkbox',
      role: 'switch',
      id,
      checked: activo,
      'aria-describedby': `${id}-ayuda`,
      onchange: (e: Event) => alCambiar((e.currentTarget as HTMLInputElement).checked),
    }),
    h('label', { for: id }, etiqueta),
    h('p', { id: `${id}-ayuda`, class: 'interruptor__ayuda' }, ayuda),
  );
}

/** Preferencias de la clase: Modo Docente y menos movimiento. */
export function opciones(store: Store, menosMovimientoActivo: boolean): HTMLElement {
  return h(
    'div',
    { class: 'opciones' },
    interruptor(
      'Modo Docente',
      'Abre todas las paradas y muestra la planeación completa de cada una, lista para imprimir.',
      store.estado.modoDocente,
      (v) => store.cambiarModoDocente(v),
    ),
    interruptor(
      'Menos movimiento',
      'Quita las animaciones y transiciones entre pantallas.',
      menosMovimientoActivo,
      (v) => store.cambiarMenosMovimiento(v),
    ),
  );
}
