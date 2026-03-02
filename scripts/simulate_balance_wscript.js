// EL IMPOSTOR — Balance Simulation (WScript compatible, v2 refined)
// Run: cscript //nologo scripts\simulate_balance_wscript.js

var CONFIG = {
    SCORING: {
        PARTICIPATION: 75,
        IMPOSTOR_SURVIVE: 350,
        IMPOSTOR_GUESS_WORD: 500,
        IMPOSTOR_MYSTERIOUS_WIN: 400,
        CITIZEN_CORRECT_VOTE: 200,
        CITIZEN_COLLECTIVE_WIN: 100,
        CITIZEN_WRONG_VOTE: -25
    },
    ELO: {
        INITIAL: 1000, WIN_AS_IMPOSTOR: 25, LOSS_AS_IMPOSTOR: -15,
        CORRECT_VOTE: 10, WRONG_VOTE: -5, MIN: 700, MAX: 1500
    },
    MODEL: { ALPHA_IMPOSTOR: 1.0, ALPHA_MYSTERIOUS: 0.65, BASE_GUESS_PROB: 0.15 }
};

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function pad(s, n) { s = String(s); while (s.length < n) s = " " + s; return s; }
function padEnd(s, n) { s = String(s); while (s.length < n) s = s + " "; return s; }

function getImpostors(n) {
    if (n <= 5) return 1;
    if (n <= 7) return 1;
    if (n <= 10) return 2;
    return 3;
}

function simulateGames(numPlayers, mode, skill, numGames) {
    var imp = getImpostors(numPlayers);
    var cit = numPlayers - imp;
    var pWrong = (1 - skill) * (cit / numPlayers);
    if (mode === "mysterious") pWrong = Math.min(0.95, pWrong * 1.15);
    var pGuess = (mode === "impostor") ? CONFIG.MODEL.BASE_GUESS_PROB : 0;
    var wins = 0;
    for (var i = 0; i < numGames; i++) {
        if (Math.random() < pWrong) { wins++; }
        else if (pGuess > 0 && Math.random() < pGuess) { wins++; }
    }
    return { n: numPlayers, mode: mode, imp: imp, wr: wins / numGames, pW: pWrong, pG: pGuess };
}

var out = "";
function P(s) { out += s + "\n"; }

P("");
P("================================================================");
P("   EL IMPOSTOR - Simulacion de Balance v2 (Refinada)");
P("================================================================");
P("   Participation: " + CONFIG.SCORING.PARTICIPATION + " pts");
P("   Bonus pista:   ELIMINADO (subjetivo)");
P("   Turno:         ALEATORIO PURO (sin palanca ELO)");
P("   Campo palabra: difficulty (1-5), alineado con BD");
P("");

// 1. Win-rate table
P("--- 1. TABLA DE WIN-RATES (d=0.6, 1000 partidas) ---");
P("");
P(" N  | I | Modo       | Win-Rate | Estado  | P_wrong | P_guess");
P("----+---+------------+----------+---------+---------+--------");

var n, mode, r;
for (n = 3; n <= 12; n++) {
    var modes = ["impostor", "mysterious"];
    for (var mi = 0; mi < modes.length; mi++) {
        mode = modes[mi];
        r = simulateGames(n, mode, 0.6, 1000);
        var wr = (r.wr * 100).toFixed(1);
        var status = (r.wr >= 0.35 && r.wr <= 0.45) ? " OK   " : (r.wr < 0.35 ? " BAJO " : " ALTO ");
        var mStr = (mode === "impostor") ? "Impostor  " : "Misterioso";
        P(" " + pad(n, 2) + " | " + r.imp + " | " + mStr + " | " + pad(wr, 5) + " %  | " + status + " | " + (r.pW * 100).toFixed(1) + "%    | " + (r.pG * 100).toFixed(0) + "%");
    }
}
P("");

// 2. Sensitivity
P("--- 2. ANALISIS DE SENSIBILIDAD (Modo Impostor, 1000 partidas) ---");
P("");
P(" N  | d=0.4 (novato) | d=0.6 (medio) | d=0.8 (experto)");
P("----+----------------+---------------+----------------");
var ns = [4, 6, 8, 10, 12];
for (var ni = 0; ni < ns.length; ni++) {
    n = ns[ni];
    var r4 = simulateGames(n, "impostor", 0.4, 1000);
    var r6 = simulateGames(n, "impostor", 0.6, 1000);
    var r8 = simulateGames(n, "impostor", 0.8, 1000);
    var f = function (rx) {
        var w = (rx.wr * 100).toFixed(1);
        var ok = (rx.wr >= 0.35 && rx.wr <= 0.45) ? " OK" : "   ";
        return pad(w, 5) + "%" + ok;
    };
    P(" " + pad(n, 2) + " |   " + f(r4) + "       |   " + f(r6) + "      |   " + f(r8));
}
P("");

