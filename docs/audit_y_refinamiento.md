# El Impostor — Auditoría Cross-Agent y Prompts de Refinamiento

> Auditoría del trabajo producido por los 3 agentes especialistas. Análisis de coherencia, solapamientos, gaps e inconsistencias. Prompts de refinamiento al final.

---

## 1. Inventario de Entregables por Agente

### Agente 1 — UX/UI Architect
| Entregable | Archivo | Estado |
|---|---|---|
| Documento de arquitectura UX/UI | `docs/ux_ui_architecture.md` | ✅ Completo |
| Screens implementados (HTML/CSS/JS) | `app/js/screens.js` (1035 líneas) | ✅ Funcional |
| Estilos | `app/css/` | ✅ |
| Sonidos generados | `app/js/sounds.js` | ✅ |
| App main | `app/js/app.js`, `app/index.html` | ✅ |

### Agente 2 — Data Architect
| Entregable | Archivo | Estado |
|---|---|---|
| Documento de arquitectura de datos | `docs/data_architecture.md` | ✅ Completo |
| Script de inicialización de BD | `scripts/init_db.py` | ✅ |
| Seed data | `data/seed/categories.json` | ✅ (mínimo) |
| Esquema DDL | Dentro del doc + script | ✅ Coherente |

### Agente 3 — Game Balance Designer
| Entregable | Archivo | Estado |
|---|---|---|
| Documento de balance | `docs/game_balance_design.md` | ✅ Completo |
| Config centralizada | `src/balance/balance_config.js` | ✅ |
| Ratio de impostores | `src/balance/impostor_ratio.js` | ✅ |
| Sistema ELO | `src/balance/elo_system.js` | ✅ |
| Selector de palabras | `src/balance/word_selector.js` | ✅ |
| Validador de adivinanza | `src/balance/guess_validator.js` | ✅ |
| Orden de turno | `src/balance/turn_order.js` | ✅ |
| Scoring | `src/balance/scoring.js` | ✅ |
| Simulación | `scripts/simulate_balance.js` | ✅ |

---

## 2. Análisis de Coherencia Cross-Agent

### ✅ Lo que funciona bien

1. **Flujo de revelación → datos → balance alineado**: La mecánica hold-to-reveal del UX (600ms), la estructura de datos del Data Architect para almacenar palabras/pares, y las fórmulas de selección del Game Balance se complementan sin contradicciones.

2. **Esquema DDL consistente**: El DDL en `data_architecture.md`, `scripts/init_db.py`, y las referencias en `game_balance_design.md` son idénticos — los 3 agentes usan las mismas tablas, columnas y tipos.

3. **Los tiers semánticos (A/B/C) son un contrato compartido sólido**: El Data Architect los define, el Game Balance los consume para ajustar dificultad, y el UX no necesita conocer su implementación.

4. **Sistema de puntuación unificado**: Los valores de `balance_config.js` coinciden exactamente con los del documento de balance y con lo que `game.js` aplica.

---

### ⚠️ Inconsistencias y Problemas Detectados

#### PROBLEMA 1: Dos sistemas de palabras paralelos e incompatibles

El **Data Architect** diseñó una arquitectura SQLite con tablas `words`, `semantic_pairs`, `categories`, cooldowns, etc. Sin embargo, el **UX/UI Architect** implementó `app/js/words.js` como un JSON hardcodeado en memoria con una estructura completamente diferente:

```javascript
// words.js (UX/UI) — estructura plana en JS
{ word: 'Perro', pairs: ['Lobo', 'Gato', 'Zorro'] }

// data_architecture.md (Data) — estructura relacional en SQLite
words(word_id, category_id, text, difficulty, language)
semantic_pairs(pair_id, word_a_id, word_b_id, similarity, tier)
```

**Consecuencia:** `words.js` no tiene scores de similitud, no tiene tiers, no tiene dificultad ni sistema de cooldowns. El Game Balance diseñó `word_selector.js` esperando un `frequency` field que no existe en `words.js`.

> [!CAUTION]
> Este es el problema de integración más grave. Los 3 agentes deben converger en un único formato de datos que el front-end pueda consumir.

---

#### PROBLEMA 2: `game.js` no usa el módulo `src/balance/`

