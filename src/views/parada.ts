import { buscarParada, ecosistemas, type EcosistemaId } from '../content';
import { burbuja } from '../components/burbuja';
import type { Contexto, Vista } from '../contexto';
import { h, icono } from '../dom';
import { rutas } from '../router';
import { estadoDeParada, siguienteParada } from '../state/progreso';
import { noEncontrada } from './no-encontrada';

export const ID_SELLO = 'sello-conseguido';

/**
 * Plantilla común a las 9 paradas: llegada del guía, reto en pantalla,
 * reto de movimiento, sello y pista. Los juegos llegan en las fases 3 a 5.
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

  const encabezado = [
    h(
      'p',
      { class: 'parada__miga' },
      h('a', { href: rutas.ecosistema(eco) }, ecosistemas[eco].nombre),
      ` · Parada ${numero} de 3`,
    ),
    h('h1', { tabindex: -1 }, p.titulo),
  ];

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
        ),
        h('a', { class: 'boton boton--huellita', href: rutas.mapa }, icono('🐾'), 'Volver al mapa'),
      ),
    };
  }

  const completada = estado === 'completada';

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
          icono(p.sello.icono, 'sello-grande'),
          ` ¡Sello «${p.sello.nombre}» conseguido!`,
        ),
        h(
          'div',
          { class: 'pista' },
          h('h3', null, icono('✉️'), ' Pista para la siguiente aventura'),
          h('p', null, p.pista),
        ),
        siguiente
          ? h(
              'a',
              {
                class: 'boton boton--huellita',
                href: rutas.parada(siguiente.ecosistema, siguiente.numero),
              },
              icono('🐾'),
              `Ir a la parada ${posicion + 1}`,
            )
          : h(
              'a',
              { class: 'boton boton--huellita', href: rutas.final },
              icono('🏆'),
              'Ver el final de la aventura',
            ),
      )
    : h(
        'section',
        { class: 'parada__bloque parada__sello' },
        h('h2', null, icono('🎫'), ' El sello'),
        h(
          'p',
          null,
          `Cuando terminen los dos retos, Huellita pone el sello «${p.sello.nombre}» en el pasaporte.`,
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'boton boton--huellita',
            onclick: () => {
              store.completar(p.id);
              document.getElementById(ID_SELLO)?.focus();
            },
          },
          icono(p.sello.icono),
          '¡Lo logramos! Poner el sello',
        ),
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
        { class: 'parada__bloque', 'aria-label': 'Llegada del guía' },
        burbuja(guia, p.saludo),
      ),
      h(
        'section',
        { class: 'parada__bloque' },
        h('h2', null, icono('🎮'), ' Reto en pantalla'),
        h('p', null, p.retoPantalla),
        h(
          'div',
          { class: 'en-construccion', role: 'note' },
          icono('🛠️'),
          ' Este juego se está construyendo. Por ahora, hagan el reto en el salón.',
        ),
      ),
      h(
        'section',
        { class: 'parada__bloque' },
        h('h2', null, icono('🤸'), ' Reto de movimiento'),
        h('p', null, p.retoMovimiento),
      ),
      sello,
      h(
        'nav',
        { class: 'parada__navegacion', 'aria-label': 'Navegación de la parada' },
        h('a', { class: 'boton boton--secundario', href: rutas.mapa }, '← Volver al mapa'),
        modoDocente &&
          h(
            'a',
            { class: 'boton boton--secundario', href: rutas.planeacion(eco, numero) },
            icono('📄'),
            'Ver planeación',
          ),
      ),
    ),
  };
}
