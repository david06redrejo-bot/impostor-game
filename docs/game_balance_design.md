# El Impostor — Game Balance Design

> **Agente 3 — Game Balance Designer**
> Equilibrio matemático, ratios, dificultad adaptativa y puntuación.

---

## 1. Modelo Matemático de Equilibrio

### 1.1 Rango objetivo: 35 %–45 % win-rate del impostor

| Argumento | Detalle |
|---|---|
| **Asimetría recompensante** | < 30 % frustra al impostor; ≥ 50 % frustra a la mayoría (ciudadanos). |
| **Tensión constante** | ~40 % mantiene a ambos bandos en alerta cada ronda. |
| **Referencia industrial** | *Secret Hitler* ~35–40 %, *The Resistance* ~40 %, *One Night Werewolf* ~35–45 %. |

### 1.2 Modelo final de win-rate

El impostor gana de dos formas:
1. **Los ciudadanos eliminan a un inocente** (confusión grupal).
2. **El impostor es eliminado pero adivina la palabra** (solo Modo Impostor).

```
P_win_impostor = P_wrong_target + (1 − P_wrong_target) × P_adivinar

Donde:
  P_wrong_target = (1 − d) × (C / N)
    d = habilidad de deducción (0.5 = aleatorio, 1.0 = perfecto)
    C = ciudadanos, N = jugadores totales

  P_adivinar = 0.15 (Modo Impostor) o 0 (Modo Misterioso)
```

### 1.3 Tabla de win-rates (d = 0.6, habilidad media)

#### Modo Impostor

| N | I | C | P_wrong | P_guess | **Win-rate** | Estado |
|:-:|:-:|:-:|:-------:|:-------:|:------------:|:------:|
| 3 | 1 | 2 | 26.7 % | 15 % | **37.7 %** | ✅ |
| 4 | 1 | 3 | 30.0 % | 15 % | **40.5 %** | ✅ |
| 5 | 1 | 4 | 32.0 % | 15 % | **42.2 %** | ✅ |
| 6 | 1 | 5 | 33.3 % | 15 % | **43.3 %** | ✅ |
| 7 | 1 | 6 | 34.3 % | 15 % | **44.2 %** | ✅ |
| 8 | 2 | 6 | 30.0 % | 15 % | **40.5 %** | ✅ |
| 9 | 2 | 7 | 31.1 % | 15 % | **41.4 %** | ✅ |
| 10 | 2 | 8 | 32.0 % | 15 % | **42.2 %** | ✅ |
| 11 | 3 | 8 | 29.1 % | 15 % | **39.7 %** | ✅ |
| 12 | 3 | 9 | 30.0 % | 15 % | **40.5 %** | ✅ |

#### Modo Misterioso

Sin mecánica de adivinanza, pero el impostor se camufla mejor (+15 % relativo a P_wrong):

| N | I | **Win-rate** | Estado |
|:-:|:-:|:------------:|:------:|
| 3 | 1 | ~31 % | ⚠️ bajo — compensar con distancia semántica alta |
| 4 | 1 | ~35 % | ✅ |
| 5 | 1 | ~37 % | ✅ |
| 6 | 1 | ~38 % | ✅ |
| 7 | 1 | ~39 % | ✅ |
| 8 | 2 | ~35 % | ✅ |
| 9 | 2 | ~36 % | ✅ |
| 10 | 2 | ~37 % | ✅ |
| 11 | 3 | ~34 % | ⚠️ compensar con distancia semántica alta |
| 12 | 3 | ~35 % | ✅ |

> **Nota sobre sensibilidad**: Para grupos expertos (d ≥ 0.75) el win-rate baja ~10 puntos; el sistema adaptativo (Sección 3) compensa usando palabras más difíciles y menor distancia semántica. Para novatos (d ≤ 0.45) el win-rate sube ~10 puntos; el sistema compensa usando palabras fáciles y mayor distancia semántica.

---

## 2. Tabla de Ratios Óptimos

### 2.1 Ratios recomendados (ambos modos)

| Jugadores | Impostores (default) | Override manual | Justificación |
|:---------:|:--------------------:|:---------------:|---|
| 3 | **1** | — | 2 impostores sería absurdo (solo 1 ciudadano) |
| 4 | **1** | — | 50 % impostores desequilibra |
| 5 | **1** | — | Equilibrio óptimo |
| 6 | **1** | 1–2 | Con 2 impostores → más difícil, opción para expertos |
| 7 | **1** | 1–2 | Ídem |
| 8 | **2** | 1–2 | Grupo grande necesita 2 para mantener tensión |
| 9 | **2** | — | Equilibrio óptimo |
| 10 | **2** | 2–3 | Con 3 impostores → opción para expertos |
| 11 | **3** | 2–3 | A partir de 11, 2 se detectan fácilmente |
| 12 | **3** | 2–3 | Equilibrio óptimo |

