# El Impostor 🕵️‍♂️

**El Impostor** is an offline, pass-and-play social deduction party game designed for mobile devices. It brings the tension and strategy of classic hidden-role games directly to your hands, requiring only a single device shared among friends.

## Features ✨

*   **100% Offline & Pass-and-Play**: No required internet connection or multiple devices. Start a game anywhere, anytime.
*   **Dual Game Modes**:
    *   **Impostor Mode**: Citizens receive a secret word; the Impostor receives a blank screen. Will the Impostor guess the word, or will the citizens root them out?
    *   **Misterioso Mode**: Citizens receive a word; the Impostor receives a *semantically similar* word (e.g., "Dog" vs. "Wolf"). Perfect for deceit and subtle bluffs.
*   **Adaptive Difficulty (Invisible ELO)**: The game features a sophisticated, hidden mathematical balance engine that tracking wins and losses per player to silently adjust the frequency of complex words and the semantic distance between words.
*   **Secure Turn Transitions**: Designed with a "Hold-to-Reveal" mechanic ensuring that passing the phone prevents accidental glimpses of other players' roles.
*   **Zero-Overhead Netlify Deployment**: The entire game front-end runs purely on the browser (HTML, Vanilla CSS, JS with ES Modules) and can be dragged-and-dropped onto static hosts like Netlify.

## Tech Stack 🛠

*   **Frontend**: Vanilla JavaScript (ES6 Modules), CSS, and HTML5.
*   **Data & Balance**:
    *   Advanced balancing algorithms handling Impostor/Player ratios dynamically.
    *   Deterministic word pools embedded in a JSON structure handling complexity metrics (`difficulty`, `similarity`, and `tier`).
    *   *(Optional)* A Python setup script `scripts/init_db.py` is included for generating an SQLite database if the client application is ever ported to a native container.
*   **Storage**: Utilizes `localStorage` for transparent player statistic tracking and ELO persistence.

## How to Play 🎮

1.  **Select a Mode & Category**: Choose between the classic *Impostor* or *Misterioso* mode, and pick a thematic word category.
2.  **Pass and Play**: Players take turns entering their names and holding the screen to securely reveal their role and word.
3.  **Debate**: Everyone names one clue related to their word. The Impostor must blend in and deduce the real word.
4.  **Vote & Eliminate**: After a timed debate, the device is passed around to cast secret votes. The player with the most votes is eliminated!

## Deployment (Netlify) 🚀

The game is live and automatically deployed via Netlify integration with GitHub.

**Play now**: [https://impostorgame-1-2-3.netlify.app/](https://impostorgame-1-2-3.netlify.app/)

The project includes a `netlify.toml` file which automatically sets the publishing directory to `app/`. Any pushes to the `main` branch will automatically trigger a new build and deploy the game.
