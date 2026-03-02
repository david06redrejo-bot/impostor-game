/**
 * ═══════════════════════════════════════════════════════════════
 *  EL IMPOSTOR — Difficulty-Aware Word Selector
 *  Selects words and semantic pairs adapted to the impostor's
 *  ELO band, ensuring invisible difficulty scaling.
 *
 *  v1 Adaptive levers (2 of 2):
 *    1. Word difficulty (1–5) — aligned with `words.difficulty` in DB
 *    2. Semantic distance  — only in Modo Misterioso
 * ═══════════════════════════════════════════════════════════════
 */

import { BALANCE_CONFIG } from './balance_config.js';

const { WORD_SELECTION } = BALANCE_CONFIG;

/**
 * Calcula la dificultad objetivo de palabra para un ELO dado.
 * Más ELO → dificultad más alta (palabras más raras/nicho).
 * Alineado con el campo `difficulty INTEGER` (1–5) de la tabla `words`.
 *
 * @param {number} elo - ELO del impostor
 * @returns {number} Dificultad objetivo (1=fácil/frecuente, 5=difícil/rara)
 */
export function getTargetWordDifficulty(elo) {
    const raw = 1 + Math.floor(
        (elo - WORD_SELECTION.DIFF_ELO_OFFSET) / WORD_SELECTION.DIFF_ELO_DIVISOR
    );
    return clamp(raw, WORD_SELECTION.DIFF_MIN, WORD_SELECTION.DIFF_MAX);
}

/**
 * Calcula la distancia semántica objetivo para Modo Misterioso.
 * Más ELO → menor similitud → más difícil camuflarse como impostor.
 *
 * @param {number} elo - ELO del impostor
 * @returns {number} Similitud semántica objetivo (0.45–0.90)
 */
export function getTargetSemanticDistance(elo) {
    const raw = WORD_SELECTION.SEM_DIST_BASE -
        (elo - WORD_SELECTION.SEM_DIST_ELO_OFFSET) * WORD_SELECTION.SEM_DIST_ELO_FACTOR;
    return clamp(raw, WORD_SELECTION.SEM_DIST_MIN, WORD_SELECTION.SEM_DIST_MAX);
}

/**
 * Selecciona la mejor palabra de un catálogo dado el ELO del impostor.
 *
 * @param {Word[]} wordPool     - Pool de palabras de la categoría elegida
 * @param {number} impostorElo  - ELO del impostor actual
 * @param {Set<string>} recentlyUsed - IDs de palabras usadas recientemente (cooldown)
 * @returns {Word|null} Palabra seleccionada, o null si no hay candidatas
 */
export function selectWord(wordPool, impostorElo, recentlyUsed = new Set()) {
    const targetDiff = getTargetWordDifficulty(impostorElo);

    // Filtrar palabras en cooldown
    const available = wordPool.filter(w => !recentlyUsed.has(w.id));
    if (available.length === 0) return null;

    // Ordenar por cercanía a la dificultad objetivo
    const scored = available.map(w => ({
        word: w,
        diffDelta: Math.abs(w.difficulty - targetDiff),
    }));
    scored.sort((a, b) => a.diffDelta - b.diffDelta);

    // Seleccionar entre las top 5 candidatas (con algo de aleatoriedad)
    const topCandidates = scored.slice(0, Math.min(5, scored.length));
    const idx = Math.floor(Math.random() * topCandidates.length);
    return topCandidates[idx].word;
}

/**
 * Selecciona el par semántico óptimo para Modo Misterioso.
 *
 * @param {Word} citizenWord       - Palabra de los ciudadanos
 * @param {SemanticPair[]} pairs   - Pares semánticos disponibles para esa palabra
 * @param {number} impostorElo     - ELO del impostor
 * @returns {SemanticPair|null} Par seleccionado
 */
export function selectSemanticPair(citizenWord, pairs, impostorElo) {
    if (!pairs || pairs.length === 0) return null;

    const targetDist = getTargetSemanticDistance(impostorElo);

    // Ordenar pares por cercanía a la similitud objetivo
    const scored = pairs.map(p => ({
        pair: p,
        distDiff: Math.abs(p.similarity - targetDist),
    }));
    scored.sort((a, b) => a.distDiff - b.distDiff);

    // Top 3 con aleatoriedad
    const topCandidates = scored.slice(0, Math.min(3, scored.length));
    const idx = Math.floor(Math.random() * topCandidates.length);
    return topCandidates[idx].pair;
}

// ─── Utilidades ──────────────────────────────────────────────

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * @typedef {object} Word
 * @property {string} id         - word_id from DB
 * @property {string} text       - word text
 * @property {string} category   - category name or id
 * @property {number} difficulty - 1 (fácil/frecuente) a 5 (difícil/rara), matches DB field
 */

/**
 * @typedef {object} SemanticPair
 * @property {string} impostorWord - Palabra que verá el impostor
 * @property {number} similarity   - Similitud semántica (0–1)
 */
