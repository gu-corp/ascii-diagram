import { parse, asciiToHtml } from './packages/core/src/index.js';

const diagram = `
┌─────────────────────────────────────────────────────────────────────────┐
│              電子決済取引業者（G.U.Exchange）の役割                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   一般ユーザー                                                           │
│       │                                                                  │
│       │ 口座開設、チャージ、換金、送金                                   │
│       ▼                                                                  │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  G.U.Exchange（電子決済取引業者）                                │   │
│   │                                                                  │   │
│   │  【ライセンス】                                                  │   │
│   │   ・電子決済取引業                                               │   │
│   │   ・暗号資産交換業                                               │   │
│   │                                                                  │   │
│   │  【業務】                                                        │   │
│   │   ・ユーザー口座管理（KYC/AML）                                  │   │
│   │   ・ステーブルコインの売買（チャージ/換金）                      │   │
│   │   ・信託会社への発行・償還申請                                   │   │
│   │   ・ユーザー間送金の仲介                                         │   │
│   └────────────────────────────────────────────────────────────────┘   │
│       │                                                                  │
│       │ 発行申請、償還申請                                               │
│       ▼                                                                  │
│   信託会社（受託者）                                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
`.trim();

console.log('=== Input ===');
console.log(diagram);
console.log('\n');

console.log('=== Parsed Nodes ===');
const result = parse(diagram);
for (const node of result.nodes) {
  console.log(`${node.type}: x=${node.x}, y=${node.y}, w=${node.width}, h=${node.height}`);
  if (node.type === 'box') {
    console.log(`  text: "${(node as any).text.substring(0, 50)}..."`);
  }
}

console.log('\n=== HTML Output ===');
const html = asciiToHtml(diagram);
console.log(html);

// Write HTML file
import { writeFileSync } from 'fs';
import { generateCSS } from './packages/core/src/renderer/css.js';

const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Complex ASCII Diagram</title>
  <style>
${generateCSS()}
  </style>
</head>
<body>
  <h1>ASCII Diagram Test</h1>

  <h2>Rendered:</h2>
  ${html}

  <h2>Original:</h2>
  <pre style="font-family: monospace; line-height: 1.2;">${diagram}</pre>
</body>
</html>`;

writeFileSync('demo-complex.html', fullHtml);
console.log('\n=== Written to demo-complex.html ===');
