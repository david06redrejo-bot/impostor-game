/**
 * ═══════════════════════════════════════════════════════════════
 *  EL IMPOSTOR — Turn Order Assignment
 *  v1: Pure random shuffle (Fisher-Yates). No ELO-based placement.
 *
 *  The ELO-based turn order lever was removed for v1:
 *  - Measured impact was minimal (+5% / -3% win-rate).
 *  - Added significant integration complexity.
 *  - Not worth the risk of players perceiving unfairness.
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Genera el orden de turno para la ronda de pistas.
 * Aplica un shuffle aleatorio puro (Fisher-Yates) a todos los jugadores.
 *
 * @param {string[]} playerIds - IDs de todos los jugadores
 * @returns {string[]} Lista de IDs en orden de turno aleatorio
 */
export function generateTurnOrder(playerIds) {
    const shuffled = [...playerIds];
    shuffleArray(shuffled);
    return shuffled;
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
