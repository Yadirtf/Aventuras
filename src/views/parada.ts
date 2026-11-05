import { buscarParada, ecosistemas, type EcosistemaId } from '../content';
import { burbuja } from '../components/burbuja';
import { celebrar } from '../components/celebracion';
import { rinconCalma } from '../components/rincon-calma';
import type { Contexto, Vista } from '../contexto';
import { h, icono } from '../dom';
import { imagen } from '../imagenes';
import { montarJuego } from '../juegos';
import { rutas } from '../router';
import { estadoDeParada, siguienteParada } from '../state/progreso';
import { noEncontrada } from './no-encontrada';

export const ID_SELLO = 'sello-conseguido';

/**
 * Plantilla común a las 9 paradas: llegada del guía, reto en pantalla (el juego),
 * reto de movimiento, sello, pista y rincón de calma.
 */
export function parada(ctx: Contexto, eco: EcosistemaId, numero: number): Vista {
  const p = buscarParada(eco, numero);
  if (!p) return noEncontrada();

  const { store, paradas } = ctx;
  const { modoDocente } = store.estado;
  const estado = estadoDeParada(paradas, p.id, store.completadas, modoDocente);
  const posicion = paradas.indexOf(p) + 1;
  const siguiente = siguienteParada(paradas, p.id);
  const [guia = 'huellita'] = p.guias;
  const ecosistema = ecosistemas[eco];

  const encabezado = h(
    'header',
    { class: 'parada__encabezado' },
    h(
      'p',
      { class: 'parada__miga' },
      h('a', { href: rutas.ecosistema(eco) }, ecosistema.nombre),
      ` · Parada ${numero} de 3`,
    ),
    h('h1', { tabindex: -1 }, p.titulo),
  );

  if (estado === 'bloqueada') {
    return {
      titulo: p.titulo,
      tema: eco,
      contenido: h(
        'section',
        { class: 'parada parada--bloqueada' },
        encabezado,
        burbuja(
          'huellita',
          '¡Esta parada todavía está dormida! Completa la anterior para despertarla.',
          {
            pose: 'pregunta',
          },
        ),
        h(
          'a',
          { class: 'boton boton--huellita', href: rutas.mapa },
          icono('huellas'),
          'Volver al mapa',
        ),
      ),
    };
  }

  const completada = estado === 'completada';

  const botonSello = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--huellita boton--grande',
      onclick: () => {
        store.completar(p.id);
        const sello = document.getElementById(ID_SELLO);
        sello?.focus();
        if (sello?.parentElement) celebrar(sello.parentElement);
      },
    },
    imagen(p.sello.imagen, { clase: 'icono', carga: 'eager' }),
    '¡Lo logramos! Poner el sello',
  );

  const sello = completada
    ? h(
        'section',
        {
          class: 'parada__bloque parada__sello parada__sello--puesto',
          'aria-labelledby': ID_SELLO,
        },
        h(
          'h2',
          { id: ID_SELLO, tabindex: -1 },
          imagen(p.sello.imagen, { clase: 'sello-grande', carga: 'eager' }),
          `¡Sello «${p.sello.nombre}» conseguido!`,
        ),
        h(
          'div',
          { class: 'pista' },
          h('h3', null, icono('sobre'), 'Pista para la siguiente aventura'),
          h('p', null, p.pista),
        ),
        h(
          'div',
          { class: 'parada__siguiente' },
          siguiente
            ? h(
                'a',
                {
                  class: 'boton boton--huellita boton--grande',
                  href: rutas.parada(siguiente.ecosistema, siguiente.numero),
                },
                icono('huellas'),
                `Ir a la parada ${posicion + 1}`,
              )
            : h(
                'a',
                { class: 'boton boton--huellita boton--grande', href: rutas.final },
                icono('trofeo'),
                'Ver el final de la aventura',
              ),
          numero === 3 &&
            ecosistema.familia &&
            h(
              'a',
              { class: 'boton boton--secundario', href: rutas.familia(eco) },
              icono('familia'),
              'Tarjeta para la familia',
            ),
        ),
      )
    : h(
        'section',
        { class: 'parada__bloque parada__sello' },
        h('h2', null, icono('medalla'), 'El sello'),
        h(
          'p',
          null,
          `Cuando terminen los retos, Huellita pone el sello «${p.sello.nombre}» en el pasaporte.`,
        ),
        botonSello,
      );

  const juego = p.juego
    ? montarJuego(p.juego, p, store, () => {
        if (!completada) botonSello.classList.add('boton--latido');
      })
    : h(
        'div',
        { class: 'en-construccion', role: 'note' },
        icono('rompecabezas'),
        'Este juego se está construyendo. Por ahora, hagan el reto en el salón.',
      );

  return {
    titulo: p.titulo,
    tema: eco,
    contenido: h(
      'section',
      { class: 'parada' },
      encabezado,
      h(
        'section',
        { class: 'parada__llegada', 'aria-label': 'Llegada del guía' },
        burbuja(guia, p.saludo),
      ),
      h(
        'section',
        { class: 'parada__bloque' },
        h('h2', null, icono('control'), 'Reto en pantalla'),
        h('p', { class: 'parada__intro' }, p.retoPantalla),
        juego,
      ),
      h(
        'section',
        { class: 'parada__bloque' },
        h('h2', null, icono('acrobata'), 'Reto de movimiento'),
        h('p', null, p.retoMovimiento),
      ),
      sello,
      rinconCalma(eco),
      h(
        'nav',
        { class: 'parada__navegacion', 'aria-label': 'Navegación de la parada' },
        h('a', { class: 'boton boton--secundario', href: rutas.mapa }, '← Volver al mapa'),
        modoDocente &&
          h(
            'a',
            { class: 'boton boton--secundario', href: rutas.planeacion(eco, numero) },
            icono('documento'),
            'Ver planeación',
          ),
      ),
    ),
  };
}
