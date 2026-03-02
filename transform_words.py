import re
import random

path = "app/js/words.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

id_counter = 1


def replace_word(match):
    global id_counter
    word = match.group(1)
    pairs_str = match.group(2)

    difficulty = random.randint(1, 5)
    word_id = f"w_{id_counter:03d}"
    id_counter += 1

    pairs = [p.strip().strip("'") for p in pairs_str.split(",") if p.strip()]

    new_pairs = []
    for i, p in enumerate(pairs):
        tier = "A" if i == 0 else ("B" if i == 1 else "C")
        similarity = 0.88 if i == 0 else (0.72 if i == 1 else 0.60)
        new_pairs.append(f"{{ word: '{p}', similarity: {similarity}, tier: '{tier}' }}")

    return f"{{ id: '{word_id}', text: '{word}', difficulty: {difficulty}, pairs: [{', '.join(new_pairs)}] }}"


pattern = r"\{\s*word:\s*'([^']+)',\s*pairs:\s*\[([^\]]+)\]\s*\}"
new_content = re.sub(pattern, replace_word, content)

with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully transformed words.js")
