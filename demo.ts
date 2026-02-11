import { asciiToHtml, generateCSS } from './packages/core/src/index.js';

// シンプルな図（ボックス → 矢印 → ボックス）
// 全角文字は幅2、▶は幅2なので、→（幅1）を使用
const simpleDiagram = `
┌────────────┐    ┌────────────┐
│  ユーザー  │───→│  Exchange  │
└────────────┘    └────────────┘
`;

// 複雑な図
const complexDiagram = `
┌─────────────────────────────────────────────────────┐
│         電子決済取引業者（G.U.Exchange）の役割        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  一般ユーザー                                        │
│      │                                              │
│      │ 口座開設、チャージ、換金、送金                 │
│      ▼                                              │
│  ┌─────────────────────────────────────────────┐   │
│  │     G.U.Exchange（電子決済取引業者）          │   │
│  │                                             │   │
│  │  【ライセンス】                              │   │
│  │  ・電子決済取引業                            │   │
│  │  ・暗号資産交換業                            │   │
│  │                                             │   │
│  │  【業務】                                    │   │
│  │  ・ユーザー口座管理（KYC/AML）               │   │
│  │  ・ステーブルコインの売買                    │   │
│  └─────────────────────────────────────────────┘   │
│      │                                              │
│      │ 発行申請、償還申請                           │
│      ▼                                              │
│  信託会社（受託者）                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
`;

const diagram = simpleDiagram;

console.log('=== ASCII Input ===');
console.log(diagram);

console.log('\n=== HTML Output ===');
const html = asciiToHtml(diagram);
console.log(html);

console.log('\n=== CSS ===');
const css = generateCSS();
console.log(css.substring(0, 500) + '...');

// Write a complete HTML file
const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ASCII Diagram Demo</title>
  <style>
${css}
  </style>
</head>
<body>
  <h1>ASCII Diagram Demo</h1>

  <h2>Rendered Output:</h2>
  ${html}

  <h2>Original ASCII:</h2>
  <pre>${diagram}</pre>
</body>
</html>`;

import { writeFileSync } from 'fs';
writeFileSync('demo-output.html', fullHtml);
console.log('\n=== Written to demo-output.html ===');