El `app/js/game.js` contiene su propia lógica de balance inline:
- `getImpostorCount()` — duplica `impostor_ratio.js`
- `calculateRoundScores()` — duplica `scoring.js`
- `checkGuess()` — versión simplificada de `guess_validator.js`

Los módulos de `src/balance/` usan ES modules (`import/export`) pero `game.js` es un IIFE clásico que no importa nada de `src/balance/`. Son dos sistemas paralelos que **no se hablan**.

> [!WARNING]
> Hay que decidir: ¿se usa `src/balance/` como librería importada en el front, o `game.js` absorbe e integra esa lógica directamente?

---

#### PROBLEMA 3: `word_selector.js` espera un campo `frequency` que no existe

```javascript
// word_selector.js espera:
{ id, text, category, frequency: 1-5 }

// words.js ofrece:
{ word: 'Perro', pairs: ['Lobo', 'Gato', 'Zorro'] }

// data_architecture.md define:
words.difficulty (1-5)  ← pero lo llama "difficulty", no "frequency"
```

El campo se llama `difficulty` en el DDL del Data Architect y `frequency` en el Game Balance. Son conceptos ligeramente diferentes (dificultad de la palabra vs. frecuencia de uso) pero el Game Balance los trata como la misma cosa.

---

#### PROBLEMA 4: ELO no integrado en la app

El Game Balance diseñó un sistema ELO sofisticado (`elo_system.js`, bandas de dificultad, ajuste de turno). Pero:
- `game.js` no tiene ni rastro del sistema ELO
- `player_profiles` en SQLite tiene `vote_accuracy`, `win_streak` etc., pero no tiene un campo `elo`
- `screens.js` no muestra nada relativo al ELO

> [!IMPORTANT]
> El campo `elo` no existe en la tabla `player_profiles` del Data Architect. Game Balance asumió que existiría.

---

#### PROBLEMA 5: El turn_order del Game Balance no se aplica

El Game Balance diseñó que la posición del impostor en la ronda de pistas dependa de su ELO. Sin embargo, `game.js` genera el orden de turno de forma puramente aleatoria:

```javascript
// game.js, línea ~147
this.state.clueOrder = [...Array(this.state.numPlayers).keys()];
GameEngine.shuffleArray(this.state.clueOrder);
```

El módulo `turn_order.js` con su lógica de posicionamiento ELO-aware no se consume.

---

#### PROBLEMA 6: Anti-repetición no implementada en el front

El Data Architect diseñó un sistema de cooldowns con tabla `word_cooldowns` y algoritmo de rotación inteligente. El front-end (`game.js`) lleva un `usedWords: []` en memoria que se pierde al cerrar la app. No persiste entre sesiones.

---

### 🟡 Solapamientos Menores (Funcionales pero Redundantes)

| Área | Agente 1 (UX) | Agente 3 (Balance) | Acción |
|---|---|---|---|
| `shuffleArray` | `game.js:shuffleArray` | `turn_order.js:shuffleArray` | Unificar en una utility compartida |
| Validación de adivinanza | `game.js:checkGuess` (simple) | `guess_validator.js` (Levenshtein completo) | Usar solo `guess_validator.js` |
| Cálculo de impostores | `game.js:getImpostorCount` | `impostor_ratio.js` | Usar solo `impostor_ratio.js` |
| Cálculo de puntos | `game.js:calculateRoundScores` | `scoring.js` | Usar solo `scoring.js` |

---

## 3. Gaps Identificados

| Gap | Responsable natural | Impacto |
|---|---|---|
| Campo `elo` ausente en `player_profiles` | **Data Architect** | Bloquea todo el sistema adaptativo de Game Balance |
| Campo `difficulty`/`frequency` desalineado | **Data + Balance** | Selector de palabras no puede funcionar |
| `words.js` no sigue el esquema del Data Architect | **UX + Data** | Dos fuentes de verdad incompatibles |
| No hay pipeline de importación de JSON→SQLite → front | **Data Architect** | Los datos están desconectados del front |
| `src/balance/` no integrado en `app/` | **UX + Balance** | La lógica de balance existe pero no se ejecuta |
| Stats persistentes (localStorage vs. SQLite) | **UX + Data** | `game.js` usa localStorage; Data Architect diseñó SQLite |

