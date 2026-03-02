#!/usr/bin/env python3
"""
import_pack.py — Importa un pack JSON+gzip a la BD con merge incremental.
Uso: python scripts/import_pack.py data/packs/ciencia_tech_v1.json.gz
"""

import sqlite3, json, gzip, os, argparse

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(BASE, "db", "impostor.db")


def import_pack(pack_path: str):
    if not os.path.exists(pack_path):
        print(f"[✗] Archivo no encontrado: {pack_path}")
        return

    # Leer y descomprimir
    with gzip.open(pack_path, "rb") as f:
        pack = json.loads(f.read().decode("utf-8"))

    meta = pack["pack_meta"]
    print(f"[i] Importando pack: {meta['name']} v{meta['version']}")

    conn = sqlite3.connect(DB)
    conn.execute("PRAGMA foreign_keys = ON")
    cur = conn.cursor()

    try:
        cur.execute("BEGIN TRANSACTION")

        # 1. Upsert pack
        cur.execute(
            """INSERT INTO packs (pack_id, name, version, is_free, size_bytes)
                       VALUES (?, ?, ?, ?, ?)
                       ON CONFLICT(pack_id) DO UPDATE SET
                         version = excluded.version, name = excluded.name""",
            (
                meta["pack_id"],
                meta["name"],
                meta["version"],
                int(meta.get("is_free", False)),
                os.path.getsize(pack_path),
            ),
        )

        # 2. Upsert categorías
        for cat in pack.get("categories", []):
            cur.execute(
                """INSERT INTO categories (name, icon_emoji, is_premium, pack_id, sort_order)
                           VALUES (?, ?, ?, ?, ?)
                           ON CONFLICT(name) DO UPDATE SET
                             icon_emoji=excluded.icon_emoji, sort_order=excluded.sort_order""",
                (
                    cat["name"],
                    cat.get("icon_emoji"),
                    int(not meta.get("is_free", False)),
                    meta["pack_id"],
                    cat.get("sort_order", 0),
                ),
            )

        # 3. Upsert palabras
        word_count = 0
        for w in pack.get("words", []):
            cat_name = w.get(
                "category",
                pack["categories"][0]["name"] if pack.get("categories") else None,
            )
            cur.execute("SELECT category_id FROM categories WHERE name=?", (cat_name,))
            row = cur.fetchone()
            if not row:
                continue
            cur.execute(
                """INSERT INTO words (category_id, text, difficulty, language)
                           VALUES (?, ?, ?, 'es')
                           ON CONFLICT(text, language) DO UPDATE SET
                             difficulty=excluded.difficulty, category_id=excluded.category_id""",
                (row[0], w["text"], w.get("difficulty", 3)),
            )
            word_count += 1

        # 4. Insertar pares semánticos
        pair_count = 0
        for p in pack.get("semantic_pairs", []):
            cur.execute(
                "SELECT word_id FROM words WHERE text=? AND language='es'",
                (p["word_a"],),
            )
            a = cur.fetchone()
            cur.execute(
                "SELECT word_id FROM words WHERE text=? AND language='es'",
                (p["word_b"],),
            )
            b = cur.fetchone()
            if not a or not b:
                continue
            lo, hi = min(a[0], b[0]), max(a[0], b[0])
            cur.execute(
                """INSERT INTO semantic_pairs (word_a_id, word_b_id, similarity, tier)
                           VALUES (?, ?, ?, ?)
                           ON CONFLICT(word_a_id, word_b_id) DO UPDATE SET
                             similarity=excluded.similarity, tier=excluded.tier""",
                (lo, hi, p["similarity"], p["tier"]),
            )
            pair_count += 1

        conn.commit()
        print(f"[✓] Importación completada: {word_count} palabras, {pair_count} pares")
        print(f"    ⚠️ Estadísticas de jugador y historial NO fueron tocados.")

    except Exception as e:
        conn.rollback()
        print(f"[✗] Error durante importación, rollback ejecutado: {e}")
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("pack_file", help="Ruta al archivo .json.gz del pack")
    args = parser.parse_args()
    import_pack(args.pack_file)
