const Levenshtein = require('levenshtein');
console.info(new Levenshtein('ab', 'bac').distance);
