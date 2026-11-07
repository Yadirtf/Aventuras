import { describe, expect, it } from 'vitest';
import { ecosistemas, paradas } from '../src/content';
import { PANTALLAS } from '../src/content/pantallas';
import { CLAVE, Store, type Almacen } from '../src/state/store';

describe('huellas en pantallas', () => {
  it('cada parada tiene su reparto y empieza con la llegada del guía', () => {
    for (const p of paradas) {
      const pantallas = PANTALLAS[p.id];
      expect(pantallas, p.id).toBeDefined();
      expect(pantallas?.[0]?.llegada, p.id).toBe(true);
      expect(
        pantallas?.filter((x) => x.llegada),
        p.id,
      ).toHaveLength(1);
    }
  });

  it('las partes del juego no se repiten y van en orden', () => {
    for (const [id, pantallas] of Object.entries(PANTALLAS)) {
      const partes = pantallas.flatMap((x) => x.partes ?? []);
      expect(partes, id).toEqual([...partes].sort((a, b) => a - b));
      expect(new Set(partes).size, id).toBe(partes.length);
    }
  });

  it('el reto de movimiento solo aparece donde la parada lo tiene, y siempre se muestra', () => {
    for (const p of paradas) {
      const conMovimiento = (PANTALLAS[p.id] ?? []).filter((x) => x.movimiento);
      expect(conMovimiento, p.id).toHaveLength(p.movimiento ? 1 : 0);
    }
  });

  it('la guía docente de cada pantalla apunta a pasos que existen en la planeación', () => {
    for (const p of paradas) {
      for (const pantalla of PANTALLAS[p.id] ?? []) {
        expect(pantalla.docente.length, `${p.id}: ${pantalla.titulo}`).toBeGreaterThan(0);
        for (const ref of pantalla.docente) {
          const [momento, i] = ref.split(':') as ['inicio' | 'desarrollo' | 'cierre', string];
          expect(p.planeacion[momento][Number(i)], `${p.id} → ${ref}`).toBeDefined();
        }
      }
    }
  });

  it('el guía del desierto es Don Camelio, el camello', () => {
    expect(ecosistemas.desierto.guia).toBe('don-camelio');
    for (const p of paradas.filter((x) => x.ecosistema === 'desierto'))
      expect(p.guias[0], p.id).toBe('don-camelio');
  });

  it('el sonido de los botones viene encendido y se puede apagar', () => {
    const datos = new Map<string, string>();
    const almacen: Almacen = {
      getItem: (k) => datos.get(k) ?? null,
      setItem: (k, v) => void datos.set(k, v),
      removeItem: (k) => void datos.delete(k),
    };
    const store = new Store(almacen);
    expect(store.estado.sonidoBotones).toBe(true);
    store.cambiarSonidoBotones(false);
    expect(JSON.parse(datos.get(CLAVE) ?? '{}').sonidoBotones).toBe(false);
    expect(new Store(almacen).estado.sonidoBotones).toBe(false);
  });
});
