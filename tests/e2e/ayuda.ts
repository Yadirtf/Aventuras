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

/** El botón del sello late cuando el juego de la parada terminó. */
export const botonSello = (page: Page) =>
  page.getByRole('button', { name: '¡Lo logramos! Poner el sello' });
