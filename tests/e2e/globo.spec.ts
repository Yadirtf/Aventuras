import { expect, test } from '@playwright/test';
import { abrir, botonSello } from './ayuda';

const MUNDO: Record<string, string> = {
  'Hay muy poca agua.': 'desierto',
  'El sol calienta mucho la arena.': 'desierto',
  'El camello camina despacio para no gastar energía.': 'desierto',
  'El agua lo cubre todo.': 'mar',
  'Los peces nadan entre corales.': 'mar',
  'El cangrejo camina de lado.': 'mar',
  'Hay muchos árboles y plantas.': 'selva',
  'Llueve y se escuchan muchos sonidos.': 'selva',
  'El mono salta de rama en rama.': 'selva',
};

test('el gran viaje en globo recorre los tres mundos y termina', async ({ page }) => {
  await page.clock.install();
  await abrir(page, '/globo/1');
  const juego = page.locator('.juego--globo');
  await juego.getByRole('button', { name: '¡Subir al globo y despegar!' }).click();

  for (const [eco, senalCorrecta] of [
    ['desierto', 'el tambor'],
    ['mar', 'la campana'],
    ['selva', 'las maracas'],
  ] as const) {
    await juego.getByRole('button', { name: 'Aterrizar ya' }).click();
    // Un destino equivocado no avanza.
    const otro = eco === 'mar' ? 'selva' : 'mar';
    await juego.locator(`.globo__destino--${otro}`).click();
    await expect(juego.locator('.globo__titulo')).toHaveText('¡Señal de aterrizaje!');
    await expect(juego.locator(`.globo__destino--${eco}`)).toContainText(senalCorrecta);
    await juego.locator(`.globo__destino--${eco}`).click();
    await expect(juego.locator('.globo__titulo')).toContainText('misión');

    if (eco === 'selva') {
      for (let ronda = 0; ronda < 5; ronda++) {
        await juego.locator('.estatua__mesa button').click();
        await page.clock.runFor(10_000);
        await expect(juego.locator('.estatua')).toHaveAttribute('data-estado', 'estatua');
      }
      await juego.getByRole('button', { name: '¡Terminar la misión!' }).click();
    } else {
      const hechos = juego.getByRole('button', { name: '¡Hecho!' });
      const total = await hechos.count();
      for (let i = 0; i < total; i++) await hechos.nth(i).click();
    }
    await juego.getByRole('button', { name: /¡Volver al globo/ }).click();
  }

  await expect(juego.locator('.globo__titulo')).toHaveText('¡De vuelta en el globo!');
  // Una tarjeta en el mundo equivocado no se queda.
  await juego.getByRole('button', { name: 'Hay muy poca agua.' }).click();
  await juego.locator('.globo__mundo--mar').click();
  await expect(juego.locator('.rompecabezas__ayuda')).toContainText('Piénsenlo otra vez');
  for (const [texto, eco] of Object.entries(MUNDO)) {
    await juego.getByRole('button', { name: texto, exact: true }).click();
    await juego.locator(`.globo__mundo--${eco}`).click();
  }
  await expect(juego.locator('.globo__semejanza')).toBeVisible();
  await juego.getByRole('button', { name: '¡Terminamos el viaje!' }).click();
  await expect(botonSello(page)).toHaveClass(/boton--latido/);
});
