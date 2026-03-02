/**
 * ═══════════════════════════════════════════════════════════════
 *  EL IMPOSTOR — Scoring Engine
 *  Calculates points for each player after a round, including
 *  base scoring, role-specific bonuses, and achievement bonuses.
 * ═══════════════════════════════════════════════════════════════
 */

import { BALANCE_CONFIG } from './balance_config.js';

const { SCORING } = BALANCE_CONFIG;

/**
 * Calcula los puntos de un jugador tras una ronda.
 *
 * @param {RoundResult} roundResult - Resultado de la ronda para este jugador
 * @returns {ScoreBreakdown}
 */
export function calculateRoundScore(roundResult) {
    const breakdown = {
        participation: SCORING.PARTICIPATION,
        roleBonus: 0,
        voteBonus: 0,
        achievementBonus: 0,
        penalties: 0,
        total: 0,
        details: [],
    };

    if (roundResult.role === 'impostor') {
        breakdown.details.push('Rol: Impostor');

        if (roundResult.outcome === 'survived') {
            // Impostor sobrevivió al debate → ganó
            const points = roundResult.mode === 'mysterious'
                ? SCORING.IMPOSTOR_MYSTERIOUS_WIN
                : SCORING.IMPOSTOR_SURVIVE;
            breakdown.roleBonus = points;
            breakdown.details.push(`Victoria como impostor: +${points}`);

        } else if (roundResult.outcome === 'guessed_word') {
            // Impostor eliminado pero adivinó la palabra
            breakdown.roleBonus = SCORING.IMPOSTOR_GUESS_WORD;
            breakdown.details.push(`Adivinó la palabra: +${SCORING.IMPOSTOR_GUESS_WORD}`);

        } else if (roundResult.outcome === 'citizen_eliminated') {
            // Un ciudadano fue eliminado en su lugar
            const points = roundResult.mode === 'mysterious'
                ? SCORING.IMPOSTOR_MYSTERIOUS_WIN
                : SCORING.IMPOSTOR_SURVIVE;
            breakdown.roleBonus = points;
            breakdown.details.push(`Ciudadano eliminado: +${points}`);
        }
        // outcome === 'eliminated' → no role bonus

    } else {
        // Ciudadano
        breakdown.details.push('Rol: Ciudadano');

        if (roundResult.won) {
            breakdown.roleBonus = SCORING.CITIZEN_COLLECTIVE_WIN;
            breakdown.details.push(`Victoria colectiva: +${SCORING.CITIZEN_COLLECTIVE_WIN}`);
        }

        if (roundResult.votedCorrectly) {
            breakdown.voteBonus = SCORING.CITIZEN_CORRECT_VOTE;
            breakdown.details.push(`Voto correcto: +${SCORING.CITIZEN_CORRECT_VOTE}`);
        } else if (roundResult.voted) {
            breakdown.penalties = SCORING.CITIZEN_WRONG_VOTE; // negative value
            breakdown.details.push(`Voto incorrecto: ${SCORING.CITIZEN_WRONG_VOTE}`);
        }

    }

    // Achievement bonuses
    if (roundResult.achievements) {
        breakdown.achievementBonus = calculateAchievementBonus(roundResult.achievements);
        if (breakdown.achievementBonus > 0) {
            breakdown.details.push(`Logros: +${breakdown.achievementBonus}`);
        }
    }

    breakdown.total =
        breakdown.participation +
        breakdown.roleBonus +
        breakdown.voteBonus +
        breakdown.achievementBonus +
        breakdown.penalties;

    return breakdown;
}

/**
 * Calcula bonus por logros especiales.
 *
 * @param {Achievements} achievements
 * @returns {number}
 */
function calculateAchievementBonus(achievements) {
    const { BONUS } = SCORING;
    let total = 0;

    if (achievements.perfectGuess) {
        total += BONUS.PERFECT_GUESS;
    }
    if (achievements.detectiveStreak) {
        total += BONUS.DETECTIVE_STREAK;
    }
    if (achievements.unanimity) {
        total += BONUS.UNANIMITY;
    }
    if (achievements.loneWolf) {
        total += BONUS.LONE_WOLF;
    }

    return total;
}

/**
 * Calcula las puntuaciones de todos los jugadores de una ronda.
 *
 * @param {RoundResult[]} allResults - Resultados de todos los jugadores
 * @returns {Map<string, ScoreBreakdown>} Mapa playerId → breakdown
 */
export function calculateAllScores(allResults) {
    const scores = new Map();
    for (const result of allResults) {
        scores.set(result.playerId, calculateRoundScore(result));
    }
    return scores;
}

/**
 * Acumula puntos a lo largo de múltiples rondas.
 *
 * @param {Map<string, number>} totals     - Totales acumulados previos
 * @param {Map<string, ScoreBreakdown>} roundScores - Puntos de esta ronda
 * @returns {Map<string, number>} Totales actualizados
 */
export function accumulateScores(totals, roundScores) {
    const updated = new Map(totals);
    for (const [playerId, breakdown] of roundScores) {
        const prev = updated.get(playerId) || 0;
        updated.set(playerId, prev + breakdown.total);
    }
    return updated;
}

/**
 * Calcula el coeficiente de variación de las puntuaciones
 * (para verificar equidad del sistema).
 *
 * @param {Map<string, number>} totals - Totales acumulados
 * @returns {{ mean: number, stdDev: number, cv: number }}
 */
export function calculateEquityMetrics(totals) {
    const values = Array.from(totals.values());
    const n = values.length;
    if (n === 0) return { mean: 0, stdDev: 0, cv: 0 };

    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? (stdDev / mean) * 100 : 0;

    return { mean: Math.round(mean), stdDev: Math.round(stdDev), cv: parseFloat(cv.toFixed(2)) };
}

/**
 * @typedef {object} RoundResult
 * @property {string}  playerId
 * @property {'impostor'|'citizen'} role
 * @property {'impostor'|'mysterious'} mode
 * @property {'survived'|'eliminated'|'guessed_word'|'citizen_eliminated'} outcome
 * @property {boolean} won
 * @property {boolean} [voted]
 * @property {boolean} [votedCorrectly]
 * @property {Achievements} [achievements]
 */

/**
 * @typedef {object} ScoreBreakdown
 * @property {number}   participation
 * @property {number}   roleBonus
 * @property {number}   voteBonus
 * @property {number}   achievementBonus
 * @property {number}   penalties
 * @property {number}   total
 * @property {string[]} details
 */

/**
 * @typedef {object} Achievements
 * @property {boolean} [perfectGuess]
 * @property {boolean} [detectiveStreak]
 * @property {boolean} [unanimity]
 * @property {boolean} [loneWolf]
 */
