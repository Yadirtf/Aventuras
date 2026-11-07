import type { Page } from '@playwright/test';

/** Abre una parada en Modo Docente para no depender del orden de desbloqueo. */
export async function abrir(page: Page, ruta: string): Promise<void> {
  await page.addInitScript(() => {
    // Solo la primera vez: así una recarga conserva lo guardado.
    if (localStorage.getItem('camino-aventuras:v1')) return;
    localStorage.setItem(
      'camino-aventuras:v1',
      JSON.stringify({
        explorador: 'Prueba',
        completadas: [],
        modoDocente: true,
        menosMovimiento: true,
        mural: {},
      }),
    );
  });
  page.on('pageerror', (e) => {
    throw e;
  });
  await page.goto(ruta);
}

/** El último paso de la huella (el sello) late cuando el juego de la parada terminó. */
export const selloListo = (page: Page) => page.locator('.huella__paso').last();

/** Pasa a la pantalla de la huella que tiene ese título (los botones de la barra de pasos). */
export async function pantalla(page: Page, titulo: string): Promise<void> {
  await page
    .getByRole('list', { name: 'Pantallas de esta huella' })
    .getByRole('button', { name: new RegExp(`^Pantalla \\d+ de \\d+: ${escapar(titulo)}$`) })
    .click();
}

/** Pasa a la pantalla del sello, la última de la huella. */
export async function pantallaSello(page: Page): Promise<void> {
  await pantalla(page, 'El sello');
}

const escapar = (texto: string) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
