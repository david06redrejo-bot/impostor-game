#!/usr/bin/env python3
"""
init_db.py — Crea la base de datos SQLite de El Impostor con el esquema completo.

Uso:
  python scripts/init_db.py              # Crea db/impostor.db
  python scripts/init_db.py --force      # Sobreescribe si ya existe
"""

import sqlite3
import os
import sys
import argparse

# Ruta base del proyecto (un nivel arriba de /scripts/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "db", "impostor.db")

DDL = """
-- ============================================================
-- El Impostor — Schema DDL (SQLite 3.35+)
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA page_size = 4096;
PRAGMA auto_vacuum = INCREMENTAL;
PRAGMA foreign_keys = ON;

-- ---- Packs & Categorías ----

CREATE TABLE IF NOT EXISTS packs (
  pack_id       TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  version       INTEGER NOT NULL DEFAULT 1,
  is_free       INTEGER NOT NULL DEFAULT 0,
  size_bytes    INTEGER NOT NULL DEFAULT 0,
  checksum      TEXT,
  installed_at  INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS categories (
  category_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL UNIQUE,
  icon_emoji    TEXT,
  is_premium    INTEGER NOT NULL DEFAULT 0,
  pack_id       TEXT REFERENCES packs(pack_id),
  sort_order    INTEGER NOT NULL DEFAULT 0
);

-- ---- Contenido: Palabras y Pares ----

CREATE TABLE IF NOT EXISTS words (
  word_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id   INTEGER NOT NULL REFERENCES categories(category_id),
  text          TEXT NOT NULL,
  difficulty    INTEGER NOT NULL DEFAULT 3 CHECK(difficulty BETWEEN 1 AND 5),
  language      TEXT NOT NULL DEFAULT 'es',
  created_at    INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  UNIQUE(text, language)
);

CREATE TABLE IF NOT EXISTS semantic_pairs (
  pair_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  word_a_id     INTEGER NOT NULL REFERENCES words(word_id),
  word_b_id     INTEGER NOT NULL REFERENCES words(word_id),
  similarity    REAL NOT NULL CHECK(similarity BETWEEN 0.0 AND 1.0),
  tier          TEXT NOT NULL CHECK(tier IN ('A','B','C')),
  UNIQUE(word_a_id, word_b_id),
  CHECK(word_a_id < word_b_id)
);

-- ---- Jugadores ----

CREATE TABLE IF NOT EXISTS player_profiles (
  player_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  avatar_index  INTEGER NOT NULL DEFAULT 0,
  elo           INTEGER NOT NULL DEFAULT 1000,  -- Internal, never shown to player. Used by src/balance/elo_system.js
  games_played  INTEGER NOT NULL DEFAULT 0,
  games_won     INTEGER NOT NULL DEFAULT 0,
  games_lost    INTEGER NOT NULL DEFAULT 0,
  impostor_count INTEGER NOT NULL DEFAULT 0,
  citizen_count  INTEGER NOT NULL DEFAULT 0,
  vote_accuracy  REAL NOT NULL DEFAULT 0.0,
  win_streak     INTEGER NOT NULL DEFAULT 0,
  max_streak     INTEGER NOT NULL DEFAULT 0,
  total_points   INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- ---- Historial de Partidas ----

CREATE TABLE IF NOT EXISTS match_history (
  match_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  mode          TEXT NOT NULL CHECK(mode IN ('impostor','misterioso')),
  category_id   INTEGER REFERENCES categories(category_id),
  num_players   INTEGER NOT NULL CHECK(num_players BETWEEN 3 AND 12),
  played_at     INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  num_rounds    INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS match_rounds (
  round_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id      INTEGER NOT NULL REFERENCES match_history(match_id),
  word_id       INTEGER NOT NULL REFERENCES words(word_id),
  pair_word_id  INTEGER REFERENCES words(word_id),
  round_number  INTEGER NOT NULL,
  winner        TEXT CHECK(winner IN ('impostor','citizens'))
);

CREATE TABLE IF NOT EXISTS player_match_results (
  result_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id        INTEGER NOT NULL REFERENCES match_history(match_id),
  player_id       INTEGER NOT NULL REFERENCES player_profiles(player_id),
  role            TEXT NOT NULL CHECK(role IN ('impostor','citizen')),
  voted_correctly INTEGER NOT NULL DEFAULT 0,
  points_earned   INTEGER NOT NULL DEFAULT 0,
  was_eliminated  INTEGER NOT NULL DEFAULT 0,
  guessed_word    INTEGER NOT NULL DEFAULT 0
);

-- ---- Cooldowns (Anti-Repetición) ----

CREATE TABLE IF NOT EXISTS word_cooldowns (
  cooldown_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  word_id        INTEGER NOT NULL UNIQUE REFERENCES words(word_id),
  last_used_at   INTEGER NOT NULL,
  use_count      INTEGER NOT NULL DEFAULT 1,
  cooldown_until INTEGER NOT NULL
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_words_category    ON words(category_id, word_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_words_text ON words(text, language);
CREATE INDEX IF NOT EXISTS idx_pairs_word_a      ON semantic_pairs(word_a_id, tier);
CREATE INDEX IF NOT EXISTS idx_pairs_word_b      ON semantic_pairs(word_b_id, tier);
CREATE INDEX IF NOT EXISTS idx_pairs_tier        ON semantic_pairs(tier, similarity DESC);
CREATE INDEX IF NOT EXISTS idx_cooldown_word     ON word_cooldowns(word_id);
CREATE INDEX IF NOT EXISTS idx_match_played      ON match_history(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_match     ON player_match_results(match_id);
CREATE INDEX IF NOT EXISTS idx_results_player    ON player_match_results(player_id);
"""


