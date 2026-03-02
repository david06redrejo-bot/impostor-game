#!/usr/bin/env python3
"""
seed_data.py — Puebla la BD desde data/seed/base_pack.json (fuente de verdad única).
Uso: python scripts/seed_data.py
"""

import sqlite3, json, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(BASE, "db", "impostor.db")
PACK = os.path.join(BASE, "data", "seed", "base_pack.json")


def run():
    if not os.path.exists(DB):
        print(
            f"[✗] BD no encontrada: {DB}\n    Ejecuta primero: python scripts/init_db.py"
        )
        return
    if not os.path.exists(PACK):
        print(
            f"[✗] Pack no encontrado: {PACK}\n    Ejecuta primero: python scripts/generate_base_pack.py"
        )
        return

    pack = json.load(open(PACK, encoding="utf-8"))
    meta = pack["pack_meta"]

    conn = sqlite3.connect(DB)
    conn.execute("PRAGMA foreign_keys = ON")
    cur = conn.cursor()

    # 1. Pack record
    cur.execute(
        "INSERT OR IGNORE INTO packs VALUES (?,?,?,?,0,NULL,strftime('%s','now'))",
        (
            meta["pack_id"],
            meta["name"],
            meta["version"],
            int(meta.get("is_free", True)),
        ),
    )

    # 2. Categories
    cat_map = {}
    for c in pack["categories"]:
        cur.execute(
            """INSERT OR IGNORE INTO categories (name,icon_emoji,is_premium,pack_id,sort_order)
                       VALUES (?,?,?,?,?)""",
            (
                c["name"],
                c["icon_emoji"],
                int(c.get("is_premium", False)),
                meta["pack_id"],
                c["sort_order"],
            ),
        )
        cur.execute("SELECT category_id FROM categories WHERE name=?", (c["name"],))
        cat_map[c["name"]] = cur.fetchone()[0]
    print(f"[✓] {len(cat_map)} categorías")

    # 3. Words
    wc = 0
    for w in pack["words"]:
        cid = cat_map.get(w["category"])
        if not cid:
            continue
        cur.execute(
            """INSERT OR IGNORE INTO words (category_id,text,difficulty,language)
                       VALUES (?,?,?,'es')""",
            (cid, w["text"], w.get("difficulty", 3)),
        )
        wc += 1
    conn.commit()
    print(f"[✓] {wc} palabras")

    # 4. Build text→id map
    cur.execute("SELECT word_id, text FROM words")
    wmap = {r[1]: r[0] for r in cur.fetchall()}

    # 5. Semantic pairs
    pc, sk = 0, 0
    for p in pack["semantic_pairs"]:
        aid, bid = wmap.get(p["word_a"]), wmap.get(p["word_b"])
        if not aid or not bid:
            sk += 1
            continue
        lo, hi = min(aid, bid), max(aid, bid)
        cur.execute(
            """INSERT OR IGNORE INTO semantic_pairs (word_a_id,word_b_id,similarity,tier)
                       VALUES (?,?,?,?)""",
            (lo, hi, p["similarity"], p["tier"]),
        )
        pc += 1
    conn.commit()
    print(f"[✓] {pc} pares semánticos ({sk} omitidos)")

    # Summary
    cur.execute("SELECT COUNT(*) FROM words")
    tw = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM semantic_pairs")
    tp = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM categories")
    tc = cur.fetchone()[0]
    db_kb = os.path.getsize(DB) / 1024
    print(
        f"\n--- Resumen ---\n  Categorías: {tc}\n  Palabras: {tw}\n  Pares: {tp}\n  BD: {db_kb:.1f} KB"
    )
    conn.close()


if __name__ == "__main__":
    run()
