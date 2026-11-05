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

| Comando           | Qué hace                                                                 |
| ----------------- | ------------------------------------------------------------------------ |
| `npm run dev`     | Servidor de desarrollo con recarga automática                            |
| `npm run build`   | Compila tipos y genera el sitio en `dist/`                               |
| `npm run preview` | Sirve `dist/` para revisarlo como en producción                          |
| `npm run check`   | Formato (Prettier), lint (ESLint), tipos (TypeScript) y pruebas (Vitest) |
| `npm run format`  | Aplica el formato de Prettier                                            |

## Estructura

```
docs/                  Planeaciones originales de las autoras (fuente, no se modifica)
public/assets/         Ilustraciones y audios (fase 2 en adelante)
src/
  content/
    paradas/*.json     Una parada por archivo: textos de pantalla + planeación completa
    types.ts           Formato del contenido
    validar.ts         Validador: avisa qué campo falta en qué archivo
    ecosistemas.ts     Nombre, descripción, autora y guía de cada ecosistema
    personajes.ts      Los 8 personajes
  state/               Pasaporte (localStorage) y reglas de desbloqueo
  views/               Portada, mapa, ecosistema, parada, planeación y final
  components/          Piezas reutilizables (tarjeta de parada, burbuja, pasaporte, opciones)
  styles/              Variables de diseño, estilos base, de vistas y de impresión
  router.ts            Rutas limpias con la History API
tests/                 Pruebas de contenido, progreso, pasaporte y rutas
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

## Fases

Este repositorio sigue el [documento de fases](https://claude.ai/artifact/RaVMvBKENBKtxrc8YupKo6)
del [plan de la página](https://claude.ai/artifact/Eu6R97BLZtGbquU5RJCuf2). Fases 0 y 1 listas:
proyecto base, despliegue, contenido estructurado, portada, mapa, plantilla de parada, pasaporte y
Modo Docente. Los juegos de cada parada llegan en las fases 3 a 5 y las ilustraciones en la fase 2.
