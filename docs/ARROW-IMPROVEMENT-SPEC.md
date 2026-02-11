# Arrow Improvement Specification

**Version**: 1.0.0
**Date**: 2026-02-11
**Status**: Draft

---

## 1. 現状の課題

### 1.1 未対応の矢印文字

| 文字 | 説明 | 現状 |
|------|------|------|
| ↕ | 上下双方向矢印 | ❌ 未対応 |
| ↔ | 左右双方向矢印 | ❌ 未対応 |
| ⇄ | 左右交換矢印 | ❌ 未対応 |
| ⇅ | 上下交換矢印 | ❌ 未対応 |

### 1.2 線と矢印の接続

現状、以下のパターンが正しく認識されない：

```
─→   (水平線 + 右矢印)
│↓   (垂直線 + 下矢印)
├──→ (分岐線 + 矢印)
```

### 1.3 レンダリングの問題

- CSSの`content`プロパティで矢印を描画しているため、サイズ調整が困難
- 線と矢印が視覚的に接続していない
- フォントによって矢印の見た目が異なる

---

## 2. 改善仕様

### 2.1 追加する矢印タイプ

#### TokenType追加

```typescript
export type TokenType =
  // ... existing types ...
  | 'arrow-right'      // → ▶ >
  | 'arrow-left'       // ← ◀ <
  | 'arrow-up'         // ↑ ▲ ^
  | 'arrow-down'       // ↓ ▼ v
  | 'arrow-bidirectional-h'  // ↔ ⇄ (NEW)
  | 'arrow-bidirectional-v'  // ↕ ⇅ (NEW)
```

#### 文字マッピング追加

```typescript
const CHAR_MAP: Record<string, TokenType> = {
  // ... existing mappings ...

  // Bidirectional arrows
  '↕': 'arrow-bidirectional-v',
  '⇅': 'arrow-bidirectional-v',
  '↔': 'arrow-bidirectional-h',
  '⇄': 'arrow-bidirectional-h',
};
```

### 2.2 ArrowNode型の拡張

```typescript
export interface ArrowNode extends BaseNode {
  type: 'arrow';
  direction: 'left' | 'right' | 'up' | 'down' | 'bidirectional-h' | 'bidirectional-v';
  style: 'solid' | 'dashed';
  headStyle: 'filled' | 'open' | 'none';
  label?: string;

  // NEW: 接続情報
  connection?: {
    from?: 'line' | 'box' | 'none';  // 矢印の始点に接続するもの
    to?: 'line' | 'box' | 'none';    // 矢印の終点に接続するもの
  };
}
```

### 2.3 SVGベースのレンダリング

CSSではなくSVGで矢印を描画することで、より精密な制御を実現：

```typescript
function renderArrowSVG(arrow: ArrowNode, prefix: string): string {
  const svgId = `${prefix}-arrow-svg`;

  const paths: Record<string, string> = {
    'right': '<path d="M0,6 L8,6 L5,3 M8,6 L5,9" stroke="currentColor" fill="none" stroke-width="2"/>',
    'left': '<path d="M10,6 L2,6 L5,3 M2,6 L5,9" stroke="currentColor" fill="none" stroke-width="2"/>',
    'up': '<path d="M6,10 L6,2 L3,5 M6,2 L9,5" stroke="currentColor" fill="none" stroke-width="2"/>',
    'down': '<path d="M6,0 L6,8 L3,5 M6,8 L9,5" stroke="currentColor" fill="none" stroke-width="2"/>',
    'bidirectional-h': '<path d="M2,6 L5,3 M2,6 L5,9 M2,6 L10,6 L7,3 M10,6 L7,9" stroke="currentColor" fill="none" stroke-width="2"/>',
    'bidirectional-v': '<path d="M6,2 L3,5 M6,2 L9,5 M6,2 L6,10 L3,7 M6,10 L9,7" stroke="currentColor" fill="none" stroke-width="2"/>',
  };

  return `<svg class="${prefix}-arrow ${prefix}-arrow-${arrow.direction}" viewBox="0 0 12 12" width="16" height="16">
  ${paths[arrow.direction]}
</svg>`;
}
```

### 2.4 矢印のCSS改善

```css
/* Arrow base */
.ascii-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ascii-border-color);
}

/* SVG arrows scale properly */
.ascii-arrow svg {
  width: 1em;
  height: 1em;
}

/* Vertical arrows in vertical flow */
.ascii-flow-vertical .ascii-arrow-down,
.ascii-flow-vertical .ascii-arrow-up,
.ascii-flow-vertical .ascii-arrow-bidirectional-v {
  margin: 0.25rem 0;
}

/* Horizontal arrows in horizontal flow */
.ascii-flow-horizontal .ascii-arrow-right,
.ascii-flow-horizontal .ascii-arrow-left,
.ascii-flow-horizontal .ascii-arrow-bidirectional-h {
  margin: 0 0.25rem;
}

/* Arrow with line connection */
.ascii-arrow-connected {
  position: relative;
}

.ascii-arrow-connected::before {
  content: '';
  position: absolute;
  background-color: var(--ascii-border-color);
}

.ascii-arrow-connected.ascii-arrow-right::before {
  left: -1rem;
  top: 50%;
  width: 1rem;
  height: 2px;
  transform: translateY(-50%);
}
```

---

## 3. 実装計画

### Phase 1: 双方向矢印の追加（優先度：高）

1. `tokenizer.ts`: `↕`, `↔` の文字マッピング追加
2. `types.ts`: `ArrowNode.direction` に双方向タイプ追加
3. `css.ts`: 双方向矢印のスタイル追加
4. テスト追加

### Phase 2: SVGレンダリング（優先度：中）

1. `renderer/svg.ts`: SVG生成ロジック作成
2. `renderer/index.ts`: SVGレンダリングオプション追加
3. `types.ts`: `AsciiDiagramOptions` に `renderMode: 'css' | 'svg'` 追加
4. CSSからSVGへの移行パス

### Phase 3: 線と矢印の接続検出（優先度：低）

1. `analyzer.ts`: コンテキスト解析強化
2. 隣接する線と矢印の検出ロジック
3. 接続情報をArrowNodeに追加
4. 接続状態に応じたレンダリング

---

## 4. 下位互換性

- 既存の矢印文字（→, ←, ↑, ↓）の動作は変更しない
- 新しい矢印タイプはオプショナル機能として追加
- SVGレンダリングはオプトイン（デフォルトは現行のCSS方式）

---

## 5. テストケース

### 5.1 双方向矢印

```ascii
┌───┐
│ A │
└───┘
  ↕
┌───┐
│ B │
└───┘
```

期待結果: 双方向垂直矢印として認識

### 5.2 水平双方向矢印

```ascii
┌───┐  ↔  ┌───┐
│ A │     │ B │
└───┘     └───┘
```

期待結果: 双方向水平矢印として認識

---

## 改訂履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-11 | 初版作成 |
