/* ============================================================
   EL IMPOSTOR — Game State Engine (ES Module)
   ============================================================
   Consumes src/balance/ modules for all game logic.
   No duplicated balance logic — single source of truth.
   ============================================================ */

import { getRecommendedImpostors, getImpostorOptions } from './balance/impostor_ratio.js';
import { createEloProfile, updateElo, getDifficultyBand } from './balance/elo_system.js';
import { selectWord, selectSemanticPair } from './balance/word_selector.js';
import { validateGuess, createGuessSession, processGuessAttempt } from './balance/guess_validator.js';
import { generateTurnOrder } from './balance/turn_order.js';
import { calculateRoundScore } from './balance/scoring.js';
import { BALANCE_CONFIG } from './balance/balance_config.js';
import { getWordPool, getCategories } from './words.js';
import { SoundSystem } from './sounds.js';

const SETTINGS_KEY = 'impostor_settings';
const STATS_KEY = 'impostor_stats';
const ELO_KEY = 'impostor_elo_profiles';

const DEFAULT_SETTINGS = {
    soundEnabled: true,
    vibrationEnabled: true,
    colorblindMode: false,
    highContrast: false,
    reducedMotion: false,
    fontScale: 1,
};

let settings = { ...DEFAULT_SETTINGS };

// --- Game State ---
let state = {
    phase: 'menu',
    mode: 'impostor', // impostor | misterioso
    numPlayers: 4,
    numImpostors: 1,
    categoryId: 'animals',
    debateTimeSeconds: 180,
    numClueRounds: 1,
    guessTimeSeconds: BALANCE_CONFIG.GUESS.TIME_SECONDS,
    numRounds: 3,
    currentRound: 1,
    players: [],
    dealingIndex: 0,
    dealingState: 'cortina',
    revealRetries: 0,
    viewAgainCount: 0,
    currentWord: null,
    currentWordEntry: null,
    impostorWord: null,
    clueOrder: [],
    currentClueIndex: 0,
    timerRunning: false,
    timerRemaining: 0,
    votingOrder: [],
    votingIndex: 0,
    votingState: 'announce',
    selectedVote: null,
    votes: {},
    eliminatedPlayer: null,
    guessText: '',
    guessSession: null,
    guessStartTime: null,
    usedWordIds: new Set(),
    roundScores: [],
    cumulativeScores: {},
    _tiedIndices: null,
};

// --- Recommended debate time ---
function getRecommendedDebateTime(numPlayers) {
    if (numPlayers <= 5) return 180;
    if (numPlayers <= 8) return 300;
    return 480;
}

