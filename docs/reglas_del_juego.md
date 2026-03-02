# El Impostor — Manual de Reglas

> Juego de deducción social presencial · Pass-and-play · 100 % offline

---

## 1. Descripción General

**El Impostor** es un juego de deducción social diseñado para ser jugado en persona con un único dispositivo móvil que se pasa de mano en mano. Los jugadores debaten, interrogan y votan para descubrir quién entre ellos es el impostor, mientras el impostor intenta mezclarse sin ser detectado.

| Dato | Valor |
|---|---|
| Jugadores | 3 – 12 |
| Duración por ronda | 5 – 15 min |
| Dispositivos necesarios | 1 (móvil o tablet) |
| Conexión a internet | No requerida |

---

## 2. Modalidades de Juego

### 2.1 Modo Impostor (Clásico)

| Rol | Lo que ve en pantalla |
|---|---|
| **Ciudadano** | La **palabra clave** de la ronda (p. ej. *"Guitarra"*) |
| **Impostor** | Una pantalla **en blanco** — no sabe cuál es la palabra |

**Objetivo de los ciudadanos:** Identificar y eliminar al impostor mediante debate.
**Objetivo del impostor:** Sobrevivir al debate sin ser descubierto y, si es eliminado, adivinar la palabra para robar la victoria.

### 2.2 Modo Misterioso

| Rol | Lo que ve en pantalla |
|---|---|
| **Ciudadano** | La palabra clave de la ronda (p. ej. *"Guitarra"*) |
| **Impostor** | Una palabra **semánticamente similar** (p. ej. *"Ukulele"*) |

**Objetivo de los ciudadanos:** Detectar al impostor a través de matices en sus respuestas.
**Objetivo del impostor:** Participar convincentemente en el debate sin ser detectado. Gana si sobrevive a la votación final.

> [!NOTE]
> En Modo Misterioso el impostor **no** tiene la opción de adivinar la palabra tras ser eliminado.

---

## 3. Preparación de la Partida

### 3.1 Configuración Inicial

1. **Abrir la app** y seleccionar **"Nueva Partida"**.
2. **Elegir modalidad**: Impostor o Misterioso.
3. **Número de jugadores**: Introducir la cantidad (3 – 12).
4. **Categoría de palabras**: Seleccionar una categoría (Animales, Comida, Deportes, Lugares, etc.) o dejar en *Aleatorio*.
5. **Tiempo de debate** *(opcional)*: Configurar un temporizador para la ronda de debate (recomendado: 3 min para ≤5 jugadores, 5 min para 6 – 8, 8 min para 9 – 12).
6. **Confirmar** la configuración.

### 3.2 Ratio de Impostores

La app calcula automáticamente el número de impostores según el tamaño del grupo:

| Jugadores | Impostores | Ciudadanos |
|:---------:|:----------:|:----------:|
| 3 – 5     | 1          | 2 – 4      |
| 6 – 8     | 1 – 2      | 5 – 6      |
| 9 – 12    | 2 – 3      | 7 – 9      |

> [!TIP]
> En partidas de 6 – 8 jugadores, el host puede elegir manualmente entre 1 o 2 impostores para variar la dificultad.

---

## 4. Fase de Reparto de Roles (Pass-and-Play)

Esta es la fase más sensible en cuanto a privacidad. El dispositivo se pasa de jugador en jugador siguiendo este protocolo estricto:

### 4.1 Protocolo de Revelación Segura

```
┌─────────────────────────────────────────┐
│  PANTALLA DE TRANSICIÓN (opaca)         │
│                                         │
│     "Pasa el dispositivo a:             │
│          JUGADOR 3"                     │
│                                         │
│  [ Toca la pantalla cuando estés listo ]│
└─────────────────────────────────────────┘
          │
          ▼  (el jugador toca)
┌─────────────────────────────────────────┐
│  PANTALLA DE REVELACIÓN                 │
│                                         │
│  ┌───────────────────────────────┐      │
│  │  Mantén pulsado para ver      │      │
│  │  tu palabra                   │      │
│  └───────────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
          │
          ▼  (el jugador mantiene pulsado)
┌─────────────────────────────────────────┐
│                                         │
│        🎸 "GUITARRA"                    │
│        (o pantalla en blanco            │
│         si es impostor)                 │
│                                         │
│  [ Suelta para ocultar ]               │
└─────────────────────────────────────────┘
          │
          ▼  (suelta el dedo)
┌─────────────────────────────────────────┐
│                                         │
│     ✅ "¿Has memorizado tu palabra?"    │
│                                         │
│       [ SÍ — PASAR AL SIGUIENTE ]      │
│                                         │
└─────────────────────────────────────────┘
```

**Reglas de seguridad:**
- La palabra **solo es visible** mientras el jugador mantiene el dedo pulsado sobre la zona designada.
- Al soltar, la pantalla se oculta instantáneamente.
- Un **sonido/vibración** sutil confirma que la palabra fue revelada (feedback háptico).
- Tras confirmar, la app muestra la **pantalla de transición** para el siguiente jugador.

---

## 5. Fase de Debate

Una vez todos los jugadores han visto su rol, comienza el debate:

### 5.1 Estructura del Debate

1. **Ronda de pistas**: Cada jugador dice, por turnos, una palabra o frase corta relacionada con la palabra clave. El orden lo establece la app aleatoriamente.
2. **Debate abierto**: Los jugadores discuten libremente, hacen preguntas y buscan inconsistencias.
3. **Segunda ronda de pistas** *(opcional)*: Si el grupo lo desea, se hace una segunda ronda para afinar sospechas.

