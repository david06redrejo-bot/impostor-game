/* ============================================================
   EL IMPOSTOR — Sound & Haptic Feedback System (ES Module)
   ============================================================ */

let audioCtx = null;
let enabled = true;
let vibrationEnabled = true;

function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.15) {
    if (!enabled) return;
    try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration);
    } catch (e) { }
}

function playMultiTone(notes, type = 'sine', volume = 0.12, dur = 0.15, gap = 0.1) {
    if (!enabled) return;
    try {
        const ctx = getCtx();
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * gap);
            gain.gain.setValueAtTime(volume, ctx.currentTime + i * gap);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * gap + dur);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * gap);
            osc.stop(ctx.currentTime + i * gap + dur);
        });
    } catch (e) { }
}

function vibrate(pattern) {
    if (!vibrationEnabled) return;
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { }
}

export const SoundSystem = {
    init() { getCtx(); },
    setSoundEnabled(val) { enabled = val; },
    setVibrationEnabled(val) { vibrationEnabled = val; },
    isSoundEnabled() { return enabled; },
    isVibrationEnabled() { return vibrationEnabled; },

    onButtonPress() { playTone(800, 0.05, 'square', 0.08); vibrate(30); },
    onReveal() { playMultiTone([523, 659], 'sine', 0.15, 0.2, 0.08); vibrate([50, 50, 50]); },
    onHide() { playTone(330, 0.08, 'sine', 0.1); vibrate(30); },
    onConfirmPass() {
        // Whoosh-like noise burst
        if (enabled) try {
            const ctx = getCtx();
            const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
            const src = ctx.createBufferSource();
            const f = ctx.createBiquadFilter();
            const g = ctx.createGain();
            src.buffer = buf; f.type = 'bandpass';
            f.frequency.setValueAtTime(2000, ctx.currentTime);
            f.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
            g.gain.setValueAtTime(0.15, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
        } catch (e) { }
        vibrate([50, 50, 50]);
    },
    onVoteRegistered() { playMultiTone([523, 659, 784], 'sine'); vibrate(150); },
    onResultsReveal() {
        if (enabled) try {
            const ctx = getCtx();
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.5);
            g.gain.setValueAtTime(0.1, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
        } catch (e) { }
        vibrate([50, 100, 150]);
    },
    onVictory() { playMultiTone([523, 659, 784, 1047], 'triangle', 0.15, 0.4, 0.15); vibrate([50, 100, 150]); },
    onTimerTick() { playTone(1000, 0.03, 'square', 0.06); },
    onTimerWarning() { playTone(1000, 0.03, 'square', 0.06); vibrate(30); },
    onError() { playMultiTone([300, 250], 'square', 0.1, 0.12, 0.12); vibrate([100, 50, 100]); },
};
