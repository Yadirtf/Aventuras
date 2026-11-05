import { expect, test, type Page } from '@playwright/test';

/** Abre una parada en Modo Docente para no depender del orden de desbloqueo. */
async function abrir(page: Page, ruta: string) {
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

test.describe('Parada 1: pelota preguntona', () => {
  test('la pelota se detiene en las 5 preguntas y el juego termina', async ({ page }) => {
    await abrir(page, '/desierto/1');
    const boton = page
      .locator('.juego--pelota')
      .getByRole('button', { name: /Empezar palmas|¡Alto!/ });
    for (let i = 0; i < 5; i++) {
      await boton.click(); // empezar
      await page.waitForTimeout(800);
      await boton.click(); // ¡alto!
      await expect(page.locator('.ronda__estacion--hecha')).toHaveCount(i + 1);
    }
    await expect(page.locator('.juego--pelota .burbuja__frase').first()).toContainText(
      'todas las preguntas',
      {
        timeout: 5000,
      },
    );
    await expect(page.getByRole('button', { name: '¡Lo logramos! Poner el sello' })).toHaveClass(
      /boton--latido/,
    );
  });

  test('las ideas del mural se guardan y se pueden quitar', async ({ page }) => {
    await abrir(page, '/desierto/1');
    await page.getByLabel('Escriban una idea y elijan dónde pegarla:').fill('Hace mucho calor');
    await page.locator('.mural__botones').getByRole('button', { name: 'Clima' }).click();
    await expect(page.locator('.mural__columna[aria-label="Clima"] .nota')).toHaveText(
      /Hace mucho calor/,
    );
    await page.reload();
    await expect(page.locator('.mural__columna[aria-label="Clima"] .nota')).toHaveCount(1);
    await page.getByRole('button', { name: 'Quitar «Hace mucho calor»' }).click();
    await expect(page.locator('.mural__columna[aria-label="Clima"] .nota')).toHaveCount(0);
  });

  test('se puede dibujar en el lienzo con el pincel de arena', async ({ page }) => {
    await abrir(page, '/desierto/1');
    const lienzo = page.locator('.lienzo__papel');
    await lienzo.scrollIntoViewIfNeeded();
    const antes = await lienzo.evaluate((c: HTMLCanvasElement) => c.toDataURL());
    await page.getByRole('button', { name: 'Pincel de arena' }).click();
    await lienzo.scrollIntoViewIfNeeded();
    const caja = await lienzo.boundingBox();
    if (!caja) throw new Error('sin lienzo');
    await page.mouse.move(caja.x + 50, caja.y + 50);
    await page.mouse.down();
    await page.mouse.move(caja.x + 200, caja.y + 120, { steps: 8 });
    await page.mouse.up();
    expect(await lienzo.evaluate((c: HTMLCanvasElement) => c.toDataURL())).not.toBe(antes);
  });
});

test.describe('Parada 2: títeres', () => {
  test('las tarjetas se voltean', async ({ page }) => {
    await abrir(page, '/desierto/2');
    const tarjeta = page.locator('.tarjeta').first();
    await tarjeta.click();
    await expect(tarjeta).toHaveAttribute('aria-pressed', 'true');
  });

  test('la mímica sortea, cuenta y revela', async ({ page }) => {
    await abrir(page, '/desierto/2');
    const mimica = page.locator('.mimica');
    await mimica.getByRole('button', { name: 'Sortear animal' }).click();
    await mimica.getByRole('button', { name: 'Empezar 30 segundos' }).click();
    await expect(mimica.getByRole('timer')).not.toHaveText('30', { timeout: 3000 });
    await mimica.getByRole('button', { name: '¡Revelar!' }).click();
    await expect(mimica.locator('.mimica__estado')).toContainText('¡Era');
  });

  test('en el teatrino se sube un títere, se mueve con el teclado y dice una frase', async ({
    page,
  }) => {
    await abrir(page, '/desierto/2');
    await page.getByRole('button', { name: 'Subir camello' }).click();
    await page.locator('.teatrino__frases').getByRole('button').first().click();
    const titere = page.locator('.titere').first();
    await expect(titere.locator('.titere__globo')).toBeVisible();
    const antes = await titere.evaluate((el) => (el as HTMLElement).style.left);
    await titere.focus();
    await page.keyboard.press('ArrowRight');
    expect(await titere.evaluate((el) => (el as HTMLElement).style.left)).not.toBe(antes);
    // Escena 3: frase propia
    await page.getByRole('tab', { name: 'Escena 3' }).click();
    await page.getByRole('button', { name: 'Subir lagarto' }).click();
    await page.getByPlaceholder('Escriban lo que dice').fill('¡Encontré un oasis!');
    await page.getByRole('button', { name: 'Decir' }).click();
    await expect(page.locator('.titere__globo')).toHaveText('¡Encontré un oasis!');
  });

  test('¿Mito o realidad? llega al final', async ({ page }) => {
    await abrir(page, '/desierto/2');
    const mito = page.locator('.mito');
    for (let i = 0; i < 4; i++) {
      await mito.getByRole('button', { name: 'Mito', exact: true }).click();
      await mito.getByRole('button', { name: /Siguiente|Terminar/ }).click();
    }
    await expect(mito.locator('.burbuja__frase')).toContainText('Descubrieron 3 de 4');
  });
});

test.describe('Parada 3: rally y rompecabezas', () => {
  test('encontrar los 6 objetos y armar el rompecabezas entrega la pista del mar', async ({
    page,
  }) => {
    await abrir(page, '/desierto/3');
    // Un objeto fuera de turno no cuenta
    await page.getByRole('button', { name: 'serpiente' }).click();
    await expect(page.locator('.rally__contador')).toHaveText('Piezas: 0 de 6');

    for (const objeto of [
      'camello',
      'lagarto',
      'pañuelo',
      'gota de agua',
      'cactus',
      'reloj de arena',
    ]) {
      await page.getByRole('button', { name: objeto, exact: true }).click();
      await page.waitForTimeout(1700);
    }
    await expect(page.locator('.rompecabezas')).toBeVisible();

    for (let i = 1; i <= 6; i++) {
      await page.getByRole('button', { name: `Pieza ${i}`, exact: true }).click();
      await page.getByRole('button', { name: `Lugar ${i}`, exact: true }).click();
    }
    await expect(page.locator('.rompecabezas__mensaje')).toContainText(
      'Hay un lugar donde el agua cubre todo',
    );
    await expect(page.locator('.relevo .burbuja')).toHaveCount(2);
  });

  test('una pieza en el lugar equivocado no se queda', async ({ page }) => {
    await abrir(page, '/desierto/3');
    for (const objeto of [
      'camello',
      'lagarto',
      'pañuelo',
      'gota de agua',
      'cactus',
      'reloj de arena',
    ]) {
      await page.getByRole('button', { name: objeto, exact: true }).click();
      await page.waitForTimeout(1700);
    }
    await page.getByRole('button', { name: 'Pieza 1', exact: true }).click();
    await page.getByRole('button', { name: 'Lugar 2', exact: true }).click();
    await expect(page.locator('.rompecabezas__ayuda')).toContainText('otro lugar');
    await expect(page.locator('.rompecabezas__casilla--llena')).toHaveCount(0);
  });
});