### 2.2 Ajuste para Modo Misterioso

Misma tabla de impostores. La diferencia se gestiona con la **distancia semántica** como palanca:
- Grupos ≤ 5: distancia semántica alta (0.80+) para compensar la ausencia de adivinanza.
- Grupos 6–7 con 1 impostor: distancia semántica ≥ 0.70 para evitar win-rate excesivo.
- Grupos ≥ 11: distancia semántica alta para compensar la ventaja coordinativa del grupo grande.

### 2.3 Implementación

```javascript
function getRecommendedImpostors(numPlayers) {
  if (numPlayers <= 5)  return 1;
  if (numPlayers <= 7)  return 1;  // override manual: 1 o 2
  if (numPlayers <= 10) return 2;  // override manual: 2 o 3 si N ≥ 10
  return 3;                         // override manual: 2 o 3
}
```

---

## 3. Dificultad Adaptativa (v1: 2 palancas)

### 3.1 Sistema ELO invisible

El ELO nunca se muestra al jugador. Solo determina la selección de palabra y par semántico.

```
ELO_inicial = 1000   (rango: 700–1500)

Victoria como impostor:   ELO += 25
Derrota como impostor:    ELO -= 15  (asimétrico)
Voto correcto:            ELO += 10
Voto incorrecto:          ELO -= 5
```

**Bandas de dificultad:**

| Banda | ELO | Dificultad palabra | Distancia semántica |
|---|---|---|---|
| Novato | < 950 | 1 (fácil / frecuente) | 0.85 (muy similar) |
| Normal | 950–1100 | 2 | 0.75 |
| Veterano | 1100–1250 | 4 | 0.65 |
| Experto | > 1250 | 5 (difícil / rara) | 0.50 (vagamente similar) |

### 3.2 Palanca 1: Dificultad de la palabra (1–5)

Alineada con el campo `difficulty INTEGER` de la tabla `words` en la BD.

```
dificultad_objetivo = clamp(1 + floor((ELO - 950) / 100), 1, 5)

Ejemplos:
  ELO 1000 → dificultad 1 (Perro, Gato)
  ELO 1100 → dificultad 2 (Delfín, Águila)
  ELO 1250 → dificultad 4 (Ornitorrinco)
  ELO 1350 → dificultad 5 (Quetzal, Narval)
```

### 3.3 Palanca 2: Distancia semántica (solo Modo Misterioso)

```
similitud_objetivo = clamp(0.85 − (ELO − 950) × 0.001, 0.45, 0.90)

Ejemplos:
  ELO 1000 → similitud 0.80 (Guitarra / Ukulele) → fácil
  ELO 1150 → similitud 0.65 (Guitarra / Violín) → medio
  ELO 1300 → similitud 0.50 (Guitarra / Tambor) → difícil
```

### 3.4 Orden de turno

v1: **siempre aleatorio** (Fisher-Yates shuffle). La palanca de posición basada en ELO fue evaluada y descartada por su bajo impacto (+5 % / −3 %) y alta complejidad de integración.

> [!IMPORTANT]
> Todos los ajustes son imperceptibles. La app "elige la palabra de la ronda" — los jugadores asumen que es aleatorio. Si un jugador siente que el juego lo castiga por ganar, el sistema ha fallado.

---

## 4. Mecánica de Adivinanza Post-Eliminación

> Solo aplica a **Modo Impostor**. En Modo Misterioso no hay adivinanza.

### 4.1 Probabilidad base

```
P_adivinar = P_azar + 0.03 × n_pistas × d × (difficulty / 5)

P_azar = 1 / |categoría| ≈ 1–2 %
```

Con debate de 5 ciudadanos, d=0.6, palabra dificultad 3: `P ≈ 5.6 %`
Con debate de 5 ciudadanos, d=0.8, palabra dificultad 5: `P ≈ 14 %`

**Rango efectivo: 5 %–20 %** — significativo pero no dominante.

### 4.2 Sin pistas adicionales

| Opción | P_adivinar | Decisión |
|---|---|---|
| Sin pistas extra | 5–20 % | ✅ **Elegida** — el debate ya da información suficiente |
| Primera letra | 15–35 % | ❌ Demasiado fácil, frustra a ciudadanos |
| Nº de sílabas | 8–25 % | ❌ Rompe la tensión del momento |

