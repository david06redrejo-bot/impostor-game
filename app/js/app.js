/* ============================================================
   EL IMPOSTOR — App Entry Point (ES Module)
   ============================================================ */

import { GameEngine } from './game.js';
import { SoundSystem } from './sounds.js';
import { Screens } from './screens.js';

// Expose to window for onclick handlers in HTML templates
window.GameEngine = GameEngine;
window.SoundSystem = SoundSystem;
window.Screens = Screens;

document.addEventListener('DOMContentLoaded', () => {
    GameEngine.loadSettings();

    // Prevent touch moves on hold zones
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.reveal-zone, .btn-hold')) e.preventDefault();
    }, { passive: false });

    // Hide sensitive info when app goes to background
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            const st = GameEngine.state;
            if (st.dealingState === 'reveal') Screens.dealingReady();
        }
    });

    // Prevent double-tap zoom on iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) e.preventDefault();
        lastTouchEnd = now;
    }, false);

    Screens.splash();
});
