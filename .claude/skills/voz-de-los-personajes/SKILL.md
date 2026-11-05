---
name: voz-de-los-personajes
description: Escribir o revisar diálogos, saludos, pistas y textos en pantalla de los personajes de «El camino de las aventuras» (Huellita, Dunita, Don Camelio, Capitana Tortu, Momo, el Tiburón, las Medusas y los Cocodrilos) con un tono uniforme para niños de 7 a 8 años. Úsala siempre que se agregue o cambie texto que dice un personaje.
---

# Voz de los personajes

Guía para que todos los textos que dicen los personajes suenen igual, los escriba quien los escriba.
El contenido vive en `src/content/paradas/*.json` (campos `saludo`, `retoPantalla`,
`retoMovimiento` y `pista`) y en `src/content/personajes.ts`.

## Para quién escribimos

Niños y niñas de segundo grado (7 a 8 años) que todavía leen despacio. La docente proyecta la
página en el salón y la lee en voz alta con ellos.

## Reglas para todos los personajes

1. **Frases cortas.** Máximo 20 palabras por frase y 3 frases por intervención.
2. **Preguntan en vez de explicar.** Terminan con una pregunta abierta siempre que se pueda
   («¿Qué animal tiene joroba?»), como hace la docente en las planeaciones.
3. **Hablan al grupo.** Usan «ustedes» y «exploradores» o «tripulación»; nunca «tú» solo, porque
   la página se usa con toda la clase.
4. **Nunca corrigen con un «no».** Ante un error dan una pista o hacen otra pregunta.
5. **Español neutro de Colombia.** «Ustedes», no «vosotros». Signos de apertura (¡ ¿) siempre.
   Comillas latinas « » para citar.
6. **Celebran el esfuerzo y el equipo,** no solo el acierto: «¡Lo lograron juntos!».
7. **Fieles a las planeaciones.** No inventan datos científicos; si un personaje aclara algo,
   sale del texto de la autora (por ejemplo, la joroba del camello guarda grasa, no agua).
8. **Personajes originales.** No citan ni imitan personajes de series, películas o canciones
   comerciales.
9. **Sin miedo.** Los personajes de reto (Tiburón, Medusas, Cocodrilos) son juguetones o
   gruñones, nunca dan miedo de verdad.

## Cada personaje

| Personaje                             | Dónde             | Cómo habla                                                                             | Muletilla o gesto                                                |
| ------------------------------------- | ----------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Huellita**                          | Todo el recorrido | Curiosa y animadora. Da la bienvenida, pone los sellos, abre el mapa.                  | «¡Sigue las huellitas!» · dar tres pasitos y aplaudir            |
| **Dunita**, la zorrita del desierto   | Desierto          | Lista y atenta; menciona sus orejas enormes y que sale de noche.                       | «Con estas orejas lo escucho todo» · taparse del sol con la mano |
| **Don Camelio**, el camello sabio     | Desierto          | Lento y paciente, un poco olvidadizo; aclara mitos con calma.                          | «Mmm… déjenme recordar…» · mecerse de lado a lado                |
| **Capitana Tortu**, la tortuga marina | Mar               | Valiente y tranquila, voz de capitana; llama «tripulación» y «buzos y buzas» al grupo. | «¡Atención, tripulación!» · nadar en cámara lenta                |
| **Momo**, el mono explorador          | Selva             | Inquieto y bromista; frases con energía y onomatopeyas.                                | «¡Uh, uh, ah, ah!» · saltar con los pies juntos                  |
| **El Tiburón de Agua Salada**         | Mar (reto)        | Gruñón de mentiras; al final se vuelve amigo.                                          | «¡Grrr… nadie cruza mi mar!»                                     |
| **Las Medusas Cosquillas**            | Mar (reto)        | Juguetonas, hablan en coro.                                                            | «¡Si nos tocas, congélate 3 segundos!»                           |
| **Los Cocodrilos del Río**            | Selva (reto)      | Dormilones; bostezan.                                                                  | «¡Shhh! Estamos durmiendo…»                                      |

## Relevo entre ecosistemas

El guía que se va entrega la pista al que llega: Dunita le pasa el rompecabezas del mar a la
Capitana Tortu; Tortu le pasa el sobre «¿?» a Momo. La `pista` de la última parada de cada
ecosistema debe anunciar el siguiente sin nombrarlo.

## Cómo revisar un texto

Antes de guardar, comprueba:

- [ ] ¿Lo entendería un niño de 7 años si se lo leen una vez?
- [ ] ¿Cumple el largo máximo?
- [ ] ¿Suena al personaje según la tabla?
- [ ] ¿Termina en pregunta o en invitación a moverse?
- [ ] ¿Respeta lo que dice la planeación de la autora?

## Ejemplos

Bien (Dunita, parada 1):

> ¡Hola, exploradores! Soy Dunita. Con estas orejas tan grandes escucho todo lo que ustedes saben.
> ¿Qué es un desierto para ustedes?

Mal:

> Hola. El desierto es un bioma árido caracterizado por precipitaciones inferiores a 250 mm anuales.

(Demasiado largo y técnico, explica en vez de preguntar y no suena a Dunita.)
