import { describe, expect, it } from 'vitest';
import { ecosistemas, paradas, personajes } from '../src/content';
import desierto1 from '../src/content/paradas/desierto-1.json';
import desierto2 from '../src/content/paradas/desierto-2.json';
import selva3 from '../src/content/paradas/selva-3.json';
import { ContenidoInvalido, validarParada } from '../src/content/validar';

describe('contenido', () => {
  it('tiene las 10 paradas en el orden desierto → mar → selva → globo', () => {
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
      'globo-1',
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

  it('las paradas sin reto de movimiento son las que pidieron las autoras', () => {
    const sinReto = paradas.filter((p) => !p.movimiento).map((p) => p.id);
    expect(sinReto).toEqual(['desierto-1', 'mar-3', 'selva-1', 'globo-1']);
    expect(paradas.find((p) => p.id === 'desierto-3')?.movimiento?.opcional).toBe(true);
    expect(paradas.find((p) => p.id === 'mar-2')?.movimiento?.antesDelJuego).toBe(true);
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

  it('exige que las figuras que se mueven en el cuento estén en la escena', () => {
    const datos = structuredClone(selva3) as unknown as {
      juego: { escenas: { partes: object[] }[] };
    };
    datos.juego.escenas[0]?.partes.push({ texto: 'Un elefante pasó.', figura: 'elefante' });
    expect(() => validarParada(datos, 'prueba')).toThrow(/no está en las figuras de la escena/);
  });

  it('exige que los diálogos de los títeres sean de animales del juego', () => {
    const datos = structuredClone(desierto2) as unknown as {
      juego: { escenas: { dialogos: Record<string, string> }[] };
    };
    const escena = datos.juego.escenas[0];
    if (escena) escena.dialogos.dragon = '¡Hola!';
    expect(() => validarParada(datos, 'prueba')).toThrow(
      /dialogos\.dragon: no es un animal del juego/,
    );
  });

  it('rechaza personajes desconocidos', () => {
    const datos = copia();
    datos.guias = ['dragon'];
    expect(() => validarParada(datos, 'prueba')).toThrow(/personaje desconocido «dragon»/);
  });
});
