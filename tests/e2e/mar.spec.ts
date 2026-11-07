import { expect, test } from '@playwright/test';
import { abrir, botonSello } from './ayuda';

test.describe('Parada 4: descubriendo el fondo del mar', () => {
  test('siluetas, dietas y «¡A comer!» llevan al sello', async ({ page }) => {
    await abrir(page, '/mar/1');
    const sombras = page.locator('.juego__parte').first();
    const animales = [
      { id: 'tiburon', nombre: 'Tiburón', dieta: 'Carnívoro', comida: 'Peces' },
      { id: 'tortuga', nombre: 'Tortuga marina', dieta: 'Herbívoro', comida: 'Algas' },
      { id: 'pez-payaso', nombre: 'Pez payaso', dieta: 'Omnívoro', comida: 'Plancton' },
      { id: 'pulpo', nombre: 'Pulpo', dieta: 'Carnívoro', comida: 'Cangrejos' },
    ];

    // Una sombra equivocada no se descubre.
    await sombras.locator('.ficha-animal[data-animal="tiburon"]').click();
    await page.locator('.sombra[data-animal="pulpo"]').click();
    await expect(page.locator('.sombra--descubierta')).toHaveCount(0);

    // El primero se arrastra; los demás se tocan.
    const [primero, ...resto] = animales;
    if (!primero) throw new Error('sin animales');
    await sombras
      .locator(`.ficha-animal[data-animal="${primero.id}"]`)
      .dragTo(page.locator(`.sombra[data-animal="${primero.id}"]`));
    await expect(page.locator('.sombra--descubierta')).toHaveCount(1);
    for (const a of resto) {
      await sombras.locator(`.ficha-animal[data-animal="${a.id}"]`).click();
      await page.locator(`.sombra[data-animal="${a.id}"]`).click();
    }
    await expect(page.locator('.sombra--descubierta')).toHaveCount(4);

    for (const a of animales)
      await page
        .locator(`.dieta[data-animal="${a.id}"]`)
        .getByRole('button', { name: a.dieta })
        .click();
    await expect(page.locator('.dieta--resuelta')).toHaveCount(4);

    for (const a of animales) {
      await page.getByRole('button', { name: a.nombre, exact: true }).last().click();
      await page.locator('.carta-comida', { hasText: a.comida }).click();
    }
    await expect(page.locator('.carta-comida--comida')).toHaveCount(4);
    await expect(botonSello(page)).toHaveClass(/boton--latido/);
  });
});

test.describe('Parada 5: el mapa del tesoro', () => {
  test('cuatro cruces por las dos rutas arman el mapa', async ({ page }) => {
    await abrir(page, '/mar/2');
    const tortu = page.locator('.juego--mapa .burbuja__frase').first();

    // Antes de cruzar: el cuento para escuchar y el mapa de las dos rutas.
    await expect(page.locator('.lectura__parrafo')).toHaveCount(4);
    await expect(page.locator('.lectura')).toContainText('tiburón de agua salada');
    await expect(page.locator('.rutas')).toContainText('Ruta A');
    await expect(page.locator('.mar-tablero__aleta')).toHaveCount(0);

    // Ruta B con un chapuzón primero.
    await page.getByRole('button', { name: 'Ruta B: los aros' }).click();
    await expect(page.locator('.mar-tablero__aleta')).toHaveCount(2);
    const agua = page.getByRole('button', { name: 'Agua del Tiburón' });
    await agua.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const cajaAgua = await agua.boundingBox();
    if (!cajaAgua) throw new Error('sin agua');
    await agua.click({ position: { x: 40, y: cajaAgua.height - 40 } });
    await expect(tortu).toContainText('Splash');
    await page.getByRole('button', { name: 'Aro 3' }).click();
    await expect(tortu).toContainText('muy lejos');
    for (let i = 1; i <= 6; i++) await page.getByRole('button', { name: `Aro ${i}` }).click();
    await expect(page.locator('.mapa__tarjeta')).toHaveCount(1);

    // Ruta A con el teclado, tres veces.
    for (let vuelta = 0; vuelta < 3; vuelta++) {
      await page.getByRole('button', { name: 'Ruta A: la línea en zigzag' }).click();
      const buzo = page.getByRole('button', { name: /^Buzo/ });
      await buzo.focus();
      for (let i = 0; i < 24; i++) await page.keyboard.press('ArrowRight');
    }
    await expect(page.locator('.mapa__tarjeta')).toHaveCount(4);

    // Las cuatro piezas arman el rompecabezas del mapa del tesoro.
    const puzzle = page.locator('.rompecabezas');
    await expect(puzzle).toBeVisible();
    for (let i = 0; i < 4; i++) {
      await puzzle.locator(`[data-pieza="${i}"]`).click();
      await puzzle.getByRole('button', { name: `Lugar ${i + 1}` }).click();
    }
    await expect(page.locator('.mapa-armado__mensaje')).toContainText('gran X');
    await expect(botonSello(page)).toHaveClass(/boton--latido/);
  });

  test('en la ruta A, salirse de la línea es caer al agua', async ({ page }) => {
    await abrir(page, '/mar/2');
    await page.getByRole('button', { name: 'Ruta A: la línea en zigzag' }).click();
    const buzo = page.getByRole('button', { name: /^Buzo/ });
    const caja = await buzo.boundingBox();
    if (!caja) throw new Error('sin buzo');
    await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.mouse.down();
    await page.mouse.move(caja.x + caja.width / 2, caja.y + 260, { steps: 6 });
    await page.mouse.up();
    await expect(page.locator('.juego--mapa .burbuja__frase').first()).toContainText('Splash');
  });
});

