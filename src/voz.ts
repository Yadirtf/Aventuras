import type { Personaje } from './content/types';

/**
 * Lee en voz alta con la síntesis de voz del navegador. Es el respaldo hasta tener
 * audios grabados (fase 6); si el navegador no la tiene, los botones de voz no aparecen.
 */

const sintesis = (): SpeechSynthesis | null =>
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

export const hayVoz = (): boolean => sintesis() !== null;

let vozElegida: SpeechSynthesisVoice | null | undefined;

/** Prefiere voces de Latinoamérica y, si no hay, cualquier voz en español. */
function vozEnEspanol(): SpeechSynthesisVoice | null {
  if (vozElegida !== undefined) return vozElegida;
  const voces = sintesis()?.getVoices() ?? [];
  if (voces.length === 0) return null; // todavía cargando; se reintenta en la próxima frase
  const preferencia = ['es-CO', 'es-MX', 'es-US', 'es-419', 'es-ES'];
  vozElegida =
    preferencia.map((l) => voces.find((v) => v.lang === l)).find(Boolean) ??
    voces.find((v) => v.lang.toLowerCase().startsWith('es')) ??
    null;
  return vozElegida;
}

export function detenerVoz(): void {
  sintesis()?.cancel();
}

/** Lee el texto con la voz del personaje. La promesa se cumple al terminar o al interrumpirse. */
export function hablar(texto: string, personaje?: Pick<Personaje, 'voz'>): Promise<void> {
  const s = sintesis();
  if (!s) return Promise.resolve();
  s.cancel();
  return new Promise((resolver) => {
    const frase = new SpeechSynthesisUtterance(texto);
    frase.lang = 'es-CO';
    const voz = vozEnEspanol();
    if (voz) frase.voice = voz;
    frase.pitch = personaje?.voz.tono ?? 1;
    frase.rate = personaje?.voz.velocidad ?? 1;
    frase.onend = () => resolver();
    frase.onerror = () => resolver();
    s.speak(frase);
  });
}
