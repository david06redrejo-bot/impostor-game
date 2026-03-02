/**
 * ═══════════════════════════════════════════════════════════════
 *  EL IMPOSTOR — Post-Elimination Guess Validator
 *  Validates the impostor's guess after being eliminated
 *  (Modo Impostor only — not available in Modo Misterioso).
 * ═══════════════════════════════════════════════════════════════
 */

import { BALANCE_CONFIG } from './balance_config.js';

const { GUESS } = BALANCE_CONFIG;

/**
 * Normaliza un string para comparación: minúsculas, sin acentos, trim.
 *
 * @param {string} str
 * @returns {string}
 */
export function normalizeString(str) {
    return str
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // eliminar diacríticos
}

/**
 * Calcula la distancia de Levenshtein entre dos strings.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function levenshteinDistance(a, b) {
    const m = a.length;
    const n = b.length;

    // Optimización: si uno es vacío, la distancia es la longitud del otro
    if (m === 0) return n;
    if (n === 0) return m;

    // Usamos solo 2 filas (optimización de memoria)
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    let curr = new Array(n + 1);

    for (let i = 1; i <= m; i++) {
        curr[0] = i;
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            curr[j] = Math.min(
                prev[j] + 1,      // deletion
                curr[j - 1] + 1,  // insertion
                prev[j - 1] + cost // substitution
            );
        }
        [prev, curr] = [curr, prev];
    }

    return prev[n];
}

/**
 * Verifica si la adivinanza del impostor es correcta.
 * Acepta errores ortográficos dentro de la tolerancia Levenshtein.
 *
 * @param {string} guess       - Lo que escribió el impostor
 * @param {string} correctWord - La palabra correcta de la ronda
 * @returns {{ correct: boolean, exactMatch: boolean, distance: number }}
 */
export function validateGuess(guess, correctWord) {
    const normalizedGuess = normalizeString(guess);
    const normalizedCorrect = normalizeString(correctWord);

    if (normalizedGuess === normalizedCorrect) {
        return { correct: true, exactMatch: true, distance: 0 };
    }

    const distance = levenshteinDistance(normalizedGuess, normalizedCorrect);
    const withinTolerance = distance <= GUESS.LEVENSHTEIN_TOLERANCE;

    return {
        correct: withinTolerance,
        exactMatch: false,
        distance,
    };
}

/**
 * Crea el estado de una sesión de adivinanza.
 *
 * @returns {GuessSession}
 */
export function createGuessSession() {
    return {
        maxAttempts: GUESS.MAX_ATTEMPTS,
        attemptsUsed: 0,
        timeLimit: GUESS.TIME_SECONDS,
        startedAt: null,
        result: null, // 'correct' | 'incorrect' | 'timeout'
    };
}

/**
 * Procesa un intento de adivinanza dentro de una sesión.
 *
 * @param {GuessSession} session - Sesión actual
 * @param {string} guess         - Intento del impostor
 * @param {string} correctWord   - Palabra correcta
 * @param {number} elapsedSeconds - Segundos transcurridos
 * @returns {{ session: GuessSession, validation: object, bonusPoints: number }}
 */
export function processGuessAttempt(session, guess, correctWord, elapsedSeconds) {
    // Check timeout
    if (elapsedSeconds > session.timeLimit) {
        return {
            session: { ...session, result: 'timeout' },
            validation: { correct: false, exactMatch: false, distance: -1 },
            bonusPoints: 0,
        };
    }

    // Check attempts
    if (session.attemptsUsed >= session.maxAttempts) {
        return {
            session: { ...session, result: 'incorrect' },
            validation: { correct: false, exactMatch: false, distance: -1 },
            bonusPoints: 0,
        };
    }

    const validation = validateGuess(guess, correctWord);
    const updatedSession = {
        ...session,
        attemptsUsed: session.attemptsUsed + 1,
        result: validation.correct ? 'correct' : 'incorrect',
    };

    // Bonus por adivinanza muy rápida (< 10s)
    const { BONUS } = BALANCE_CONFIG.SCORING;
    const bonusPoints = (validation.correct && elapsedSeconds < BONUS.PERFECT_GUESS_TIME)
        ? BONUS.PERFECT_GUESS
        : 0;

    return { session: updatedSession, validation, bonusPoints };
}

/**
 * Calcula la probabilidad teórica de adivinar la palabra
 * dado el contexto de la partida (para telemetría/análisis).
 *
 * @param {number} numClues      - Número de pistas escuchadas
 * @param {number} skill         - Habilidad del impostor (0.5–1.0)
 * @param {number} wordFrequency - Frecuencia de la palabra (1–5)
 * @param {number} categorySize  - Tamaño de la categoría
 * @returns {number} Probabilidad estimada (0–1)
 */
export function estimateGuessProbability(numClues, skill, wordFrequency, categorySize) {
    const pAzar = 1 / categorySize;
    const beta = 0.03;
    const freqFactor = wordFrequency / 5;
    return Math.min(1, pAzar + beta * numClues * skill * freqFactor);
}

/**
 * @typedef {object} GuessSession
 * @property {number} maxAttempts
 * @property {number} attemptsUsed
 * @property {number} timeLimit
 * @property {number|null} startedAt
 * @property {'correct'|'incorrect'|'timeout'|null} result
 */