// --- Fisher-Yates shuffle ---
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// === ELO Profile Management (localStorage) ===
function loadEloProfiles() {
    try {
        const raw = localStorage.getItem(ELO_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
}

function saveEloProfiles(profiles) {
    try { localStorage.setItem(ELO_KEY, JSON.stringify(profiles)); } catch (e) { }
}

function getOrCreateEloProfile(playerName) {
    const profiles = loadEloProfiles();
    if (!profiles[playerName]) {
        profiles[playerName] = createEloProfile(playerName);
        saveEloProfiles(profiles);
    }
    return profiles[playerName];
}

function getPlayerElo(playerName) {
    return getOrCreateEloProfile(playerName).elo;
}

function updateEloAfterRound(players, result) {
    const profiles = loadEloProfiles();
    players.forEach(p => {
        const profile = profiles[p.name] || createEloProfile(p.name);
        const votedCorrectly = p.votedFor !== null && players[p.votedFor]?.role === 'impostor';
        const won = (p.role === 'impostor')
            ? (result === 'impostor_win_not_found' || result === 'impostor_win_steal' || result === 'impostor_survive')
            : (result === 'citizen_win');
        profiles[p.name] = updateElo(profile, p.role, { won, votedCorrectly });
    });
    saveEloProfiles(profiles);
}

// === Game Lifecycle ===
function initGame() {
    const players = state.players.map((p, i) => ({
        name: p.name || `Jugador ${i + 1}`,
        role: 'citizen',
        word: '',
        score: 0,
        eliminated: false,
        votedFor: null,
    }));
    state.players = players;
    state.currentRound = 1;
    state.usedWordIds = new Set();
    state.cumulativeScores = {};
    players.forEach((_, i) => { state.cumulativeScores[i] = 0; });
}

function setupRound() {
    const numPlayers = state.players.length;
    const numImpostors = state.numImpostors;
    const modeKey = state.mode === 'misterioso' ? 'mysterious' : 'impostor';

    // Determine impostor(s)
    const indices = Array.from({ length: numPlayers }, (_, i) => i);
    shuffleArray(indices);
    const impostorIndices = new Set(indices.slice(0, numImpostors));

    // Get the impostor's ELO for word selection
    const firstImpostorIdx = indices[0];
    const impostorName = state.players[firstImpostorIdx].name;
    const impostorElo = getPlayerElo(impostorName);

    // Select word using balance module (ELO-aware)
    const wordPool = getWordPool(state.categoryId);
    const selectedWordEntry = selectWord(wordPool, impostorElo, state.usedWordIds);

    if (!selectedWordEntry) {
        // Fallback: reset cooldown and retry
        state.usedWordIds.clear();
        const fallback = selectWord(wordPool, impostorElo, state.usedWordIds);
        if (!fallback) return;
        state.currentWordEntry = fallback;
    } else {
        state.currentWordEntry = selectedWordEntry;
    }

    state.currentWord = state.currentWordEntry.text;
    state.usedWordIds.add(state.currentWordEntry.id);

    // Select semantic pair for Misterioso mode (ELO-aware)
    if (state.mode === 'misterioso' && state.currentWordEntry.pairs.length > 0) {
        // Convert pairs to format expected by selectSemanticPair
        const pairsForSelector = state.currentWordEntry.pairs.map(p => ({
            impostorWord: p.word,
            similarity: p.similarity,
        }));
        const selectedPair = selectSemanticPair(state.currentWordEntry, pairsForSelector, impostorElo);
        state.impostorWord = selectedPair ? selectedPair.impostorWord : state.currentWordEntry.pairs[0].word;
    } else {
        state.impostorWord = null;
    }

    // Assign roles
    state.players.forEach((p, i) => {
        p.role = impostorIndices.has(i) ? 'impostor' : 'citizen';
        if (p.role === 'citizen') {
            p.word = state.currentWord;
        } else {
            p.word = state.mode === 'misterioso' ? state.impostorWord : '';
        }
        p.eliminated = false;
        p.votedFor = null;
    });

    // Generate turn order using balance module (ELO-aware positioning)
    const playerIds = state.players.map((_, i) => String(i));
    const impostorId = String(firstImpostorIdx);
    const turnOrderIds = generateTurnOrder(playerIds, impostorId, impostorElo);
    state.clueOrder = turnOrderIds.map(Number);

    // Reset dealing
    state.dealingIndex = 0;
    state.dealingState = 'cortina';
    state.revealRetries = 0;
    state.viewAgainCount = 0;

    // Reset voting
    state.votes = {};
    state.votingIndex = 0;
    state.votingState = 'announce';
    state.selectedVote = null;
    state._tiedIndices = null;

    // Timer
    state.timerRemaining = state.debateTimeSeconds;
    state.timerRunning = false;
    state.currentClueIndex = 0;

    // Resolution
    state.eliminatedPlayer = null;
    state.guessText = '';
    state.guessSession = null;
    state.guessStartTime = null;
    state.roundScores = [];
}

// === Voting ===
function setupVoting() {
    const activePlayers = state.players
        .map((p, i) => ({ index: i, player: p }))
        .filter(x => !x.player.eliminated);
    const order = activePlayers.map(x => x.index);
    shuffleArray(order); // Voting order is always random (not ELO-influenced)
    state.votingOrder = order;
    state.votingIndex = 0;
    state.votes = {};
    state.selectedVote = null;
    state.votingState = 'announce';
}

function registerVote(voterIndex, votedForIndex) {
    state.votes[voterIndex] = votedForIndex;
}

function tallyVotes() {
    const tally = {};
    Object.values(state.votes).forEach(idx => { tally[idx] = (tally[idx] || 0) + 1; });
    const maxVotes = Math.max(...Object.values(tally));
    const topVoted = Object.keys(tally).filter(idx => tally[idx] === maxVotes).map(Number);
    return { tally, maxVotes, topVoted, isTie: topVoted.length > 1 };
}

// === Resolution ===
function resolveElimination(eliminatedIndex) {
    state.eliminatedPlayer = eliminatedIndex;
    state.players[eliminatedIndex].eliminated = true;
}

function checkGuessResult(guess) {
    return validateGuess(guess, state.currentWord);
}

function calculateRoundScores(result) {
    const modeKey = state.mode === 'misterioso' ? 'mysterious' : 'impostor';
    const allVotes = state.votes;
    const impostorIndices = state.players
        .map((p, i) => ({ p, i }))
        .filter(x => x.p.role === 'impostor')
        .map(x => x.i);

    // Check if all votes targeted an impostor (unanimity)
    const allCorrect = Object.values(allVotes).every(v => impostorIndices.includes(v));

    const scores = state.players.map((player, i) => {
        const votedCorrectly = player.votedFor !== null && state.players[player.votedFor]?.role === 'impostor';
        const won = (player.role === 'impostor')
            ? (result !== 'citizen_win')
            : (result === 'citizen_win');

        let outcome;
        if (player.role === 'impostor') {
            if (result === 'citizen_win') outcome = 'eliminated';
            else if (result === 'impostor_win_steal') outcome = 'guessed_word';
            else if (result === 'impostor_win_not_found') outcome = 'citizen_eliminated';
            else outcome = 'survived';
        } else {
            outcome = result === 'citizen_win' ? 'survived' : 'eliminated';
        }

        const roundResult = {
            playerId: String(i),
            role: player.role,
            mode: modeKey,
            outcome,
            won,
            voted: player.votedFor !== null,
            votedCorrectly,
            gaveGoodClue: false, // Not tracked in current UI
            achievements: {
                unanimity: player.role === 'citizen' && allCorrect && result === 'citizen_win',
                loneWolf: player.role === 'impostor' && won && state.players.length >= BALANCE_CONFIG.SCORING.BONUS.LONE_WOLF_MIN_PLAYERS,
            },
        };

        const breakdown = calculateRoundScore(roundResult);
        state.cumulativeScores[i] = (state.cumulativeScores[i] || 0) + breakdown.total;

        return {
            playerIndex: i,
            name: player.name,
            points: breakdown.total,
            detail: breakdown.details.join(' · '),
            role: player.role,
            breakdown,
        };
    });

    // Update ELO after scoring
    updateEloAfterRound(state.players, result);

    state.roundScores = scores;
    return scores;
}

function getFinalRankings() {
    return state.players
        .map((p, i) => ({ index: i, name: p.name, score: state.cumulativeScores[i] || 0 }))
        .sort((a, b) => b.score - a.score);
}

// === Settings Persistence ===
function loadSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) { }
    applySettings();
}

