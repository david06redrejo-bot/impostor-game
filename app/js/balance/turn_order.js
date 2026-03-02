/**
 * ═══════════════════════════════════════════════════════════════
 *  EL IMPOSTOR — Turn Order Assignment
 *  Places the impostor earlier or later in the clue round
 *  based on their ELO, as an invisible difficulty lever.
 * ═══════════════════════════════════════════════════════════════
 */

import { BALANCE_CONFIG } from './balance_config.js';

const { TURN_ORDER } = BALANCE_CONFIG;

/**
 * Genera el orden de turno para la ronda de pistas.
 *
 * @param {string[]} playerIds   - IDs de todos los jugadores
 * @param {string}   impostorId  - ID del impostor
 * @param {number}   impostorElo - ELO del impostor (ignorado, orden siempre aleatorio)
 * @returns {string[]} Lista de IDs en orden de turno
 */
export function generateTurnOrder(playerIds, impostorId, impostorElo) {
    const others = [...playerIds];

    // Barajar a todos los jugadores de forma aleatoria
    shuffleArray(others);
    return others;
}

// ─── Utilidades ──────────────────────────────────────────────

/**
 * Fisher-Yates shuffle in-place.
 * @param {any[]} arr
 */
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
