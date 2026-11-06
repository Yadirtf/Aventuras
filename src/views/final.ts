import { burbuja } from '../components/burbuja';
import { celebrar } from '../components/celebracion';
import { figuraPersonaje } from '../components/personaje';
import { ecosistemas, personajes } from '../content';
import { ECOSISTEMAS, PERSONAJES } from '../content/types';
import type { Contexto, Vista } from '../contexto';
import { ALTO_DIPLOMA, ANCHO_DIPLOMA, dibujarDiploma, fechaEnPalabras } from '../diploma';
import { h, icono } from '../dom';
import { imagen } from '../imagenes';
import { rutas } from '../router';
import { aventuraCompleta } from '../state/progreso';
import { paisaje } from './portada';

const MENSAJE =
  '«Hemos recorrido el desierto, explorado el mundo marino y descubierto los secretos de la selva. ¡Nuestra aventura ha terminado!»';
const NOMBRE_POR_DEFECTO = 'Exploradores de segundo grado';

/** Pantalla de cierre (sección 4 de doc1.txt): celebración, recorrido y diploma. */
export function final({ store, paradas, router }: Contexto): Vista {
  const completadas = store.completadas;
  const faltan = paradas.filter((p) => !completadas.has(p.id)).length;

  if (!aventuraCompleta(paradas, completadas) && !store.estado.modoDocente) {
    return {
      titulo: 'Aventura completada',
      tema: 'general',
      contenido: h(
        'section',
        { class: 'final' },
        h('h1', { tabindex: -1 }, '¡Todavía no termina la aventura!'),
        burbuja(
          'huellita',
          `Faltan ${faltan} ${faltan === 1 ? 'sello' : 'sellos'} en el pasaporte. ¡Sigamos las huellitas!`,
          { pose: 'pregunta' },
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

  const nombre = store.estado.explorador || NOMBRE_POR_DEFECTO;
  const conseguidas = paradas.filter((p) => completadas.has(p.id));

  // --- Diploma ------------------------------------------------------------------------
  const lienzo = h('canvas', {
    class: 'diploma__lienzo',
    width: ANCHO_DIPLOMA,
    height: ALTO_DIPLOMA,
    role: 'img',
    'aria-label': `Diploma del explorador para ${nombre}, con ${conseguidas.length} sellos, del ${fechaEnPalabras(new Date())}.`,
  });
  const listo = dibujarDiploma(lienzo, {
    nombre,
    fecha: new Date(),
    sellos: conseguidas.map((p) => ({
      nombre: p.sello.nombre,
      imagen: p.sello.imagen,
      ecosistema: p.ecosistema,
    })),
  });
  const impresion = h('img', { class: 'diploma__impresion', alt: '' });

  const descargar = async () => {
    await listo;
    const enlace = document.createElement('a');
    enlace.download = `diploma-${nombre.toLowerCase().replace(/[^a-z0-9áéíóúñü]+/gi, '-')}.png`;
    enlace.href = lienzo.toDataURL('image/png');
    enlace.click();
  };

  const imprimir = async () => {
    await listo;
    impresion.src = lienzo.toDataURL('image/png');
    await impresion.decode().catch(() => undefined);
    document.documentElement.classList.add('imprimiendo-diploma');
    const limpiar = () => document.documentElement.classList.remove('imprimiendo-diploma');
    window.addEventListener('afterprint', limpiar, { once: true });
    window.print();
    // Algunos navegadores no avisan con afterprint; se limpia igual al volver.
    window.setTimeout(limpiar, 1000);
  };

  // --- Empezar de nuevo, con confirmación en dos pasos --------------------------------
  const confirmar = h(
    'div',
    { class: 'final__confirmar', hidden: true, role: 'alert' },
    h('p', null, '¿Seguro? Se borran el nombre, los sellos y los murales de este equipo.'),
    h(
      'div',
      { class: 'juego__acciones' },
      h(
        'button',
        {
          type: 'button',
          class: 'boton boton--huellita',
          onclick: () => {
            store.empezarDeNuevo();
            router.ir(rutas.portada);
          },
        },
        'Sí, empezar de nuevo',
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'boton boton--secundario',
          onclick: () => {
            confirmar.hidden = true;
            otraVez.hidden = false;
            otraVez.focus();
          },
        },
        'No, quedarnos aquí',
      ),
    ),
  );
  const otraVez = h(
    'button',
    {
      type: 'button',
      class: 'boton boton--secundario',
      onclick: () => {
        otraVez.hidden = true;
        confirmar.hidden = false;
        confirmar.querySelector('button')?.focus();
      },
    },
    icono('brujula'),
    'Una nueva aventura con otro grupo',
  );

  const contenido = h(
    'section',
    { class: 'final' },
    h(
      'header',
      { class: 'final__encabezado' },
      h(
        'h1',
        { class: 'final__titulo', tabindex: -1 },
        h('span', { class: 'final__titulo-chico' }, '¡Felicitaciones,'),
        h('span', { class: 'final__titulo-grande' }, 'exploradores!'),
      ),
      h('p', { class: 'final__nombre' }, nombre),
    ),
    paisaje(),
    h(
      'div',
      { class: 'final__huellitas', 'aria-hidden': 'true' },
      Array.from({ length: 9 }, () => imagen('huellas', { clase: 'final__huellita' })),
    ),
    burbuja('huellita', MENSAJE, { pose: 'celebracion' }),

    h(
      'section',
      { class: 'final__bloque', 'aria-labelledby': 'final-personajes' },
      h('h2', { id: 'final-personajes' }, icono('confeti'), 'Los amigos del camino'),
      h(
        'ul',
        { class: 'final__desfile' },
        PERSONAJES.map((id, i) =>
          h(
            'li',
            { class: 'final__amigo', style: `--i:${i}` },
            figuraPersonaje(id, { pose: 'celebracion' }),
            h('span', { class: 'final__amigo-nombre' }, personajes[id].corto),
          ),
        ),
      ),
    ),

    h(
      'section',
      { class: 'final__bloque', 'aria-labelledby': 'final-recorrido' },
      h('h2', { id: 'final-recorrido' }, icono('mapa'), 'Nuestro recorrido'),
      h(
        'ol',
        { class: 'final__recorrido' },
        ECOSISTEMAS.map((eco) => {
          const e = ecosistemas[eco];
          return h(
            'li',
            { class: `final__ecosistema final__ecosistema--${eco}` },
            imagen(e.imagen, { clase: 'final__ecosistema-figura' }),
            h('h3', null, e.nombre),
            h('p', null, `Guía: ${personajes[e.guia].corto}`),
            h(
              'ul',
              { class: 'final__sellos', 'aria-label': `Sellos de ${e.nombre}` },
              paradas
                .filter((p) => p.ecosistema === eco)
                .map((p) =>
                  h(
                    'li',
                    { class: 'final__sello-item' },
                    completadas.has(p.id)
                      ? imagen(p.sello.imagen, { clase: 'final__sello', carga: 'eager' })
                      : h('span', { class: 'final__sello final__sello--vacio' }),
                    h(
                      'span',
                      { class: 'final__sello-nombre' },
                      completadas.has(p.id) ? p.sello.nombre : 'Sin sello',
                    ),
                  ),
                ),
            ),
          );
        }),
      ),
    ),

    h(
      'section',
      { class: 'final__bloque diploma', 'aria-labelledby': 'final-diploma' },
      h('h2', { id: 'final-diploma' }, icono('medalla'), 'El diploma del explorador'),
      h(
        'p',
        null,
        'Descárguenlo como imagen o imprímanlo. Para tenerlo en PDF, elijan «Guardar como PDF» al imprimir.',
      ),
      h('div', { class: 'diploma__marco' }, lienzo),
      h(
        'div',
        { class: 'juego__acciones' },
        h(
          'button',
          { type: 'button', class: 'boton boton--huellita', onclick: () => void descargar() },
          icono('guardar'),
          'Descargar diploma',
        ),
        h(
          'button',
          { type: 'button', class: 'boton boton--secundario', onclick: () => void imprimir() },
          icono('impresora'),
          'Imprimir o guardar en PDF',
        ),
      ),
    ),

    h(
      'nav',
      { class: 'final__navegacion', 'aria-label': 'Después de la aventura' },
      h('a', { class: 'boton boton--secundario', href: rutas.mapa }, '← Volver al mapa'),
      otraVez,
      confirmar,
    ),
    impresion,
  );

  // La fiesta empieza cuando la pantalla ya está puesta.
  window.setTimeout(() => {
    if (contenido.isConnected) celebrar(contenido);
  }, 400);

  return { titulo: '¡Felicitaciones, exploradores!', tema: 'general', contenido };
}
