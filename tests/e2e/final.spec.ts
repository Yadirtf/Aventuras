import { expect, test, type Page } from '@playwright/test';

const IDS = ['desierto', 'mar', 'selva'].flatMap((eco) => [1, 2, 3].map((n) => `${eco}-${n}`));

async function sembrar(page: Page, completadas: string[]): Promise<void> {
  await page.addInitScript((ids) => {
    if (localStorage.getItem('camino-aventuras:v1')) return;
    localStorage.setItem(
      'camino-aventuras:v1',
      JSON.stringify({ explorador: 'Los Jaguares', completadas: ids, menosMovimiento: true }),
    );
  }, completadas);
}

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (e) => {
    throw e;
  });
});

test('sin los 9 sellos, la pantalla final invita a seguir', async ({ page }) => {
  await sembrar(page, IDS.slice(0, 7));
  await page.goto('/final');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '¡Todavía no termina la aventura!',
  );
  await expect(page.getByText('Faltan 2 sellos')).toBeVisible();
});

test('con la aventura completa: personajes, recorrido y diploma', async ({ page }) => {
  await sembrar(page, IDS);
  await page.goto('/final');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Felicitaciones');
  await expect(page.locator('.final__nombre')).toHaveText('Los Jaguares');
  await expect(page.getByText('¡Nuestra aventura ha terminado!')).toBeVisible();
  await expect(page.locator('.final__amigo')).toHaveCount(8);
  await expect(page.locator('.final__ecosistema')).toHaveCount(3);
  await expect(page.locator('.final__sello-item img')).toHaveCount(9);
  await expect(
    page.getByRole('img', { name: /Diploma del explorador para Los Jaguares/ }),
  ).toBeVisible();

  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Descargar diploma' }).click(),
  ]);
  expect(descarga.suggestedFilename()).toBe('diploma-los-jaguares.png');

  // El diploma quedó dibujado: el lienzo no está en blanco.
  const colores = await page.locator('.diploma__lienzo').evaluate((c: HTMLCanvasElement) => {
    const datos = c.getContext('2d')?.getImageData(0, 0, c.width, c.height).data ?? [];
    const vistos = new Set<string>();
    for (let i = 0; i < datos.length; i += 4 * 997)
      vistos.add(`${datos[i]},${datos[i + 1]},${datos[i + 2]}`);
    return vistos.size;
  });
  expect(colores).toBeGreaterThan(20);
});

test('imprimir deja solo el diploma en la hoja', async ({ page }) => {
  await sembrar(page, IDS);
  await page.addInitScript(() => {
    window.print = () => {
      (window as unknown as { clasesAlImprimir: string }).clasesAlImprimir =
        document.documentElement.className;
    };
  });
  await page.goto('/final');
  await page.getByRole('button', { name: 'Imprimir o guardar en PDF' }).click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { clasesAlImprimir?: string }).clasesAlImprimir),
    )
    .toContain('imprimiendo-diploma');
  await expect(page.locator('.diploma__impresion')).toHaveAttribute('src', /^data:image\/png/);
});

test('empezar de nuevo pide confirmación y borra el progreso', async ({ page }) => {
  await sembrar(page, IDS);
  await page.goto('/final');
  await page.getByRole('button', { name: 'Una nueva aventura con otro grupo' }).click();
  await page.getByRole('button', { name: 'No, quedarnos aquí' }).click();
  await expect(
    page.getByRole('button', { name: 'Una nueva aventura con otro grupo' }),
  ).toBeFocused();

  await page.getByRole('button', { name: 'Una nueva aventura con otro grupo' }).click();
  await page.getByRole('button', { name: 'Sí, empezar de nuevo' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('.cabecera__cuenta')).toHaveText('0/9');
});

test('cada reto de movimiento tiene su alternativa tranquila', async ({ page }) => {
  await sembrar(page, IDS);
  for (const id of IDS) {
    await page.goto(`/${id.replace('-', '/')}`);
    await expect(page.locator('.parada__tranquilo')).toContainText('Alternativa tranquila');
  }
});
