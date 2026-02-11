# ascii-diagram 要件定義書

**バージョン**: 0.1.0
**更新日**: 2026-02-11
**ステータス**: Draft
**リポジトリ**: `gu-corp/ascii-diagram`

---

## 1. 概要

### 1.1 目的

Markdown内のASCIIアート図をHTML/CSSに自動変換し、きれいな図として表示するツール。Mermaidと同様の開発者体験を提供する。

### 1.2 背景

- 技術ドキュメントでASCIIアートの図が多用されている
- 既存ツール（svgbob等）は日本語対応が弱い
- Mermaidは記法の学習コストがある
- ASCIIアートはテキストエディタで直感的に編集可能

### 1.3 ゴール

```
┌──────────────────────────────────────────────────────────┐
│  Markdownソース        →        レンダリング結果          │
│                                                          │
│  ```ascii                       ┌─────────┐              │
│  ┌─────────┐                    │ ユーザー │              │
│  │ ユーザー │                    └─────────┘              │
│  └─────────┘                    (きれいなHTML/CSS)        │
│  ```                                                     │
└──────────────────────────────────────────────────────────┘
```

---

## 2. ターゲットユーザー

| ユーザー | ニーズ |
|---------|--------|
| テクニカルライター | ドキュメントに図を入れたい |
| エンジニア | 仕様書・設計書の作成 |
| プロダクトマネージャー | 業務フロー図の作成 |

### 2.1 ユーザーストーリー

1. **US-01**: ユーザーとして、Markdown内にASCIIで書いた図を、そのままきれいな図として表示したい
2. **US-02**: ユーザーとして、日本語を含む図を正しく表示したい
3. **US-03**: ユーザーとして、Mermaidと同じように```ascii```ブロックで図を書きたい
4. **US-04**: ユーザーとして、ダークモード対応した図を表示したい
5. **US-05**: ユーザーとして、図内のテキストを選択・コピーしたい

---

## 3. 機能要件

### 3.1 対応図形

#### Phase 1（MVP）

| 図形 | ASCII表現 | 優先度 |
|------|-----------|:------:|
| ボックス（角） | `┌ ┐ └ ┘` | 高 |
| ボックス（線） | `─ │` | 高 |
| ボックス（ASCII） | `+ - \|` | 高 |
| 矢印（横） | `→ ← ─▶ ◀─ -->` | 高 |
| テキスト | 任意の文字列 | 高 |

#### Phase 2

| 図形 | ASCII表現 | 優先度 |
|------|-----------|:------:|
| 矢印（縦） | `↑ ↓ ▲ ▼` | 中 |
| 分岐 | `├ ┤ ┬ ┴ ┼` | 中 |
| 二重線 | `═ ║ ╔ ╗ ╚ ╝` | 中 |
| 角丸ボックス | `╭ ╮ ╯ ╰` | 中 |

#### Phase 3

| 図形 | ASCII表現 | 優先度 |
|------|-----------|:------:|
| 斜め線 | `/ \` | 低 |
| 点線 | `┄ ┆ ╌ ╎` | 低 |
| 網掛け | `░ ▒ ▓` | 低 |

### 3.2 入力形式

````markdown
```ascii
┌─────────────┐     ┌─────────────┐
│   ユーザー   │────▶│   Exchange  │
└─────────────┘     └─────────────┘
```
````

### 3.3 出力形式

```html
<div class="ascii-diagram">
  <div class="ascii-row">
    <div class="ascii-box">ユーザー</div>
    <div class="ascii-connector">
      <div class="ascii-line"></div>
      <div class="ascii-arrow">▶</div>
    </div>
    <div class="ascii-box">Exchange</div>
  </div>
</div>
```

### 3.4 スタイリング

```css
/* デフォルトテーマ */
.ascii-diagram {
  --ascii-border-color: #333;
  --ascii-bg-color: #fff;
  --ascii-text-color: #333;
}

