/**
 * ═══════════════════════════════════════════════════════════════
 *  EL IMPOSTOR — Balance Simulation v2 (Node.js version)
 *  Run: node scripts/simulate_balance.js
 *
 *  v2 changes: participation=75, no clue bonus, difficulty (not
 *  frequency), pure random turn order, simplified document.
 * ═══════════════════════════════════════════════════════════════
 */

const CONFIG = {
    SCORING: {
        PARTICIPATION: 75,
        IMPOSTOR_SURVIVE: 350,
        IMPOSTOR_GUESS_WORD: 500,
        IMPOSTOR_MYSTERIOUS_WIN: 400,
        CITIZEN_CORRECT_VOTE: 200,
        CITIZEN_COLLECTIVE_WIN: 100,
        CITIZEN_WRONG_VOTE: -25,
    },
    ELO: {
        INITIAL: 1000, WIN_AS_IMPOSTOR: 25, LOSS_AS_IMPOSTOR: -15,
        CORRECT_VOTE: 10, WRONG_VOTE: -5, MIN: 700, MAX: 1500,
    },
    MODEL: { ALPHA_IMPOSTOR: 1.0, ALPHA_MYSTERIOUS: 0.65, BASE_GUESS_PROB: 0.15 },
};

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function pad(s, n) { return String(s).padStart(n); }
function padEnd(s, n) { return String(s).padEnd(n); }

function getImpostors(n) {
    if (n <= 5) return 1;
    if (n <= 7) return 1;
    if (n <= 10) return 2;
    return 3;
}

function simulateGames(numPlayers, mode, skill, numGames) {
    const imp = getImpostors(numPlayers);
    const cit = numPlayers - imp;
    let pWrong = (1 - skill) * (cit / numPlayers);
    if (mode === 'mysterious') pWrong = Math.min(0.95, pWrong * 1.15);
    const pGuess = mode === 'impostor' ? CONFIG.MODEL.BASE_GUESS_PROB : 0;
    let wins = 0;
    for (let i = 0; i < numGames; i++) {
        if (Math.random() < pWrong) wins++;
        else if (pGuess > 0 && Math.random() < pGuess) wins++;
    }
    return { n: numPlayers, mode, imp, wr: wins / numGames, pW: pWrong, pG: pGuess };
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('   EL IMPOSTOR — Simulación de Balance v2 (Refinada)');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`   Participation: ${CONFIG.SCORING.PARTICIPATION} pts`);
console.log('   Bonus pista:   ELIMINADO (subjetivo)');
console.log('   Turno:         ALEATORIO PURO');
console.log('   Campo palabra: difficulty (1-5), alineado con BD');
console.log('');

// 1. Win-rate table
console.log('── 1. TABLA DE WIN-RATES (d=0.6, 1000 partidas) ──');
console.log('');
console.log(' N  │ I │ Modo       │ Win-Rate │ Estado │ P_wrong │ P_guess');
console.log('────┼───┼────────────┼──────────┼────────┼─────────┼────────');

for (let n = 3; n <= 12; n++) {
    for (const mode of ['impostor', 'mysterious']) {
        const r = simulateGames(n, mode, 0.6, 1000);
        const wr = (r.wr * 100).toFixed(1);
        const status = r.wr >= 0.35 && r.wr <= 0.45 ? ' ✅  ' : r.wr < 0.35 ? ' ❌  ' : ' ⚠️  ';
        const mStr = padEnd(mode === 'impostor' ? 'Impostor' : 'Misterioso', 10);
        console.log(` ${pad(n.toString(), 2)} │ ${r.imp} │ ${mStr} │ ${pad(wr, 5)} %  │${status}│ ${(r.pW * 100).toFixed(1)}%    │ ${(r.pG * 100).toFixed(0)}%`);
    }
}

console.log('');

// 2. Sensitivity
console.log('── 2. SENSIBILIDAD (Modo Impostor, 1000 partidas) ──');
console.log('');
console.log(' N  │  d=0.4 (novato)  │  d=0.6 (medio)  │  d=0.8 (experto)');
console.log('────┼──────────────────┼─────────────────┼──────────────────');

for (const n of [4, 6, 8, 10, 12]) {
    const fmt = (r) => {
        const w = (r.wr * 100).toFixed(1);
        return `${pad(w, 5)}% ${r.wr >= 0.35 && r.wr <= 0.45 ? '✅' : '❌'}`;
    };
    console.log(` ${pad(n.toString(), 2)} │    ${fmt(simulateGames(n, 'impostor', 0.4, 1000))}       │    ${fmt(simulateGames(n, 'impostor', 0.6, 1000))}      │    ${fmt(simulateGames(n, 'impostor', 0.8, 1000))}`);
}

console.log('');