---

## 4. Prompts de Refinamiento

### 4.1 — Prompt para UX/UI Architect

```
PROMPT DE REFINAMIENTO — UX/UI Architect

CONTEXTO DE LO QUE HICISTE:
Has diseñado y programado la capa de presentación completa de "El Impostor":
- ux_ui_architecture.md con el sistema de revelación segura (hold-to-reveal 600ms),
  pantallas de transición, feedback multisensorial, votación secreta, diagrama de flujos.
- app/js/screens.js (1035 líneas) con todas las pantallas implementadas.
- app/js/game.js (401 líneas) con el motor de estado del juego.
- app/js/words.js con la base de datos de palabras embebida.
- app/js/sounds.js, app/css/, app/index.html.

CONTEXTO DE LOS OTROS AGENTES:

El Data Architect (Agente 2) ha diseñado un esquema SQLite con tablas: words,
semantic_pairs, categories, player_profiles, match_history, match_rounds,
player_match_results, word_cooldowns. Cada palabra tiene un campo `difficulty`
(1-5). Cada par semántico tiene un `similarity` score (0.0-1.0) y un `tier`
('A','B','C'). Hay un script init_db.py que crea la BD.

El Game Balance Designer (Agente 3) ha creado un módulo en src/balance/ con:
- balance_config.js: TODAS las constantes de balance centralizadas.
- impostor_ratio.js: calcula impostores óptimos por tamaño de grupo.
- elo_system.js: sistema ELO invisible que ajusta dificultad.
- word_selector.js: selecciona palabras según ELO del impostor.
- guess_validator.js: validación con Levenshtein distance (tolerancia ≤ 2 chars).
- turn_order.js: posiciona al impostor en la ronda de pistas según su ELO.
- scoring.js: motor de puntuación con logros, bonus y penalizaciones.

PROBLEMAS DETECTADOS EN LA AUDITORÍA:

1. game.js duplica lógica de balance: getImpostorCount, calculateRoundScores,
   checkGuess, shuffleArray — todo esto ya existe de forma superior en
   src/balance/. Debes ELIMINAR estas duplicaciones de game.js y consumir los
   módulos de src/balance/.

2. words.js usa una estructura plana ({word, pairs[]}) incompatible con el
   esquema del Data Architect ({word_id, category_id, text, difficulty,
   semantic_pairs con similarity y tier}). Debes adaptar words.js para que siga
   la estructura del Data Architect (o consumirla de una fuente unificada).

3. Las estadísticas usan localStorage, pero el Data Architect diseñó SQLite.
   Para la versión web actual, localStorage es viable, pero el formato de los
   datos en localStorage debe alinearse con las tablas del Data Architect para
   facilitar la futura migración a SQLite en la app nativa.

4. El sistema ELO del Game Balance no está integrado en la UI. Necesitas añadir
   la persistencia de ELO por jugador (aunque sea localStorage) y consumir
   elo_system.js para que el selector de palabras y el orden de turno funcionen.

TAREAS DE REFINAMIENTO:

1. INTEGRAR src/balance/ en game.js:
   - Importa y usa impostor_ratio.getRecommendedImpostors() en vez de tu
     función inline getImpostorCount().
   - Importa y usa scoring.calculateRoundScore() en vez de tu función inline.
   - Importa y usa guess_validator.validateGuess() en vez de tu simple
     checkGuess().
   - Importa y usa turn_order.generateTurnOrder() en setupRound().
   - Decide la estrategia de módulos: si usas ES modules nativo (<script
     type="module">), refactoriza index.html y todos los scripts.

2. UNIFICAR EL FORMATO DE PALABRAS:
   - Añade a cada palabra en words.js los campos: difficulty (1-5) y a cada
     par: similarity (0.0-1.0), tier ('A'/'B'/'C').
   - Esto permite que word_selector.js funcione sin cambios.
   - Estructura objetivo por palabra:
     { id: 'w_001', text: 'Perro', difficulty: 4,
       pairs: [
         { word: 'Lobo', similarity: 0.88, tier: 'A' },
         { word: 'Zorro', similarity: 0.72, tier: 'B' }
       ]
     }

3. INTEGRAR ELO:
   - Almacena el ELO por nombre de jugador en localStorage junto a las stats.
   - Pasa el ELO del impostor actual a word_selector.selectWord() y
     turn_order.generateTurnOrder() al inicio de cada ronda.

4. SIMPLIFICAR — NO AÑADIR COMPLEJIDAD:
   - No añadas nuevas pantallas, modos de juego ni features.
   - El objetivo es que lo que ya existe funcione perfectamente con los
     módulos de balance integrados.
   - La UI existente es buena. Solo necesita consumir las APIs correctas.
   - Elimina código muerto y dependencias redundantes.

RESTRICCIONES:
- No cambies la mecánica de hold-to-reveal ni los tiempos de interacción.
- No modifiques balance_config.js (eso es dominio del Game Balance).
- El esquema de datos de words.js debe ser compatible con el del Data
  Architect, pero no necesitas implementar SQLite — basta el JSON en JS.
- Mantén la app 100% funcional offline con un solo fichero HTML servido.
```