// 3. Detailed 100-round simulation with UPDATED scoring
P("--- 3. SIMULACION DETALLADA (6 jugadores, 100 rondas, d=0.6) ---");
P("    Scoring: Participation=75, Sin bonus pista");
P("");

var NUM = 6, ROUNDS = 100, SKILL = 0.6;
var impCount = getImpostors(NUM);
var players = [];
for (var i = 0; i < NUM; i++) {
    players.push({ id: "J" + (i + 1), elo: 1000, pts: 0, asImp: 0, impWon: 0, asCit: 0, cVotes: 0, wVotes: 0 });
}
var pWr = (1 - SKILL) * ((NUM - impCount) / NUM);
var pGu = CONFIG.MODEL.BASE_GUESS_PROB;
var totalImpWins = 0;

for (var rd = 0; rd < ROUNDS; rd++) {
    var impIdx = rd % NUM;
    var imp2 = players[impIdx];
    imp2.asImp++;
    for (var j = 0; j < NUM; j++) {
        players[j].pts += CONFIG.SCORING.PARTICIPATION;
        if (j !== impIdx) players[j].asCit++;
    }
    var roll = Math.random();
    var impWon2 = false, guessed = false;
    if (roll < pWr) { impWon2 = true; }
    else if (Math.random() < pGu) { impWon2 = true; guessed = true; }

    if (impWon2) {
        totalImpWins++;
        imp2.impWon++;
        imp2.pts += guessed ? CONFIG.SCORING.IMPOSTOR_GUESS_WORD : CONFIG.SCORING.IMPOSTOR_SURVIVE;
        imp2.elo = clamp(imp2.elo + CONFIG.ELO.WIN_AS_IMPOSTOR, CONFIG.ELO.MIN, CONFIG.ELO.MAX);
        for (var k = 0; k < NUM; k++) {
            if (k !== impIdx) {
                players[k].elo = clamp(players[k].elo + CONFIG.ELO.WRONG_VOTE, CONFIG.ELO.MIN, CONFIG.ELO.MAX);
                players[k].wVotes++;
                players[k].pts += CONFIG.SCORING.CITIZEN_WRONG_VOTE;
            }
        }
    } else {
        imp2.elo = clamp(imp2.elo + CONFIG.ELO.LOSS_AS_IMPOSTOR, CONFIG.ELO.MIN, CONFIG.ELO.MAX);
        for (var k2 = 0; k2 < NUM; k2++) {
            if (k2 !== impIdx) {
                players[k2].pts += CONFIG.SCORING.CITIZEN_COLLECTIVE_WIN;
                if (Math.random() < 0.60) {
                    players[k2].pts += CONFIG.SCORING.CITIZEN_CORRECT_VOTE;
                    players[k2].cVotes++;
                    players[k2].elo = clamp(players[k2].elo + CONFIG.ELO.CORRECT_VOTE, CONFIG.ELO.MIN, CONFIG.ELO.MAX);
                } else {
                    players[k2].pts += CONFIG.SCORING.CITIZEN_WRONG_VOTE;
                    players[k2].wVotes++;
                    players[k2].elo = clamp(players[k2].elo + CONFIG.ELO.WRONG_VOTE, CONFIG.ELO.MIN, CONFIG.ELO.MAX);
                }
                // NO clue bonus — eliminated in v2
            }
        }
    }
}

P("Win-rate del impostor: " + (totalImpWins / ROUNDS * 100).toFixed(1) + "%");
P("Victorias impostor: " + totalImpWins + " / " + ROUNDS);
P("");
P("Jugador | Puntos | ELO  | Imp. | Win% Imp | Votos OK | Votos Mal");
P("--------+--------+------+------+----------+----------+----------");
var vals = [];
for (var p = 0; p < NUM; p++) {
    var pl = players[p];
    var iwp = pl.asImp > 0 ? (pl.impWon / pl.asImp * 100).toFixed(1) + "%" : "N/A";
    P("  " + padEnd(pl.id, 5) + " | " + pad(pl.pts, 5) + "  | " + pad(pl.elo, 4) + " | " + pad(pl.asImp, 3) + "  | " + pad(iwp, 7) + "  | " + pad(pl.cVotes, 5) + "    | " + pad(pl.wVotes, 5));
    vals.push(pl.pts);
}

