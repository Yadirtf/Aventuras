# El camino de las aventuras

Página interactiva para niños y niñas de segundo grado (7 a 8 años) de la Corporación Everyday
Home. Convierte las nueve planeaciones de `docs/` en un recorrido por tres ecosistemas
(desierto → fondo del mar → selva) con un Pasaporte del Explorador que se llena de sellos.

- **Modo Explorador:** pensado para proyectarse en el salón. Portada, mapa de huellitas y nueve
  paradas que se desbloquean una tras otra.
- **Modo Docente:** desde ⚙️ Opciones. Abre todas las paradas y muestra la planeación completa de
  cada una, lista para imprimir.

## Correr en local

Requiere Node 22 (ver `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Comando           | Qué hace                                                                   |
| ----------------- | -------------------------------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con recarga automática                              |
| `npm run build`   | Compila tipos y genera el sitio en `dist/`                                 |
| `npm run preview` | Sirve `dist/` para revisarlo como en producción                            |
| `npm run check`   | Formato (Prettier), lint (ESLint), tipos (TypeScript) y pruebas (Vitest)   |
| `npm run format`  | Aplica el formato de Prettier                                              |
| `npm run e2e`     | Recorridos completos en el navegador con Playwright (computador y tableta) |

## Estructura

```
docs/                  Planeaciones originales de las autoras (fuente, no se modifica)
public/assets/3d/      Figuras 3D de animales y objetos (ver «Imágenes»)
src/
  content/
    paradas/*.json     Una parada por archivo: textos de pantalla + planeación completa
    types.ts           Formato del contenido
    validar.ts         Validador: avisa qué campo falta en qué archivo
    ecosistemas.ts     Nombre, descripción, autora y guía de cada ecosistema
    personajes.ts      Los 8 personajes
  state/               Pasaporte (localStorage) y reglas de desbloqueo
  views/               Portada, mapa, ecosistema, parada, planeación, familia y final
  components/          Piezas reutilizables (personajes con poses, burbuja con voz, fondo
                       animado, celebración, rincón de calma, pasaporte, opciones)
  juegos/              Los juegos de cada parada (pelota preguntona, títeres, rally)
  imagenes.ts          Lista de figuras disponibles
  voz.ts, sonido.ts    Lectura en voz alta y efectos de sonido del navegador
  styles/              Variables de diseño, estilos base, de vistas y de impresión
  router.ts            Rutas limpias con la History API
tests/                 Pruebas de contenido, progreso, pasaporte y rutas
tests/e2e/             Recorridos en el navegador (Playwright)
.claude/skills/        Skill «Voz de los personajes» para redactar diálogos
```

### Rutas

| Ruta                          | Pantalla                                  |
| ----------------------------- | ----------------------------------------- |
| `/`                           | Portada                                   |
| `/mapa`                       | Mapa de exploración                       |
| `/desierto`, `/mar`, `/selva` | Presentación de cada ecosistema           |
| `/desierto/1` … `/selva/3`    | Paradas (1 a 3 dentro de cada ecosistema) |
| `/desierto/1/planeacion` …    | Ficha imprimible de la planeación         |
| `/desierto/familia` …         | Tarjeta imprimible para la familia        |
| `/final`                      | Aventura completada                       |

## Editar el contenido

Los textos están en `src/content/paradas/`, un JSON por parada, para que se puedan corregir sin
tocar código. Al guardar, `npm run check` (y el servidor de desarrollo) validan que no falte ningún
campo y dicen exactamente cuál falta y en qué archivo. Si una autora todavía no ha definido algo
(por ejemplo, los indicadores de logro), se deja la lista vacía y se anota en `pendientes`: la ficha
lo muestra en un recuadro amarillo que no sale al imprimir.

Los diálogos de los personajes siguen la skill `.claude/skills/voz-de-los-personajes`.

## Despliegue en Vercel

El proyecto de Vercel se llama **`camino-de-las-aventuras`** (URL
`https://camino-de-las-aventuras.vercel.app`) y está conectado al repositorio `Yadirtf/Aventuras`.

- **Producción:** cada cambio que entra a `main` se publica solo.
- **Previsualización:** cada pull request genera su propia URL para que las autoras revisen.
- La configuración está en `vercel.json`: build con `npm run build`, salida en `dist/`, todas las
  rutas reescritas a `index.html` (así recargar `/mapa` no da 404) y caché larga para `/assets/*`.
  Por esa caché, **un archivo de `public/assets/` que cambia de contenido debe cambiar de nombre**
  (por ejemplo, `dunita-v2.svg`).

Para conectarlo la primera vez: en [vercel.com/new](https://vercel.com/new) importar
`Yadirtf/Aventuras`, poner como nombre `camino-de-las-aventuras` y dejar el resto como lo detecta
Vercel (lee `vercel.json`).

GitHub Actions corre `npm run check` y `npm run build` en cada pull request
(`.github/workflows/check.yml`).

## Privacidad

La página no tiene servidor ni cuentas y no usa analítica. El nombre del explorador y los sellos se
guardan solo en el navegador del equipo del salón; «Empezar de nuevo» los borra. La tipografía
(Andika, diseñada para lectores que empiezan) va incluida en el sitio, sin pedirla a servicios
externos.

## Imágenes

Las figuras de `public/assets/3d/` son de [Fluent Emoji 3D](https://github.com/microsoft/fluentui-emoji)
de Microsoft, con licencia MIT (texto y crédito en `public/assets/3d/LICENCIA.md`). Para agregar una
figura, copien el `.webp` en esa carpeta y súmenla a la lista de `src/imagenes.ts`.

## Fases

Este repositorio sigue el [documento de fases](https://claude.ai/artifact/RaVMvBKENBKtxrc8YupKo6)
del [plan de la página](https://claude.ai/artifact/Eu6R97BLZtGbquU5RJCuf2). Fases 0 y 1 listas:
proyecto base, despliegue, contenido estructurado, portada, mapa, plantilla de parada, pasaporte y
Modo Docente.

Fases 2 y 3 listas: paleta de colores nueva, figuras 3D, personajes con poses y voz, fondo animado,
sonidos, rincón de calma y los tres juegos del desierto (pelota preguntona con mural y lienzo,
títeres con mímica, teatrino y «¿Mito o realidad?», y rally de pistas con rompecabezas), además de
la tarjeta para la familia.

Pendiente de revisión de las autoras: las adaptaciones de los animales y las frases del teatrino
del desierto son un borrador. Quedan para más adelante las fotos de la galería y las voces grabadas;
mientras tanto la página usa la voz del navegador.
