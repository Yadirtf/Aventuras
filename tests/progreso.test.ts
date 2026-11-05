import { describe, expect, it } from 'vitest';
import { paradas } from '../src/content';
import { aventuraCompleta, estadoDeParada, siguienteParada } from '../src/state/progreso';

const estado = (id: string, completadas: string[], docente = false) =>
  estadoDeParada(paradas, id, new Set(completadas), docente);

describe('progreso', () => {
  it('al empezar solo está disponible la primera parada', () => {
    expect(paradas.map((p) => estado(p.id, []))).toEqual([
      'disponible',
      ...Array<string>(8).fill('bloqueada'),
    ]);
  });

  it('completar una parada desbloquea la siguiente, también entre ecosistemas', () => {
    expect(estado('desierto-2', ['desierto-1'])).toBe('disponible');
    expect(estado('mar-1', ['desierto-1', 'desierto-2', 'desierto-3'])).toBe('disponible');
    expect(estado('mar-2', ['desierto-1', 'desierto-2', 'desierto-3'])).toBe('bloqueada');
  });

  it('en Modo Docente todas están disponibles', () => {
    expect(paradas.every((p) => estado(p.id, [], true) === 'disponible')).toBe(true);
  });

  it('marca las completadas aunque se salten pasos en Modo Docente', () => {
    expect(estado('selva-3', ['selva-3'])).toBe('completada');
  });

  it('sabe cuál es la siguiente parada y cuándo termina la aventura', () => {
    expect(siguienteParada(paradas, 'desierto-3')?.id).toBe('mar-1');
    expect(siguienteParada(paradas, 'selva-3')).toBeUndefined();
    expect(aventuraCompleta(paradas, new Set(paradas.map((p) => p.id)))).toBe(true);
    expect(aventuraCompleta(paradas, new Set(['desierto-1']))).toBe(false);
  });
});
