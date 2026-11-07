import { expect, test } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

test('después de la primera visita, la aventura funciona sin internet', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // La primera vez el service worker aún no controla la página; con recargar ya sí.
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

  await context.setOffline(true);
  await page.goto('/desierto/1');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // El juego del desierto se carga aparte y también quedó guardado.
  await expect(page.locator('.juego--cargando')).toHaveCount(0);
  await expect(page.locator('.juego--pelota').first()).toBeVisible();
  await expect(page.locator('img.figura, .parada img').first()).toBeVisible();
  await page.getByRole('button', { name: 'Opciones' }).click();
  await expect(page.getByText('Lista para usar sin internet')).toBeVisible();
});
