import { imagen, type Imagen } from './imagenes';

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

/** Pequeña figura 3D decorativa junto a un texto (títulos, botones). */
export const icono = (nombre: Imagen, clase = 'icono'): HTMLImageElement =>
  imagen(nombre, { clase, carga: 'eager' });

/** Baraja una copia de la lista (Fisher-Yates). */
export function barajar<T>(lista: readonly T[], azar: () => number = Math.random): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j] as T, copia[i] as T];
  }
  return copia;
}

/** Respeta «menos movimiento» (preferencia guardada o del sistema). */
export const sinMovimiento = (): boolean =>
  document.documentElement.dataset.movimiento === 'reducido';
