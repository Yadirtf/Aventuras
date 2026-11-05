import { ECOSISTEMAS, PERSONAJES, type Parada } from './types';

/**
 * Valida en tiempo de ejecución que un JSON de parada tenga todos los campos.
 * Reúne todos los errores para que quien edite el contenido los vea de una vez.
 */
export class ContenidoInvalido extends Error {
  constructor(
    readonly origen: string,
    readonly errores: string[],
  ) {
    super(`Contenido inválido en ${origen}:\n- ${errores.join('\n- ')}`);
    this.name = 'ContenidoInvalido';
  }
}

type Registro = Record<string, unknown>;

const esRegistro = (v: unknown): v is Registro =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const esTexto = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

class Revisor {
  readonly errores: string[] = [];

  texto(obj: Registro, campo: string, ruta: string): void {
    if (!esTexto(obj[campo])) this.errores.push(`${ruta}${campo}: falta o está vacío`);
  }

  textoONulo(obj: Registro, campo: string, ruta: string): void {
    if (!(campo in obj)) this.errores.push(`${ruta}${campo}: falta (usa null si no aplica)`);
    else if (obj[campo] !== null && !esTexto(obj[campo]))
      this.errores.push(`${ruta}${campo}: debe ser texto o null`);
  }

  listaDeTextos(obj: Registro, campo: string, ruta: string, { vacia = true } = {}): void {
    const v = obj[campo];
    if (!Array.isArray(v)) {
      this.errores.push(`${ruta}${campo}: debe ser una lista`);
      return;
    }
    if (!vacia && v.length === 0) this.errores.push(`${ruta}${campo}: no puede estar vacía`);
    v.forEach((item, i) => {
      if (!esTexto(item)) this.errores.push(`${ruta}${campo}[${i}]: debe ser texto`);
    });
  }

  pasos(obj: Registro, campo: string, ruta: string): void {
    const v = obj[campo];
    if (!Array.isArray(v) || v.length === 0) {
      this.errores.push(`${ruta}${campo}: debe ser una lista con al menos un paso`);
      return;
    }
    v.forEach((paso, i) => {
      const r = `${ruta}${campo}[${i}].`;
      if (!esRegistro(paso)) {
        this.errores.push(`${r.slice(0, -1)}: debe ser un objeto`);
        return;
      }
      this.texto(paso, 'texto', r);
      if ('titulo' in paso && !esTexto(paso.titulo)) this.errores.push(`${r}titulo: vacío`);
      if ('lista' in paso) this.listaDeTextos(paso, 'lista', r, { vacia: false });
    });
  }
}

export function validarParada(datos: unknown, origen: string): Parada {
  const r = new Revisor();
  if (!esRegistro(datos)) throw new ContenidoInvalido(origen, ['el archivo no es un objeto']);

  r.texto(datos, 'id', '');
  if (!ECOSISTEMAS.includes(datos.ecosistema as never))
    r.errores.push(`ecosistema: debe ser uno de ${ECOSISTEMAS.join(', ')}`);
  if (![1, 2, 3].includes(datos.numero as number)) r.errores.push('numero: debe ser 1, 2 o 3');
  if (esTexto(datos.id) && datos.id !== `${String(datos.ecosistema)}-${String(datos.numero)}`)
    r.errores.push('id: debe ser «ecosistema-numero»');
  for (const campo of ['titulo', 'saludo', 'retoPantalla', 'retoMovimiento', 'pista'])
    r.texto(datos, campo, '');

  if (!Array.isArray(datos.guias) || datos.guias.length === 0)
    r.errores.push('guias: debe tener al menos un personaje');
  else
    datos.guias.forEach((g, i) => {
      if (!PERSONAJES.includes(g as never))
        r.errores.push(`guias[${i}]: personaje desconocido «${String(g)}»`);
    });

  if (!esRegistro(datos.sello)) r.errores.push('sello: falta');
  else {
    r.texto(datos.sello, 'nombre', 'sello.');
    r.texto(datos.sello, 'icono', 'sello.');
  }

  const p = datos.planeacion;
  if (!esRegistro(p)) r.errores.push('planeacion: falta');
  else {
    const ruta = 'planeacion.';
    for (const campo of ['tema', 'autora', 'duracion', 'objetivo', 'tiempos'])
      r.texto(p, campo, ruta);
    r.textoONulo(p, 'docenteTutora', ruta);
    r.textoONulo(p, 'fecha', ruta);
    for (const campo of ['inicio', 'desarrollo', 'cierre']) r.pasos(p, campo, ruta);
    r.listaDeTextos(p, 'materiales', ruta, { vacia: false });
    r.listaDeTextos(p, 'indicadoresDeLogro', ruta);
    r.listaDeTextos(p, 'observaciones', ruta);
    r.listaDeTextos(p, 'pendientes', ruta);

    if (
      Array.isArray(p.indicadoresDeLogro) &&
      p.indicadoresDeLogro.length === 0 &&
      Array.isArray(p.pendientes) &&
      !p.pendientes.some((x) => typeof x === 'string' && /indicadores/i.test(x))
    )
      r.errores.push(`${ruta}indicadoresDeLogro: vacío sin anotarlo en pendientes`);

    if (!Array.isArray(p.anexos)) r.errores.push(`${ruta}anexos: debe ser una lista`);
    else
      p.anexos.forEach((a, i) => {
        const ra = `${ruta}anexos[${i}].`;
        if (!esRegistro(a)) return r.errores.push(`${ra.slice(0, -1)}: debe ser un objeto`);
        r.texto(a, 'titulo', ra);
        if ('url' in a && !(typeof a.url === 'string' && /^https:\/\//.test(a.url)))
          r.errores.push(`${ra}url: debe empezar por https://`);
      });
  }

  if (r.errores.length > 0) throw new ContenidoInvalido(origen, r.errores);
  return datos as unknown as Parada;
}