---

### 4.2 — Prompt para Data Architect

```
PROMPT DE REFINAMIENTO — Data Architect

CONTEXTO DE LO QUE HICISTE:
Has diseñado la arquitectura de datos completa de "El Impostor":
- data_architecture.md con esquema SQLite, sistema de emparejamiento semántico
  híbrido (B+C), pipeline de contenido, optimización de almacenamiento,
  y sistema de anti-repetición con cooldowns escalados.
- scripts/init_db.py con DDL completo (9 tablas + 9 índices).
- data/seed/categories.json con seed data básico.

CONTEXTO DE LOS OTROS AGENTES:

El UX/UI Architect (Agente 1) ha implementado una app web funcional con
app/js/words.js que contiene ~150 palabras en 6 categorías con pares
semánticos en formato plano: {word: 'Perro', pairs: ['Lobo', 'Gato']}.
NO usa SQLite ni tu esquema. Usa localStorage para persistencia.

El Game Balance Designer (Agente 3) ha creado src/balance/ con un sistema
que espera que cada palabra tenga un campo de frecuencia/dificultad (1-5)
y que los pares semánticos tengan similarity score (0.0-1.0) y tier
('A'/'B'/'C'). También ha creado un sistema ELO por jugador que necesita
persistencia.

PROBLEMAS DETECTADOS EN LA AUDITORÍA:

1. La tabla player_profiles NO tiene campo `elo`. El Game Balance diseñó un
   sistema ELO completo (elo_system.js, bandas de dificultad), pero tu
   esquema no contempla dónde almacenarlo.

2. Los datos de words.js (front) no siguen tu esquema. No tienen difficulty,
   no tienen similarity scores, no tienen tiers. Son listas planas de strings.

3. Los datos seed (categories.json) son mínimos y no contienen palabras.

4. El campo se llama `difficulty` en tu DDL pero el Game Balance lo refiere
   como `frequency`. Son conceptos diferentes (dificultad del concepto vs.
   frecuencia de aparición en la lengua) pero se usan como la misma cosa.

TAREAS DE REFINAMIENTO:

1. ACTUALIZAR EL ESQUEMA — AÑADIR CAMPO ELO:
   - Añade `elo INTEGER NOT NULL DEFAULT 1000` a player_profiles.
   - Actualiza el DDL en data_architecture.md y en scripts/init_db.py.
   - Añade al documento una nota explicando que el campo elo es privado,
     no se muestra al jugador, y se usa internamente por el motor de
     balance (src/balance/elo_system.js).

2. ALINEAR `difficulty` CON EL USO REAL:
   - Renómbralo a `difficulty` de forma definitiva (ya está así en el DDL).
   - Documenta explícitamente en data_architecture.md que `difficulty`
     combina dos factores: frecuencia de la palabra en el lenguaje + qué
     tan fácil es dar pistas sobre ella. El Game Balance consumirá este
     campo como proxy de dificultad.
   - Los valores: 1=muy difícil/rara, 5=muy fácil/común.

3. ENRIQUECER EL SEED DATA:
   - Genera un archivo data/seed/base_pack.json siguiendo TU propio formato
     de pack (pack_meta + categories + words + semantic_pairs).
   - Incluye todas las palabras y pares que ya existen en app/js/words.js,
     pero enriquecidos con:
     · difficulty (1-5) para cada palabra
     · similarity (0.0-1.0) para cada par
     · tier ('A','B','C') derivado del similarity según tus umbrales
   - Esto se convierte en la FUENTE DE VERDAD única: el UX la consume como
     JSON, y el init_db.py la importa a SQLite para la app nativa futura.

4. SIMPLIFICAR — ELIMINAR LO INNECESARIO:
   - Elimina la sección de embeddings/word2vec del documento. La decisión
     ya es clara: pares pre-curados (estrategia B+C). No necesitamos documentar
     alternativas descartadas en detalle.
   - Elimina la sección de compresión avanzada de embeddings (int8/PCA). No se
     va a implementar.
   - La sección de actualización incremental (API endpoint, WiFi check) es
     prematura. Simplifica a: "Los packs adicionales se incluyen como archivos
     JSON en el bundle de la app o se descargan manualmente".

5. NO AÑADIR NUEVAS TABLAS NI COMPLEJIDAD:
   - No diseñes nuevas features ni tablas.
   - El objetivo es que el esquema existente tenga exactamente lo necesario
     y ni una columna de más.

RESTRICCIONES:
- No cambies los nombres de las tablas existentes.
- No modifiques los tipos de los campos que ya usan los otros agentes.
- Mantén la compatibilidad con scripts/init_db.py (actualízalo si cambias el DDL).
- El formato del pack JSON (base_pack.json) debe ser directamente consumible
  por el front (words.js puede importarlo o inlinearlo).
```

