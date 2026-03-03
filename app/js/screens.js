/* ============================================================
   EL IMPOSTOR — Screen Renderer (ES Module)
   ============================================================ */

import { GameEngine } from './game.js';
import { SoundSystem } from './sounds.js';
import { getCategories } from './words.js';

const $ = (sel) => document.querySelector(sel);
const app = () => $('#app');

function show(html) {
  app().innerHTML = html;
  requestAnimationFrame(() => {
    const s = app().querySelector('.screen');
    if (s) s.classList.add('active');
  });
}

// ==================== SPLASH ====================
function splash() {
  show(`
    <div class="screen" id="screen-splash" style="background:var(--bg-primary)">
      <div class="emoji-icon animate-float">🕵️</div>
      <h1 class="logo-title animate-fade-in">El Impostor</h1>
      <p class="logo-subtitle animate-fade-in delay-2">Deducción social · Pass-and-play</p>
      <button class="btn btn-ghost mt-xl animate-fade-in delay-4" onclick="Screens.mainMenu()">
        Toca para empezar
      </button>
    </div>
  `);
}

// ==================== MAIN MENU ====================
function mainMenu() {
  SoundSystem.init();
  show(`
    <div class="screen" style="background:var(--bg-primary)">
      <div class="spacer"></div>
      <div class="emoji-icon animate-float">🕵️</div>
      <h1 class="logo-title">El Impostor</h1>
      <p class="logo-subtitle mb-lg">¿Quién miente?</p>
      <div class="flex-col gap-md w-full animate-fade-in-up delay-2">
        <button class="btn btn-primary" onclick="SoundSystem.onButtonPress();Screens.config()">🎮 Nueva Partida</button>
        <button class="btn btn-secondary" onclick="SoundSystem.onButtonPress();Screens.stats()">📊 Estadísticas</button>
        <button class="btn btn-ghost" onclick="SoundSystem.onButtonPress();Screens.settingsScreen()">⚙️ Ajustes</button>
      </div>
      <div class="spacer"></div>
    </div>
  `);
}

// ==================== SETTINGS ====================
function settingsScreen() {
  const s = GameEngine.settings;
  show(`
    <div class="screen" style="background:var(--bg-primary);justify-content:flex-start;padding-top:var(--space-xl)">
      <div class="top-bar">
        <button class="back-btn" onclick="SoundSystem.onButtonPress();Screens.mainMenu()">←</button>
        <span class="top-title">Ajustes</span><span class="top-spacer"></span>
      </div>
      <div class="scroll-content">
        <div class="settings-section"><h3>Audio y Háptica</h3>
          <div class="setting-row"><span class="setting-label">🔊 Sonidos</span>
            <div class="toggle ${s.soundEnabled ? 'on' : ''}" onclick="Screens._toggle(this,'soundEnabled')"><div class="toggle-knob"></div></div></div>
          <div class="setting-row"><span class="setting-label">📳 Vibración</span>
            <div class="toggle ${s.vibrationEnabled ? 'on' : ''}" onclick="Screens._toggle(this,'vibrationEnabled')"><div class="toggle-knob"></div></div></div>
        </div>
        <div class="settings-section"><h3>Accesibilidad</h3>
          <div class="setting-row"><span class="setting-label">🎨 Modo daltónico</span>
            <div class="toggle ${s.colorblindMode ? 'on' : ''}" onclick="Screens._toggle(this,'colorblindMode')"><div class="toggle-knob"></div></div></div>
          <div class="setting-row"><span class="setting-label">◐ Alto contraste</span>
            <div class="toggle ${s.highContrast ? 'on' : ''}" onclick="Screens._toggle(this,'highContrast')"><div class="toggle-knob"></div></div></div>
          <div class="setting-row"><span class="setting-label">✨ Reducir movimiento</span>
            <div class="toggle ${s.reducedMotion ? 'on' : ''}" onclick="Screens._toggle(this,'reducedMotion')"><div class="toggle-knob"></div></div></div>
          <div class="setting-row"><span class="setting-label">🔤 Tamaño de fuente</span>
            <input type="range" class="range-slider" min="0.8" max="1.4" step="0.1" value="${s.fontScale}"
              oninput="GameEngine.updateSetting('fontScale',parseFloat(this.value))"></div>
        </div>
      </div>
    </div>
  `);
}

function _toggle(el, key) {
  const val = !GameEngine.settings[key];
  GameEngine.updateSetting(key, val);
  el.classList.toggle('on', val);
  SoundSystem.onButtonPress();
}

// ==================== STATS ====================
function stats() {
  const s = GameEngine.loadStats();
  const wr = s.games_played > 0 ? Math.round((s.games_won / s.games_played) * 100) : 0;
  show(`
    <div class="screen" style="background:var(--bg-primary);justify-content:flex-start;padding-top:var(--space-xl)">
      <div class="top-bar">
        <button class="back-btn" onclick="SoundSystem.onButtonPress();Screens.mainMenu()">←</button>
        <span class="top-title">Estadísticas</span><span class="top-spacer"></span>
      </div>
      <div class="scroll-content">
        <div class="stats-grid animate-fade-in">
          <div class="stat-card"><div class="stat-value">${s.games_played}</div><div class="stat-label">Partidas</div></div>
          <div class="stat-card"><div class="stat-value">${s.games_won}</div><div class="stat-label">Victorias</div></div>
          <div class="stat-card"><div class="stat-value">${wr}%</div><div class="stat-label">Win Rate</div></div>
          <div class="stat-card"><div class="stat-value">${s.best_win_streak}</div><div class="stat-label">Mejor Racha</div></div>
          <div class="stat-card"><div class="stat-value">${s.times_impostor}</div><div class="stat-label">Impostor</div></div>
          <div class="stat-card"><div class="stat-value">${s.times_citizen}</div><div class="stat-label">Ciudadano</div></div>
        </div>
      </div>
    </div>
  `);
}

