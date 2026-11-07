import type { Vista } from '../contexto';

/**
 * Fondo vivo generado por código: granos de arena y brillo en el desierto, burbujas en el mar,
 * hojas en la selva y nubes suaves en el resto. Se detiene con «menos movimiento» y cuando
 * la pestaña no está visible.
 */

type Tema = Vista['tema'];

interface Particula {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  giro: number;
  fase: number;
}

const COLORES: Record<Tema, string[]> = {
  general: ['#ffffff', '#fff3c4', '#e7dcff'],
  desierto: ['#f6c177', '#f2a65a', '#ffe0a3'],
  mar: ['#ffffff', '#bfe9ff', '#9fd8f5'],
  selva: ['#7cc56b', '#4fa548', '#b5e08c', '#f2c94c'],
  globo: ['#ffffff', '#e7f5ff', '#fff0f6'],
};

const CANTIDAD: Record<Tema, number> = { general: 10, desierto: 40, mar: 28, selva: 22, globo: 14 };

export class FondoAnimado {
  readonly lienzo = document.createElement('canvas');
  #ctx = this.lienzo.getContext('2d');
  #tema: Tema = 'general';
  #particulas: Particula[] = [];
  #cuadro = 0;
  #activo = false;
  /** El movimiento arranca cuando la página ya cargó, para no frenar la primera pintura. */
  #listo = false;

  constructor() {
    this.lienzo.className = 'fondo-animado';
    this.lienzo.setAttribute('aria-hidden', 'true');
    window.addEventListener('resize', () => this.#ajustar());
    document.addEventListener('visibilitychange', () => this.#actualizar());
    this.#ajustar();
    const arrancar = () =>
      window.setTimeout(() => {
        this.#listo = true;
        this.#actualizar();
      }, 1500);
    if (document.readyState === 'complete') arrancar();
    else window.addEventListener('load', arrancar, { once: true });
  }

  cambiarTema(tema: Tema): void {
    if (tema === this.#tema && this.#particulas.length > 0) return;
    this.#tema = tema;
    this.#particulas = Array.from({ length: CANTIDAD[tema] }, () => this.#nueva(true));
    this.#dibujar();
  }

  /** Activa o pausa la animación según la preferencia de movimiento. */
  moverse(activo: boolean): void {
    this.#activo = activo;
    this.#actualizar();
  }

  #actualizar(): void {
    cancelAnimationFrame(this.#cuadro);
    if (this.#activo && this.#listo && !document.hidden) this.#bucle();
    else this.#dibujar();
  }

  #ajustar(): void {
    const escala = Math.min(window.devicePixelRatio || 1, 2);
    this.lienzo.width = window.innerWidth * escala;
    this.lienzo.height = window.innerHeight * escala;
    this.#ctx?.setTransform(escala, 0, 0, escala, 0, 0);
    this.#dibujar();
  }

  #nueva(enCualquierLugar: boolean): Particula {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const t = this.#tema;
    const base = {
      x: Math.random() * w,
      y: enCualquierLugar ? Math.random() * h : 0,
      giro: Math.random() * Math.PI * 2,
      fase: Math.random() * Math.PI * 2,
    };
    if (t === 'mar')
      return {
        ...base,
        y: enCualquierLugar ? base.y : h + 20,
        r: 3 + Math.random() * 9,
        vx: 0,
        vy: -(0.3 + Math.random() * 0.7),
      };
    if (t === 'selva')
      return {
        ...base,
        y: enCualquierLugar ? base.y : -20,
        r: 6 + Math.random() * 8,
        vx: 0.2,
        vy: 0.4 + Math.random() * 0.6,
      };
    if (t === 'desierto')
      return {
        ...base,
        x: enCualquierLugar ? base.x : -10,
        r: 1 + Math.random() * 2.5,
        vx: 0.6 + Math.random() * 1.2,
        vy: 0.05,
      };
    return {
      ...base,
      x: enCualquierLugar ? base.x : -160,
      r: 40 + Math.random() * 50,
      vx: 0.15 + Math.random() * 0.2,
      vy: 0,
    };
  }

  #bucle = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.#particulas = this.#particulas.map((p) => {
      p.fase += 0.02;
      p.x += p.vx + (this.#tema === 'selva' || this.#tema === 'mar' ? Math.sin(p.fase) * 0.4 : 0);
      p.y += p.vy + (this.#tema === 'desierto' ? Math.sin(p.fase) * 0.2 : 0);
      p.giro += 0.01;
      const fuera = p.y < -40 || p.y > h + 40 || p.x > w + 200;
      return fuera ? this.#nueva(false) : p;
    });
    this.#dibujar();
    this.#cuadro = requestAnimationFrame(this.#bucle);
  };

  #dibujar(): void {
    const ctx = this.#ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const colores = COLORES[this.#tema];
    this.#particulas.forEach((p, i) => {
      ctx.fillStyle = colores[i % colores.length] ?? '#fff';
      ctx.globalAlpha = this.#tema === 'general' ? 0.55 : 0.6;
      ctx.beginPath();
      if (this.#tema === 'selva') {
        ctx.ellipse(p.x, p.y, p.r, p.r / 2.4, p.giro, 0, Math.PI * 2);
      } else if (this.#tema === 'mar') {
        ctx.strokeStyle = colores[i % colores.length] ?? '#fff';
        ctx.lineWidth = 2;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        return;
      } else if (this.#tema === 'general') {
        // nube: tres círculos
        ctx.arc(p.x, p.y, p.r * 0.6, 0, Math.PI * 2);
        ctx.arc(p.x + p.r * 0.6, p.y + p.r * 0.1, p.r * 0.5, 0, Math.PI * 2);
        ctx.arc(p.x - p.r * 0.6, p.y + p.r * 0.15, p.r * 0.45, 0, Math.PI * 2);
      } else {
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      }
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
}
