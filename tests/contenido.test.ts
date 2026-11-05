import { describe, expect, it } from 'vitest';
import { ecosistemas, paradas, personajes } from '../src/content';
import desierto1 from '../src/content/paradas/desierto-1.json';
import { ContenidoInvalido, validarParada } from '../src/content/validar';

describe('contenido', () => {
  it('tiene las 9 paradas en el orden desierto → mar → selva', () => {
    expect(paradas.map((p) => p.id)).toEqual([
      'desierto-1',
      'desierto-2',
      'desierto-3',
      'mar-1',
      'mar-2',
      'mar-3',
      'selva-1',
      'selva-2',
      'selva-3',
    ]);
  });

  it('usa solo personajes y ecosistemas conocidos', () => {
    for (const p of paradas) {
      expect(ecosistemas[p.ecosistema]).toBeDefined();
      for (const g of p.guias) expect(personajes[g]).toBeDefined();
    }
  });

  it('cada autora de ecosistema coincide con sus planeaciones', () => {
    for (const p of paradas) {
      const apellido = ecosistemas[p.ecosistema].autora.split(' ').at(-1) ?? '';
      expect(p.planeacion.autora).toContain(apellido);
    }
  });

  it('los sellos no se repiten', () => {
    const nombres = paradas.map((p) => p.sello.nombre);
    expect(new Set(nombres).size).toBe(nombres.length);
  });
});

describe('validarParada', () => {
  const copia = () => structuredClone(desierto1) as Record<string, unknown>;

  it('acepta una parada completa', () => {
    expect(validarParada(copia(), 'prueba').id).toBe('desierto-1');
  });

  it('reúne todos los campos que faltan en un solo error', () => {
    const datos = copia();
    delete datos.pista;
    (datos.planeacion as Record<string, unknown>).objetivo = '';
    (datos.planeacion as Record<string, unknown>).cierre = [];

    try {
      validarParada(datos, 'prueba.json');
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ContenidoInvalido);
      expect((e as ContenidoInvalido).errores).toEqual([
        'pista: falta o está vacío',
        'planeacion.objetivo: falta o está vacío',
        'planeacion.cierre: debe ser una lista con al menos un paso',
      ]);
    }
  });

  it('exige anotar en pendientes los indicadores que faltan', () => {
    const datos = copia();
    const pl = datos.planeacion as Record<string, unknown>;
    pl.indicadoresDeLogro = [];
    pl.pendientes = [];
    expect(() => validarParada(datos, 'prueba')).toThrow(/indicadoresDeLogro: vacío/);
  });

  it('rechaza personajes desconocidos', () => {
    const datos = copia();
    datos.guias = ['dragon'];
    expect(() => validarParada(datos, 'prueba')).toThrow(/personaje desconocido «dragon»/);
  });
});