---

### 4.3 — Prompt para Game Balance Designer

```
PROMPT DE REFINAMIENTO — Game Balance Designer

CONTEXTO DE LO QUE HICISTE:
Has diseñado el sistema completo de balance matemático de "El Impostor":
- game_balance_design.md con modelo probabilístico, ratios de impostores,
  curvas de dificultad con ELO adaptativo, adivinanza post-eliminación,
  y sistema de puntuación balanceado.
- src/balance/ con 8 módulos: balance_config.js, impostor_ratio.js,
  elo_system.js, word_selector.js, guess_validator.js, turn_order.js,
  scoring.js, index.js.
- scripts/simulate_balance.js con simulaciones de balance.

CONTEXTO DE LOS OTROS AGENTES:

El UX/UI Architect (Agente 1) tiene una app web funcional con game.js que
contiene lógica de balance inline (getImpostorCount, calculateRoundScores,
checkGuess). Está siendo instruido para ELIMINAR estas duplicaciones y
consumir tus módulos de src/balance/ directamente.

El Data Architect (Agente 2) tiene un esquema SQLite con:
- words(word_id, category_id, text, difficulty INT 1-5, language, ...)
- semantic_pairs(pair_id, word_a_id, word_b_id, similarity REAL, tier TEXT)
- player_profiles(player_id, name, ...) — NOTA: le hemos pedido que AÑADA
  un campo `elo INTEGER DEFAULT 1000` aquí.

El campo en la BD se llama `difficulty`, no `frequency`. Los dos agentes
están alineando ese nombre.

PROBLEMAS DETECTADOS EN LA AUDITORÍA:

1. word_selector.js espera un campo `.frequency` en las palabras, pero la
   fuente de datos usa `difficulty`. El nombre y la semántica deben alinearse.

2. El sistema ELO es sofisticado pero no se usa. El UX Architect está siendo
   instruido para integrarlo, pero el modelo tiene demasiadas palancas para
   una v1 (frecuencia de palabra + distancia semántica + orden de turno).
   Simplificarlo hará la integración viable.

3. El documento de balance contiene demasiado análisis de sensibilidad y
   modelos intermedios (§1.3-1.6 con P_detect, Φ, modelos de ronda única)
   que fueron pasos intermedios hasta llegar al modelo final (§1.7). El
   documento debería presentar solo el resultado final, no el recorrido.

4. El bonus de "buena pista" (+75 puntos) es subjetivo y difícil de
   implementar automáticamente. ¿Quién decide si un ciudadano dio una buena
   pista? game.js no tiene forma de saber esto. O se elimina o se convierte
   en algo que los jugadores votan.

TAREAS DE REFINAMIENTO:

1. ALINEAR word_selector.js CON EL CAMPO `difficulty`:
   - Renombra `.frequency` a `.difficulty` en word_selector.js y en
     balance_config.js (FREQ_* → DIFF_*).
   - La lógica es la misma: ELO alto → dificultad alta (palabras raras).
   - Asegúrate de que la JSDoc y los comentarios reflejen el cambio.

2. SIMPLIFICAR EL SISTEMA ADAPTATIVO:
   - Para la v1 SOLO usa 2 palancas (no 3):
     a) Dificultad de la palabra (1-5) — según ELO del impostor.
     b) Distancia semántica (solo en Modo Misterioso) — según ELO.
   - ELIMINA la palanca de orden de turno basado en ELO. Haz que el orden
     sea siempre aleatorio. El impacto medido es minúsculo (+5%/-3%) y
     añade complejidad de integración sin aportar diversión perceptible.
   - Actualiza turn_order.js para que SOLO haga shuffle aleatorio puro.
     Elimina la lógica de EARLY/LATE_THRESHOLD.

3. SIMPLIFICAR EL DOCUMENTO:
   - Elimina las secciones intermedias del modelo matemático (§1.3 a §1.6).
     Deja solo el modelo final corregido (§1.7) con la tabla de win-rates.
   - Elimina el análisis de sensibilidad detallado (d=0.8, d=0.4). Resúmelo
     en una nota de 3 líneas: "Para grupos expertos, la dificultad adaptativa
     aumenta la dificultad. Para novatos, la reduce."
   - El documento final no debería superar 400 líneas (actualmente tiene 737).

4. RESOLVER EL BONUS DE "BUENA PISTA":
   - Propuesta: ELIMINAR el bonus de +75 por dar buena pista.
   - Es subjetivo, no automatizable, y añade una pregunta extra en la UI
     ("¿dio buena pista?") que interrumpe el flujo de una partida rápida.
   - Compensa eliminándolo con un pequeño ajuste al bonus de participación
     (50 → 75) para mantener el equilibrio de puntos esperados.
   - Actualiza balance_config.js, scoring.js, y el documento.

5. ASEGURAR QUE TUS MÓDULOS SON CONSUMIBLES POR EL FRONT:
   - Verifica que todos los ficheros de src/balance/ funcionen tanto como
     ES modules (import/export) como cuando se incluyen con <script> tags.
   - Añade un src/balance/index.js que re-exporte todo lo que el front
     necesita para que haga `import { ... } from './balance/index.js'`.
   - El index.js actual solo re-exporta. Verifica que re-exporta TODO.

RESTRICCIONES:
- No añadas nuevos módulos. Refina los existentes.
- No cambies el rango objetivo de win-rate (35-45%).
- No modifiques las tablas del Data Architect (solo consume el campo
  `difficulty` en vez de `frequency`).
- Los valores de balance_config.js son TU fuente de verdad. Si algún
  valor cambia, cámbialo ahí y en el doc — nunca en game.js.
- El código debe seguir siendo determinista y verificable con aritmética
  básica. Nada de ML.
```

---

## 5. Matriz de Cambios Esperados Post-Refinamiento

| Archivo | UX (1) | Data (2) | Balance (3) |
|---|:---:|:---:|:---:|
| `app/js/game.js` | ✏️ Refactoriza | — | — |
| `app/js/words.js` | ✏️ Adapta formato | — | — |
| `app/js/screens.js` | ✏️ Mínimo | — | — |
| `docs/ux_ui_architecture.md` | ✏️ Actualiza | — | — |
| `docs/data_architecture.md` | — | ✏️ Simplifica | — |
| `scripts/init_db.py` | — | ✏️ Añade elo | — |
| `data/seed/base_pack.json` | — | ✏️ Crea | — |
| `docs/game_balance_design.md` | — | — | ✏️ Simplifica |
| `src/balance/balance_config.js` | — | — | ✏️ Renombra |
| `src/balance/word_selector.js` | — | — | ✏️ Renombra |
| `src/balance/turn_order.js` | — | — | ✏️ Simplifica |
| `src/balance/scoring.js` | — | — | ✏️ Quita clue bonus |