### 5.2 Reglas del Debate

| Permitido | Prohibido |
|---|---|
| Dar pistas indirectas | Decir la palabra exacta |
| Hacer preguntas a otros jugadores | Enseñar el teléfono a otros |
| Mentir sobre tus sospechas | Revelar tu rol explícitamente |
| Cambiar de opinión | Usar dispositivos externos |

> [!IMPORTANT]
> Los ciudadanos deben dar pistas lo suficientemente vagas para no regalar la palabra al impostor, pero lo suficientemente claras para demostrar que la conocen.

---

## 6. Fase de Votación

### 6.1 Proceso de Votación

1. La app anuncia el **inicio de la votación**.
2. Cada jugador vota en secreto a través del dispositivo (pass-and-play individual con la misma mecánica de transición segura).
3. Los votos se revelan **simultáneamente** en la pantalla de resultados.
4. El jugador con más votos es **eliminado**.
5. En caso de **empate**, se repite el debate con 1 minuto extra y se vuelve a votar solo entre los empatados.

### 6.2 Mayoría Requerida

- **3 – 5 jugadores**: Mayoría simple (más votos que cualquier otro).
- **6 – 12 jugadores**: Mayoría simple, con desempate obligatorio.

---

## 7. Resolución de la Partida

### 7.1 Modo Impostor

| Escenario | Resultado |
|---|---|
| El impostor es eliminado y **no adivina** la palabra | 🏆 **Victoria de los ciudadanos** |
| El impostor es eliminado y **adivina** la palabra | 🏆 **Victoria del impostor** (robo) |
| Los ciudadanos eliminan a un ciudadano inocente | 🏆 **Victoria del impostor** |
| Quedan tantos impostores como ciudadanos | 🏆 **Victoria del/los impostor(es)** |

**Mecánica de adivinanza (solo Modo Impostor):**
- Al ser eliminado, el impostor tiene **un único intento** de adivinar la palabra.
- Dispone de **30 segundos** para dar su respuesta.
- Si acierta, roba la victoria para sí mismo.

### 7.2 Modo Misterioso

| Escenario | Resultado |
|---|---|
| El impostor es eliminado | 🏆 **Victoria de los ciudadanos** |
| Los ciudadanos eliminan a un inocente | 🏆 **Victoria del impostor** |
| El impostor sobrevive a todas las rondas de votación | 🏆 **Victoria del impostor** |

> [!NOTE]
> En Misterioso no hay mecánica de adivinanza porque el impostor ya tiene información parcial (la palabra similar).

---

## 8. Puntuación y Progresión

### 8.1 Sistema de Puntos

| Acción | Puntos |
|---|---|
| Ciudadano: Votar correctamente al impostor | +200 |
| Ciudadano: Victoria colectiva | +100 |
| Impostor: Sobrevivir al debate | +300 |
| Impostor: Adivinar la palabra tras ser eliminado | +500 |
| Impostor: No ser detectado (Misterioso) | +400 |
| Cualquiera: Participar en la ronda | +50 |

### 8.2 Estadísticas Persistentes

La app almacena localmente las estadísticas de cada perfil de jugador:
- Partidas jugadas / ganadas / perdidas
- Veces como impostor / ciudadano
- Porcentaje de acierto en votaciones
- Racha de victorias

---

## 9. Categorías de Palabras

### 9.1 Categorías Gratuitas

- 🐾 Animales
- 🍕 Comida y Bebida
- ⚽ Deportes
- 🌍 Países y Ciudades
- 🎬 Cine y TV
- 🎵 Música

### 9.2 Categorías Premium (compra in-app)

- 🧪 Ciencia y Tecnología
- 📚 Literatura y Mitología
- 🎨 Arte y Cultura
- 😂 Memes y Cultura Pop
- 💼 Profesiones y Oficios
- 🎭 Emociones y conceptos abstractos
- *Packs temáticos adicionales*

---

## 10. Ajustes Avanzados

| Ajuste | Valores | Descripción |
|---|---|---|
| Número de rondas | 1 – 10 | Cuántas rondas componen una partida completa |
| Impostores | Auto / Manual | Dejar que la app decida o elegir manualmente |
| Tiempo de debate | 1 – 15 min | Cronómetro visible durante el debate |
| Rondas de pistas | 1 – 3 | Cuántas rondas de pistas obligatorias |
| Tiempo de adivinanza | 15 – 60 s | Tiempo del impostor para adivinar la palabra |
| Modo daltonismo | On / Off | Paleta accesible para todos los jugadores |
| Sonidos hápticos | On / Off | Vibración al revelar / ocultar palabra |

---

## 11. Glosario

| Término | Definición |
|---|---|
| **Pass-and-play** | Mecánica donde un único dispositivo se pasa entre jugadores |
| **Tap-to-reveal** | Tocar/mantener pulsado para ver información oculta |
| **Ciudadano** | Jugador que conoce la palabra y busca al impostor |
| **Impostor** | Jugador que desconoce la palabra (o conoce una similar) e intenta no ser detectado |
| **Ronda de pistas** | Turno en que cada jugador da una pista verbal sin decir la palabra |
| **Robo de victoria** | Cuando el impostor eliminado adivina la palabra y gana |
| **Similitud semántica** | Relación de significado entre dos palabras (usado en Modo Misterioso) |
