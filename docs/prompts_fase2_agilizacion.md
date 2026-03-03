# Prompts para Agentes Especialistas — Fase 2: Agilización del Juego

> Tres prompts diseñados para implementar cambios que agilizan y enriquecen "El Impostor".
> Cada agente opera sobre ficheros concretos y **no debe tocar** los ficheros asignados a los otros.

---

## Prompt 1 — Agente de Votación Rápida (UX/Screens)

### Contexto del Proyecto

Antes de hacer cualquier cambio, **lee** los siguientes archivos para tener contexto completo:

| Archivo | Razón |
|---------|-------|
| `app/js/screens.js` | Tu archivo principal de trabajo. Contiene toda la UI. |
| `app/js/game.js` | Motor del juego. Debes entender `setupVoting()`, `registerVote()`, `tallyVotes()`, `resolveElimination()` y `calculateRoundScores()`. |
| `app/js/balance/scoring.js` | Sistema de puntuación. Entender cómo `votedCorrectly` afecta al score. |
| `app/css/styles.css` | Estilos actuales que usarás para mantener coherencia visual. |
| `docs/reglas_del_juego.md` | Reglas oficiales del juego. |

### Problema Actual

El proceso de votación actual es **demasiado lento** para un juego de fiesta. Requiere:
1. Pantalla de anuncio de votación.
2. Por **cada jugador** → cortina ("Pasa el móvil a X") → pantalla de selección con hold-to-confirm → siguiente jugador.
3. Revelación animada de cartas con los votos.
4. Desempate si hay empate.

Esto significa que para 6 jugadores hay 6 transiciones de "pasa el móvil", que rompen el ritmo del juego presencial donde todo el mundo ya está debatiendo cara a cara.

### Cambio Requerido

Sustituir el flujo completo de votación individual por una **eliminación directa grupal**:

1. Tras el debate, se muestra **una sola pantalla** con la lista de todos los jugadores activos (no eliminados).
2. El grupo debate en voz alta y decide a quién eliminar.
3. Se toca el nombre del jugador elegido → confirmación ("¿Seguro que queréis eliminar a X?") → eliminación.
4. Se revela si era impostor o ciudadano.
5. Si era impostor y el modo es "impostor clásico", se le da la oportunidad de adivinar la palabra (pantalla `guessScreen` existente).

### Archivos que DEBES modificar

- **`app/js/screens.js`**: Reemplazar `votingAnnounce()`, `votingCortina()`, `votingSelect()`, `_selectVote()`, `_voteHoldStart()`, `_voteHoldEnd()`, `_confirmVote()`, `votingReveal()`, `_flipCards()`, `tiebreakScreen()`, y `_startTieVote()` por una **única función** `groupElimination()` que muestre la lista y gestione la confirmación.
- **`app/js/game.js`**: Simplificar `setupVoting()` (ya no necesita `votingOrder` ni iterar jugadores) y `tallyVotes()` (ya no hay tally, solo se recibe el índice del eliminado). Eliminar `registerVote()`.
- **`app/css/styles.css`**: Ajustar o eliminar las clases `.vote-card`, `.vote-card-inner`, `.vote-card-front`, `.vote-card-back`, `.vote-list`, `.vote-item`, `.vote-radio`, `.vote-results-grid` que ya no se usen.

### Archivos que NO DEBES tocar

- `app/js/words.js`
- `app/js/balance/*` (todos los módulos de balance)
- `app/js/sounds.js`
- `app/index.html`

### Restricciones técnicas

- Mantener la estética existente: fondo `var(--bg-primary)`, tarjetas `glass-card`, animaciones `animate-scale-in`, `animate-fade-in-up`.
- Mantener `SoundSystem.onButtonPress()` y `SoundSystem.onResultsReveal()` en los puntos apropiados.
- La función `calculateRoundScores()` en `game.js` usa `player.votedFor`. Como ya no hay voto individual, se debe adaptar para que todos los ciudadanos que participan en la eliminación de un impostor reciban crédito (poner `votedCorrectly: true` para todos si el eliminado es impostor).
- Conservar intacto el flujo post-eliminación: `eliminatedScreen()` → `_afterElim()` → `guessScreen()` o `victoryScreen()`.

---

## Prompt 2 — Agente de Configuración de Roles (Game Engine)

### Contexto del Proyecto

Antes de hacer cualquier cambio, **lee** los siguientes archivos:

| Archivo | Razón |
|---------|-------|
| `app/js/game.js` | Tu archivo principal. Contiene `state`, `setupRound()`, `initGame()`, y toda la lógica de asignación de roles. |
| `app/js/balance/impostor_ratio.js` | Funciones `getRecommendedImpostors()` y `getImpostorOptions()` que determinan cuántos impostores se permiten. |
| `app/js/screens.js` | Pantalla de configuración (`config()`). Debes entender cómo se renderizan las opciones para coordinar con el Agente 1. |
| `app/js/words.js` | `getWordPool()`, `getCategories()`. Entender la estructura de palabras y pares semánticos. |
| `docs/reglas_del_juego.md` | Reglas oficiales. |

