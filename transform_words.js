const fs = require('fs');

const path = 'app/js/words.js';
let content = fs.readFileSync(path, 'utf8');

// The file exports WORD_DATABASE but we can't easily eval it if it has let/const without a module context.
// Actually, it's just 'const WORD_DATABASE = { ... }'
// We can extract the JSON part and modify it, or use regex.
// Regex might be simpler for this specific structure.

// Match { word: 'XYZ', pairs: ['A', 'B', 'C'] }
let idCounter = 1;
content = content.replace(/{ \s*word:\s*'([^']+)',\s*pairs:\s*\[([^\]]+)\]\s*}/g, (match, word, pairsStr) => {
    // Generate a random difficulty between 1 and 5
    const difficulty = Math.floor(Math.random() * 5) + 1;
    const id = `w_${idCounter.toString().padStart(3, '0')}`;
    idCounter++;

    // Parse pairs manually
    const pairs = pairsStr.split(',').map(s => s.trim().replace(/'/g, '')).filter(s => s);

    // Create new pairs format
    const newPairs = pairs.map((p, index) => {
        // Tiers A, B, C based on index
        const tier = index === 0 ? 'A' : (index === 1 ? 'B' : 'C');
        const similarity = index === 0 ? 0.88 : (index === 1 ? 0.72 : 0.60);
        return `{ word: '${p}', similarity: ${similarity}, tier: '${tier}' }`;
    });

    return `{ id: '${id}', text: '${word}', difficulty: ${difficulty}, pairs: [${newPairs.join(', ')}] }`;
});

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully transformed words.js');