### 4.3 Condiciones exactas

| Parámetro | Valor | Justificación |
|---|---|---|
| **Intentos** | 1 | Más trivializaría la mecánica |
| **Tiempo** | 30 s | Suficiente para pensar, no para aburrir al grupo |
| **Formato** | Texto libre (teclado) | Evita acertar por descarte |
| **Tolerancia** | Levenshtein ≤ 2 | Acepta typos sin ser permisivo |
| **Mayúsculas/acentos** | Insensible | Normalización automática |

### 4.4 Validación

```javascript
function validateGuess(guess, correctWord) {
  const a = normalize(guess);    // trim, lowercase, strip accents
  const b = normalize(correctWord);
  if (a === b) return { correct: true, distance: 0 };
  const d = levenshtein(a, b);
  return { correct: d <= 2, distance: d };
}
```

---

## 5. Sistema de Puntuación

### 5.1 Tabla de puntos

| Acción | Puntos |
|---|:-:|
| **Participar en la ronda** | +75 |
| **Impostor: Sobrevivir al debate** | +350 |
| **Impostor: Adivinar palabra post-eliminación** | +500 |
| **Impostor: No ser detectado (Misterioso)** | +400 |
| **Ciudadano: Voto correcto al impostor** | +200 |
| **Ciudadano: Victoria colectiva** | +100 |
| **Ciudadano: Voto incorrecto** | −25 |

**Bonus por logros:**

| Logro | Bonus | Frecuencia estimada |
|---|---|---|
| Adivinanza en < 10 s | +100 | ~3 % |
| 5 votos correctos consecutivos | +150 | ~8 % |
| Unanimidad contra impostor | +50 | ~10 % |
| Impostor gana en grupo ≥ 8 | +100 | ~15 % |

### 5.2 Justificación del diseño

- **Sin bonus de pista**: Eliminado por ser subjetivo y no automatizable. La participación subió de 50 → 75 para compensar.
- **Impostor vale más**: 350–500 pts en un bloque vs. múltiples acciones del ciudadano (máx ~375).
- **No hay estrategia dominante**: Quedarse callado = solo +75; votar al azar ≈ 33 pts/ronda; participar activamente ≈ 375 pts/ronda.

### 5.3 Simulación de 100 partidas (6 jugadores, d=0.6)

Cada jugador es impostor ~17 veces y ciudadano ~83 veces.

```
Puntos esperados por jugador ≈ 20,000–21,000

Coeficiente de variación: < 5 % en 500+ rondas
→ Distribución equitativa entre todos los jugadores.
```

Resultados detallados en `docs/simulation_results.txt` (ejecutar `scripts/simulate_balance_wscript.js`).

---

## 6. Fórmulas para Implementación

Todas las constantes viven en `src/balance/balance_config.js`. Los módulos consumen ese archivo — nunca se hardcodean valores en el front.

```javascript
// ─── RATIO ───
getRecommendedImpostors(N)  // → 1, 2 o 3

// ─── ELO ───
updateElo(profile, role, result)       // actualiza ELO tras ronda
getDifficultyBand(elo)                 // → { name, wordDiff, semDist }

// ─── SELECCIÓN DE PALABRA ───
getTargetWordDifficulty(elo)           // → 1–5, matches DB `difficulty`
getTargetSemanticDistance(elo)          // → 0.45–0.90
selectWord(wordPool, elo, recentlyUsed)
selectSemanticPair(word, pairs, elo)

// ─── TURNO ───
generateTurnOrder(playerIds)           // → shuffled array (v1: pure random)

// ─── ADIVINANZA ───
validateGuess(guess, correctWord)      // → { correct, distance }

// ─── PUNTUACIÓN ───
calculateRoundScore(roundResult)       // → ScoreBreakdown
calculateEquityMetrics(totals)         // → { mean, stdDev, cv }
```

### 6.1 Verificación con hoja de cálculo

| Celda | Fórmula |
|---|---|
| A: N | 3 a 12 |
| B: I | Según tabla §2.1 |
| C: C = A − B | =A−B |
| D: d | 0.6 |
| E: P_wrong | =(1−D)×(C/A) |
| F: P_guess | 0.15 (Impostor) o 0 (Misterioso) |
| **G: P_win** | =E + (1−E) × F |

Ejemplo N=6, I=1: `P_win = 0.333 + 0.667 × 0.15 = 0.433` ✅