### Problema Actual

Actualmente el juego solo permite elegir **un modo** (Impostor o Misterioso) y asigna `numImpostors` impostores todos del mismo tipo. No hay flexibilidad para mezclar tipos de roles ni para tener un número aleatorio.

### Cambio Requerido

#### 2a. Configuración independiente de Impostores y Misteriosos

Permitir al usuario configurar **por separado**:
- `numImpostors`: número de impostores clásicos (pantalla en blanco o con pista, ver Prompt 3).
- `numMisteriosos`: número de misteriosos (reciben palabra similar).

Restricciones de validación:
- `numImpostors + numMisteriosos` < `numPlayers` (siempre debe haber al menos 1 ciudadano).
- Mínimo total de "infiltrados" (impostores + misteriosos) = 1.
- Máximo = `numPlayers - 1`.

#### 2b. Opción "Random"

Añadir un botón/toggle **"🎲 Aleatorio"** en la configuración que, cuando está activo:
- Oculta los steppers de numImpostors y numMisteriosos.
- En `setupRound()`, genera aleatoriamente el número de impostores y misteriosos respetando las restricciones.
- Posibilidad de que **todos sean impostores** (0 ciudadanos) — en ese caso el juego termina automáticamente revelando que no hay ciudadanos en una pantalla especial ("¡Todos son impostores! 😱").

#### 2c. Cambios en `setupRound()`

Actualmente `setupRound()` asigna roles como:
```javascript
p.role = impostorIndices.has(i) ? 'impostor' : 'citizen';
p.word = state.mode === 'misterioso' ? state.impostorWord : '';
```

Debe cambiar para soportar **roles mixtos**:
```javascript
// Cada jugador puede ser: 'citizen', 'impostor', or 'misterioso'
p.role = impostorIndices.has(i) ? 'impostor' : (misteriososIndices.has(i) ? 'misterioso' : 'citizen');
```

Para los misteriosos, se selecciona un par semántico (usar `selectSemanticPair` existente).
Para los impostores clásicos, la palabra dependerá de la configuración de pista (ver Prompt 3).

### Archivos que DEBES modificar

- **`app/js/game.js`**:
  - Añadir `numMisteriosos` y `randomRoles` al `state`.
  - Modificar `setupRound()` para soportar asignación mixta.
  - Añadir lógica de "todos son impostores" con detección y resultado especial.
  - Adaptar `calculateRoundScores()` para los distintos roles.
- **`app/js/balance/impostor_ratio.js`**: Añadir una función `getValidRoleCombinations(numPlayers)` que devuelve las combinaciones válidas.
- **`app/js/screens.js`**: Modificar `config()` para:
  - Reemplazar el selector de modo (Impostor/Misterioso) por **dos steppers** independientes (Impostores / Misteriosos) + el toggle aleatorio.
  - Mostrar un resumen dinámico: `"2 impostores · 1 misterioso · 3 ciudadanos"`.

### Archivos que NO DEBES tocar

- `app/js/words.js`
- `app/js/balance/scoring.js`, `elo_system.js`, `turn_order.js`, `guess_validator.js`
- `app/js/sounds.js`
- `app/css/styles.css`
- `app/index.html`

### Restricciones técnicas

- El modo `'misterioso'` ya no es un modo global del juego, sino un **tipo de rol** individual. El state global `state.mode` ya no aplica: eliminarlo o deprecarlo.
- Al renderizar la pantalla de reparto (dealing), `screens.js` ya muestra `p.word` directamente. Los misteriosos seguirán viendo su `impostorWord` y los impostores clásicos su palabra según la configuración de pista.
- Coordinar con Agente 1: el Agente 1 usa `state.mode === 'impostor'` en `_afterElim()` para decidir si dar la oportunidad de adivinar. Ahora eso debe depender de `player.role === 'impostor'` (no global).
- Coordinar con Agente 3: la pista del impostor (siguiente prompt) depende de `player.role === 'impostor'` y de `state.impostorHintEnabled`.

---

## Prompt 3 — Agente de Pista para el Impostor (Word System)

### Contexto del Proyecto

Antes de hacer cualquier cambio, **lee** los siguientes archivos:

| Archivo | Razón |
|---------|-------|
| `app/js/words.js` | Tu archivo principal. Contiene `WORD_DATABASE` con todas las palabras, pares y categorías. |
| `app/js/game.js` | Motor del juego. Entender `setupRound()` para saber cómo se asignan palabras. |
| `app/js/balance/word_selector.js` | `selectWord()` y `selectSemanticPair()`. Entender cómo selecciona pares. |
| `app/js/screens.js` | Pantalla de reparto (`dealingReveal()`). Muestra `p.word` al jugador. |
| `docs/reglas_del_juego.md` | Reglas oficiales. |

### Problema Actual

