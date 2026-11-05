import { sinMovimiento } from '../dom';
import { fanfarria } from '../sonido';

const COLORES = ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#c77dff', '#ff9f45'];

/** Lluvia de confeti sobre un elemento (o la pantalla) y una fanfarria corta. */
export function celebrar(sobre: HTMLElement = document.body): void {
  fanfarria();
  if (sinMovimiento()) return;
  const capa = document.createElement('div');
  capa.className = 'confeti';
  capa.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 40; i++) {
    const pieza = document.createElement('span');
    pieza.style.left = `${Math.random() * 100}%`;
    pieza.style.background = COLORES[i % COLORES.length] ?? '#ffd93d';
    pieza.style.animationDelay = `${Math.random() * 0.4}s`;
    pieza.style.setProperty('--giro', `${Math.random() * 720 - 360}deg`);
    pieza.style.setProperty('--deriva', `${Math.random() * 120 - 60}px`);
    capa.append(pieza);
  }
  sobre.append(capa);
  window.setTimeout(() => capa.remove(), 2600);
}
