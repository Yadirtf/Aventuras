import type { Parada } from '../content/types';

export type EstadoParada = 'bloqueada' | 'disponible' | 'completada';

/**
 * Una parada está disponible si es la primera o si la anterior está completada.
 * En Modo Docente todas están disponibles.
 */
export function estadoDeParada(
  paradas: readonly Parada[],
  id: string,
  completadas: ReadonlySet<string>,
  modoDocente: boolean,
): EstadoParada {
  if (completadas.has(id)) return 'completada';
  if (modoDocente) return 'disponible';
  const indice = paradas.findIndex((p) => p.id === id);
  if (indice === 0) return 'disponible';
  const anterior = paradas[indice - 1];
  return anterior && completadas.has(anterior.id) ? 'disponible' : 'bloqueada';
}

export const siguienteParada = (paradas: readonly Parada[], id: string): Parada | undefined =>
  paradas[paradas.findIndex((p) => p.id === id) + 1];

export const aventuraCompleta = (
  paradas: readonly Parada[],
  completadas: ReadonlySet<string>,
): boolean => paradas.every((p) => completadas.has(p.id));
