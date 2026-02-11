import { parse } from './packages/core/src/index.js';
import { tokenize } from './packages/core/src/parser/tokenizer.js';

const diagram = `
┌────────────┐    ┌────────────┐
│  ユーザー  │───→│  Exchange  │
└────────────┘    └────────────┘
`.trim();

console.log('Input:');
console.log(diagram);
console.log('\n');

// Check tokens on first row
const lines = diagram.split('\n');
const tokens = tokenize(lines);

console.log('First row tokens (corners):');
tokens[0].filter(t => t.type.includes('corner')).forEach(t => {
  console.log(`  char="${t.char}" type=${t.type} col=${t.col}`);
});

console.log('\nAll first row tokens:');
tokens[0].forEach(t => {
  console.log(`  char="${t.char}" type=${t.type} col=${t.col} width=${t.width}`);
});

// Check all tokens on row 1
console.log('\nRow 1 all tokens:');
tokens[1].forEach(t => {
  console.log(`  col=${t.col}: "${t.char}" type=${t.type} width=${t.width}`);
});

console.log('\n');
const result = parse(diagram);
console.log('Parsed nodes:');
for (const node of result.nodes) {
  console.log(JSON.stringify(node, null, 2));
}
