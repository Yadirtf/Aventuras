import { defineConfig, devices } from '@playwright/test';

/** Pruebas en el navegador: recorrido, juegos (clic, arrastre, teclado) y vista táctil. */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    reducedMotion: 'reduce',
    // El service worker se prueba aparte (sin-internet.spec.ts); en el resto estorbaría.
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'computador', use: { ...devices['Desktop Chrome'] } },
    { name: 'tableta', use: { ...devices['Galaxy Tab S4'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
