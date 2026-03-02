/**
 * ═══════════════════════════════════════════════════════════════
 *  EL IMPOSTOR — Impostor Ratio Calculator
 *  Determines optimal number of impostors per game configuration.
 * ═══════════════════════════════════════════════════════════════
 */

import { BALANCE_CONFIG } from './balance_config.js';

const { RATIO } = BALANCE_CONFIG;

/**
 * Calcula el número recomendado de impostores según el tamaño del grupo y modo.
 *
 * @param {number} numPlayers - Número total de jugadores (3–12)
 * @param {'impostor'|'mysterious'} mode - Modalidad de juego
 * @returns {number} Número recomendado de impostores
 * @throws {RangeError} Si numPlayers está fuera del rango válido
 */
export function getRecommendedImpostors(numPlayers, mode = 'impostor') {
    if (numPlayers < RATIO.MIN_PLAYERS || numPlayers > RATIO.MAX_PLAYERS) {
        throw new RangeError(
            `Número de jugadores (${numPlayers}) fuera de rango [${RATIO.MIN_PLAYERS}–${RATIO.MAX_PLAYERS}]`
        );
    }

    const table = mode === 'mysterious'
        ? RATIO.MYSTERIOUS_MODE
        : RATIO.IMPOSTOR_MODE;

    for (const tier of table) {
        if (numPlayers <= tier.maxPlayers) {
            return tier.impostors;
        }
    }

    // Fallback (shouldn't reach here with valid config)
    return table[table.length - 1].impostors;
}

/**
 * Valida si un override manual del número de impostores es permitido.
 *
 * @param {number} numPlayers - Número total de jugadores
 * @param {number} impostors  - Número de impostores deseado
 * @returns {boolean} true si el override es válido
 */
export function isValidManualOverride(numPlayers, impostors) {
    const allowed = RATIO.MANUAL_OVERRIDE[numPlayers];
    if (!allowed) {
        // No override allowed → only the default is valid
        return impostors === getRecommendedImpostors(numPlayers);
    }
    return allowed.includes(impostors);
}

/**
 * Devuelve todas las opciones válidas de impostores para un número de jugadores.
 *
 * @param {number} numPlayers - Número total de jugadores (3–12)
 * @returns {{ recommended: number, options: number[] }}
 */
export function getImpostorOptions(numPlayers) {
    const recommended = getRecommendedImpostors(numPlayers);
    const overrides = RATIO.MANUAL_OVERRIDE[numPlayers];

    return {
        recommended,
        options: overrides ? overrides : [recommended],
    };
}

/**
 * Calcula el número de ciudadanos.
 *
 * @param {number} numPlayers - Total de jugadores
 * @param {number} impostors  - Número de impostores
 * @returns {number}
 */
export function getCitizenCount(numPlayers, impostors) {
    return numPlayers - impostors;
}

/**
 * Genera la tabla completa de ratios para visualización/debug.
 *
 * @returns {Array<{players: number, mode: string, impostors: number, citizens: number, options: number[]}>}
 */
export function generateRatioTable() {
    const rows = [];
    for (let n = RATIO.MIN_PLAYERS; n <= RATIO.MAX_PLAYERS; n++) {
        for (const mode of ['impostor', 'mysterious']) {
            const rec = getRecommendedImpostors(n, mode);
            const opts = getImpostorOptions(n);
            rows.push({
                players: n,
                mode,
                impostors: rec,
                citizens: n - rec,
                options: opts.options,
            });
        }
    }
    return rows;
}
