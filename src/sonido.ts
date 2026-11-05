import type { SonidoSelva } from './content/types';

/**
 * Efectos cortos generados con Web Audio (sin archivos): palmas, acierto, error, los
 * sonidos de los animales de la selva y la tormenta. Cuando haya grabaciones con licencia
 * libre, basta cambiar estas funciones por la reproducción del archivo.
 * Se crean al primer uso porque los navegadores exigen un gesto del usuario.
 */

let contexto: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  contexto ??= new AudioContext();
  if (contexto.state === 'suspended') void contexto.resume();
  return contexto;
}

function tono(
  frecuencia: number,
  duracion: number,
  retraso = 0,
  tipo: OscillatorType = 'sine',
  { hasta, volumen = 0.25 }: { hasta?: number; volumen?: number } = {},
): void {
  const ctx = audio();
  if (!ctx) return;
  const inicio = ctx.currentTime + retraso;
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(frecuencia, inicio);
  if (hasta) osc.frequency.exponentialRampToValueAtTime(hasta, inicio + duracion);
  vol.gain.setValueAtTime(0.0001, inicio);
  vol.gain.exponentialRampToValueAtTime(volumen, inicio + 0.01);
  vol.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
  osc.connect(vol).connect(ctx.destination);
  osc.start(inicio);
  osc.stop(inicio + duracion + 0.05);
}

/** Una palmada: ruido muy corto. */
export function palmada(): void {
  const ctx = audio();
  if (!ctx) return;
  const muestras = Math.floor(ctx.sampleRate * 0.08);
  const buffer = ctx.createBuffer(1, muestras, ctx.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < muestras; i++) datos[i] = (Math.random() * 2 - 1) * (1 - i / muestras) ** 3;
  const fuente = ctx.createBufferSource();
  const vol = ctx.createGain();
  vol.gain.value = 0.5;
  fuente.buffer = buffer;
  fuente.connect(vol).connect(ctx.destination);
  fuente.start();
}

export const acierto = (): void => {
  tono(660, 0.15);
  tono(880, 0.25, 0.12);
};

export const error = (): void => tono(220, 0.25, 0, 'triangle');

export const fanfarria = (): void => {
  [523, 659, 784, 1047].forEach((f, i) => tono(f, 0.3, i * 0.12));
};

interface OpcionesRuido {
  filtro: BiquadFilterType;
  frecuencia: number;
  /** Si se indica, el filtro se desliza hasta esta frecuencia (viento, siseo). */
  hasta?: number;
  q?: number;
  volumen?: number;
  retraso?: number;
  ataque?: number;
}

/** Ruido filtrado con subida y caída suaves: base del siseo, la lluvia, el viento y el trueno. */
function ruido(
  duracion: number,
  { filtro, frecuencia, hasta, q = 1, volumen = 0.4, retraso = 0, ataque = 0.05 }: OpcionesRuido,
): void {
  const ctx = audio();
  if (!ctx) return;
  const inicio = ctx.currentTime + retraso;
  const muestras = Math.floor(ctx.sampleRate * duracion);
  const buffer = ctx.createBuffer(1, muestras, ctx.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < muestras; i++) datos[i] = Math.random() * 2 - 1;
  const fuente = ctx.createBufferSource();
  fuente.buffer = buffer;
  const f = ctx.createBiquadFilter();
  f.type = filtro;
  f.Q.value = q;
  f.frequency.setValueAtTime(frecuencia, inicio);
  if (hasta) f.frequency.exponentialRampToValueAtTime(hasta, inicio + duracion);
  const vol = ctx.createGain();
  vol.gain.setValueAtTime(0.0001, inicio);
  vol.gain.exponentialRampToValueAtTime(volumen, inicio + ataque);
  vol.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
  fuente.connect(f).connect(vol).connect(ctx.destination);
  fuente.start(inicio);
}

const ANIMALES: Record<SonidoSelva, () => void> = {
  // «¡Uh, uh, ah, ah!»: cuatro gritos que suben.
  mono: () =>
    [0, 0.22, 0.5, 0.72].forEach((t, i) =>
      tono(i < 2 ? 320 : 420, 0.18, t, 'triangle', { hasta: i < 2 ? 520 : 760, volumen: 0.3 }),
    ),
  // Siseo largo y agudo.
  serpiente: () => ruido(1.4, { filtro: 'highpass', frecuencia: 4500, volumen: 0.25, ataque: 0.3 }),
  // Tres croares graves.
  rana: () =>
    [0, 0.3, 0.6].forEach((t) => {
      tono(110, 0.16, t, 'square', { hasta: 90, volumen: 0.18 });
      tono(220, 0.16, t, 'sawtooth', { hasta: 180, volumen: 0.06 });
    }),
  // Silbidos rápidos que suben.
  ave: () =>
    [0, 0.16, 0.32, 0.6, 0.76].forEach((t) => tono(1900, 0.12, t, 'sine', { hasta: 3400 })),
  // Gruñido grave y largo.
  jaguar: () => {
    tono(90, 1.3, 0, 'sawtooth', { hasta: 60, volumen: 0.22 });
    ruido(1.3, { filtro: 'lowpass', frecuencia: 400, hasta: 150, volumen: 0.5, ataque: 0.15 });
  },
};

export const sonidoAnimal = (animal: SonidoSelva): void => ANIMALES[animal]();

export const lluvia = (): void =>
  ruido(3, { filtro: 'bandpass', frecuencia: 2600, q: 0.6, volumen: 0.35, ataque: 0.4 });

export const viento = (): void =>
  ruido(3, { filtro: 'bandpass', frecuencia: 300, hasta: 1100, q: 4, volumen: 0.5, ataque: 0.8 });

export const trueno = (): void => {
  ruido(0.25, { filtro: 'highpass', frecuencia: 1500, volumen: 0.4, ataque: 0.005 });
  ruido(2.6, { filtro: 'lowpass', frecuencia: 260, hasta: 60, volumen: 0.9, ataque: 0.05 });
};

/** Un chapuzón: cuando alguien cae al agua o roza un tentáculo. */
export const chapuzon = (): void => {
  ruido(0.5, { filtro: 'lowpass', frecuencia: 1200, hasta: 200, volumen: 0.5, ataque: 0.01 });
  tono(500, 0.3, 0, 'sine', { hasta: 150, volumen: 0.15 });
};

/** Un salto corto. */
export const salto = (): void => tono(300, 0.15, 0, 'sine', { hasta: 700, volumen: 0.2 });
