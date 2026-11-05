import { buscarParada, type EcosistemaId, type Paso } from '../content';
import type { Contexto, Vista } from '../contexto';
import { h, icono } from '../dom';
import { rutas } from '../router';
import { noEncontrada } from './no-encontrada';

const CENTRO = 'Corporación Everyday Home';
const DIRIGIDO_A = 'Segundo grado de básica primaria (niños y niñas de 7 a 8 años)';

const pasos = (lista: Paso[]) =>
  lista.map((paso) =>
    h(
      'div',
      { class: 'ficha__paso' },
      paso.titulo && h('h4', null, paso.titulo),
      h('p', null, paso.texto),
      paso.lista &&
        h(
          'ul',
          null,
          paso.lista.map((item) => h('li', null, item)),
        ),
    ),
  );

const lista = (items: string[]) =>
  h(
    'ul',
    null,
    items.map((i) => h('li', null, i)),
  );

/** Ficha imprimible con la planeación completa (Modo Docente). */
export function planeacion(_ctx: Contexto, eco: EcosistemaId, numero: number): Vista {
  const p = buscarParada(eco, numero);
  if (!p) return noEncontrada();
  const pl = p.planeacion;

  const datos: [string, string][] = [
    ['Centro de práctica', CENTRO],
    ['Dirigido a', DIRIGIDO_A],
    ['Elaborada por', pl.autora],
    ...(pl.docenteTutora ? [['Docente tutora', pl.docenteTutora] as [string, string]] : []),
    ['Fecha', pl.fecha ?? 'Por definir'],
    ['Duración', pl.duracion],
  ];

  return {
    titulo: `Planeación: ${p.titulo}`,
    tema: eco,
    contenido: h(
      'article',
      { class: 'ficha' },
      h(
        'nav',
        { class: 'ficha__acciones no-imprimir', 'aria-label': 'Acciones de la planeación' },
        h(
          'a',
          { class: 'boton boton--secundario', href: rutas.parada(eco, numero) },
          '← Volver a la parada',
        ),
        h(
          'button',
          { type: 'button', class: 'boton boton--huellita', onclick: () => window.print() },
          icono('🖨️'),
          'Imprimir planeación',
        ),
      ),
      h(
        'p',
        { class: 'ficha__sobretitulo' },
        `El camino de las aventuras · Parada ${numero} de ${p.ecosistema}`,
      ),
      h('h1', { tabindex: -1 }, pl.tema),
      h(
        'dl',
        { class: 'ficha__datos' },
        datos.map(([k, v]) => [h('dt', null, k), h('dd', null, v)]),
      ),
      pl.pendientes.length > 0 &&
        h(
          'aside',
          { class: 'ficha__pendientes no-imprimir' },
          h('h2', null, 'Pendiente de la autora'),
          lista(pl.pendientes),
        ),
      h('h2', null, 'Objetivo'),
      h('p', null, pl.objetivo),
      h('h2', null, 'Inicio'),
      pasos(pl.inicio),
      h('h2', null, 'Desarrollo'),
      pasos(pl.desarrollo),
      h('h2', null, 'Cierre'),
      pasos(pl.cierre),
      h('h2', null, 'Recursos y materiales'),
      lista(pl.materiales),
      h('h2', null, 'Tiempos'),
      h('p', null, pl.tiempos),
      h('h2', null, 'Indicadores de logro'),
      pl.indicadoresDeLogro.length > 0
        ? lista(pl.indicadoresDeLogro)
        : h('p', { class: 'ficha__vacio' }, 'Por definir.'),
      pl.observaciones.length > 0 && [h('h2', null, 'Observaciones'), lista(pl.observaciones)],
      pl.anexos.length > 0 && [
        h('h2', null, 'Anexos'),
        h(
          'ul',
          null,
          pl.anexos.map((a) =>
            h(
              'li',
              null,
              a.url
                ? h('a', { href: a.url, target: '_blank', rel: 'noopener noreferrer' }, a.titulo)
                : a.titulo,
              a.url && h('span', { class: 'solo-imprimir' }, ` (${a.url})`),
            ),
          ),
        ),
      ],
    ),
  };
}