test.describe('Parada 6: el tesoro del mar', () => {
  test('cruzar el arrecife, abrir el cofre y armar el pasaporte abre el sobre', async ({
    page,
  }) => {
    test.slow();
    await abrir(page, '/mar/3');
    await page.getByRole('button', { name: 'Empezar a cruzar' }).click();
    const estado = page.locator('.arrecife__estado');
    const avanzar = page.getByRole('button', { name: 'Avanzar un paso' });
    for (let intentos = 0; intentos < 200; intentos++) {
      const texto = (await estado.textContent()) ?? '';
      if (texto.includes('Cruzaron')) break;
      const paso = Number(/Paso (\d+)/.exec(texto)?.[1] ?? 0);
      const siguiente = page.locator('.arrecife__casilla').nth(paso + 1);
      if (
        (await siguiente.getAttribute('data-tentaculo')) === 'abajo' ||
        (await avanzar.isDisabled())
      ) {
        await page.waitForTimeout(150);
        continue;
      }
      await avanzar.click();
    }
    await expect(estado).toHaveText('¡Cruzaron el arrecife!');

    await page.getByRole('button', { name: 'Abrir el cofre' }).click();
    await expect(page.locator('.cofre--abierto')).toBeVisible();

    const abrirCandado = page.getByRole('button', { name: 'Abrir el candado' });
    await abrirCandado.click();
    await expect(page.locator('.pasaporte-viajero__aviso')).toContainText('Falta');

    await expect(page.getByLabel('Nombre del marinero')).toHaveValue('Prueba');
    await page.getByRole('button', { name: 'Huella azul' }).click();
    await page.getByRole('button', { name: 'Sello Ancla' }).click();
    const lienzo = page.locator('.juego--tesoro .lienzo__papel');
    await lienzo.scrollIntoViewIfNeeded();
    const caja = await lienzo.boundingBox();
    if (!caja) throw new Error('sin lienzo');
    await page.mouse.move(caja.x + 40, caja.y + 40);
    await page.mouse.down();
    await page.mouse.move(caja.x + 120, caja.y + 90, { steps: 4 });
    await page.mouse.up();

    await abrirCandado.click();
    await expect(page.locator('.sobre__invitacion')).toContainText('fuera del agua');
    await expect(page.locator('.relevo .burbuja[data-personaje="momo"]')).toBeVisible();
    await expect(botonSello(page)).toHaveClass(/boton--latido/);
  });

  test('rozar un tentáculo congela 3 segundos', async ({ page }) => {
    await abrir(page, '/mar/3');
    await page.getByRole('button', { name: 'Empezar a cruzar' }).click();
    const avanzar = page.getByRole('button', { name: 'Avanzar un paso' });
    await avanzar.click(); // paso 1: siempre libre
    // La casilla 2 tiene medusa: esperar a que baje el tentáculo y avanzar.
    await expect(page.locator('.arrecife__casilla').nth(2)).toHaveAttribute(
      'data-tentaculo',
      'abajo',
      { timeout: 4000 },
    );
    await avanzar.click();
    await expect(page.getByRole('timer')).toBeVisible();
    await expect(avanzar).toBeDisabled();
    await expect(avanzar).toBeEnabled({ timeout: 5000 });
  });
});
