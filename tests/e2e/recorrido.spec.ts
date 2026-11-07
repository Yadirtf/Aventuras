import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (e) => {
    throw e;
  });
});

test('de la portada al final, con progreso que sobrevive a recargar', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('¿Cómo se llama el explorador o el grupo?').fill('Los Jaguares');
  await page.getByRole('button', { name: 'Comenzar aventura' }).click();
  await expect(page).toHaveURL('/mapa');
  await expect(page.locator('.tarjeta-parada--disponible')).toHaveCount(1);

  for (let i = 0; i < 10; i++) {
    await page.locator('.tarjeta-parada--disponible a').click();
    await page.getByRole('button', { name: '¡Lo logramos! Poner el sello' }).click();
    await expect(page.locator('#sello-conseguido')).toBeFocused();
    if (i === 0) {
      await page.reload();
      await expect(page.locator('.parada__sello--puesto')).toBeVisible();
    }
    await page
      .getByRole('navigation', { name: 'Navegación de la parada' })
      .getByRole('link', { name: /Volver al mapa/ })
      .click();
  }

  await expect(page.locator('.cabecera__cuenta')).toHaveText('10/10');
  await page.getByRole('link', { name: 'Aventura completada' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Felicitaciones');
});

test('una parada bloqueada no se abre por URL y una ruta desconocida no da error', async ({
  page,
}) => {
  await page.goto('/mar/2');
  await expect(page.locator('.parada--bloqueada')).toBeVisible();
  await page.goto('/luna/9');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('no existe');
});

test('Modo Docente abre todo y muestra las 10 planeaciones', async ({ page }) => {
  await page.goto('/mapa');
  await page.getByRole('button', { name: 'Opciones' }).click();
  await page.getByRole('switch', { name: 'Modo Docente' }).check();
  await page.keyboard.press('Escape');
  await expect(page.locator('.tarjeta-parada--disponible')).toHaveCount(10);
  await expect(page.locator('.region__titulo')).toContainText([
    'Desértico',
    'Marino',
    'Selvático',
    'Gran viaje en globo',
  ]);

  for (const ruta of [
    'desierto/1',
    'desierto/2',
    'desierto/3',
    'mar/1',
    'mar/2',
    'mar/3',
    'selva/1',
    'selva/2',
    'selva/3',
    'globo/1',
  ]) {
    await page.goto(`/${ruta}/planeacion`);
    for (const seccion of ['Objetivo', 'Inicio', 'Desarrollo', 'Cierre', 'Indicadores de logro'])
      await expect(page.getByRole('heading', { name: seccion, exact: true })).toBeVisible();
  }
});

test('la tarjeta para la familia del desierto se puede abrir', async ({ page }) => {
  await page.goto('/desierto/familia');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Lo que aprendimos del desierto',
  );
  await expect(page.getByRole('button', { name: 'Imprimir tarjeta' })).toBeVisible();
});
