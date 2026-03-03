# Prompts para Agentes Especialistas — Fase 2: Agilización del Juego

> Cuatro prompts diseñados para implementar cambios que agilizan y enriquecen "El Impostor".
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

## Prompt 4 — Agente de Persistencia de Nombres (Player Roster)

### Contexto del Proyecto

Antes de hacer cualquier cambio, **lee** los siguientes archivos:

| Archivo | Razón |
|---------|-------|
| `app/js/screens.js` | Contiene `playerNames()` y `_startGame()`. Tu zona principal de trabajo para la UI del roster. |
| `app/js/game.js` | Motor del juego. Entender cómo `state.players` se inicializa y cómo `initGame()` consume los nombres. |
| `app/js/app.js` | Entry point. Entender el flujo de inicialización (`DOMContentLoaded` → `loadSettings()` → `splash()`). |
| `docs/reglas_del_juego.md` | Reglas oficiales. |

### Problema Actual

Cada vez que un usuario abre la app o inicia una partida nueva, debe escribir **manualmente** el nombre de cada jugador en la pantalla `playerNames()`. En un juego de fiesta donde los mismos amigos juegan repetidamente, esto es tedioso y rompe el ritmo.

Código actual en `screens.js`:
```javascript
function playerNames() {
  const st = GameEngine.state;
  if (st.players.length !== st.numPlayers) {
    st.players = Array.from({ length: st.numPlayers }, (_, i) => ({ name: '' }));
  }
  // ... renders empty inputs
}
```

Los nombres se pierden al recargar la página o al cerrar la app.

### Cambio Requerido

#### 4a. Guardar nombres en localStorage

Crear un sistema de **roster** (plantilla de jugadores) persistente:

- **Clave localStorage**: `impostor_player_roster`
- **Formato**: Un array de strings con los nombres usados recientemente, ordenados por última vez que jugaron (más recientes primero).
- **Máximo**: 20 nombres guardados.
- **Se actualiza** automáticamente al pulsar "¡Empezar!" en `_startGame()`, guardando los nombres de la partida actual.

#### 4b. Auto-rellenar nombres al entrar en `playerNames()`

Cuando se entra en la pantalla de nombres:
1. Cargar el roster desde localStorage.
2. Auto-rellenar los campos con los primeros N nombres del roster (donde N = `numPlayers`).
3. El usuario puede **editar** cualquier nombre pre-rellenado.
4. Si hay menos nombres guardados que jugadores, los campos restantes quedan vacíos.

#### 4c. UI de gestión rápida del roster

Añadir debajo de los inputs de nombres:

1. **Sección "Jugadores recientes"** (si hay nombres guardados): una lista horizontal de chips/badges con los nombres del roster. Tocar un chip lo añade al primer campo vacío.
2. **Botón "Borrar plantilla"**: un link pequeño al final que vacía el roster de localStorage (con confirmación).

Diseño de los chips:
```html
<div class="roster-chips">
  <span class="roster-chip" onclick="...">David</span>
  <span class="roster-chip" onclick="...">Ana</span>
  <span class="roster-chip" onclick="...">Carlos</span>
</div>
```

#### 4d. Funciones de API en game.js

Añadir al `GameEngine`:
```javascript
// Carga el roster desde localStorage
loadRoster() → string[]

// Guarda el roster en localStorage (deduplica, max 20, más recientes primero)
saveRoster(names: string[]) → void

// Borra el roster
clearRoster() → void
```

### Archivos que DEBES modificar

- **`app/js/game.js`**:
  - Añadir constante `ROSTER_KEY = 'impostor_player_roster'`.
  - Implementar `loadRoster()`, `saveRoster()`, `clearRoster()`.
  - Exportar las 3 funciones en el objeto `GameEngine`.
  - En `_startGame()` (o desde screens.js tras llamar a `_startGame`), invocar `saveRoster()` con los nombres actuales.
- **`app/js/screens.js`**:
  - Modificar `playerNames()` para:
    - Llamar a `GameEngine.loadRoster()` al renderizar.
    - Auto-rellenar los inputs con los nombres del roster.
    - Renderizar la sección de chips con jugadores recientes.
    - Renderizar el botón "Borrar plantilla".
  - Añadir funciones auxiliares:
    - `_addFromRoster(name)`: asigna el nombre al primer campo vacío.
    - `_clearRoster()`: limpia el localStorage previa confirmación y re-renderiza.
- **`app/css/styles.css`**:
  - Añadir estilos para `.roster-chips` y `.roster-chip` (chips redondeados, fondo semi-transparente, hover effect).
  - Añadir estilo para `.roster-clear-btn` (link pequeño y sutil).

### Archivos que NO DEBES tocar

- `app/js/words.js`
- `app/js/balance/*` (todos los módulos de balance)
- `app/js/sounds.js`
- `app/js/app.js` (no necesitas modificar el entry point)
- `app/index.html`

### Restricciones técnicas

- Los nombres se guardan **sin duplicados** y en **minúsculas** para la comparación (pero se muestran con la capitalización original).
- Al guardar, mover los nombres recién usados al principio del array (MRU = Most Recently Used).
- Si un nombre del roster ya está asignado a un input, no mostrarlo como chip disponible (evitar duplicados en la misma partida).
- Usar `try/catch` alrededor de todas las operaciones de localStorage (igual que el resto del código hace con `loadSettings()`, `loadStats()`, etc.).
- Mantener la estética existente: los chips deben usar colores coherentes con el tema (`var(--accent)`, `var(--surface)`, bordes `var(--border)`).
- Coordinar con Agente 2: si el Agente 2 modifica la pantalla `config()`, el Agente 4 solo toca `playerNames()`, que es una pantalla posterior y **no se solapa**.

---

## Matriz de No-Solapamiento

| Archivo | Agente 1 (Votación) | Agente 2 (Roles) | Agente 3 (Pista) | Agente 4 (Roster) |
|---------|:-------------------:|:-----------------:|:----------------:|:-----------------:|
| `screens.js` — votación | ✅ Reescribe | ❌ | ❌ | ❌ |
| `screens.js` — config | ❌ | ✅ Modifica | ✅ Añade toggle | ❌ |
| `screens.js` — playerNames | ❌ | ❌ | ❌ | ✅ Reescribe |
| `screens.js` — dealing | ❌ | ❌ | ✅ Modifica | ❌ |
| `game.js` — voting/tally | ✅ Simplifica | ❌ | ❌ | ❌ |
| `game.js` — state/setup | ❌ | ✅ Reescribe | ✅ Añade hint | ❌ |
| `game.js` — roster API | ❌ | ❌ | ❌ | ✅ Crea nuevo |
| `game.js` — scores | ✅ Adapta voted | ✅ Adapta roles | ❌ | ❌ |
| `words.js` | ❌ | ❌ | ✅ Añade hints | ❌ |
| `impostor_ratio.js` | ❌ | ✅ Añade combos | ❌ | ❌ |
| `css/styles.css` | ✅ Limpia vote | ❌ | ✅ Añade hint | ✅ Añade roster |

> **Orden de ejecución recomendado**: Agente 3 primero (datos), luego Agente 2 (lógica de roles) + Agente 4 (roster) en paralelo, finalmente Agente 1 (UI de votación).

