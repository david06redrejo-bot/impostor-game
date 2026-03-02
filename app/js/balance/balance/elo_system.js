/**
 * ═══════════════════════════════════════════════════════════════
 *  EL IMPOSTOR — ELO Adaptive Difficulty System
 *  Invisible skill tracking that adjusts game difficulty.
 *  Players NEVER see their ELO — it only drives word difficulty
 *  selection and semantic distance (v1: 2 levers).
 * ═══════════════════════════════════════════════════════════════
 */

import { BALANCE_CONFIG } from './balance_config.js';

const { ELO } = BALANCE_CONFIG;

/**
 * Crea un nuevo perfil de ELO para un jugador.
 *
 * @param {string} playerId
 * @returns {EloProfile}
 */
export function createEloProfile(playerId) {
    return {
        playerId,
        elo: ELO.INITIAL,
        gamesPlayed: 0,
        impostorWins: 0,
        impostorLosses: 0,
        correctVotes: 0,
        wrongVotes: 0,
    };
}

/**
 * Actualiza el ELO de un jugador tras una partida.
 *
 * @param {EloProfile} profile   - Perfil del jugador
 * @param {'impostor'|'citizen'} role - Rol jugado en esta ronda
 * @param {object} result - Resultado de la ronda
 * @param {boolean} result.won       - ¿Ganó la ronda?
 * @param {boolean} [result.votedCorrectly] - Solo ciudadanos: ¿votó al impostor?
 * @returns {EloProfile} Perfil actualizado (nueva referencia)
 */
export function updateElo(profile, role, result) {
    let newElo = profile.elo;
    const updates = { gamesPlayed: profile.gamesPlayed + 1 };

    if (role === 'impostor') {
        if (result.won) {
            newElo += ELO.WIN_AS_IMPOSTOR;
            updates.impostorWins = profile.impostorWins + 1;
        } else {
            newElo += ELO.LOSS_AS_IMPOSTOR; // negative value
            updates.impostorLosses = profile.impostorLosses + 1;
        }
    } else {
        // Ciudadano
        if (result.votedCorrectly) {
            newElo += ELO.CORRECT_VOTE;
            updates.correctVotes = profile.correctVotes + 1;
        } else {
            newElo += ELO.WRONG_VOTE; // negative value
            updates.wrongVotes = profile.wrongVotes + 1;
        }
    }

    // Clamp ELO to valid range
    newElo = clamp(newElo, ELO.MIN, ELO.MAX);

    return { ...profile, ...updates, elo: newElo };
}

/**
 * Determina la banda de dificultad actual del jugador.
 *
 * @param {number} elo - ELO del jugador
 * @returns {{ name: string, wordDiff: number, semDist: number }}
 */
export function getDifficultyBand(elo) {
    for (const band of ELO.BANDS) {
        if (elo <= band.maxElo) {
            return { name: band.name, wordDiff: band.wordDiff, semDist: band.semDist };
        }
    }
    // Above all bands → highest difficulty
    const last = ELO.BANDS[ELO.BANDS.length - 1];
    return { name: last.name, wordDiff: last.wordDiff, semDist: last.semDist };
}

/**
 * Calcula el win-rate estimado de un jugador como impostor
 * basado en su historial.
 *
 * @param {EloProfile} profile
 * @returns {number|null} Win-rate (0–1) o null si no hay datos suficientes
 */
export function getImpostorWinRate(profile) {
    const total = profile.impostorWins + profile.impostorLosses;
    if (total < 3) return null; // not enough data
    return profile.impostorWins / total;
}

/**
 * Calcula la precisión de voto de un ciudadano.
 *
 * @param {EloProfile} profile
 * @returns {number|null} Accuracy (0–1) o null si no hay datos suficientes
 */
export function getVoteAccuracy(profile) {
    const total = profile.correctVotes + profile.wrongVotes;
    if (total < 3) return null;
    return profile.correctVotes / total;
}

// ─── Utilidades ──────────────────────────────────────────────

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * @typedef {object} EloProfile
 * @property {string} playerId
 * @property {number} elo
 * @property {number} gamesPlayed
 * @property {number} impostorWins
 * @property {number} impostorLosses
 * @property {number} correctVotes
 * @property {number} wrongVotes
 */
