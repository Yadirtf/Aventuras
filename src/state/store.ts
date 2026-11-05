/**
 * Estado del explorador guardado en el navegador (localStorage).
 * No se guarda ningún dato fuera del dispositivo.
 */

export interface Estado {
  explorador: string;
  completadas: string[];
  modoDocente: boolean;
  /** null = seguir la preferencia del sistema operativo. */
  menosMovimiento: boolean | null;
}

export const CLAVE = 'camino-aventuras:v1';
export const LARGO_MAXIMO_NOMBRE = 30;

const inicial = (): Estado => ({
  explorador: '',
  completadas: [],
  modoDocente: false,
  menosMovimiento: null,
});

/** Lo mínimo de `Storage` que usamos, para poder probarlo sin navegador. */
export type Almacen = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function leer(almacen: Almacen | null): Estado {
  try {
    const crudo = almacen?.getItem(CLAVE);
    if (!crudo) return inicial();
    const datos = JSON.parse(crudo) as Partial<Estado>;
    return {
      explorador:
        typeof datos.explorador === 'string' ? datos.explorador.slice(0, LARGO_MAXIMO_NOMBRE) : '',
      completadas: Array.isArray(datos.completadas)
        ? [...new Set(datos.completadas.filter((x): x is string => typeof x === 'string'))]
        : [],
      modoDocente: datos.modoDocente === true,
      menosMovimiento: typeof datos.menosMovimiento === 'boolean' ? datos.menosMovimiento : null,
    };
  } catch {
    return inicial();
  }
}

type Oyente = (estado: Readonly<Estado>) => void;

export class Store {
  #estado: Estado;
  readonly #oyentes = new Set<Oyente>();

  constructor(private readonly almacen: Almacen | null) {
    this.#estado = leer(almacen);
  }

  get estado(): Readonly<Estado> {
    return this.#estado;
  }

  get completadas(): ReadonlySet<string> {
    return new Set(this.#estado.completadas);
  }

  suscribir(oyente: Oyente): () => void {
    this.#oyentes.add(oyente);
    return () => this.#oyentes.delete(oyente);
  }

  ponerNombre(nombre: string): void {
    this.#actualizar({ explorador: nombre.trim().slice(0, LARGO_MAXIMO_NOMBRE) });
  }

  completar(id: string): void {
    if (this.#estado.completadas.includes(id)) return;
    this.#actualizar({ completadas: [...this.#estado.completadas, id] });
  }

  cambiarModoDocente(activo: boolean): void {
    this.#actualizar({ modoDocente: activo });
  }

  cambiarMenosMovimiento(activo: boolean): void {
    this.#actualizar({ menosMovimiento: activo });
  }

  /** Borra nombre y sellos para usar la página con otro grupo. Conserva las preferencias. */
  empezarDeNuevo(): void {
    this.#actualizar({ explorador: '', completadas: [] });
  }

  #actualizar(cambios: Partial<Estado>): void {
    this.#estado = { ...this.#estado, ...cambios };
    try {
      this.almacen?.setItem(CLAVE, JSON.stringify(this.#estado));
    } catch {
      // Navegación privada o almacenamiento lleno: la página sigue funcionando sin guardar.
    }
    for (const oyente of this.#oyentes) oyente(this.#estado);
  }
}

export function almacenDelNavegador(): Almacen | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
