import { expect, test } from '@playwright/test';
import { abrir, botonSello } from './ayuda';

test.describe('Parada 7: nos adentramos en la selva', () => {
  test('adivinar los 5 sonidos termina el juego', async ({ page }) => {
    await abrir(page, '/selva/1');
    const contador = page.locator('.sonidos__contador');
    const opciones = page.locator('.sonidos__opcion');
    for (let ronda = 1; ronda <= 5; ronda++) {
      await page.getByRole('button', { name: 'Escuchar el sonido' }).click();
      // Se prueba cada animal hasta acertar (el orden es al azar).
      for (let i = 0; i < 5; i++) {
        await opciones.nth(i).click();
        if ((await contador.textContent())?.startsWith(`Adivinados: ${ronda}`)) break;
      }
      await expect(contador).toHaveText(`Adivinados: ${ronda} de 5`);
      if (ronda < 5) await page.getByRole('button', { name: 'Otro sonido' }).click();
    }
    await expect(botonSello(page)).toHaveClass(/boton--latido/);
  });

  test('la pausa activa cuenta el tiempo', async ({ page }) => {
    await abrir(page, '/selva/1');
    await page.getByRole('button', { name: '¡A moverse!' }).click();
    await expect(page.getByRole('timer')).not.toHaveText('20', { timeout: 3000 });
    await page.getByRole('button', { name: 'Siguiente animal' }).click();
    await expect(page.locator('.movimiento__nombre')).toHaveText('2. Mono');
  });
});

test.describe('Parada 8: los retos de la selva', () => {
  test('las cuatro estaciones del circuito', async ({ page }) => {
    test.slow();
    await abrir(page, '/selva/2');
    const momo = page.locator('.circuito .burbuja__frase');
    const siguiente = page.getByRole('button', { name: 'Siguiente estación' });

    // 1. Río: saltar solo con los cocodrilos dormidos.
    const cocodrilo = page.locator('.rio__cocodrilo');
    const saltar = page.getByRole('button', { name: '¡Saltar con los pies juntos!' });
    for (let i = 0; i < 100 && !(await siguiente.isVisible()); i++) {
      if ((await cocodrilo.getAttribute('data-estado')) === 'dormido' && (await saltar.isEnabled()))
        await saltar.click();
      else await page.waitForTimeout(150);
    }
    await siguiente.click();

    // 2. Serpientes: repetir el lado no es zigzag.
    await page.getByRole('button', { name: '← Por la izquierda' }).click();
    await page.getByRole('button', { name: '← Por la izquierda' }).click();
    await expect(momo).toContainText('no es zigzag');
    for (let i = 0; i < 4; i++)
      await page
        .getByRole('button', { name: i % 2 === 0 ? 'Por la derecha →' : '← Por la izquierda' })
        .click();
    await siguiente.click();

    // 3. Troncos: de aro en aro.
    for (let i = 1; i <= 5; i++) await page.getByRole('button', { name: `Aro ${i}` }).click();
    await siguiente.click();

    // 4. Monos: seguir las órdenes con el teclado.
    const teclas: Record<string, string> = {
      '¡Mono arriba!': 'ArrowUp',
      '¡Mono abajo!': 'ArrowDown',
      '¡Mono a la derecha!': 'ArrowRight',
      '¡Mono a la izquierda!': 'ArrowLeft',
    };
    const orden = page.locator('.monos__orden');
    await page.locator('.monos').focus();
    for (let i = 0; i < 8; i++) {
      const texto = (await orden.textContent()) ?? '';
      const tecla = teclas[texto];
      if (!tecla) throw new Error(`orden desconocida: ${texto}`);
      await page.keyboard.press(tecla);
    }
    await expect(orden).toHaveText('¡Monos expertos!');
    await expect(page.locator('.circuito__paso--hecho')).toHaveCount(4);
    await expect(botonSello(page)).toHaveClass(/boton--latido/);
  });
});

test.describe('Parada 9: la selva cobra vida', () => {
  test('el cuento llega al final y la tormenta tiene sonidos', async ({ page }) => {
    await abrir(page, '/selva/3');
    const siguiente = page
      .locator('.cuento')
      .getByRole('button', { name: /Siguiente|Fin del cuento/ });
    await expect(page.getByRole('button', { name: 'Lluvia' })).toBeHidden();
    await siguiente.click();
    await siguiente.click();
    await expect(page.locator('.cuento__contador')).toContainText('La tormenta');
    await page.getByRole('button', { name: 'Lluvia' }).click();
    await page.getByRole('button', { name: 'Trueno' }).click();
    await siguiente.click();
    await siguiente.click();
    await expect(siguiente).toHaveText('¡Fin del cuento!');
    await siguiente.click();
    await expect(page.locator('.cuento .burbuja__frase')).toContainText('¡Fin!');
    await expect(botonSello(page)).toHaveClass(/boton--latido/);
  });
});
