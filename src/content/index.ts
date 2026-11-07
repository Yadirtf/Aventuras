import { ecosistemas } from './ecosistemas';
import { personajes } from './personajes';
import { ECOSISTEMAS, type EcosistemaId, type Parada } from './types';
import { validarParada } from './validar';

const archivos = import.meta.glob<unknown>('./paradas/*.json', { eager: true, import: 'default' });

/** Las paradas en el orden del recorrido: desierto → mar → selva → gran viaje en globo. */
export const paradas: readonly Parada[] = Object.entries(archivos)
  .map(([ruta, datos]) => validarParada(datos, ruta))
  .sort(
    (a, b) =>
      ECOSISTEMAS.indexOf(a.ecosistema) - ECOSISTEMAS.indexOf(b.ecosistema) || a.numero - b.numero,
  );

export const paradasDe = (eco: EcosistemaId): Parada[] =>
  paradas.filter((p) => p.ecosistema === eco);

export const buscarParada = (eco: EcosistemaId, numero: number): Parada | undefined =>
  paradas.find((p) => p.ecosistema === eco && p.numero === numero);

export { ecosistemas, personajes, ECOSISTEMAS };
export type * from './types';
