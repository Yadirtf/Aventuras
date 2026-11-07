# El camino de las aventuras

Página interactiva para niños y niñas de segundo grado (7 a 8 años) de la Corporación Everyday
Home. Convierte las diez planeaciones de la unidad didáctica en un recorrido por tres ecosistemas
(Desértico → Marino → Selvático) y un cierre, «El gran viaje en globo por los tres mundos», con un
Pasaporte del Explorador que se llena de sellos.

- **Modo Explorador:** pensado para proyectarse en el salón. Portada, mapa de huellitas y diez
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
  juegos/              Los juegos de las 10 paradas y piezas comunes (aros, temporizador)
  imagenes.ts          Lista de figuras disponibles
  voz.ts, sonido.ts    Lectura en voz alta y sonidos (efectos, animales y tormenta)
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
| `/globo/1`                    | El gran viaje en globo (parada de cierre) |
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
  rutas reescritas a `index.html` (así recargar `/mapa` no da 404) y caché larga para los archivos
  del build en `/assets/*`. Las figuras de `/assets/3d/` no llevan esa caché larga, así que se pueden
  reemplazar sin cambiarles el nombre. `sw.js` se sirve sin caché para que el aula reciba siempre la
  última versión.

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

Fases 4 y 5 listas:

- **Fondo del mar:** siluetas para arrastrar, «¿Qué comen?» y «¡A comer!»; el mapa del tesoro por la
  ruta A (línea en zigzag, con dedo, ratón o flechas) o la B (aros); el arrecife de las medusas con
  «¡congélate 3 segundos!», el cofre y el pasaporte de viajero que abre el sobre «¿?».
- **Selva:** sonido misterioso y pausa activa «Despertamos como animales»; el circuito de cuatro
  estaciones (cocodrilos, serpientes, troncos y «¡Mono arriba!»); el cuento «Un día en la selva» con
  lluvia, viento y trueno.

Ajustes de la revisión de noviembre de 2026 (capturas y unidad didáctica actualizada):

- **Desierto:** las ideas del mural se pasan de una columna a otra (botón ⇄ o arrastrando); el
  lienzo tiene «Deshacer»; los dibujos se cuelgan en una cuerda con pinzas y se recorren como en un
  museo. Los títeres dicen en voz alta el guion de la unidad al subir, y la escena 3 es de cierre
  libre. El reto de movimiento de la parada 3 es opcional.
- **Mar:** el cuento «La misión de los exploradores del mar» (Lina Campo) se lee en voz alta,
  hay calentamiento de buzos, mapa de los circuitos, tiburones que patrullan las rutas y un
  rompecabezas del mapa del tesoro al final.
- **Selva:** primero «Despertamos como animales» y después el sonido misterioso, con grabaciones
  reales del mono y la serpiente (`public/assets/sonidos/LEEME.md`); en el circuito la serpiente
  es el peligro y el mono pasa los conos; «¡Mono arriba!» usa solo flechas; en el cuento cada
  figura se mueve cuando se nombra.
- **El gran viaje en globo:** boleto, vuelos en cámara lenta, señales (tambor, campana, maracas)
  para adivinar dónde se aterriza, una misión por ecosistema (con estatua musical en la selva) y,
  al volver, ordenar las características de los tres mundos.

Fase 6 lista (cierre):

- **Aventura completada** (`/final`): los tres paisajes juntos, los 8 personajes celebrando, el
  mensaje de doc1.txt, el recorrido con los 10 sellos y el **diploma del explorador** con el nombre del
  grupo, los sellos y la fecha. Se descarga como imagen o se imprime (y desde ahí «Guardar como PDF»,
  en hoja A4 horizontal). «Una nueva aventura con otro grupo» pide confirmación antes de borrar.
- **Accesibilidad:** `tests/e2e/accesibilidad.spec.ts` revisa con axe (WCAG 2.1 AA) las 17 pantallas
  en computador y tableta; todos los botones miden al menos 64 px; cada reto de movimiento tiene una
  **alternativa tranquila** (campo `movimiento.tranquilo` del contenido) para quien no puede o no quiere
  moverse.
- **Rendimiento:** los juegos se bajan por ecosistema solo al entrar a una de sus paradas; las letras
  principales se precargan y el fondo animado arranca cuando la página ya cargó. Lighthouse (móvil,
  red lenta simulada): rendimiento 97–99 y accesibilidad 100 en portada, mapa, ecosistemas, paradas y
  final.
- **Sin internet:** después de la primera visita, `sw.js` (generado en el build por el plugin de
  `vite.config.ts`) guarda la página, el código y las figuras; Opciones muestra «Lista para usar sin
  internet». También se puede instalar como aplicación (`public/manifest.webmanifest`).

### Lista para el lanzamiento

1. Revisar la previsualización del pull request de la fase 6 y fusionarlo a `main`: Vercel publica en
   `https://camino-de-las-aventuras.vercel.app`.
2. (Opcional) Dominio propio: en Vercel, proyecto → Settings → Domains → Add.
3. Prueba en el aula: abrir la página una vez con internet en cada equipo o tablero (queda guardada),
   recorrer una parada con el grupo y anotar lo que haya que ajustar.
4. Pendiente de contenido: indicadores de logro del viaje en globo, el sexto puesto del rally del
   desierto, el día de las paradas del mar, fotos y grabaciones de la rana, el ave y el jaguar.

## Voz de los personajes

La lectura en voz alta usa la voz del navegador. La página elige primero las voces «naturales»
(neuronales) en español latinoamericano y cambia el tono de cada personaje solo un poco, porque
forzarlo hace sonar la voz a robot. En ⚙️ Opciones se puede elegir y probar otra voz del equipo.
En Edge las voces «Online (Natural)» suenan mucho mejor que las del sistema.

Pendiente de revisión de las autoras: las adaptaciones de los animales, las frases del teatrino,
las dietas de los animales marinos, los datos de los sonidos y los textos de los juegos son un
borrador. Quedan para más adelante las fotos de la galería y las voces grabadas.
