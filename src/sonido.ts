import type { Senal, SonidoSelva } from './content/types';

/**
 * Sonidos de la página. El mono y la serpiente son grabaciones reales con licencia libre
 * (public/assets/sonidos, créditos en su LEEME.md); los demás animales usan una imitación
 * hasta tener su grabación. El resto son efectos cortos generados con
 * Web Audio: palmas, acierto, error, la tormenta, las señales del globo y la música de la
 * estatua. Se crean al primer uso porque los navegadores exigen un gesto del usuario.
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

/** Imitaciones sintéticas: solo se usan si la grabación no se puede reproducir. */
const IMITACIONES: Record<SonidoSelva, () => void> = {
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

/** Animales con grabación real en public/assets/sonidos/<animal>.mp3. */
const GRABADOS: ReadonlySet<SonidoSelva> = new Set(['mono', 'serpiente']);

let grabacion: HTMLAudioElement | null = null;

/** Reproduce la grabación real del animal; si no la hay o falla, la imitación. */
export function sonidoAnimal(animal: SonidoSelva): void {
  grabacion?.pause();
  if (typeof Audio === 'undefined' || !GRABADOS.has(animal)) return IMITACIONES[animal]();
  grabacion = new Audio(`/assets/sonidos/${animal}.mp3`);
  grabacion.play().catch(() => IMITACIONES[animal]());
}

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

// --- Señales del globo ---------------------------------------------------------------

/** Tres golpes graves de tambor: aterrizamos en el desierto. */
const tambor = (): void =>
  [0, 0.35, 0.7, 0.85].forEach((t) => {
    tono(110, 0.35, t, 'sine', { hasta: 55, volumen: 0.6 });
    ruido(0.12, { filtro: 'lowpass', frecuencia: 900, volumen: 0.35, retraso: t, ataque: 0.005 });
  });

/** Una campana que suena dos veces: aterrizamos en el fondo del mar. */
const campana = (): void =>
  [0, 0.9].forEach((t) => {
    tono(880, 1.6, t, 'sine', { volumen: 0.3 });
    tono(2210, 1.0, t, 'sine', { volumen: 0.1 });
    tono(1320, 1.2, t, 'triangle', { volumen: 0.06 });
  });

/** Maracas: ruido agudo y cortito, al ritmo. */
const maracas = (): void =>
  [0, 0.18, 0.36, 0.6, 0.78, 0.96].forEach((t) =>
    ruido(0.09, { filtro: 'highpass', frecuencia: 5000, volumen: 0.45, retraso: t, ataque: 0.005 }),
  );

export const senal: Record<Senal, () => void> = { tambor, campana, maracas };

// --- Música para moverse (estatua musical y vuelo) --------------------------------------

const MELODIAS = {
  animada: { notas: [523, 659, 784, 659, 587, 698, 880, 698], paso: 0.22, tipo: 'triangle' },
  suave: { notas: [392, 440, 523, 440, 392, 330, 294, 330], paso: 0.55, tipo: 'sine' },
} as const;

/** Toca una melodía en bucle hasta que se llame a la función que devuelve. */
export function musica(estilo: keyof typeof MELODIAS): () => void {
  const { notas, paso, tipo } = MELODIAS[estilo];
  let i = 0;
  const tocar = () => {
    tono(notas[i % notas.length] ?? 440, paso * 0.9, 0, tipo, { volumen: 0.12 });
    if (i % 2 === 0)
      tono((notas[i % notas.length] ?? 440) / 2, paso * 1.6, 0, 'sine', { volumen: 0.08 });
    i += 1;
  };
  tocar();
  const reloj = window.setInterval(tocar, paso * 1000);
  return () => window.clearInterval(reloj);
}

// --- Toques suaves de la interfaz ------------------------------------------------------

/**
 * Una nota de kalimba: seno con un armónico muy bajito, ataque suave y caída corta,
 * filtrada para que no suene chillona. Pensada para repetirse muchas veces sin cansar.
 */
function kalimba(frecuencia: number, retraso = 0, volumen = 0.07): void {
  const ctx = audio();
  if (!ctx) return;
  const inicio = ctx.currentTime + retraso;
  const filtro = ctx.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = 2200;
  const vol = ctx.createGain();
  vol.gain.setValueAtTime(0.0001, inicio);
  vol.gain.exponentialRampToValueAtTime(volumen, inicio + 0.012);
  vol.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.45);
  vol.connect(filtro).connect(ctx.destination);
  [
    [1, 1],
    [3.01, 0.12],
  ].forEach(([multiplo = 1, nivel = 1]) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frecuencia * multiplo;
    g.gain.value = nivel;
    osc.connect(g).connect(vol);
    osc.start(inicio);
    osc.stop(inicio + 0.5);
  });
}

/** El toque de cualquier botón: una nota suave y grave de kalimba. */
export const toqueSuave = (): void => kalimba(587.33);

/** Pasar de pantalla: dos notas que suben (o bajan, al volver), como una campanita lejana. */
export const pasarPantalla = (adelante = true): void => {
  const [a, b] = adelante ? [523.25, 783.99] : [783.99, 523.25];
  kalimba(a, 0, 0.06);
  kalimba(b, 0.09, 0.05);
};

/** El golpe del sello sobre el pasaporte: un «tum» grave y acolchado. */
export const golpeSello = (): void => {
  tono(150, 0.35, 0, 'sine', { hasta: 60, volumen: 0.35 });
  ruido(0.18, { filtro: 'lowpass', frecuencia: 500, volumen: 0.25, ataque: 0.004 });
};