// 3. Detailed session
console.log('── 3. SESIÓN DETALLADA (6 jugadores, 100 rondas) ──');
console.log('');

const NUM = 6, ROUNDS = 100;
const players = Array.from({ length: NUM }, (_, i) => ({
    id: `J${i + 1}`, elo: 1000, pts: 0, asImp: 0, impWon: 0, cVotes: 0, wVotes: 0,
}));

const pWr = 0.4 * (5 / 6);
const pGu = 0.15;
let totalImpWins = 0;

for (let rd = 0; rd < ROUNDS; rd++) {
    const impIdx = rd % NUM;
    players[impIdx].asImp++;
    players.forEach(p => { p.pts += CONFIG.SCORING.PARTICIPATION; });

    let impWon = false, guessed = false;
    if (Math.random() < pWr) impWon = true;
    else if (Math.random() < pGu) { impWon = true; guessed = true; }

    if (impWon) {
        totalImpWins++;
        players[impIdx].impWon++;
        players[impIdx].pts += guessed ? CONFIG.SCORING.IMPOSTOR_GUESS_WORD : CONFIG.SCORING.IMPOSTOR_SURVIVE;
        players[impIdx].elo = clamp(players[impIdx].elo + CONFIG.ELO.WIN_AS_IMPOSTOR, CONFIG.ELO.MIN, CONFIG.ELO.MAX);
        players.forEach((p, i) => {
            if (i !== impIdx) {
                p.elo = clamp(p.elo + CONFIG.ELO.WRONG_VOTE, CONFIG.ELO.MIN, CONFIG.ELO.MAX);
                p.wVotes++; p.pts += CONFIG.SCORING.CITIZEN_WRONG_VOTE;
            }
        });
    } else {
        players[impIdx].elo = clamp(players[impIdx].elo + CONFIG.ELO.LOSS_AS_IMPOSTOR, CONFIG.ELO.MIN, CONFIG.ELO.MAX);
        players.forEach((p, i) => {
            if (i !== impIdx) {
                p.pts += CONFIG.SCORING.CITIZEN_COLLECTIVE_WIN;
                if (Math.random() < 0.60) {
                    p.pts += CONFIG.SCORING.CITIZEN_CORRECT_VOTE; p.cVotes++;
                    p.elo = clamp(p.elo + CONFIG.ELO.CORRECT_VOTE, CONFIG.ELO.MIN, CONFIG.ELO.MAX);
                } else {
                    p.pts += CONFIG.SCORING.CITIZEN_WRONG_VOTE; p.wVotes++;
                    p.elo = clamp(p.elo + CONFIG.ELO.WRONG_VOTE, CONFIG.ELO.MIN, CONFIG.ELO.MAX);
                }
            }
        });
    }
}

console.log(`Win-rate impostor: ${(totalImpWins / ROUNDS * 100).toFixed(1)}% (${totalImpWins}/${ROUNDS})`);
console.log('');
console.log('Jugador │ Puntos │ ELO  │ Imp. │ Win% Imp │ Votos ✓ │ Votos ✗');
console.log('────────┼────────┼──────┼──────┼──────────┼─────────┼────────');
const vals = [];
for (const p of players) {
    const iwp = p.asImp > 0 ? (p.impWon / p.asImp * 100).toFixed(1) + '%' : 'N/A';
    console.log(`  ${padEnd(p.id, 5)} │ ${pad(p.pts.toString(), 5)}  │ ${pad(p.elo.toString(), 4)} │ ${pad(p.asImp.toString(), 3)}  │ ${pad(iwp, 7)}  │ ${pad(p.cVotes.toString(), 5)}   │ ${pad(p.wVotes.toString(), 5)}`);
    vals.push(p.pts);
}

const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
const sd = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
const cv = ((sd / mean) * 100).toFixed(2);
console.log('');
console.log(`📊 Media: ${Math.round(mean)}  │  σ: ${Math.round(sd)}  │  CV: ${cv}%  │  ${parseFloat(cv) < 5 ? '✅ EQUITATIVO' : '⚠️ REVISAR'}`);
console.log('');

// 4. Difficulty mapping
console.log('── 4. MAPEO DIFICULTAD POR ELO ──');
console.log('');
console.log(' ELO  │ Difficulty │ Dist. Semántica');
console.log('──────┼────────────┼────────────────');
for (const e of [800, 950, 1000, 1050, 1100, 1150, 1200, 1300, 1400]) {
    const diff = clamp(1 + Math.floor((e - 950) / 100), 1, 5);
    const sem = clamp(0.85 - (e - 950) * 0.001, 0.45, 0.90);
    console.log(` ${pad(e.toString(), 4)} │     ${diff}      │ ${sem.toFixed(3)}`);
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('   SIMULACIÓN v2 COMPLETADA');
console.log('═══════════════════════════════════════════════════════════════');