function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { }
    applySettings();
}

function applySettings() {
    document.documentElement.style.setProperty('--font-scale', settings.fontScale);
    document.body.classList.toggle('colorblind-mode', settings.colorblindMode);
    document.body.classList.toggle('high-contrast', settings.highContrast);
    document.body.classList.toggle('reduce-motion', settings.reducedMotion);
    SoundSystem.setSoundEnabled(settings.soundEnabled);
    SoundSystem.setVibrationEnabled(settings.vibrationEnabled);
}

// === Stats Persistence (aligned with Data Architect schema) ===
function loadStats() {
    try {
        const saved = localStorage.getItem(STATS_KEY);
        return saved ? JSON.parse(saved) : getDefaultStats();
    } catch (e) { return getDefaultStats(); }
}

function getDefaultStats() {
    return {
        // Aligned with player_profiles table
        games_played: 0,
        games_won: 0,
        times_impostor: 0,
        times_citizen: 0,
        correct_votes: 0,
        total_votes: 0,
        win_streak: 0,
        best_win_streak: 0,
    };
}

function saveStats(stats) {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch (e) { }
}

function updateStatsAfterGame(won) {
    const stats = loadStats();
    stats.games_played++;
    if (won) {
        stats.games_won++;
        stats.win_streak++;
        stats.best_win_streak = Math.max(stats.best_win_streak, stats.win_streak);
    } else {
        stats.win_streak = 0;
    }
    saveStats(stats);
}

// === Public API ===
export const GameEngine = {
    get state() { return state; },
    get settings() { return settings; },

    setState(partial) { Object.assign(state, partial); },

    // Balance module re-exports (for UI consumption)
    getRecommendedImpostors,
    getImpostorOptions,
    getRecommendedDebateTime,
    getDifficultyBand,

    // Game lifecycle
    initGame,
    setupRound,
    setupVoting,
    registerVote,
    tallyVotes,
    resolveElimination,
    checkGuessResult,
    calculateRoundScores,
    getFinalRankings,
    shuffleArray,

    // Settings
    loadSettings,
    saveSettings,
    updateSetting(key, value) {
        settings[key] = value;
        saveSettings();
    },

    // Stats
    loadStats,
    saveStats,
    updateStatsAfterGame,

    // ELO
    getPlayerElo,

    // Player accessors
    getCurrentDealingPlayer() {
        if (state.dealingIndex < state.players.length) return state.players[state.clueOrder[state.dealingIndex]];
        return null;
    },
    getCurrentDealingPlayerIndex() {
        return state.clueOrder[state.dealingIndex];
    },
    getCurrentVotingPlayer() {
        if (state.votingIndex < state.votingOrder.length) return state.players[state.votingOrder[state.votingIndex]];
        return null;
    },
    getCurrentVotingPlayerIndex() {
        return state.votingOrder[state.votingIndex];
    },
    getActivePlayers() {
        return state.players.map((p, i) => ({ ...p, index: i })).filter(p => !p.eliminated);
    },
    getImpostors() {
        return state.players.map((p, i) => ({ ...p, index: i })).filter(p => p.role === 'impostor');
    },
};
