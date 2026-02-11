import { asciiToHtmlSimple, generateSimpleCSS } from './packages/core/src/simple.js';
import { writeFileSync } from 'fs';

// 幅77で統一したサンプルデータ（内部ボックス幅68、外部ボックス幅77）
const diagram = `
┌───────────────────────────────────────────────────────────────────────────┐
│              電子決済取引業者（G.U.Exchange）の役割                       │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   一般ユーザー                                                            │
│       │                                                                   │
│       │ 口座開設、チャージ、換金、送金                                    │
│       ▼                                                                   │
│   ┌────────────────────────────────────────────────────────────────┐      │
│   │  G.U.Exchange（電子決済取引業者）                              │      │
│   │                                                                │      │
│   │  【ライセンス】                                                │      │
│   │   ・電子決済取引業                                             │      │
│   │   ・暗号資産交換業                                             │      │
│   │                                                                │      │
│   │  【業務】                                                      │      │
│   │   ・ユーザー口座管理（KYC/AML）                                │      │
│   │   ・ステーブルコインの売買（チャージ/換金）                    │      │
│   │   ・信託会社への発行・償還申請                                 │      │
│   │   ・ユーザー間送金の仲介                                       │      │
│   └────────────────────────────────────────────────────────────────┘      │
│       │                                                                   │
│       │ 発行申請、償還申請                                                │
│       ▼                                                                   │
│   信託会社（受託者）                                                      │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
`.trim();

const html = asciiToHtmlSimple(diagram);
const css = generateSimpleCSS();

const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Simple ASCII Diagram</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@400&display=swap" rel="stylesheet">
  <style>
${css}
  </style>
</head>
<body style="padding: 2rem; background: #f0f0f0;">
  <h1>シンプルなASCII変換</h1>
  ${html}
</body>
</html>`;

writeFileSync('demo-simple.html', fullHtml);
console.log('Written to demo-simple.html');