Actualmente, en modo "Impostor clásico" el impostor ve una **pantalla en blanco** (no recibe ninguna palabra). Esto puede ser frustrante o aburrido ya que no tiene ninguna pista para disimular en el debate.

### Cambio Requerido

#### 3a. Toggle "Pista para Impostor"

Añadir una opción en la configuración del juego:
- **Toggle**: "Dar pista al impostor" (activado o desactivado).
- Nuevo campo en state: `state.impostorHintEnabled` (boolean, default `false`).
- Cuando está **desactivado**: comportamiento clásico, el impostor ve pantalla en blanco.
- Cuando está **activado**: el impostor recibe una **palabra estrictamente relacionada** con la de los ciudadanos.

#### 3b. Lógica de selección de pista

La pista **NO** es lo mismo que la palabra del "misterioso". La diferencia clave:
- **Misterioso**: recibe una palabra semánticamente similar (puede ser difícil de distinguir, similarity 0.6-0.9).
- **Pista del Impostor**: recibe una palabra que es una **categoría o concepto padre** de la palabra real. Es más vaga, da una orientación general pero no desvela la palabra exacta.

Para implementar esto, cada entrada de palabra en `words.js` necesita un nuevo campo `hint`:
```javascript
{ id: 'an_01', text: 'Perro', difficulty: 1, hint: 'Animal doméstico', pairs: [...] }
```

El hint debe ser:
- Una descripción genérica o categoría amplia (no un sinónimo).
- Suficientemente vaga para no desvelar la palabra pero que le dé orientación al impostor durante el debate.

#### 3c. Pantalla de reparto para impostor con pista

En `dealingReveal()` de `screens.js`, si el jugador es impostor y `state.impostorHintEnabled === true`:
- En vez de pantalla en blanco, mostrar: `"🕵️ Eres el IMPOSTOR"` + `"Pista: [hint]"`.
- Usar un estilo diferente al de ciudadanos y misteriosos (quizá borde rojo con fondo semi-transparente).

### Archivos que DEBES modificar

- **`app/js/words.js`**: Añadir el campo `hint` a **cada una** de las 160 palabras distribuidas en 8 categorías. El hint debe ser una cadena corta (2-4 palabras) que represente un concepto padre genérico.
- **`app/js/game.js`**: 
  - Añadir `impostorHintEnabled` al `state`.
  - En `setupRound()`, cuando el rol es `'impostor'` y `state.impostorHintEnabled` es `true`, asignar `p.word = currentWordEntry.hint`.
- **`app/js/screens.js`**: 
  - Modificar `dealingReveal()` para utilizar un diseño distinto cuando el jugador es impostor con pista.
  - Añadir el toggle en la pantalla `config()`.

### Archivos que NO DEBES tocar

- `app/js/balance/balance_config.js`, `elo_system.js`, `impostor_ratio.js`, `turn_order.js`, `scoring.js`, `guess_validator.js`
- `app/js/sounds.js`
- `app/css/styles.css` (puedes añadir clases nuevas pero no modificar las existentes)
- `app/index.html`

### Restricciones técnicas

- Las pistas deben estar en **español**.
- Los hints deben ser genéricos: para "Perro" → "Animal doméstico" (correcto), NO "Canino" (demasiado preciso) ni "Mascota peluda" (describe demasiado).
- Coordinar con Agente 2: el Agente 2 gestiona `state.mode` y los roles. Este agente debe asumir que el campo `state.impostorHintEnabled` ya existe en el state (el Agente 2 lo añade) y que el rol `'impostor'` es el que recibe la pista. Los `'misterioso'` NO reciben hint, reciben su par semántico.
- La pista se muestra SOLO durante el reparto. No aparece durante el debate ni la votación.

---

## Matriz de No-Solapamiento

| Archivo | Agente 1 (Votación) | Agente 2 (Roles) | Agente 3 (Pista) |
|---------|:-------------------:|:-----------------:|:----------------:|
| `screens.js` — votación | ✅ Reescribe | ❌ | ❌ |
| `screens.js` — config | ❌ | ✅ Modifica | ✅ Añade toggle |
| `screens.js` — dealing | ❌ | ❌ | ✅ Modifica |
| `game.js` — voting/tally | ✅ Simplifica | ❌ | ❌ |
| `game.js` — state/setup | ❌ | ✅ Reescribe | ✅ Añade hint |
| `game.js` — scores | ✅ Adapta voted | ✅ Adapta roles | ❌ |
| `words.js` | ❌ | ❌ | ✅ Añade hints |
| `impostor_ratio.js` | ❌ | ✅ Añade combos | ❌ |
| `css/styles.css` | ✅ Limpia vote | ❌ | ✅ Añade hint |

> **Orden de ejecución recomendado**: Agente 3 primero (datos), luego Agente 2 (lógica de roles), finalmente Agente 1 (UI de votación). Los Agentes 2 y 3 pueden ejecutarse en paralelo si se respetan las zonas.
