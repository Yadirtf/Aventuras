/**
 * Ayudante mínimo para crear elementos sin innerHTML: todo el texto se inserta
 * como nodos de texto, así el contenido de los JSON nunca se interpreta como HTML.
 */

type Hijo = Node | string | number | false | null | undefined | Hijo[];

type Atributos = {
  class?: string | false | null | undefined;
  [atributo: string]: unknown;
};

export function h<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  atributos: Atributos | null = null,
  ...hijos: Hijo[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(etiqueta);
  for (const [nombre, valor] of Object.entries(atributos ?? {})) {
    if (valor === undefined || valor === null || valor === false) continue;
    if (nombre.startsWith('on') && typeof valor === 'function') {
      el.addEventListener(nombre.slice(2).toLowerCase(), valor as EventListener);
    } else if (valor === true) {
      el.setAttribute(nombre, '');
    } else {
      el.setAttribute(nombre, String(valor));
    }
  }
  agregar(el, hijos);
  return el;
}

function agregar(padre: Node, hijos: Hijo[]): void {
  for (const hijo of hijos) {
    if (hijo === null || hijo === undefined || hijo === false) continue;
    if (Array.isArray(hijo)) agregar(padre, hijo);
    else padre.appendChild(typeof hijo === 'object' ? hijo : document.createTextNode(String(hijo)));
  }
}

/** Icono decorativo (emoji provisional) que los lectores de pantalla ignoran. */
export const icono = (simbolo: string, clase = 'icono'): HTMLSpanElement =>
  h('span', { class: clase, 'aria-hidden': 'true' }, simbolo);
