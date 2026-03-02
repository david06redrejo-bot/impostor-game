#!/usr/bin/env python3
"""
validate_pairs.py — Valida la cobertura y calidad de los pares semánticos.
Uso: python scripts/validate_pairs.py
"""

import sqlite3, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(BASE, "db", "impostor.db")


def validate():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    print("=" * 60)
    print("  VALIDACIÓN DE PARES SEMÁNTICOS — El Impostor")
    print("=" * 60)

    # 1. Palabras sin pares (no pueden usarse en modo Misterioso)
    cur.execute("""
        SELECT w.word_id, w.text, c.name
        FROM words w
        JOIN categories c ON w.category_id = c.category_id
        WHERE NOT EXISTS (
            SELECT 1 FROM semantic_pairs sp
            WHERE sp.word_a_id = w.word_id OR sp.word_b_id = w.word_id
        )
        ORDER BY c.name, w.text
    """)
    orphans = cur.fetchall()
    print(
        f"\n[{'✗' if orphans else '✓'}] Palabras SIN pares semánticos: {len(orphans)}"
    )
    if orphans:
        by_cat = {}
        for _, text, cat in orphans:
            by_cat.setdefault(cat, []).append(text)
        for cat, words in sorted(by_cat.items()):
            print(
                f"    {cat} ({len(words)}): {', '.join(words[:10])}{'...' if len(words) > 10 else ''}"
            )

    # 2. Palabras con pocos pares (<2)
    cur.execute("""
        SELECT w.text, c.name, COUNT(*) as cnt
        FROM words w
        JOIN categories c ON w.category_id = c.category_id
        JOIN (
            SELECT word_a_id as wid FROM semantic_pairs
            UNION ALL
            SELECT word_b_id FROM semantic_pairs
        ) sp ON sp.wid = w.word_id
        GROUP BY w.word_id
        HAVING cnt < 2
        ORDER BY cnt, c.name
    """)
    low_pairs = cur.fetchall()
    print(f"\n[{'!' if low_pairs else '✓'}] Palabras con < 2 pares: {len(low_pairs)}")

    # 3. Distribución por tier
    cur.execute(
        "SELECT tier, COUNT(*), AVG(similarity) FROM semantic_pairs GROUP BY tier ORDER BY tier"
    )
    tiers = cur.fetchall()
    print(f"\n--- Distribución por Tier ---")
    for tier, cnt, avg_sim in tiers:
        label = {"A": "Muy similar", "B": "Similar", "C": "Vagamente similar"}.get(
            tier, tier
        )
        print(f"    Tier {tier} ({label}): {cnt} pares, similitud media: {avg_sim:.2f}")

    # 4. Cobertura por categoría
    cur.execute("""
        SELECT c.name, 
               COUNT(DISTINCT w.word_id) as total_words,
               COUNT(DISTINCT CASE WHEN sp.wid IS NOT NULL THEN w.word_id END) as words_with_pairs
        FROM categories c
        JOIN words w ON w.category_id = c.category_id
        LEFT JOIN (
            SELECT word_a_id as wid FROM semantic_pairs
            UNION SELECT word_b_id FROM semantic_pairs
        ) sp ON sp.wid = w.word_id
        WHERE c.is_premium = 0
        GROUP BY c.category_id
        ORDER BY c.sort_order
    """)
    coverage = cur.fetchall()
    print(f"\n--- Cobertura por Categoría (gratuitas) ---")
    for name, total, with_pairs in coverage:
        pct = (with_pairs / total * 100) if total > 0 else 0
        bar = "█" * int(pct / 5) + "░" * (20 - int(pct / 5))
        print(f"    {name:25s} {with_pairs:3d}/{total:3d} ({pct:5.1f}%) {bar}")

    # 5. Resumen
    cur.execute("SELECT COUNT(*) FROM words")
    tw = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM semantic_pairs")
    tp = cur.fetchone()[0]
    ratio = tp / tw if tw > 0 else 0
    print(f"\n--- Resumen ---")
    print(f"    Total palabras:     {tw}")
    print(f"    Total pares:        {tp}")
    print(f"    Ratio pares/palabra: {ratio:.1f} (objetivo: ≥ 3.0)")
    print(
        f"    {'[✓] Ratio aceptable' if ratio >= 2 else '[!] Se necesitan más pares'}"
    )

    db_size = os.path.getsize(DB) / 1024
    print(f"    Tamaño BD:          {db_size:.1f} KB")

    conn.close()


if __name__ == "__main__":
    validate()