def init_db(force: bool = False):
    """Crea la base de datos con el esquema completo."""
    if os.path.exists(DB_PATH):
        if force:
            os.remove(DB_PATH)
            print(f"[✓] Base de datos anterior eliminada: {DB_PATH}")
        else:
            print(f"[!] La base de datos ya existe: {DB_PATH}")
            print("    Usa --force para sobreescribir.")
            return False

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(DDL)
    conn.close()

    size_kb = os.path.getsize(DB_PATH) / 1024
    print(f"[✓] Base de datos creada: {DB_PATH} ({size_kb:.1f} KB)")
    print(f"[✓] 9 tablas + 9 índices creados correctamente.")
    return True


def verify_schema():
    """Verifica que todas las tablas e índices existen."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Verificar tablas
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [row[0] for row in cursor.fetchall()]

    expected_tables = [
        "categories",
        "match_history",
        "match_rounds",
        "packs",
        "player_match_results",
        "player_profiles",
        "semantic_pairs",
        "word_cooldowns",
        "words",
    ]

    print("\n--- Verificación de Schema ---")
    for t in expected_tables:
        status = "✓" if t in tables else "✗"
        print(f"  [{status}] Tabla: {t}")

    # Verificar índices
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name"
    )
    indexes = [row[0] for row in cursor.fetchall()]

    expected_indexes = [
        "idx_cooldown_word",
        "idx_match_played",
        "idx_pairs_tier",
        "idx_pairs_word_a",
        "idx_pairs_word_b",
        "idx_results_match",
        "idx_results_player",
        "idx_words_category",
        "idx_words_text",
    ]

    for i in expected_indexes:
        status = "✓" if i in indexes else "✗"
        print(f"  [{status}] Índice: {i}")

    conn.close()
    all_ok = all(t in tables for t in expected_tables) and all(
        i in indexes for i in expected_indexes
    )
    print(
        f"\n{'[✓] Schema completo verificado.' if all_ok else '[✗] Schema incompleto!'}"
    )
    return all_ok


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Inicializa la BD de El Impostor")
    parser.add_argument(
        "--force", action="store_true", help="Sobreescribir BD existente"
    )
    args = parser.parse_args()

    if init_db(force=args.force):
        verify_schema()
