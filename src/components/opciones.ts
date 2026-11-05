import { personajes } from '../content';
import { h } from '../dom';
import type { Store } from '../state/store';
import { alCargarVoces, hablar, hayVoz, vocesEnEspanol } from '../voz';

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

/** Lista de voces en español del equipo, con botón para escucharla antes de elegir. */
function selectorVoz(store: Store): HTMLElement | false {
  if (!hayVoz()) return false;
  const lista = h('select', {
    id: 'op-voz',
    'aria-describedby': 'op-voz-ayuda',
    onchange: (e: Event) => store.cambiarVoz((e.currentTarget as HTMLSelectElement).value || null),
  });
  const llenar = () =>
    lista.replaceChildren(
      h('option', { value: '' }, 'Automática (la que mejor suena)'),
      ...vocesEnEspanol().map((v) =>
        h(
          'option',
          { value: v.voiceURI, selected: v.voiceURI === store.estado.voz },
          `${v.name} (${v.lang})`,
        ),
      ),
    );
  llenar();
  alCargarVoces(llenar);
  return h(
    'div',
    { class: 'selector-voz' },
    h('label', { for: 'op-voz' }, 'Voz de los personajes'),
    h(
      'div',
      { class: 'selector-voz__fila' },
      lista,
      h(
        'button',
        {
          type: 'button',
          class: 'boton boton--secundario boton--chico',
          onclick: () => void hablar('¡Hola, exploradores! Así suena mi voz.', personajes.huellita),
        },
        'Probar',
      ),
    ),
    h(
      'p',
      { id: 'op-voz-ayuda', class: 'interruptor__ayuda' },
      'Las voces «Natural» u «Online» (Edge) y las de Google (Chrome) suenan menos a robot.',
    ),
  );
}

/** Preferencias de la clase: Modo Docente, menos movimiento y voz. */
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
    selectorVoz(store),
  );
}
