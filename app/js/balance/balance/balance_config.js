/**
 * ═══════════════════════════════════════════════════════════════
 *  EL IMPOSTOR — Game Balance Configuration
 *  All tuning constants in one place. No magic numbers elsewhere.
 * ═══════════════════════════════════════════════════════════════
 */

export const BALANCE_CONFIG = Object.freeze({

  // ─── Ratio de impostores ───────────────────────────────────
  RATIO: {
    // Modo Impostor — umbrales de jugadores para subir el nº de impostores
    IMPOSTOR_MODE: [
      { maxPlayers: 5, impostors: 1 },
      { maxPlayers: 7, impostors: 1 },  // host puede override a 2
      { maxPlayers: 10, impostors: 2 },  // host puede override a 3 si N ≥ 10
      { maxPlayers: 12, impostors: 3 },
    ],
    // Modo Misterioso — misma tabla (ajuste vía distancia semántica)
    MYSTERIOUS_MODE: [
      { maxPlayers: 5, impostors: 1 },
      { maxPlayers: 7, impostors: 1 },  // + distancia semántica ≥ 0.70
      { maxPlayers: 10, impostors: 2 },
      { maxPlayers: 12, impostors: 3 },
    ],
    // Rangos de override manual permitidos
    MANUAL_OVERRIDE: {
      6: [1, 2],
      7: [1, 2],
      8: [1, 2],
      10: [2, 3],
      11: [2, 3],
      12: [2, 3],
    },
    MIN_PLAYERS: 3,
    MAX_PLAYERS: 12,
  },

  // ─── Sistema ELO adaptativo ────────────────────────────────
  ELO: {
    INITIAL: 1000,
    MIN: 700,
    MAX: 1500,

    // Cambios de ELO por resultado
    WIN_AS_IMPOSTOR: +25,
    LOSS_AS_IMPOSTOR: -15,
    CORRECT_VOTE: +10,
    WRONG_VOTE: -5,

    // Bandas de dificultad
    BANDS: [
      { name: 'novato', maxElo: 949, wordDiff: 1, semDist: 0.85 },
      { name: 'normal', maxElo: 1100, wordDiff: 2, semDist: 0.75 },
      { name: 'veterano', maxElo: 1250, wordDiff: 4, semDist: 0.65 },
      { name: 'experto', maxElo: 1500, wordDiff: 5, semDist: 0.50 },
    ],
  },

  // ─── Selección de palabra ──────────────────────────────────
  WORD_SELECTION: {
    // dificultad_objetivo = clamp(1 + floor((elo - 950) / 100), 1, 5)
    // Alineado con campo `difficulty` (1–5) de la tabla `words` en SQLite.
    DIFF_ELO_OFFSET: 950,
    DIFF_ELO_DIVISOR: 100,
    DIFF_MIN: 1,
    DIFF_MAX: 5,

    // distancia semántica objetivo (solo Modo Misterioso)
    SEM_DIST_BASE: 0.85,
    SEM_DIST_ELO_FACTOR: 0.001,
    SEM_DIST_ELO_OFFSET: 950,
    SEM_DIST_MIN: 0.45,
    SEM_DIST_MAX: 0.90,
  },

  // ─── Orden de turno ────────────────────────────────────────
  // v1: orden siempre aleatorio (Fisher-Yates). Sin palanca ELO.
  // La palanca de turno fue eliminada por su bajo impacto (+5%/−3%)
  // y alta complejidad de integración.

  // ─── Mecánica de adivinanza ────────────────────────────────
  GUESS: {
    TIME_SECONDS: 30,
    MAX_ATTEMPTS: 1,
    LEVENSHTEIN_TOLERANCE: 2,
    CASE_INSENSITIVE: true,
    ACCENT_INSENSITIVE: true,
  },

  // ─── Sistema de puntuación ─────────────────────────────────
  SCORING: {
    PARTICIPATION: 75,   // subido de 50 → 75 al eliminar bonus de pista
    IMPOSTOR_SURVIVE: 350,
    IMPOSTOR_GUESS_WORD: 500,
    IMPOSTOR_MYSTERIOUS_WIN: 400,
    CITIZEN_CORRECT_VOTE: 200,
    CITIZEN_COLLECTIVE_WIN: 100,
    CITIZEN_WRONG_VOTE: -25,

    // Bonus por desempeño notable
    BONUS: {
      PERFECT_GUESS: 100,   // adivinar en < 10 s
      PERFECT_GUESS_TIME: 10,   // umbral en segundos
      DETECTIVE_STREAK: 150,   // 5 votos correctos consecutivos
      DETECTIVE_STREAK_LEN: 5,
      UNANIMITY: 50,   // todos votan al impostor
      LONE_WOLF: 100,   // impostor gana en grupo ≥ 8
      LONE_WOLF_MIN_PLAYERS: 8,
    },
  },

  // ─── Modelo probabilístico (para simulación) ──────────────
  MODEL: {
    ALPHA_IMPOSTOR: 1.00,    // factor de información Modo Impostor
    ALPHA_MYSTERIOUS: 0.65,    // factor de información Modo Misterioso
    WIN_RATE_TARGET_MIN: 0.35,
    WIN_RATE_TARGET_MAX: 0.45,
    DEFAULT_SKILL: 0.6,       // habilidad de deducción media
    BASE_GUESS_PROB: 0.15,    // P_adivinar base usada en el modelo
  },
});
