import { describe, expect, it, vi } from 'vitest';
import { CLAVE, Store, type Almacen } from '../src/state/store';

function almacenFalso(inicial?: string): Almacen & { datos: Map<string, string> } {
  const datos = new Map<string, string>();
  if (inicial !== undefined) datos.set(CLAVE, inicial);
  return {
    datos,
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => void datos.set(k, v),
    removeItem: (k) => void datos.delete(k),
  };
}

describe('Store', () => {
  it('guarda el progreso y lo recupera al recargar', () => {
    const almacen = almacenFalso();
    const store = new Store(almacen);
    store.ponerNombre('  Los Jaguares  ');
    store.completar('desierto-1');
    store.completar('desierto-1');

    const recargado = new Store(almacen);
    expect(recargado.estado.explorador).toBe('Los Jaguares');
    expect(recargado.estado.completadas).toEqual(['desierto-1']);
  });

  it('«Empezar de nuevo» borra nombre y sellos, pero no las preferencias', () => {
    const store = new Store(almacenFalso());
    store.ponerNombre('Ana');
    store.completar('desierto-1');
    store.cambiarModoDocente(true);
    store.empezarDeNuevo();
    expect(store.estado).toMatchObject({ explorador: '', completadas: [], modoDocente: true });
  });

  it('mueve una idea del mural a otra columna', () => {
    const store = new Store(almacenFalso());
    store.agregarNota('desierto-1:Clima', 'serpiente');
    store.agregarNota('desierto-1:Clima', 'hace calor');
    store.moverNota('desierto-1:Clima', 0, 'desierto-1:Animales');
    expect(store.notas('desierto-1:Clima')).toEqual(['hace calor']);
    expect(store.notas('desierto-1:Animales')).toEqual(['serpiente']);
  });

  it('cuelga y descuelga dibujos, y «Empezar de nuevo» los borra', () => {
    const store = new Store(almacenFalso());
    store.colgarDibujo('desierto-1', 'data:image/jpeg;base64,AAA');
    store.colgarDibujo('desierto-1', 'no es una imagen');
    store.colgarDibujo('desierto-1', 'data:image/jpeg;base64,BBB');
    store.descolgarDibujo('desierto-1', 0);
    expect(store.dibujos('desierto-1')).toEqual(['data:image/jpeg;base64,BBB']);
    store.empezarDeNuevo();
    expect(store.dibujos('desierto-1')).toEqual([]);
  });

  it('ignora datos guardados dañados', () => {
    expect(new Store(almacenFalso('{no es json')).estado.completadas).toEqual([]);
    const raro = new Store(
      almacenFalso(JSON.stringify({ completadas: [1, 'mar-1'], modoDocente: 'sí' })),
    );
    expect(raro.estado.completadas).toEqual(['mar-1']);
    expect(raro.estado.modoDocente).toBe(false);
  });

  it('funciona sin almacenamiento (navegación privada)', () => {
    const store = new Store(null);
    store.completar('mar-1');
    expect(store.completadas.has('mar-1')).toBe(true);
  });

  it('avisa a los suscriptores en cada cambio', () => {
    const store = new Store(almacenFalso());
    const oyente = vi.fn();
    const quitar = store.suscribir(oyente);
    store.completar('mar-1');
    quitar();
    store.completar('mar-2');
    expect(oyente).toHaveBeenCalledTimes(1);
  });
});
