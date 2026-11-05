import { describe, expect, it } from 'vitest';
import { interpretarRuta } from '../src/router';

describe('interpretarRuta', () => {
  it.each([
    ['/', { vista: 'portada' }],
    ['/mapa', { vista: 'mapa' }],
    ['/mapa/', { vista: 'mapa' }],
    ['/final', { vista: 'final' }],
    ['/selva', { vista: 'ecosistema', ecosistema: 'selva' }],
    ['/desierto/1', { vista: 'parada', ecosistema: 'desierto', numero: 1 }],
    ['/mar/2', { vista: 'parada', ecosistema: 'mar', numero: 2 }],
    ['/selva/3/planeacion', { vista: 'planeacion', ecosistema: 'selva', numero: 3 }],
  ])('%s', (ruta, esperado) => {
    expect(interpretarRuta(ruta)).toEqual(esperado);
  });

  it.each([
    '/luna',
    '/mar/4',
    '/mar/0',
    '/mar/uno',
    '/mar/1/otra',
    '/mapa/extra',
    '/mar/1/planeacion/x',
  ])('%s no existe', (ruta) => {
    expect(interpretarRuta(ruta).vista).toBe('no-encontrada');
  });
});
