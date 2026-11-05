import { describe, expect, it } from 'vitest';
import { puntajeVoz } from '../src/voz';

const voz = (name: string, lang: string, localService = true) => ({ name, lang, localService });

describe('elección de la voz', () => {
  it('descarta las voces que no son en español', () => {
    expect(puntajeVoz(voz('Samantha', 'en-US'))).toBeLessThan(0);
  });

  it('prefiere una voz natural a una básica del sistema', () => {
    const natural = voz('Microsoft Salome Online (Natural) - Spanish (Colombia)', 'es-CO', false);
    const basica = voz('Microsoft Sabina - Spanish (Mexico)', 'es-MX');
    expect(puntajeVoz(natural)).toBeGreaterThan(puntajeVoz(basica));
  });

  it('prefiere el español de Latinoamérica al de España con la misma calidad', () => {
    expect(puntajeVoz(voz('Google español de Estados Unidos', 'es-US', false))).toBeGreaterThan(
      puntajeVoz(voz('Google español', 'es-ES', false)),
    );
  });
});
