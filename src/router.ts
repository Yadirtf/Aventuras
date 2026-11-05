import { ECOSISTEMAS, type EcosistemaId } from './content/types';

export type Ruta =
  | { vista: 'portada' }
  | { vista: 'mapa' }
  | { vista: 'ecosistema'; ecosistema: EcosistemaId }
  | { vista: 'parada'; ecosistema: EcosistemaId; numero: number }
  | { vista: 'planeacion'; ecosistema: EcosistemaId; numero: number }
  | { vista: 'final' }
  | { vista: 'no-encontrada' };

const esEcosistema = (s: string | undefined): s is EcosistemaId =>
  ECOSISTEMAS.includes(s as EcosistemaId);

/** Convierte una ruta limpia (`/mar/2`) en la vista que debe mostrarse. */
export function interpretarRuta(pathname: string): Ruta {
  const partes = pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const [a, b, c, ...resto] = partes;

  if (partes.length === 0) return { vista: 'portada' };
  if (partes.length === 1 && a === 'mapa') return { vista: 'mapa' };
  if (partes.length === 1 && a === 'final') return { vista: 'final' };
  if (!esEcosistema(a) || resto.length > 0) return { vista: 'no-encontrada' };
  if (b === undefined) return { vista: 'ecosistema', ecosistema: a };

  const numero = /^[123]$/.test(b) ? Number(b) : NaN;
  if (Number.isNaN(numero)) return { vista: 'no-encontrada' };
  if (c === undefined) return { vista: 'parada', ecosistema: a, numero };
  if (c === 'planeacion') return { vista: 'planeacion', ecosistema: a, numero };
  return { vista: 'no-encontrada' };
}

export const rutas = {
  portada: '/',
  mapa: '/mapa',
  final: '/final',
  ecosistema: (eco: EcosistemaId) => `/${eco}`,
  parada: (eco: EcosistemaId, numero: number) => `/${eco}/${numero}`,
  planeacion: (eco: EcosistemaId, numero: number) => `/${eco}/${numero}/planeacion`,
};

type AlNavegar = (ruta: Ruta, opciones: { esNavegacion: boolean }) => void;

/** Enrutador con la History API: intercepta los enlaces internos y el botón Atrás. */
export class Router {
  constructor(private readonly alNavegar: AlNavegar) {}

  iniciar(): void {
    window.addEventListener('popstate', () => this.#mostrar(true));
    document.addEventListener('click', (evento) => {
      if (evento.defaultPrevented || evento.button !== 0) return;
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
      const enlace = (evento.target as Element | null)?.closest('a');
      if (!enlace || enlace.target || enlace.hasAttribute('download')) return;
      const url = new URL(enlace.href, location.href);
      if (url.origin !== location.origin) return;
      evento.preventDefault();
      this.ir(url.pathname);
    });
    this.#mostrar(false);
  }

  ir(pathname: string): void {
    if (pathname !== location.pathname) history.pushState(null, '', pathname);
    this.#mostrar(true);
  }

  /** Vuelve a pintar la vista actual sin moverse (por ejemplo, tras ganar un sello). */
  refrescar(): void {
    this.alNavegar(interpretarRuta(location.pathname), { esNavegacion: false });
  }

  #mostrar(esNavegacion: boolean): void {
    this.alNavegar(interpretarRuta(location.pathname), { esNavegacion });
  }
}
