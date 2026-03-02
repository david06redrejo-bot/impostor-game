#!/usr/bin/env python3
"""
export_pack.py — Exporta una categoría como pack JSON+gzip.
Uso: python scripts/export_pack.py "Animales" --output data/packs/animales_v1.json.gz
"""

import sqlite3, json, gzip, os, argparse, hashlib

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(BASE, "db", "impostor.db")


def export_pack(category_name: str, output_path: str, pack_version: int = 1):
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Obtener categoría
    cur.execute("SELECT * FROM categories WHERE name = ?", (category_name,))
    cat = cur.fetchone()
    if not cat:
        print(f"[✗] Categoría no encontrada: {category_name}")
        conn.close()
        return

    cat_id = cat["category_id"]

    # Obtener palabras
    cur.execute(
        "SELECT word_id, text, difficulty FROM words WHERE category_id = ?", (cat_id,)
    )
    words = cur.fetchall()
    word_ids = {w["word_id"] for w in words}

    # Obtener pares (donde ambas palabras pertenecen a esta categoría o al menos una)
    cur.execute(
        """SELECT sp.word_a_id, sp.word_b_id, sp.similarity, sp.tier,
                          wa.text as text_a, wb.text as text_b
                   FROM semantic_pairs sp
                   JOIN words wa ON sp.word_a_id = wa.word_id
                   JOIN words wb ON sp.word_b_id = wb.word_id
                   WHERE wa.category_id = ? OR wb.category_id = ?""",
        (cat_id, cat_id),
    )
    pairs = cur.fetchall()

    # Construir pack
    pack = {
        "pack_meta": {
            "pack_id": f"{category_name.lower().replace(' ', '_')}_v{pack_version}",
            "name": category_name,
            "version": pack_version,
            "language": "es",
            "is_free": not bool(cat["is_premium"]),
        },
        "categories": [
            {
                "name": cat["name"],
                "icon_emoji": cat["icon_emoji"],
                "sort_order": cat["sort_order"],
            }
        ],
        "words": [
            {
                "text": w["text"],
                "difficulty": w["difficulty"],
                "category": category_name,
            }
            for w in words
        ],
        "semantic_pairs": [
            {
                "word_a": p["text_a"],
                "word_b": p["text_b"],
                "similarity": p["similarity"],
                "tier": p["tier"],
            }
            for p in pairs
        ],
    }
    conn.close()

    # Escribir JSON + gzip
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    json_bytes = json.dumps(pack, ensure_ascii=False, indent=2).encode("utf-8")
    with gzip.open(output_path, "wb") as f:
        f.write(json_bytes)

    raw_kb = len(json_bytes) / 1024
    gz_kb = os.path.getsize(output_path) / 1024
    checksum = hashlib.md5(json_bytes).hexdigest()

    print(f"[✓] Pack exportado: {output_path}")
    print(f"    Palabras: {len(pack['words'])}, Pares: {len(pack['semantic_pairs'])}")
    print(
        f"    JSON: {raw_kb:.1f} KB → gzip: {gz_kb:.1f} KB ({(1 - gz_kb / raw_kb) * 100:.0f}% compresión)"
    )
    print(f"    Checksum: {checksum}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("category", help="Nombre de la categoría a exportar")
    parser.add_argument("--output", "-o", default=None, help="Ruta de salida .json.gz")
    parser.add_argument("--version", "-v", type=int, default=1)
    args = parser.parse_args()
    if not args.output:
        slug = (
            args.category.lower()
            .replace(" ", "_")
            .replace("á", "a")
            .replace("é", "e")
            .replace("í", "i")
            .replace("ó", "o")
            .replace("ú", "u")
        )
        args.output = os.path.join(
            BASE, "data", "packs", f"{slug}_v{args.version}.json.gz"
        )
    export_pack(args.category, args.output, args.version)
