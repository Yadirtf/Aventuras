import '@fontsource/andika/latin-400.css';
import '@fontsource/andika/latin-700.css';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/componentes.css';
import './styles/vistas.css';
import './styles/juegos.css';
import './styles/juegos-mar.css';
import './styles/juegos-selva.css';
import './styles/juegos-globo.css';
import './styles/huella.css';
import './styles/imprimir.css';

import { paradas } from './content';
import { FondoAnimado } from './components/fondo-animado';
import { opciones } from './components/opciones';
import { pasaporte } from './components/pasaporte';
import type { Contexto, Vista } from './contexto';
import { h, icono } from './dom';
import { toqueSuave } from './sonido';
import { detenerVoz, usarVoz } from './voz';
import { Router, rutas, type Ruta } from './router';
import { almacenDelNavegador, Store } from './state/store';
import { ecosistema } from './views/ecosistema';
import { familia } from './views/familia';
import { final } from './views/final';
import { mapa } from './views/mapa';
import { noEncontrada } from './views/no-encontrada';
import { parada } from './views/parada';
import { planeacion } from './views/planeacion';
import { portada } from './views/portada';

const TITULO_SITIO = 'El camino de las aventuras';

const store = new Store(almacenDelNavegador());
const router = new Router(mostrar);
const ctx: Contexto = { store, router, paradas };

const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
const menosMovimiento = () => store.estado.menosMovimiento ?? prefiereMenosMovimiento.matches;

function vistaPara(ruta: Ruta): Vista {
  switch (ruta.vista) {
    case 'portada':
      return portada(ctx);
    case 'mapa':
      return mapa(ctx);
    case 'ecosistema':
      return ecosistema(ctx, ruta.ecosistema);
    case 'familia':
      return familia(ctx, ruta.ecosistema);
    case 'parada':
      return parada(ctx, ruta.ecosistema, ruta.numero);
    case 'planeacion':
      return planeacion(ctx, ruta.ecosistema, ruta.numero);
    case 'final':
      return final(ctx);
    case 'no-encontrada':
      return noEncontrada();
  }
}

// --- Estructura fija: cabecera, contenido y paneles ---------------------------------

const principal = h('main', { id: 'contenido', class: 'principal' });
const fondo = new FondoAnimado();

const panelPasaporte = h('div', { class: 'panel__cuerpo' });
const panelOpciones = h('div', { class: 'panel__cuerpo' });

function panel(titulo: string, cuerpo: HTMLElement): HTMLDialogElement {
  const dialogo = h(
    'dialog',
    { class: 'panel', 'aria-label': titulo },
    h(
      'div',
      { class: 'panel__cabecera' },
      h('h2', null, titulo),
      h(
        'button',
        {
          type: 'button',
          class: 'boton-icono',
          'aria-label': 'Cerrar',
          onclick: () => dialogo.close(),
        },
        '✕',
      ),
    ),
    cuerpo,
  );
  // Cerrar al tocar fuera del panel.
  dialogo.addEventListener('click', (e) => e.target === dialogo && dialogo.close());
  return dialogo;
}

const dialogoPasaporte = panel('Pasaporte del Explorador', panelPasaporte);
const dialogoOpciones = panel('Opciones', panelOpciones);

const cuentaSellos = h('span', { class: 'cabecera__cuenta' });
const indicadorDocente = h('span', { class: 'cabecera__docente', hidden: true }, 'Modo Docente');

const cabecera = h(
  'header',
  { class: 'cabecera' },
  h(
    'a',
    { class: 'cabecera__marca', href: rutas.portada },
    icono('huellas', 'icono cabecera__logo'),
    TITULO_SITIO,
  ),
  indicadorDocente,
  h(
    'div',
    { class: 'cabecera__acciones' },
    h(
      'button',
      {
        type: 'button',
        class: 'boton boton--pasaporte',
        onclick: () => {
          panelPasaporte.replaceChildren(pasaporte(ctx, () => dialogoPasaporte.close()));
          dialogoPasaporte.showModal();
        },
      },
      icono('libro'),
      h('span', { class: 'cabecera__etiqueta' }, 'Pasaporte'),
      cuentaSellos,
    ),
    h(
      'button',
      {
        type: 'button',
        class: 'boton-icono',
        'aria-label': 'Opciones',
        onclick: () => {
          panelOpciones.replaceChildren(opciones(store, menosMovimiento()));
          dialogoOpciones.showModal();
        },
      },
      icono('engranaje'),
    ),
  ),
);

document.body.replaceChildren(
  fondo.lienzo,
  h('a', { class: 'saltar', href: '#contenido' }, 'Saltar al contenido'),
  cabecera,
  principal,
  dialogoPasaporte,
  dialogoOpciones,
);

// La huella ocupa justo el alto que deja la cabecera, para jugarla sin scroll.
new ResizeObserver(() =>
  document.documentElement.style.setProperty('--alto-cabecera', `${cabecera.offsetHeight}px`),
).observe(cabecera);

/**
 * Toque suave al presionar un botón o un enlace con forma de botón. Los que ya tienen su
 * propio sonido (pasar de pantalla) lo indican con data-sonido.
 */
document.addEventListener(
  'click',
  (evento) => {
    if (!store.estado.sonidoBotones) return;
    const boton = (evento.target as Element | null)?.closest<HTMLElement>(
      'button, a.boton, a.tarjeta-parada__cuerpo, [role="button"]',
    );
    if (!boton || boton.matches(':disabled') || boton.dataset.sonido) return;
    toqueSuave();
  },
  true,
);

// --- Sincronización con el estado ----------------------------------------------------

function actualizarCromo(): void {
  const completadas = store.completadas;
  const total = paradas.filter((p) => completadas.has(p.id)).length;
  cuentaSellos.textContent = `${total}/${paradas.length}`;
  indicadorDocente.hidden = !store.estado.modoDocente;
  usarVoz(store.estado.voz);
  document.documentElement.dataset.movimiento = menosMovimiento() ? 'reducido' : 'normal';
  fondo.moverse(!menosMovimiento());
  if (dialogoPasaporte.open) {
    panelPasaporte.replaceChildren(pasaporte(ctx, () => dialogoPasaporte.close()));
  }
}

function mostrar(ruta: Ruta, { esNavegacion }: { esNavegacion: boolean }): void {
  const vista = vistaPara(ruta);
  document.title = ruta.vista === 'portada' ? TITULO_SITIO : `${vista.titulo} · ${TITULO_SITIO}`;
  document.body.dataset.tema = vista.tema;
  fondo.cambiarTema(vista.tema);
  principal.replaceChildren(vista.contenido);

  if (esNavegacion) {
    detenerVoz();
    principal.classList.remove('entrada');
    void principal.offsetWidth; // reinicia la animación de entrada
    principal.classList.add('entrada');
    window.scrollTo(0, 0);
    principal.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
  }
}

/** Solo se vuelve a pintar la vista si cambia algo que la afecta (no al pegar notas del mural). */
const huella = () => {
  const { explorador, completadas, modoDocente } = store.estado;
  return JSON.stringify([explorador, completadas, modoDocente]);
};
let ultimaHuella = huella();
store.suscribir(() => {
  actualizarCromo();
  const nueva = huella();
  if (nueva !== ultimaHuella) {
    ultimaHuella = nueva;
    router.refrescar();
  }
});
prefiereMenosMovimiento.addEventListener('change', actualizarCromo);

actualizarCromo();
router.iniciar();

// Uso sin internet: el service worker guarda la página la primera vez que se abre.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}