// ==================== CONFIG ====================
function _getRoleSummary() {
  const st = GameEngine.state;
  if (st.randomRoles) return '🎲 Se asignarán al azar';
  const parts = [];
  if (st.numImpostors > 0) parts.push(`${st.numImpostors} impostor${st.numImpostors > 1 ? 'es' : ''}`);
  if (st.numMisteriosos > 0) parts.push(`${st.numMisteriosos} misterioso${st.numMisteriosos > 1 ? 's' : ''}`);
  const citizens = st.numPlayers - st.numImpostors - st.numMisteriosos;
  parts.push(`${citizens} ciudadano${citizens !== 1 ? 's' : ''}`);
  return parts.join(' · ');
}

function config() {
  const st = GameEngine.state;
  const cats = getCategories(false);
  const randomOn = st.randomRoles;

  show(`
    <div class="screen" style="background:var(--bg-primary);justify-content:flex-start;padding-top:var(--space-xl)">
      <div class="top-bar">
        <button class="back-btn" onclick="SoundSystem.onButtonPress();Screens.mainMenu()">←</button>
        <span class="top-title">Nueva Partida</span><span class="top-spacer"></span>
      </div>
      <div class="scroll-content">
        <h3 class="text-center mb-md">Jugadores</h3>
        <div class="stepper mb-md">
          <button class="stepper-btn" onclick="Screens._adjPlayers(-1)">−</button>
          <span class="stepper-value" id="player-count">${st.numPlayers}</span>
          <button class="stepper-btn" onclick="Screens._adjPlayers(1)">+</button>
        </div>

        <h3 class="text-center mb-md">Roles</h3>
        <div class="setting-row mb-md" style="justify-content:center;gap:var(--space-md)">
          <span class="setting-label">🎲 Aleatorio</span>
          <div class="toggle ${randomOn ? 'on' : ''}" onclick="Screens._toggleRandom(this)"><div class="toggle-knob"></div></div>
        </div>

        <div id="role-steppers" style="${randomOn ? 'display:none' : ''}">
          <div class="stepper mb-sm">
            <button class="stepper-btn" onclick="Screens._adjImpostors(-1)">−</button>
            <span class="stepper-value">🕵️ <span id="imp-count">${st.numImpostors}</span></span>
            <button class="stepper-btn" onclick="Screens._adjImpostors(1)">+</button>
          </div>
          <p class="text-muted text-center mb-md" style="font-size:var(--font-size-sm)">Impostores (pantalla en blanco)</p>

          <div class="stepper mb-sm">
            <button class="stepper-btn" onclick="Screens._adjMisteriosos(-1)">−</button>
            <span class="stepper-value">🔮 <span id="mist-count">${st.numMisteriosos}</span></span>
            <button class="stepper-btn" onclick="Screens._adjMisteriosos(1)">+</button>
          </div>
          <p class="text-muted text-center mb-md" style="font-size:var(--font-size-sm)">Misteriosos (palabra similar)</p>
        </div>

        <p class="text-center mb-lg" id="role-summary" style="font-weight:600;color:var(--text-secondary)">${_getRoleSummary()}</p>

        <h3 class="text-center mb-md">Categoría</h3>
        <div class="option-grid mb-lg" id="cat-grid">
          ${cats.map(c => `<div class="option-card ${st.categoryId === c.id ? 'selected' : ''}" onclick="Screens._selectCat('${c.id}')">
            <div class="option-emoji">${c.emoji}</div><div class="option-label">${c.name}</div></div>`).join('')}
        </div>
        <h3 class="text-center mb-md">Tiempo de debate</h3>
        <div class="stepper mb-lg">
          <button class="stepper-btn" onclick="Screens._adjTime(-30)">−</button>
          <span class="stepper-value" id="time-value">${Math.floor(st.debateTimeSeconds / 60)}:${String(st.debateTimeSeconds % 60).padStart(2, '0')}</span>
          <button class="stepper-btn" onclick="Screens._adjTime(30)">+</button>
        </div>
        <h3 class="text-center mb-md">Rondas</h3>
        <div class="stepper mb-lg">
          <button class="stepper-btn" onclick="Screens._adjRounds(-1)">−</button>
          <span class="stepper-value" id="rounds-value">${st.numRounds}</span>
          <button class="stepper-btn" onclick="Screens._adjRounds(1)">+</button>
        </div>
        <button class="btn btn-primary mt-md" onclick="SoundSystem.onButtonPress();Screens.playerNames()">Continuar ➡️</button>
      </div>
    </div>
  `);
}

function _toggleRandom(el) {
  SoundSystem.onButtonPress();
  const val = !GameEngine.state.randomRoles;
  GameEngine.setState({ randomRoles: val });
  el.classList.toggle('on', val);
  const steppers = document.getElementById('role-steppers');
  if (steppers) steppers.style.display = val ? 'none' : '';
  _updateRoleSummary();
}

function _adjImpostors(delta) {
  SoundSystem.onButtonPress();
  const st = GameEngine.state;
  const maxAllowed = st.numPlayers - st.numMisteriosos - 1; // at least 1 citizen
  const n = Math.max(0, Math.min(maxAllowed, st.numImpostors + delta));
  // Enforce at least 1 total infiltrator
  if (n + st.numMisteriosos < 1) return;
  GameEngine.setState({ numImpostors: n });
  const el = document.getElementById('imp-count');
  if (el) el.textContent = n;
  _updateRoleSummary();
}

