import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PARADAS = ['desierto', 'mar', 'selva'].flatMap((eco) => [1, 2, 3].map((n) => `/${eco}/${n}`));
const RUTAS = [
  '/',
  '/mapa',
  '/desierto',
  '/mar',
  '/selva',
  ...PARADAS,
  '/desierto/1/planeacion',
  '/mar/familia',
  '/final',
];

test.describe('Accesibilidad (WCAG 2.1 AA, revisión automática con axe)', () => {
  for (const ruta of RUTAS) {
    test(`sin problemas en ${ruta}`, async ({ page }) => {
      await page.addInitScript(
        (ids) => {
          localStorage.setItem(
            'camino-aventuras:v1',
            JSON.stringify({
              explorador: 'Prueba',
              completadas: ids,
              modoDocente: true,
              menosMovimiento: true,
            }),
          );
        },
        PARADAS.map((r) => r.slice(1).replace('/', '-')),
      );
      await page.goto(ruta);
      await page.waitForLoadState('networkidle');
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const resumen = violations.map(
        (v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
      );
      expect(resumen).toEqual([]);
    });
  }
});
