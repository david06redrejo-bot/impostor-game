/**
 * ═══════════════════════════════════════════════════════════════
 *  EL IMPOSTOR — Balance System Public API
 *  Barrel export for all balance modules.
 * ═══════════════════════════════════════════════════════════════
 */

// Configuration
export { BALANCE_CONFIG } from './balance_config.js';

// Impostor ratio calculation
export {
    getRecommendedImpostors,
    isValidManualOverride,
    getImpostorOptions,
    getCitizenCount,
    generateRatioTable,
} from './impostor_ratio.js';

// ELO adaptive difficulty
export {
    createEloProfile,
    updateElo,
    getDifficultyBand,
    getImpostorWinRate,
    getVoteAccuracy,
} from './elo_system.js';

// Word & semantic pair selection
export {
    getTargetWordFrequency,
    getTargetSemanticDistance,
    selectWord,
    selectSemanticPair,
} from './word_selector.js';

// Turn order
export {
    generateTurnOrder,
    estimatePositionImpact,
} from './turn_order.js';

// Post-elimination guess
export {
    normalizeString,
    levenshteinDistance,
    validateGuess,
    createGuessSession,
    processGuessAttempt,
    estimateGuessProbability,
} from './guess_validator.js';

// Scoring
export {
    calculateRoundScore,
    calculateAllScores,
    accumulateScores,
    calculateEquityMetrics,
} from './scoring.js';