/* ダークモード */
.dark .ascii-diagram {
  --ascii-border-color: #ccc;
  --ascii-bg-color: #1a1a1a;
  --ascii-text-color: #eee;
}
```

---

## 4. 非機能要件

### 4.1 パフォーマンス

| 項目 | 要件 |
|------|------|
| 変換速度 | 100行以下のASCII図を50ms以内に変換 |
| バンドルサイズ | core パッケージ 20KB以下（gzip） |

### 4.2 互換性

| 項目 | 要件 |
|------|------|
| Node.js | 18.x 以上 |
| ブラウザ | Chrome/Firefox/Safari/Edge 最新2バージョン |
| フレームワーク | Nextra, Docusaurus, VitePress, Astro |

### 4.3 多言語対応

| 項目 | 要件 |
|------|------|
| 日本語 | 全角文字の幅を正しく計算 |
| CJK | 中国語・韓国語も対応 |
| RTL | 将来対応（Phase 3以降） |

### 4.4 アクセシビリティ

| 項目 | 要件 |
|------|------|
| テキスト | 選択・コピー可能 |
| スクリーンリーダー | 適切なaria-label |
| キーボード | フォーカス対応 |

---

## 5. 技術スタック

### 5.1 言語・ランタイム

| 項目 | 選定 | 理由 |
|------|------|------|
| 言語 | TypeScript | エコシステム、型安全 |
| ランタイム | Node.js 18+ | LTS |
| パッケージ管理 | pnpm | 高速、ワークスペース対応 |

### 5.2 依存ライブラリ

| ライブラリ | 用途 |
|-----------|------|
| `string-width` | 全角文字幅計算 |
| `unified` | Markdown処理基盤 |
| `unist-util-visit` | AST走査 |

### 5.3 開発ツール

| ツール | 用途 |
|--------|------|
| Vitest | テスト |
| tsup | ビルド |
| Turborepo | モノレポ管理 |
| Changesets | バージョン管理 |

---

## 6. パッケージ構成

```
ascii-diagram/
├── packages/
│   ├── core/                 # コアライブラリ
│   │   ├── src/
│   │   │   ├── parser/       # ASCIIパーサー
│   │   │   │   ├── tokenizer.ts
│   │   │   │   ├── analyzer.ts
│   │   │   │   └── unicode.ts
│   │   │   ├── renderer/     # HTML生成
│   │   │   │   ├── html.ts
│   │   │   │   └── css.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── remark-plugin/        # remarkプラグイン
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── demo/                 # デモサイト
│       ├── src/
│       └── package.json
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 7. API設計

### 7.1 Core API

```typescript
import { parse, render } from '@gu-corp/ascii-diagram';

// ASCIIをパースしてASTを取得
const ast = parse(`
┌─────────┐
│  Hello  │
└─────────┘
`);

// ASTをHTMLに変換
const html = render(ast);

// 一括変換
const html = asciiToHtml(asciiString, options);
```

### 7.2 Remark Plugin

```javascript
// next.config.mjs
import remarkAsciiDiagram from '@gu-corp/remark-ascii-diagram';

const withNextra = nextra({
  mdxOptions: {
    remarkPlugins: [remarkAsciiDiagram]
  }
});
```

### 7.3 Options

```typescript
interface AsciiDiagramOptions {
  // テーマ
  theme?: 'light' | 'dark' | 'auto';

  // CSSクラスプレフィックス
  classPrefix?: string;

  // インラインスタイル出力
  inlineStyles?: boolean;

  // フォント設定
  fontFamily?: string;
}
```

---

## 8. マイルストーン

### Phase 1: MVP（2週間）

- [ ] プロジェクトセットアップ（モノレポ構成）
- [ ] 基本パーサー（ボックス認識）
- [ ] HTMLレンダラー（基本形）
- [ ] 日本語対応（全角幅計算）
- [ ] remarkプラグイン
- [ ] デモサイト

### Phase 2: 機能拡充（2週間）

- [ ] 矢印・コネクター対応
- [ ] 分岐対応
- [ ] ダークモード
- [ ] テーマカスタマイズ
- [ ] Docusaurusプラグイン

### Phase 3: 高度な機能（将来）

- [ ] 斜め線対応
- [ ] SVG出力オプション
- [ ] AI補助（曖昧なパターン認識）
- [ ] エディタ拡張（VS Code）

---

## 9. 競合分析

| ツール | 日本語 | HTML出力 | remark対応 | 保守状況 |
|--------|:------:|:--------:|:----------:|:--------:|
| svgbob | ✗ | ✗ (SVG) | △ | 活発 |
| asciidoctor-diagram | △ | ✗ | ✗ | 活発 |
| ditaa | △ | ✗ (PNG) | ✗ | 停滞 |
| **ascii-diagram** | ◎ | ◎ | ◎ | - |

---

## 10. 成功指標

| 指標 | 目標 |
|------|------|
| npm ダウンロード | 1,000/月（6ヶ月後） |
| GitHub スター | 100（6ヶ月後） |
| ドキュメントサイト導入 | 5サイト |

---

## 変更履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|------|---------|--------|
| 0.1.0 | 2026-02-11 | 初版作成 | - |
