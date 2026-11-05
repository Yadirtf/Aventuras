import { esImagen } from '../imagenes';
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

  imagen(obj: Registro, campo: string, ruta: string): void {
    if (!esImagen(obj[campo]))
      this.errores.push(
        `${ruta}${campo}: imagen desconocida «${String(obj[campo])}» (ver src/imagenes.ts)`,
      );
  }

  numero(obj: Registro, campo: string, ruta: string, min: number, max: number): void {
    const v = obj[campo];
    if (typeof v !== 'number' || v < min || v > max)
      this.errores.push(`${ruta}${campo}: debe ser un número entre ${min} y ${max}`);
  }

  /** Revisa una lista de objetos con `revisar` y exige al menos `minimo` elementos. */
  objetos(
    obj: Registro,
    campo: string,
    ruta: string,
    minimo: number,
    revisar: (item: Registro, ruta: string) => void,
  ): void {
    const v = obj[campo];
    if (!Array.isArray(v) || v.length < minimo) {
      this.errores.push(`${ruta}${campo}: debe ser una lista con al menos ${minimo} elementos`);
      return;
    }
    v.forEach((item, i) => {
      const r = `${ruta}${campo}[${i}].`;
      if (esRegistro(item)) revisar(item, r);
      else this.errores.push(`${r.slice(0, -1)}: debe ser un objeto`);
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
    r.imagen(datos.sello, 'imagen', 'sello.');
  }

  if ('juego' in datos) validarJuego(r, datos.juego);

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

function validarJuego(r: Revisor, juego: unknown): void {
  const ruta = 'juego.';
  if (!esRegistro(juego)) {
    r.errores.push('juego: debe ser un objeto');
    return;
  }
  switch (juego.tipo) {
    case 'pelota-preguntona':
      r.listaDeTextos(juego, 'preguntas', ruta, { vacia: false });
      r.objetos(juego, 'columnas', ruta, 1, (c, rc) => {
        r.texto(c, 'nombre', rc);
        r.imagen(c, 'imagen', rc);
      });
      return;
    case 'titeres':
      r.objetos(juego, 'animales', ruta, 2, (a, ra) => {
        for (const campo of ['id', 'nombre', 'adaptacion']) r.texto(a, campo, ra);
        r.imagen(a, 'imagen', ra);
      });
      r.numero(juego, 'segundosMimica', ruta, 5, 120);
      r.objetos(juego, 'escenas', ruta, 1, (e, re) => {
        r.texto(e, 'titulo', re);
        r.texto(e, 'narracion', re);
        r.listaDeTextos(e, 'frases', re);
      });
      r.objetos(juego, 'mitos', ruta, 1, (m, rm) => {
        r.texto(m, 'texto', rm);
        r.texto(m, 'explicacion', rm);
        if (typeof m.esRealidad !== 'boolean')
          r.errores.push(`${rm}esRealidad: debe ser true o false`);
      });
      return;
    case 'rally':
      r.objetos(juego, 'pistas', ruta, 2, (p, rp) => {
        r.texto(p, 'objeto', rp);
        r.texto(p, 'pista', rp);
        r.imagen(p, 'imagen', rp);
        r.numero(p, 'x', rp, 0, 100);
        r.numero(p, 'y', rp, 0, 100);
      });
      r.texto(juego, 'reverso', ruta);
      if (!esRegistro(juego.relevo)) r.errores.push('juego.relevo: falta');
      else {
        r.texto(juego.relevo, 'despedida', 'juego.relevo.');
        r.texto(juego.relevo, 'respuesta', 'juego.relevo.');
        if (!PERSONAJES.includes(juego.relevo.siguienteGuia as never))
          r.errores.push('juego.relevo.siguienteGuia: personaje desconocido');
      }
      return;
    default:
      r.errores.push(`juego.tipo: tipo de juego desconocido «${String(juego.tipo)}»`);
  }
}
