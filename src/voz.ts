import type { Personaje } from './content/types';

/**
 * Lee en voz alta con la síntesis de voz del navegador. Es el respaldo hasta tener
 * audios grabados (fase 6); si el navegador no la tiene, los botones de voz no aparecen.
 *
 * Lo que más suena a robot es forzar el tono y la velocidad, y las voces básicas del
 * sistema. Por eso se eligen primero las voces «naturales» (neuronales) cuando el equipo
 * las tiene, y los personajes solo se diferencian con cambios suaves.
 */

const sintesis = (): SpeechSynthesis | null =>
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

export const hayVoz = (): boolean => sintesis() !== null;

/** Límites para que ninguna voz suene a ardilla ni a robot. */
const TONO = { min: 0.85, max: 1.25 };
const VELOCIDAD = { min: 0.8, max: 1.05 };
const limitar = (v: number, { min, max }: { min: number; max: number }) =>
  Math.min(max, Math.max(min, v));

/** Puntaje de una voz: las neuronales y las de Latinoamérica primero. */
export function puntajeVoz(
  voz: Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'localService'>,
): number {
  const nombre = voz.name.toLowerCase();
  const idioma = voz.lang.replace('_', '-').toLowerCase();
  if (!idioma.startsWith('es')) return -1;
  let puntaje = 0;
  if (/natural|neural|online/.test(nombre)) puntaje += 100;
  if (/premium|enhanced|mejorad/.test(nombre)) puntaje += 80;
  if (nombre.includes('google')) puntaje += 60;
  // Las voces que no son locales suelen ser las de mejor calidad.
  if (!voz.localService) puntaje += 10;
  if (idioma === 'es-co') puntaje += 30;
  else if (['es-mx', 'es-us', 'es-419'].includes(idioma)) puntaje += 25;
  else if (idioma !== 'es-es') puntaje += 15;
  else puntaje += 5;
  return puntaje;
}

/** Voces en español del equipo, de la que mejor suena a la que peor. */
export function vocesEnEspanol(): SpeechSynthesisVoice[] {
  return (sintesis()?.getVoices() ?? [])
    .filter((v) => puntajeVoz(v) >= 0)
    .sort((a, b) => puntajeVoz(b) - puntajeVoz(a));
}

let preferida: string | null = null;

/** Usa la voz elegida en Opciones (su voiceURI) o, con null, la mejor disponible. */
export function usarVoz(uri: string | null): void {
  preferida = uri;
}

/** Avisa cuando el navegador termina de cargar sus voces (llegan tarde en Chrome). */
export function alCargarVoces(hacer: () => void): void {
  const s = sintesis();
  if (s) s.onvoiceschanged = hacer;
}

function vozElegida(): SpeechSynthesisVoice | null {
  const voces = vocesEnEspanol();
  return voces.find((v) => v.voiceURI === preferida) ?? voces[0] ?? null;
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
    const voz = vozElegida();
    frase.lang = voz?.lang ?? 'es-CO';
    if (voz) frase.voice = voz;
    frase.pitch = limitar(personaje?.voz.tono ?? 1, TONO);
    frase.rate = limitar(personaje?.voz.velocidad ?? 0.95, VELOCIDAD);
    frase.onend = () => resolver();
    frase.onerror = () => resolver();
    s.speak(frase);
  });
}
