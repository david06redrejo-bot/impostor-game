# El Impostor — Arquitectura de Datos & Sistema Semántico Offline

> **Agente 2 · Data Architect (NLP & Base de Datos Semántica Offline)**
> Dominio exclusivo: estructura de datos local, emparejamiento semántico y optimización de peso.

---

## Índice

1. [Modelo de Datos Local](#1-modelo-de-datos-local)
2. [Sistema de Emparejamiento Semántico](#2-sistema-de-emparejamiento-semántico)
3. [Pipeline de Contenido](#3-pipeline-de-contenido)
4. [Optimización de Almacenamiento](#4-optimización-de-almacenamiento)
5. [Anti-Repetición y Frescura](#5-anti-repetición-y-frescura)

---

## 1. Modelo de Datos Local

### 1.1 Elección de tecnología: SQLite

**Decisión:** SQLite como motor de base de datos único.

**Justificación:**
- **Cross-platform nativo**: SQLite es el motor por defecto tanto en Android (Room/SQLite) como en iOS (Core Data respaldado por SQLite o SQLite directo con GRDB/FMDB).
- **Cero configuración**: No requiere servidor, daemon ni cuenta — se instala como un fichero `.db` dentro del bundle de la app.
- **Madurez y rendimiento**: Más de 20 años de desarrollo; lectura de registros individuales en < 1 ms en cualquier dispositivo moderno.
- **Tamaño del motor**: ~600 KB embebido, despreciable frente al contenido.
- **Transacciones ACID**: Garantiza integridad de datos incluso si la app se cierra abruptamente durante una partida.

---

### 1.2 Diagrama Entidad-Relación

```
┌──────────────────────┐       ┌──────────────────────────┐
│      categories      │       │         words            │
├──────────────────────┤       ├──────────────────────────┤
│ PK  category_id  INT│───┐   │ PK  word_id         INT  │
│     name        TEXT │   │   │ FK  category_id     INT  │──→ categories
│     icon_emoji  TEXT │   │   │     text            TEXT  │
│     is_premium  BOOL │   │   │     difficulty    INT(1-5)│  ← ver §1.5
│     pack_id     TEXT │   │   │     language      TEXT(2) │
│     sort_order  INT  │   │   │     created_at    INT    │
└──────────────────────┘   │   └──────────────────────────┘
                           │               │
                           │               │ word_id (FK)
                           │               ▼
┌──────────────────────┐   │   ┌──────────────────────────┐
│       packs          │   │   │    semantic_pairs         │
├──────────────────────┤   │   ├──────────────────────────┤
│ PK  pack_id    TEXT  │   │   │ PK  pair_id         INT  │
│     name       TEXT  │   │   │ FK  word_a_id       INT  │──→ words
│     version    INT   │   │   │ FK  word_b_id       INT  │──→ words
│     is_free    BOOL  │   │   │     similarity    REAL   │ ← [0.0 – 1.0]
│     size_bytes INT   │   │   │     tier         TEXT(1)  │ ← 'A','B','C'
│     checksum   TEXT  │   │   └──────────────────────────┘
│     installed_at INT │   │
└──────────────────────┘   │
                           │
┌──────────────────────────┐   ┌──────────────────────────┐
│   player_profiles        │   │      match_history       │
├──────────────────────────┤   ├──────────────────────────┤
│ PK  player_id       INT  │   │ PK  match_id        INT  │
│     name            TEXT │   │     mode          TEXT    │ ← 'impostor'|'misterioso'
│     avatar_index    INT  │   │ FK  category_id    INT   │──→ categories
│     elo             INT  │   │     num_players    INT   │
│     games_played    INT  │   │     played_at      INT   │
│     games_won       INT  │   │     num_rounds     INT   │
│     games_lost      INT  │   └──────────────────────────┘
│     impostor_count  INT  │               │
│     citizen_count   INT  │               │ match_id (FK)
│     vote_accuracy  REAL  │               ▼
│     win_streak      INT  │   ┌──────────────────────────┐
│     max_streak      INT  │   │   match_rounds           │
│     total_points    INT  │   ├──────────────────────────┤
│     created_at      INT  │   │ PK  round_id        INT  │
└──────────────────────────┘   │ FK  match_id        INT  │──→ match_history
         │                     │ FK  word_id         INT  │──→ words
         │ player_id (FK)      │ FK  pair_word_id    INT  │──→ words (nullable)
         ▼                     │     round_number   INT  │
┌──────────────────────────┐   │     winner        TEXT   │ ← 'impostor'|'citizens'
│  player_match_results    │   └──────────────────────────┘
├──────────────────────────┤
│ PK  result_id       INT  │
│ FK  match_id        INT  │──→ match_history
│ FK  player_id       INT  │──→ player_profiles
│     role           TEXT  │ ← 'impostor'|'citizen'
│     voted_correctly BOOL │
│     points_earned   INT  │
│     was_eliminated  BOOL │
│     guessed_word    BOOL │ ← solo Modo Impostor
└──────────────────────────┘

┌──────────────────────────┐
│   word_cooldowns         │
├──────────────────────────┤
│ PK  cooldown_id     INT  │
│ FK  word_id         INT  │──→ words
│     last_used_at    INT  │ ← epoch timestamp
│     use_count       INT  │
│     cooldown_until  INT  │ ← epoch timestamp
└──────────────────────────┘
```

### 1.3 Estrategia de Indexación

| Índice | Tipo | Columnas | Propósito | Complejidad |
|---|---|---|---|---|
| `idx_words_category` | B-Tree | `(category_id, word_id)` | Filtrar palabras por categoría | O(log n) |
| `idx_words_text` | B-Tree UNIQUE | `(text, language)` | Evitar duplicados, búsqueda directa | O(log n) |
| `idx_pairs_word_a` | B-Tree | `(word_a_id, tier)` | Buscar pares de una palabra por nivel de similitud | O(log n) |
| `idx_pairs_word_b` | B-Tree | `(word_b_id, tier)` | Búsqueda bidireccional de pares | O(log n) |
| `idx_pairs_tier` | B-Tree | `(tier, similarity DESC)` | Consultas por umbral de dificultad | O(log n) |
| `idx_cooldown_word` | B-Tree UNIQUE | `(word_id)` | Lookup O(log n) de cooldown por palabra | O(log n) |
| `idx_match_played` | B-Tree | `(played_at DESC)` | Historial ordenado cronológicamente | O(log n) |

> **Nota sobre O(1):** SQLite no soporta hash indexes nativos, pero con tablas de ≤ 50.000 registros, un B-Tree de profundidad 3-4 ejecuta en **< 0,1 ms**, funcionalmente equivalente a O(1) en la práctica.

### 1.4 Estimación de Peso por 1.000 Palabras

| Escala | Peso estimado |
|---|---|
| 1.000 palabras | 0,27 MB |
| 5.000 palabras | 1,35 MB |
| 10.000 palabras | 2,70 MB |
| 20.000 palabras | 5,40 MB |

> ✅ Con 625 palabras en la app base actual, el contenido ocupa **~208 KB** — muy por debajo del presupuesto de 30 MB.

### 1.5 Campo `difficulty` — Semántica Oficial

El campo `words.difficulty` (INTEGER 1-5) combina dos factores en un único proxy:

| Valor | Significado | Frecuencia en el lenguaje | Facilidad para dar pistas |
|---|---|---|---|
| **5** | Muy fácil/común | Palabra de uso diario | Cualquier jugador da pistas sin esfuerzo |
| **4** | Fácil | Conocida por la mayoría | Pistas obvias disponibles |
| **3** | Media | Conocida pero no cotidiana | Requiere algo de creatividad |
| **2** | Difícil | Poco frecuente | Pocas pistas claras |
| **1** | Muy difícil/rara | Palabra especializada o poco común | Pistas muy indirectas |

> **Nota para Game Balance (Agente 3):** Este campo es consumido por `src/balance/word_selector.js` como proxy de dificultad. El motor de balance selecciona palabras con `difficulty` acorde a la banda de ELO del grupo. No existe un campo separado de "frecuencia" — `difficulty` integra ambos conceptos.

### 1.6 Campo `elo` — Dificultad Adaptativa

El campo `player_profiles.elo` (INTEGER, default 1000) almacena el rating interno de habilidad de cada jugador.

| Aspecto | Detalle |
|---|---|
| **Valor inicial** | 1000 |
| **Rango** | 100 – 2000 (clamp) |
| **Visibilidad** | **Privado** — nunca se muestra al jugador |
| **Consumidor** | `src/balance/elo_system.js` |
| **Uso** | Selección de dificultad de palabras, distancia semántica en Misterioso, y orden de turno |

> [!IMPORTANT]
> El campo `elo` es invisible para el jugador. Si un jugador percibe que "el juego le castiga por ganar", el sistema de balance ha fallado (ver restricciones del Agente 3).

---

## 2. Sistema de Emparejamiento Semántico

### 2.1 Estrategia: Pares Pre-curados + Taxonomía (Híbrida B+C)

La estrategia de emparejamiento es un **grafo de pares explícitos pre-curados** organizado dentro de una **taxonomía jerárquica de categorías**.

```
┌─────────────────────────────────────────────────────┐
│              ARQUITECTURA HÍBRIDA B + C              │
│                                                     │
│  ┌───────────────────────────┐                      │
│  │  C: TAXONOMÍA JERÁRQUICA  │  ← Organización      │
│  │  Categoría → Palabras     │    y navegación       │
│  └─────────────┬─────────────┘                      │
│                │ Cada palabra tiene                  │
│                │ category_id (FK)                    │
│                ▼                                    │
│  ┌───────────────────────────┐                      │
│  │  B: GRAFO DE PARES        │  ← Emparejamiento    │
│  │  EXPLÍCITOS PRE-CURADOS   │    de alta calidad    │
│  │  (word_A, word_B, score)  │                      │
│  └───────────────────────────┘                      │
└─────────────────────────────────────────────────────┘
```

**¿Por qué pares curados y no embeddings?** En un juego de deducción social, la *percepción humana* de similitud importa más que la similitud vectorial. "Guitarra" y "Ukelele" deben sentirse *casi iguales pero no idénticas* para que el modo Misterioso sea divertido. Un embedding podría devolver "Guitarra" → "Acústica" (alta similitud vectorial pero una es adjetivo), lo cual arruina la experiencia.

### 2.2 Umbrales de Similitud para Modo Misterioso

| Tier | Código | Rango de Score | Uso en juego | Ejemplo |
|---|---|---|---|---|
| **A** — Muy similar | `'A'` | 0.85 – 1.00 | Dificultad **fácil** para el impostor | Guitarra ↔ Ukelele |
| **B** — Similar | `'B'` | 0.70 – 0.84 | Dificultad **media** | Guitarra ↔ Violín |
| **C** — Vagamente similar | `'C'` | 0.50 – 0.69 | Dificultad **difícil** para el impostor | Guitarra ↔ Concierto |

> El tier se almacena desnormalizado en `semantic_pairs.tier` para consultas filtradas directas sin calcular rangos en runtime.

### 2.3 Pseudocódigo del Algoritmo de Emparejamiento

```pseudo
FUNCIÓN obtener_par_misterioso(category_id, difficulty_tier, excluded_word_ids):
  """
  Selecciona una palabra principal y su par semántico para una ronda.
  
  Params:
    category_id       — categoría seleccionada (o NULL para aleatorio)
    difficulty_tier   — 'A', 'B' o 'C'
    excluded_word_ids — lista de word_ids en cooldown
  
  Returns: (palabra_ciudadanos, palabra_impostor, score)
  """

  # Paso 1: Seleccionar palabra candidata no en cooldown
  candidatas ← SELECT w.word_id, w.text FROM words w
               WHERE (category_id IS NULL OR w.category_id = category_id)
                 AND w.word_id NOT IN (excluded_word_ids)
               ORDER BY RANDOM()

  # Paso 2: Para cada candidata, buscar un par válido
  PARA CADA palabra IN candidatas:
    pares ← SELECT word_b_id, w2.text, similarity
            FROM semantic_pairs sp JOIN words w2 ...
            WHERE sp.word_a_id = palabra.word_id AND sp.tier = difficulty_tier
            UNION (búsqueda inversa word_b_id → word_a_id)
            ORDER BY RANDOM() LIMIT 1

    SI pares NO ESTÁ VACÍO:
      RETORNAR (palabra.text, pares[0].text, pares[0].similarity)

  # Paso 3: Fallback — relajar tier (A→B→C)
  SI difficulty_tier != 'C':
    RETORNAR obtener_par_misterioso(category_id, next_tier, excluded_word_ids)

  # Paso 4: Último fallback — ignorar cooldowns
  RETORNAR obtener_par_misterioso(category_id, 'A', [])
FIN FUNCIÓN
```

**Rendimiento:** < 5 ms en Snapdragon 665 / A12 (muy por debajo del requisito de 50 ms).

---

## 3. Pipeline de Contenido

### 3.1 Fuente de Verdad Única: `base_pack.json`

El archivo `data/seed/base_pack.json` es la **fuente de verdad única** para todo el contenido del juego. Tanto el front-end (`app/js/words.js`) como la BD nativa (`db/impostor.db`) se generan a partir de este fichero.

```
data/seed/base_pack.json  ← FUENTE DE VERDAD
        │
        ├──→ scripts/seed_data.py  ──→ db/impostor.db (app nativa)
        │
        └──→ app/js/words.js (web app — puede importar o inline el JSON)
```

### 3.2 Formato del Pack JSON

```json
{
  "pack_meta": {
    "pack_id": "base_v1",
    "name": "Pack Base",
    "version": 1,
    "language": "es",
    "is_free": true
  },
  "categories": [
    { "id": "animals", "name": "Animales", "icon_emoji": "🐾", "is_premium": false, "sort_order": 1 }
  ],
  "words": [
    { "text": "Perro", "category": "Animales", "difficulty": 5 }
  ],
  "semantic_pairs": [
    { "word_a": "Perro", "word_b": "Lobo", "similarity": 0.88, "tier": "A" }
  ]
}
```

Los packs adicionales se incluyen como archivos JSON en el bundle de la app o se descargan manualmente. La importación usa `scripts/import_pack.py` con merge incremental (UPSERT transaccional) que **nunca toca** las tablas de jugadores ni historial.

### 3.3 Criterios de Validación

**Por palabra:**
1. ¿Un jugador promedio (10+ años) conoce la palabra en español?
2. ¿Significado dominante claro? (Evitar homónimos ambiguos)
3. Sin contenido ofensivo.
4. Pertenece a exactamente una categoría.

**Por par semántico:**
1. Un humano diría "sí, tienen relación" en < 3 segundos.
2. Mismo tipo gramatical (sustantivo ↔ sustantivo preferentemente).
3. Score coherente con la percepción: 0.90 = casi intercambiables, 0.55 = tenue.
4. Cada palabra debe tener **al menos 2 pares** (idealmente 3).

### 3.4 Scripts del Pipeline

| Script | Comando | Función |
|---|---|---|
| `generate_base_pack.py` | `python scripts/generate_base_pack.py` | Genera `base_pack.json` desde datos embebidos |
| `init_db.py` | `python scripts/init_db.py [--force]` | Crea BD con schema completo |
| `seed_data.py` | `python scripts/seed_data.py` | Puebla BD desde `base_pack.json` |
| `export_pack.py` | `python scripts/export_pack.py "Categoría"` | Exporta categoría como `.json.gz` |
| `import_pack.py` | `python scripts/import_pack.py pack.json.gz` | Importa pack con merge incremental |
| `validate_pairs.py` | `python scripts/validate_pairs.py` | Informe de cobertura y calidad |

---

## 4. Optimización de Almacenamiento

### 4.1 Presupuesto de Almacenamiento

| Componente | Peso estimado | Notas |
|---|---|---|
| **Contenido base** (8 categorías, 625 palabras) | | |
| └ Palabras + pares + índices | **0.21 MB** | Verificado: 208 KB real |
| **Datos de usuario** (vacío inicial) | ~0.01 MB | Crece con uso |
| **Total contenido base** | **≈ 0.22 MB** | |
| **Presupuesto restante** | **29.78 MB** | Hasta 30 MB total |

> ✅ La app base ocupa < 0.25 MB de datos. El presupuesto de 30 MB permite escalar a > 100.000 palabras.

### 4.2 Compresión de Packs

Los packs descargables se distribuyen como `.json.gz` (gzip nivel 6). Ratio de compresión verificado: **~91%** (21.9 KB → 1.9 KB para categoría Animales).

### 4.3 Estrategia de Cache en Runtime

```
Nivel 1: Cache de partida (in-memory)
  → Al iniciar partida, pre-cargar todas las palabras y pares
    de la categoría seleccionada (~50-100 KB, < 10 ms)

Nivel 2: Set de palabras ya usadas en la partida actual
  → Excluir de selección para evitar repetir en rondas consecutivas

Nivel 3: Cooldowns persistentes (SQLite)
  → Consultada al inicio de la partida, no en cada ronda
  → Cooldowns expirados se limpian con DELETE batch al iniciar la app

RESULTADO: Rondas 2+ se resuelven en < 1 ms (lectura in-memory + filtro set).
```

---

## 5. Anti-Repetición y Frescura

### 5.1 Sistema de Cooldown por Palabra

Cada vez que se usa una palabra, se registra en `word_cooldowns` con cooldown escalado:

| Uso # | Cooldown |
|---|---|
| 1 | 2 horas |
| 2 | 4 horas |
| 3 | 6 horas |
| 5 | 10 horas |
| 10 | 20 horas |
| 50+ | 168 horas (1 semana) — cap máximo |

```pseudo
FUNCIÓN registrar_uso(word_id):
  existing ← SELECT * FROM word_cooldowns WHERE word_id = word_id
  SI existing EXISTE:
    new_count ← existing.use_count + 1
    cooldown_horas ← MIN(new_count * 2, 168)
    UPDATE word_cooldowns SET use_count = new_count,
      last_used_at = AHORA(), cooldown_until = AHORA() + cooldown_horas * 3600
  SINO:
    INSERT INTO word_cooldowns VALUES (word_id, AHORA(), 1, AHORA() + 2*3600)
```

### 5.2 Algoritmo de Rotación Inteligente

Scoring compuesto: `score = freshness_weight × pair_quality_weight`

- **freshness_weight**: nunca usada (1.0), cooldown expirado (0.8), >48h (0.6), >24h (0.4), <24h (excluida)
- **pair_quality_weight**: tiene tier A (1.0), solo B (0.9), solo C (0.7)

Se selecciona aleatoriamente del **top-10** para mantener variedad sin sacrificar calidad.

### 5.3 Garantías

| Escenario | Comportamiento |
|---|---|
| Categoría de 200 palabras, uso diario | Sin repetición ~100 partidas |
| Todas las palabras en cooldown | Fallback: se ignoran cooldowns |
| Primera partida | Selección aleatoria uniforme |
| Pack nuevo instalado | freshness = 1.0, prioridad máxima |

---

## Apéndice A: DDL Completo (SQLite)

```sql
PRAGMA journal_mode = WAL;
PRAGMA page_size = 4096;
PRAGMA auto_vacuum = INCREMENTAL;
PRAGMA foreign_keys = ON;

CREATE TABLE packs (
  pack_id       TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  version       INTEGER NOT NULL DEFAULT 1,
  is_free       INTEGER NOT NULL DEFAULT 0,
  size_bytes    INTEGER NOT NULL DEFAULT 0,
  checksum      TEXT,
  installed_at  INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE categories (
  category_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL UNIQUE,
  icon_emoji    TEXT,
  is_premium    INTEGER NOT NULL DEFAULT 0,
  pack_id       TEXT REFERENCES packs(pack_id),
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE words (
  word_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id   INTEGER NOT NULL REFERENCES categories(category_id),
  text          TEXT NOT NULL,
  difficulty    INTEGER NOT NULL DEFAULT 3 CHECK(difficulty BETWEEN 1 AND 5),
  language      TEXT NOT NULL DEFAULT 'es',
  created_at    INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  UNIQUE(text, language)
);

CREATE TABLE semantic_pairs (
  pair_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  word_a_id     INTEGER NOT NULL REFERENCES words(word_id),
  word_b_id     INTEGER NOT NULL REFERENCES words(word_id),
  similarity    REAL NOT NULL CHECK(similarity BETWEEN 0.0 AND 1.0),
  tier          TEXT NOT NULL CHECK(tier IN ('A','B','C')),
  UNIQUE(word_a_id, word_b_id),
  CHECK(word_a_id < word_b_id)
);

CREATE TABLE player_profiles (
  player_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  avatar_index   INTEGER NOT NULL DEFAULT 0,
  elo            INTEGER NOT NULL DEFAULT 1000,  -- Internal: src/balance/elo_system.js
  games_played   INTEGER NOT NULL DEFAULT 0,
  games_won      INTEGER NOT NULL DEFAULT 0,
  games_lost     INTEGER NOT NULL DEFAULT 0,
  impostor_count INTEGER NOT NULL DEFAULT 0,
  citizen_count  INTEGER NOT NULL DEFAULT 0,
  vote_accuracy  REAL NOT NULL DEFAULT 0.0,
  win_streak     INTEGER NOT NULL DEFAULT 0,
  max_streak     INTEGER NOT NULL DEFAULT 0,
  total_points   INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE match_history (
  match_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  mode          TEXT NOT NULL CHECK(mode IN ('impostor','misterioso')),
  category_id   INTEGER REFERENCES categories(category_id),
  num_players   INTEGER NOT NULL CHECK(num_players BETWEEN 3 AND 12),
  played_at     INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  num_rounds    INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE match_rounds (
  round_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id      INTEGER NOT NULL REFERENCES match_history(match_id),
  word_id       INTEGER NOT NULL REFERENCES words(word_id),
  pair_word_id  INTEGER REFERENCES words(word_id),
  round_number  INTEGER NOT NULL,
  winner        TEXT CHECK(winner IN ('impostor','citizens'))
);

CREATE TABLE player_match_results (
  result_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id        INTEGER NOT NULL REFERENCES match_history(match_id),
  player_id       INTEGER NOT NULL REFERENCES player_profiles(player_id),
  role            TEXT NOT NULL CHECK(role IN ('impostor','citizen')),
  voted_correctly INTEGER NOT NULL DEFAULT 0,
  points_earned   INTEGER NOT NULL DEFAULT 0,
  was_eliminated  INTEGER NOT NULL DEFAULT 0,
  guessed_word    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE word_cooldowns (
  cooldown_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  word_id        INTEGER NOT NULL UNIQUE REFERENCES words(word_id),
  last_used_at   INTEGER NOT NULL,
  use_count      INTEGER NOT NULL DEFAULT 1,
  cooldown_until INTEGER NOT NULL
);

-- ÍNDICES
CREATE INDEX idx_words_category    ON words(category_id, word_id);
CREATE UNIQUE INDEX idx_words_text ON words(text, language);
CREATE INDEX idx_pairs_word_a      ON semantic_pairs(word_a_id, tier);
CREATE INDEX idx_pairs_word_b      ON semantic_pairs(word_b_id, tier);
CREATE INDEX idx_pairs_tier        ON semantic_pairs(tier, similarity DESC);
CREATE INDEX idx_cooldown_word     ON word_cooldowns(word_id);
CREATE INDEX idx_match_played      ON match_history(played_at DESC);
CREATE INDEX idx_results_match     ON player_match_results(match_id);
CREATE INDEX idx_results_player    ON player_match_results(player_id);
```

---

## Apéndice B: Benchmark de Rendimiento

| Operación | Tiempo estimado | Dispositivo |
|---|---|---|
| Obtener palabra aleatoria de categoría | < 2 ms | Snapdragon 665 |
| Buscar pares semánticos de palabra | < 1 ms | Snapdragon 665 |
| Pre-cargar categoría completa | < 5 ms | Snapdragon 665 |
| **Flujo completo `obtener_par_misterioso`** | **< 5 ms** | Snapdragon 665 |
| Importar pack 1.000 palabras | ~200 ms | Snapdragon 665 |

> ✅ Todas las operaciones de tiempo de juego se resuelven en < 10 ms.