function _adjMisteriosos(delta) {
  SoundSystem.onButtonPress();
  const st = GameEngine.state;
  const maxAllowed = st.numPlayers - st.numImpostors - 1; // at least 1 citizen
  const n = Math.max(0, Math.min(maxAllowed, st.numMisteriosos + delta));
  // Enforce at least 1 total infiltrator
  if (st.numImpostors + n < 1) return;
  GameEngine.setState({ numMisteriosos: n });
  const el = document.getElementById('mist-count');
  if (el) el.textContent = n;
  _updateRoleSummary();
}

function _updateRoleSummary() {
  const el = document.getElementById('role-summary');
  if (el) el.textContent = _getRoleSummary();
}

function _selectCat(id) {
  GameEngine.setState({ categoryId: id });
  SoundSystem.onButtonPress();
  document.querySelectorAll('#cat-grid .option-card').forEach(c => c.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
}

function _adjPlayers(delta) {
  SoundSystem.onButtonPress();
  const st = GameEngine.state;
  const n = Math.max(3, Math.min(12, st.numPlayers + delta));
  // Clamp roles so totalInfiltrators < n
  let imp = Math.min(st.numImpostors, n - 1);
  let mist = Math.min(st.numMisteriosos, n - imp - 1);
  if (imp + mist < 1) imp = 1;
  GameEngine.setState({
    numPlayers: n, numImpostors: imp, numMisteriosos: mist,
    debateTimeSeconds: GameEngine.getRecommendedDebateTime(n)
  });
  const pc = document.getElementById('player-count');
  if (pc) pc.textContent = n;
  const ic = document.getElementById('imp-count');
  if (ic) ic.textContent = imp;
  const mc = document.getElementById('mist-count');
  if (mc) mc.textContent = mist;
  const t = GameEngine.state.debateTimeSeconds;
  const tv = document.getElementById('time-value');
  if (tv) tv.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  _updateRoleSummary();
}

function _adjTime(delta) {
  SoundSystem.onButtonPress();
  const t = Math.max(60, Math.min(900, GameEngine.state.debateTimeSeconds + delta));
  GameEngine.setState({ debateTimeSeconds: t });
  $('#time-value').textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

function _adjRounds(delta) {
  SoundSystem.onButtonPress();
  const r = Math.max(1, Math.min(10, GameEngine.state.numRounds + delta));
  GameEngine.setState({ numRounds: r });
  $('#rounds-value').textContent = r;
}

// ==================== PLAYER NAMES ====================
function playerNames() {
  const st = GameEngine.state;
  if (st.players.length !== st.numPlayers) {
    st.players = Array.from({ length: st.numPlayers }, (_, i) => ({ name: '' }));
  }
  const items = st.players.map((p, i) => `
    <div class="player-item">
      <div class="player-number">${i + 1}</div>
      <input type="text" class="player-name-input" placeholder="Jugador ${i + 1}"
        value="${p.name || ''}" data-index="${i}"
        oninput="GameEngine.state.players[${i}].name=this.value" maxlength="15">
    </div>`).join('');

  show(`
    <div class="screen" style="background:var(--bg-primary);justify-content:flex-start;padding-top:var(--space-xl)">
      <div class="top-bar">
        <button class="back-btn" onclick="SoundSystem.onButtonPress();Screens.config()">←</button>
        <span class="top-title">Nombres</span><span class="top-spacer"></span>
      </div>
      <div class="scroll-content">
        <p class="subtitle text-center mb-lg">Escribe el nombre de cada jugador</p>
        <div class="player-list">${items}</div>
        <button class="btn btn-primary mt-xl" onclick="Screens._startGame()">🎭 ¡Empezar!</button>
      </div>
    </div>
  `);
}

function _startGame() {
  SoundSystem.onButtonPress();
  GameEngine.state.players.forEach((p, i) => { if (!p.name.trim()) p.name = `Jugador ${i + 1}`; });
  GameEngine.initGame();
  GameEngine.setupRound();
  // Check all-impostors case
  if (GameEngine.state.allImpostors) {
    allImpostorsScreen();
  } else {
    dealingCortina();
  }
}

// ==================== ALL IMPOSTORS (special) ====================
function allImpostorsScreen() {
  SoundSystem.onVictory();
  spawnConfetti();
  const st = GameEngine.state;
  const roleList = st.players.map(p => {
    const badge = p.role === 'impostor' ? '🕵️ Impostor' : '🔮 Misterioso';
    return `<div class="score-row"><span class="score-name">${p.name}</span><span class="score-points">${badge}</span></div>`;
  }).join('');

  show(`
    <div class="screen" style="background:var(--bg-primary)">
      <div class="scroll-content">
        <div class="emoji-icon animate-pulse" style="font-size:4rem">😱</div>
        <h1 class="text-center" style="color:var(--accent-danger)">¡Todos son impostores!</h1>
        <p class="subtitle text-center mt-md">No hay ciudadanos en esta ronda.<br>¡Nadie tenía la palabra correcta!</p>
        <p class="subtitle text-center">Palabra: <strong>${st.currentWord}</strong></p>
        <div class="glass-card mt-lg">${roleList}</div>
        <div class="btn-row mt-xl">
          <button class="btn btn-primary" onclick="SoundSystem.onButtonPress();Screens._nextRoundOrEnd()">
            ${st.currentRound < st.numRounds ? '🔁 Siguiente ronda' : '🏅 Ver resultados'}</button>
        </div>
        <button class="btn btn-ghost mt-md" onclick="SoundSystem.onButtonPress();Screens.mainMenu()">🏠 Menú principal</button>
      </div>
    </div>
  `);
}

// ==================== DEALING: CORTINA ====================
function dealingCortina() {
  const st = GameEngine.state;
  const pi = GameEngine.getCurrentDealingPlayerIndex();
  const player = st.players[pi];
  show(`
    <div class="screen screen-cortina instant-in">
      <div class="emoji-icon animate-float">🔄</div>
      <h2 class="text-center">Pasa el móvil a</h2>
      <div class="glass-card text-center animate-scale-in delay-1">
        <div style="font-size:var(--font-size-4xl);font-weight:900">${pi + 1}</div>
        <div style="font-size:var(--font-size-xl);font-weight:600;margin-top:var(--space-sm)">${player.name}</div>
      </div>
      <p class="subtitle text-center">Toca el botón cuando tengas el dispositivo</p>
      <button class="btn btn-primary animate-fade-in-up delay-3" onclick="SoundSystem.onButtonPress();Screens.dealingReady()">☑️ Ya lo tengo</button>
      <p class="progress-text">${st.dealingIndex + 1} / ${st.players.length} jugadores</p>
    </div>
  `);
}

// ==================== DEALING: READY ====================
let _holdAnimFrame = null, _holdStartTime = 0, _holdComplete = false, _autoHideTimer = null;

function dealingReady() {
  const pi = GameEngine.getCurrentDealingPlayerIndex();
  const player = GameEngine.state.players[pi];
  _holdComplete = false;
  show(`
    <div class="screen" style="background:var(--bg-secondary)">
      <div class="emoji-icon">👁️</div>
      <h2 class="text-center">Tu turno</h2>
      <p class="subtitle">${player.name}</p>
      <div class="reveal-zone" id="reveal-zone"
        ontouchstart="Screens._holdStart(event)" ontouchend="Screens._holdEnd(event)"
        onmousedown="Screens._holdStart(event)" onmouseup="Screens._holdEnd(event)"
        onmouseleave="Screens._holdEnd(event)" oncontextmenu="event.preventDefault()">
        <div class="reveal-icon">👆</div>
        <p style="font-weight:600">MANTÉN PULSADO<br>para ver tu palabra</p>
        <div class="reveal-progress-bar"><div class="reveal-progress-fill" id="reveal-fill"></div></div>
      </div>
      <p class="text-muted text-center mt-md">Asegúrate de que nadie más vea la pantalla</p>
    </div>
  `);
}

function _holdStart(e) {
  e.preventDefault();
  if (_holdComplete) return;
  _holdStartTime = Date.now();
  const zone = $('#reveal-zone'), fill = $('#reveal-fill');
  zone.classList.add('holding');
  function animate() {
    const pct = Math.min(100, ((Date.now() - _holdStartTime) / 600) * 100);
    fill.style.width = pct + '%';
    if (pct >= 100) { _holdComplete = true; SoundSystem.onReveal(); dealingReveal(); return; }
    _holdAnimFrame = requestAnimationFrame(animate);
  }
  _holdAnimFrame = requestAnimationFrame(animate);
}

function _holdEnd(e) {
  e.preventDefault();
  if (_holdComplete) return;
  cancelAnimationFrame(_holdAnimFrame);
  const zone = $('#reveal-zone'), fill = $('#reveal-fill');
  if (zone) zone.classList.remove('holding');
  if (fill) fill.style.width = '0%';
}

// ==================== DEALING: REVEAL ====================
function dealingReveal() {
  const st = GameEngine.state;
  const pi = GameEngine.getCurrentDealingPlayerIndex();
  const player = st.players[pi];

  let content;
  if (player.role === 'impostor') {
    content = `<div class="role-badge impostor">🕵️ IMPOSTOR</div>
      <p style="font-size:var(--font-size-xl);margin-top:var(--space-lg);text-align:center">No tienes palabra.<br>Haz como si la conocieras.</p>`;
  } else if (player.role === 'misterioso') {
    content = `<div class="role-badge impostor">🔮 MISTERIOSO</div>
      <div class="word-display" style="margin-top:var(--space-lg)">${player.word}</div>
      <p class="text-muted mt-md text-center">Tu palabra es DIFERENTE a la del resto</p>`;
  } else {
    content = `<div class="role-badge citizen">✅ CIUDADANO</div>
      <div class="word-display" style="margin-top:var(--space-lg)">${player.word}</div>`;
  }

  show(`
    <div class="screen" style="background:var(--bg-secondary)">
      <div class="glass-card text-center animate-scale-in" style="display:flex;flex-direction:column;align-items:center">${content}</div>
      <p class="subtitle text-center mt-lg">Memoriza tu palabra. No la digas en voz alta.</p>
      <button class="btn btn-primary mt-lg" onclick="SoundSystem.onButtonPress();Screens.dealingConfirm()">✅ Ya la he memorizado</button>
    </div>
  `);
  clearTimeout(_autoHideTimer);
  _autoHideTimer = setTimeout(() => { SoundSystem.onHide(); dealingConfirm(); }, 8000);
}

// ==================== DEALING: CONFIRM ====================
function dealingConfirm() {
  clearTimeout(_autoHideTimer);
  _holdComplete = false;
  show(`
    <div class="screen" style="background:var(--bg-secondary)">
      <div class="emoji-icon">✅</div>
      <h2 class="text-center">¿Has memorizado tu palabra?</h2>
      <div class="btn-row mt-xl">
        <button class="btn btn-ghost" onclick="SoundSystem.onButtonPress();Screens._viewAgain()">🔄 Ver de nuevo</button>
        <button class="btn btn-primary" onclick="SoundSystem.onConfirmPass();Screens._nextPlayer()">➡️ Siguiente</button>
      </div>
    </div>
  `);
}

function _viewAgain() {
  const st = GameEngine.state;
  st.viewAgainCount = (st.viewAgainCount || 0) + 1;
  if (st.viewAgainCount > 3) { _nextPlayer(); return; }
  dealingReady();
}

function _nextPlayer() {
  const st = GameEngine.state;
  st.dealingIndex++;
  st.viewAgainCount = 0;
  _holdComplete = false;
  if (st.dealingIndex >= st.players.length) debateScreen();
  else dealingCortina();
}

// ==================== DEBATE ====================
let _debateInterval = null;

function debateScreen() {
  const st = GameEngine.state;
  st.timerRemaining = st.debateTimeSeconds;
  const clueItems = st.clueOrder.map((pi, i) => {
    const p = st.players[pi];
    let status = 'pending', icon = '⬜';
    if (i < st.currentClueIndex) { status = 'done'; icon = '✅'; }
    else if (i === st.currentClueIndex) { status = 'current'; icon = '▶️'; }
    return `<div class="clue-item ${status}"><span class="clue-status">${icon}</span>${p.name}</div>`;
  }).join('');
  const m = Math.floor(st.timerRemaining / 60), s = st.timerRemaining % 60;

  show(`
    <div class="screen" style="background:var(--bg-primary);justify-content:flex-start;padding-top:var(--space-xl)">
      <h2 class="text-center">💬 Debate</h2>
      <p class="text-muted">Ronda ${st.currentRound} de ${st.numRounds}</p>
      <div class="glass-card text-center mt-md">
        <div class="timer-display" id="timer-display">${m}:${String(s).padStart(2, '0')}</div>
        <div class="timer-bar"><div class="timer-bar-fill" id="timer-fill" style="width:100%"></div></div>
      </div>
      <h3 class="mt-lg mb-md">📋 Orden de pistas</h3>
      <div class="clue-order" id="clue-order">${clueItems}</div>
      <div class="btn-row mt-xl">
        <button class="btn btn-secondary btn-sm" onclick="Screens._nextClue()">⏭ Siguiente pista</button>
        <button class="btn btn-danger btn-sm" onclick="Screens._goToVoting()">🗳 Votación</button>
      </div>
      <button class="btn btn-ghost btn-sm mt-md" id="btn-timer" onclick="Screens._toggleTimer()">▶️ Iniciar temporizador</button>
      <p class="text-muted text-center mt-md">💡 No digas la palabra exacta</p>
    </div>
  `);
}

function _toggleTimer() {
  const st = GameEngine.state;
  st.timerRunning = !st.timerRunning;
  const btn = $('#btn-timer');
  if (st.timerRunning) {
    btn.textContent = '⏸ Pausar temporizador';
    _debateInterval = setInterval(() => {
      st.timerRemaining--;
      if (st.timerRemaining <= 0) { st.timerRemaining = 0; st.timerRunning = false; clearInterval(_debateInterval); SoundSystem.onTimerWarning(); }
      const m = Math.floor(st.timerRemaining / 60), s = st.timerRemaining % 60;
      const td = $('#timer-display'), tf = $('#timer-fill');
      if (td) td.textContent = `${m}:${String(s).padStart(2, '0')}`;
      if (tf) { tf.style.width = `${(st.timerRemaining / st.debateTimeSeconds) * 100}%`; tf.classList.toggle('warning', st.timerRemaining < 30); }
      if (st.timerRemaining <= 10 && st.timerRemaining > 0) SoundSystem.onTimerTick();
    }, 1000);
  } else { btn.textContent = '▶️ Iniciar temporizador'; clearInterval(_debateInterval); }
}

function _nextClue() {
  SoundSystem.onButtonPress();
  const st = GameEngine.state;
  st.currentClueIndex = Math.min(st.currentClueIndex + 1, st.clueOrder.length);
  document.querySelectorAll('.clue-item').forEach((el, i) => {
    el.className = 'clue-item ' + (i < st.currentClueIndex ? 'done' : i === st.currentClueIndex ? 'current' : 'pending');
    el.querySelector('.clue-status').textContent = i < st.currentClueIndex ? '✅' : i === st.currentClueIndex ? '▶️' : '⬜';
  });
}

function _goToVoting() {
  SoundSystem.onButtonPress();
  clearInterval(_debateInterval);
  GameEngine.setupVoting();
  votingAnnounce();
}

// ==================== VOTING ====================
function votingAnnounce() {
  show(`
    <div class="screen" style="background:var(--bg-primary)">
      <div class="emoji-icon animate-pulse">🗳</div>
      <h1 class="text-center">Votación</h1>
      <p class="subtitle text-center mt-md">Cada jugador votará en secreto a quién cree que es el impostor</p>
      <button class="btn btn-danger mt-xl animate-fade-in-up delay-2" onclick="SoundSystem.onButtonPress();Screens.votingCortina()">Empezar votación</button>
    </div>
  `);
}

function votingCortina() {
  const st = GameEngine.state;
  const pi = GameEngine.getCurrentVotingPlayerIndex();
  const player = st.players[pi];
  show(`
    <div class="screen screen-cortina votacion instant-in">
      <div class="emoji-icon animate-float">🗳</div>
      <h2 class="text-center">Pasa el móvil a</h2>
      <div class="glass-card text-center animate-scale-in delay-1">
        <div style="font-size:var(--font-size-3xl);font-weight:900">${player.name}</div>
        <div class="text-muted mt-sm">para votar</div>
      </div>
      <button class="btn btn-primary animate-fade-in-up delay-3" onclick="SoundSystem.onButtonPress();Screens.votingSelect()">☑️ Ya lo tengo</button>
      <p class="progress-text">${st.votingIndex + 1} / ${st.votingOrder.length} votantes</p>
    </div>
  `);
}

function votingSelect() {
  const st = GameEngine.state;
  const voterIdx = GameEngine.getCurrentVotingPlayerIndex();
  const voter = st.players[voterIdx];
  const items = st.players.map((p, i) => {
    const disabled = i === voterIdx || p.eliminated;
    return `<div class="vote-item ${disabled ? 'disabled' : ''}" data-index="${i}"
      onclick="${disabled ? '' : 'Screens._selectVote(' + i + ')'}">
      <div class="vote-radio"></div><span>${p.name}${i === voterIdx ? ' (TÚ)' : ''}${p.eliminated ? ' ❌' : ''}</span></div>`;
  }).join('');

  show(`
    <div class="screen" style="background:var(--bg-secondary);justify-content:flex-start;padding-top:var(--space-xl)">
      <h2 class="text-center">🗳 Votación</h2>
      <p class="subtitle">${voter.name}</p>
      <p class="text-center mt-md mb-md">¿Quién crees que es el impostor?</p>
      <div class="vote-list" id="vote-list">${items}</div>
      <div class="btn-hold mt-xl" id="vote-btn" style="opacity:0.4;pointer-events:none"
        ontouchstart="Screens._voteHoldStart(event)" ontouchend="Screens._voteHoldEnd(event)"
        onmousedown="Screens._voteHoldStart(event)" onmouseup="Screens._voteHoldEnd(event)"
        onmouseleave="Screens._voteHoldEnd(event)">
        <span>MANTÉN PULSADO PARA VOTAR</span>
        <span class="hold-label">Selecciona un jugador arriba</span>
        <div class="hold-progress" id="vote-progress"></div>
      </div>
    </div>
  `);
  GameEngine.setState({ selectedVote: null });
}

function _selectVote(index) {
  SoundSystem.onButtonPress();
  GameEngine.setState({ selectedVote: index });
  document.querySelectorAll('.vote-item').forEach(el => el.classList.toggle('selected', parseInt(el.dataset.index) === index));
  const btn = $('#vote-btn');
  btn.style.opacity = '1'; btn.style.pointerEvents = 'all';
  btn.querySelector('.hold-label').textContent = `Votar por ${GameEngine.state.players[index].name}`;
}

let _voteHoldAnim = null, _voteHoldStartT = 0;

function _voteHoldStart(e) {
  e.preventDefault();
  if (GameEngine.state.selectedVote === null) return;
  _voteHoldStartT = Date.now();
  const prog = $('#vote-progress');
  function animate() {
    const pct = Math.min(100, ((Date.now() - _voteHoldStartT) / 800) * 100);
    prog.style.width = pct + '%';
    if (pct >= 100) { SoundSystem.onVoteRegistered(); _confirmVote(); return; }
    _voteHoldAnim = requestAnimationFrame(animate);
  }
  _voteHoldAnim = requestAnimationFrame(animate);
}

function _voteHoldEnd(e) {
  e.preventDefault();
  cancelAnimationFrame(_voteHoldAnim);
  const prog = $('#vote-progress');
  if (prog) prog.style.width = '0%';
}

function _confirmVote() {
  const st = GameEngine.state;
  const voterIdx = GameEngine.getCurrentVotingPlayerIndex();
  GameEngine.registerVote(voterIdx, st.selectedVote);
  st.players[voterIdx].votedFor = st.selectedVote;
  st.votingIndex++;
  if (st.votingIndex >= st.votingOrder.length) votingReveal();
  else votingCortina();
}

// ==================== VOTING: REVEAL ====================
function votingReveal() {
  const st = GameEngine.state;
  const cards = st.votingOrder.map((voterIdx, i) => {
    const voter = st.players[voterIdx];
    const votedFor = st.players[st.votes[voterIdx]];
    return `<div class="vote-card" id="vote-card-${i}"><div class="vote-card-inner">
      <div class="vote-card-front">❓</div>
      <div class="vote-card-back"><div class="voter-name">${voter.name}</div><div class="voted-for">→ ${votedFor.name}</div></div>
    </div></div>`;
  }).join('');

  show(`
    <div class="screen" style="background:var(--bg-primary)">
      <div class="emoji-icon">🗳</div><h2 class="text-center">Resultados</h2>
      <div class="vote-results-grid mt-lg">${cards}</div>
      <button class="btn btn-primary mt-xl" id="reveal-btn" onclick="Screens._flipCards()">Revelar votos</button>
    </div>
  `);
}

function _flipCards() {
  SoundSystem.onResultsReveal();
  $('#reveal-btn').style.display = 'none';
  const cards = document.querySelectorAll('.vote-card');
  cards.forEach((c, i) => setTimeout(() => { c.classList.add('flipped'); SoundSystem.onButtonPress(); }, i * 300));
  setTimeout(() => {
    const res = GameEngine.tallyVotes();
    if (res.isTie) tiebreakScreen(res.topVoted);
    else eliminatedScreen(res.topVoted[0]);
  }, cards.length * 300 + 1500);
}

// ==================== TIEBREAK ====================
function tiebreakScreen(tiedIndices) {
  const names = tiedIndices.map(i => GameEngine.state.players[i].name).join(' vs ');
  show(`
    <div class="screen" style="background:var(--bg-primary)">
      <div class="emoji-icon">⚖️</div><h1 class="text-center">¡Empate!</h1>
      <div class="glass-card text-center mt-lg">
        <p style="font-size:var(--font-size-xl);font-weight:700">${names}</p>
        <p class="text-muted mt-md">Debate extra: 1 minuto. Luego se vuelve a votar solo entre los empatados</p>
      </div>
      <button class="btn btn-danger mt-xl" onclick="Screens._startTieVote([${tiedIndices}])">🗳 Volver a votar</button>
    </div>
  `);
}

function _startTieVote(tiedIndices) {
  SoundSystem.onButtonPress();
  const st = GameEngine.state;
  const active = st.players.map((_, i) => i).filter(i => !st.players[i].eliminated);
  GameEngine.shuffleArray(active);
  st.votingOrder = active; st.votingIndex = 0; st.votes = {}; st.selectedVote = null;
  st._tiedIndices = tiedIndices;
  votingCortina();
}

// ==================== ELIMINATED ====================
function eliminatedScreen(playerIndex) {
  GameEngine.resolveElimination(playerIndex);
  const player = GameEngine.state.players[playerIndex];
  const isInfiltrator = player.role === 'impostor' || player.role === 'misterioso';

  let badgeClass, badgeLabel;
  if (player.role === 'impostor') { badgeClass = 'impostor'; badgeLabel = '🕵️ IMPOSTOR'; }
  else if (player.role === 'misterioso') { badgeClass = 'impostor'; badgeLabel = '🔮 MISTERIOSO'; }
  else { badgeClass = 'citizen'; badgeLabel = '✅ CIUDADANO'; }

  show(`
    <div class="screen" style="background:var(--bg-primary)">
      <div class="emoji-icon animate-shake">🚫</div><h1 class="text-center">Eliminado</h1>
      <div class="glass-card text-center mt-lg animate-scale-in">
        <p style="font-size:var(--font-size-2xl);font-weight:800">${player.name}</p>
        <div class="mt-md"><span class="role-badge ${badgeClass}">${badgeLabel}</span></div>
      </div>
      <button class="btn btn-primary mt-xl animate-fade-in-up delay-3"
        onclick="SoundSystem.onButtonPress();Screens._afterElim(${playerIndex},'${player.role}')">Continuar</button>
    </div>
  `);
}

function _afterElim(playerIndex, role) {
  // Classic impostor eliminated → gets to guess the word
  if (role === 'impostor') {
    guessScreen(playerIndex);
  }
  // Misterioso eliminated → no guess, citizens win
  else if (role === 'misterioso') {
    victoryScreen('citizen_win');
  }
  // Citizen eliminated → infiltrators win
  else {
    victoryScreen('impostor_win_not_found');
  }
}

// ==================== GUESS (with Levenshtein validation) ====================
let _guessInterval = null, _guessHoldAnim = null, _guessHoldStartT = 0, _guessStartTime = 0;

function guessScreen(impostorIndex) {
  const player = GameEngine.state.players[impostorIndex];
  let timeLeft = GameEngine.state.guessTimeSeconds;
  _guessStartTime = Date.now();

  show(`
    <div class="screen" style="background:var(--bg-primary)">
      <div class="emoji-icon">🔮</div>
      <h2 class="text-center">Última oportunidad</h2>
      <p class="subtitle text-center">${player.name}, adivina la palabra</p>
      <div class="glass-card text-center mt-md"><div class="timer-display" id="guess-timer">${timeLeft}</div></div>
      <div class="guess-input-wrapper mt-lg">
        <input type="text" class="input-field" id="guess-input" placeholder="Escribe tu respuesta..."
          oninput="GameEngine.state.guessText=this.value" autocomplete="off">
      </div>
      <p class="text-muted text-center mt-sm" id="guess-hint">Se acepta con pequeños errores ortográficos</p>
      <div class="btn-hold mt-lg"
        ontouchstart="Screens._guessHoldStart(event)" ontouchend="Screens._guessHoldEnd(event)"
        onmousedown="Screens._guessHoldStart(event)" onmouseup="Screens._guessHoldEnd(event)"
        onmouseleave="Screens._guessHoldEnd(event)">
        <span>MANTÉN PULSADO PARA CONFIRMAR</span>
        <div class="hold-progress" id="guess-progress"></div>
      </div>
    </div>
  `);

  _guessInterval = setInterval(() => {
    timeLeft--;
    const el = $('#guess-timer');
    if (el) el.textContent = timeLeft;
    if (timeLeft <= 5 && timeLeft > 0) SoundSystem.onTimerTick();
    if (timeLeft <= 0) { clearInterval(_guessInterval); victoryScreen('citizen_win'); }
  }, 1000);
}

function _guessHoldStart(e) {
  e.preventDefault();
  _guessHoldStartT = Date.now();
  const prog = $('#guess-progress');
  function animate() {
    const pct = Math.min(100, ((Date.now() - _guessHoldStartT) / 800) * 100);
    prog.style.width = pct + '%';
    if (pct >= 100) {
      clearInterval(_guessInterval);
      // Use balance module's validateGuess (Levenshtein-tolerant)
      const result = GameEngine.checkGuessResult(GameEngine.state.guessText);
      victoryScreen(result.correct ? 'impostor_win_steal' : 'citizen_win');
      return;
    }
    _guessHoldAnim = requestAnimationFrame(animate);
  }
  _guessHoldAnim = requestAnimationFrame(animate);
}

function _guessHoldEnd(e) {
  e.preventDefault();
  cancelAnimationFrame(_guessHoldAnim);
  const prog = $('#guess-progress');
  if (prog) prog.style.width = '0%';
}

// ==================== VICTORY ====================
function victoryScreen(result) {
  const st = GameEngine.state;
  const scores = GameEngine.calculateRoundScores(result);
  const infiltrators = GameEngine.getInfiltrators();
  const infNames = infiltrators.map(p => {
    const icon = p.role === 'misterioso' ? '🔮' : '🕵️';
    return `${icon} ${p.name}`;
  }).join(', ');

  let title, emoji, color;
  if (result === 'citizen_win') { title = '¡Victoria de los Ciudadanos!'; emoji = '🏆'; color = 'var(--accent-success)'; }
  else if (result === 'impostor_win_steal') { title = '¡Robo de Victoria!'; emoji = '🎭'; color = 'var(--accent-danger)'; }
  else { title = '¡Victoria de los Infiltrados!'; emoji = '🕵️'; color = 'var(--accent-danger)'; }

  SoundSystem.onVictory();
  spawnConfetti();

  const scoreRows = scores.map(s => {
    const roleIcon = s.role === 'impostor' ? '🕵️' : s.role === 'misterioso' ? '🔮' : '✅';
    return `<div class="score-row">
    <span class="score-name">${roleIcon} ${s.name}</span><span class="score-detail">${s.detail}</span>
    <span class="score-points">${s.points >= 0 ? '+' : ''}${s.points}</span>
  </div>`;
  }).join('');

  show(`
    <div class="screen" style="background:var(--bg-primary);justify-content:flex-start;padding-top:var(--space-xl)">
      <div class="scroll-content">
        <div class="emoji-icon animate-pulse" style="font-size:4rem">${emoji}</div>
        <h1 class="text-center" style="color:${color}">${title}</h1>
        <p class="subtitle text-center mt-sm">Infiltrados: ${infNames}</p>
        <p class="subtitle text-center">Palabra: <strong>${st.currentWord}</strong>${st.impostorWord ? ` · Similar: <strong>${st.impostorWord}</strong>` : ''}</p>
        <div class="glass-card mt-lg"><h3 class="text-center mb-md">Puntos esta ronda</h3>${scoreRows}</div>
        <div class="btn-row mt-xl">
          <button class="btn btn-primary" onclick="SoundSystem.onButtonPress();Screens._nextRoundOrEnd()">
            ${st.currentRound < st.numRounds ? '🔁 Siguiente ronda' : '🏅 Ver resultados'}</button>
        </div>
        <button class="btn btn-ghost mt-md" onclick="SoundSystem.onButtonPress();Screens.mainMenu()">🏠 Menú principal</button>
      </div>
    </div>
  `);
}

function _nextRoundOrEnd() {
  const st = GameEngine.state;
  if (st.currentRound < st.numRounds) {
    st.currentRound++;
    GameEngine.setupRound();
    if (GameEngine.state.allImpostors) allImpostorsScreen();
    else dealingCortina();
  }
  else finalScores();
}

// ==================== FINAL SCORES ====================
function finalScores() {
  const rankings = GameEngine.getFinalRankings();
  const rows = rankings.map((r, i) => {
    const rc = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
    return `<div class="score-row ${i === 0 ? 'highlight' : ''}">
      <span class="score-rank ${rc}">${medal}</span><span class="score-name">${r.name}</span>
      <span class="score-points">${r.score} pts</span></div>`;
  }).join('');

  SoundSystem.onVictory();
  show(`
    <div class="screen" style="background:var(--bg-primary);justify-content:flex-start;padding-top:var(--space-xl)">
      <div class="scroll-content">
        <div class="emoji-icon animate-pulse" style="font-size:4rem">🏅</div>
        <h1 class="text-center">Resultados Finales</h1>
        <p class="text-muted">${GameEngine.state.numRounds} rondas completadas</p>
        <div class="glass-card mt-lg">${rows}</div>
        <div class="btn-row mt-xl">
          <button class="btn btn-primary" onclick="SoundSystem.onButtonPress();Screens.config()">🔁 Nueva partida</button>
          <button class="btn btn-ghost" onclick="SoundSystem.onButtonPress();Screens.mainMenu()">🏠 Menú</button>
        </div>
      </div>
    </div>
  `);
}

// ==================== CONFETTI ====================
function spawnConfetti() {
  const c = document.createElement('div'); c.className = 'confetti-container';
  document.body.appendChild(c);
  const colors = ['#6c5ce7', '#00cec9', '#ff6b6b', '#ffa726', '#66bb6a', '#a855f7', '#ffd700'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div'); p.className = 'confetti-piece';
    p.style.left = Math.random() * 100 + '%'; p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDelay = Math.random() * 2 + 's'; p.style.animationDuration = (2 + Math.random() * 2) + 's';
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    p.style.width = (6 + Math.random() * 8) + 'px'; p.style.height = (6 + Math.random() * 8) + 'px';
    c.appendChild(p);
  }
  setTimeout(() => c.remove(), 5000);
}

// ==================== PUBLIC API (window-accessible for onclick handlers) ====================
export const Screens = {
  splash, mainMenu, config, playerNames, settingsScreen, stats,
  dealingCortina, dealingReady, dealingReveal, dealingConfirm, debateScreen,
  votingAnnounce, votingCortina, votingSelect, votingReveal,
  tiebreakScreen, eliminatedScreen, guessScreen, victoryScreen, finalScores,
  allImpostorsScreen,
  _toggle, _selectCat, _adjPlayers, _adjTime, _adjRounds,
  _adjImpostors, _adjMisteriosos, _toggleRandom,
  _startGame, _viewAgain, _nextPlayer, _toggleTimer, _nextClue, _goToVoting,
  _selectVote, _voteHoldStart, _voteHoldEnd, _confirmVote, _flipCards,
  _startTieVote, _afterElim, _guessHoldStart, _guessHoldEnd, _nextRoundOrEnd,
  _holdStart, _holdEnd,
};