var sum = 0;
for (var v = 0; v < vals.length; v++) sum += vals[v];
var avg = sum / vals.length;
var variance = 0;
for (var v2 = 0; v2 < vals.length; v2++) variance += (vals[v2] - avg) * (vals[v2] - avg);
variance /= vals.length;
var sd = Math.sqrt(variance);
var cv = (sd / avg * 100).toFixed(2);

P("");
P("Media de puntos:           " + Math.round(avg));
P("Desviacion estandar:       " + Math.round(sd));
P("Coef. de variacion:        " + cv + "%");
P("Equidad:                   " + (parseFloat(cv) < 5 ? "EQUITATIVO (CV < 5%)" : "REVISAR (CV=" + cv + "%)"));
P("");

// 4. Guess impact
P("--- 4. IMPACTO DE LA MECANICA DE ADIVINANZA ---");
P("");
var gns = [4, 6, 8, 10];
for (var gi = 0; gi < gns.length; gi++) {
    n = gns[gi];
    var wg = simulateGames(n, "impostor", 0.6, 5000);
    var ci = n - getImpostors(n);
    var pw = (1 - 0.6) * (ci / n);
    var noG = 0;
    for (var gg = 0; gg < 5000; gg++) { if (Math.random() < pw) noG++; }
    var noGr = noG / 5000;
    var diff = ((wg.wr - noGr) * 100).toFixed(1);
    P("N=" + pad(n, 2) + ": Sin adivinanza = " + (noGr * 100).toFixed(1) + "% | Con = " + (wg.wr * 100).toFixed(1) + "% | Impacto = +" + diff + "%");
}
P("");

// 5. Levenshtein test
P("--- 5. TEST VALIDADOR (Levenshtein) ---");
P("");

function normalize(s) {
    return s.replace(/^\s+|\s+$/g, "").toLowerCase()
        .replace(/[aáàä]/g, "a").replace(/[eéèë]/g, "e")
        .replace(/[iíìï]/g, "i").replace(/[oóòö]/g, "o")
        .replace(/[uúùü]/g, "u").replace(/[ñ]/g, "n");
}

function lev(a, b) {
    var m = a.length, nn = b.length;
    if (m === 0) return nn;
    if (nn === 0) return m;
    var prev = [];
    for (var i = 0; i <= nn; i++) prev[i] = i;
    var curr2 = [];
    for (var i2 = 1; i2 <= m; i2++) {
        curr2[0] = i2;
        for (var j2 = 1; j2 <= nn; j2++) {
            var cost = (a.charAt(i2 - 1) === b.charAt(j2 - 1)) ? 0 : 1;
            curr2[j2] = Math.min(prev[j2] + 1, curr2[j2 - 1] + 1, prev[j2 - 1] + cost);
        }
        var tmp = prev; prev = curr2; curr2 = tmp;
    }
    return prev[nn];
}

function testG(guess, correct) {
    var a = normalize(guess), b = normalize(correct);
    var d = lev(a, b);
    var ok = d <= 2;
    P('  "' + guess + '" vs "' + correct + '" -> dist=' + d + " -> " + (ok ? "ACIERTO" : "FALLO"));
}

testG("guitarra", "Guitarra");
testG("gitarra", "Guitarra");
testG("gutara", "Guitarra");
testG("delfin", "Delfín");
testG("ornitorrinco", "Ornitorrinco");
testG("perro", "gato");
P("");

// 6. Word difficulty mapping test
P("--- 6. DIFICULTAD DE PALABRA POR ELO ---");
P("");
P("  ELO  | Difficulty | Dist. Semantica");
P("-------+------------+----------------");
var elos = [800, 950, 1000, 1050, 1100, 1150, 1200, 1300, 1400];
for (var ei = 0; ei < elos.length; ei++) {
    var e = elos[ei];
    var diff = Math.max(1, Math.min(5, 1 + Math.floor((e - 950) / 100)));
    var sem = Math.max(0.45, Math.min(0.90, 0.85 - (e - 950) * 0.001));
    P("  " + pad(e, 4) + " |     " + diff + "      | " + sem.toFixed(3));
}

P("");
P("================================================================");
P("  SIMULACION v2 COMPLETADA");
P("================================================================");

WScript.Echo(out);
