/**
 * Efectos cortos generados con Web Audio (sin archivos): palmas, acierto y error.
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
): void {
  const ctx = audio();
  if (!ctx) return;
  const inicio = ctx.currentTime + retraso;
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = tipo;
  osc.frequency.value = frecuencia;
  vol.gain.setValueAtTime(0.0001, inicio);
  vol.gain.exponentialRampToValueAtTime(0.25, inicio + 0.01);
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
