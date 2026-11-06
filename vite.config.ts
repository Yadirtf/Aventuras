import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/** Lista los archivos de public/ como rutas del sitio («/assets/3d/mono.webp»). */
function archivosPublicos(carpeta: string, raiz = carpeta): string[] {
  return readdirSync(carpeta)
    .filter((nombre) => !nombre.startsWith('.'))
    .flatMap((nombre) => {
      const ruta = join(carpeta, nombre);
      return statSync(ruta).isDirectory()
        ? archivosPublicos(ruta, raiz)
        : ['/' + relative(raiz, ruta).split(sep).join('/')];
    });
}

/**
 * Genera sw.js con la lista de todo lo que hay que guardar para usar la página sin
 * internet. La versión cambia con cada build, así el aula recibe siempre lo último.
 */
function sinInternet(): Plugin {
  return {
    name: 'aventuras-sin-internet',
    apply: 'build',
    generateBundle(_opciones, paquete) {
      const archivos = [
        '/index.html',
        ...Object.keys(paquete)
          .filter((f) => f !== 'index.html')
          .map((f) => `/${f}`),
        ...archivosPublicos('public'),
      ].sort();
      const huella = createHash('sha256');
      for (const f of archivos) huella.update(f);
      for (const salida of Object.values(paquete))
        huella.update(salida.type === 'chunk' ? salida.code : salida.source);
      const plantilla = readFileSync('sw/sw.js', 'utf8');
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: plantilla
          .replace("'__VERSION__'", `'${huella.digest('hex').slice(0, 12)}'`)
          .replace('= __ARCHIVOS__;', `= ${JSON.stringify(archivos)};`),
      });
    },
  };
}

/** Precarga las dos letras de la primera pantalla para que el texto aparezca de una vez. */
function precargarLetras(): Plugin {
  return {
    name: 'aventuras-precargar-letras',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, { bundle }) {
        return Object.keys(bundle ?? {})
          .filter((f) => /(andika-latin-400|baloo-2-latin-800)-normal-.*\.woff2$/.test(f))
          .map((f) => ({
            tag: 'link',
            attrs: {
              rel: 'preload',
              href: `/${f}`,
              as: 'font',
              type: 'font/woff2',
              crossorigin: '',
            },
            injectTo: 'head' as const,
          }));
      },
    },
  };
}

export default defineConfig({
  plugins: [sinInternet(), precargarLetras()],
  build: {
    target: 'es2022',
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
