# @gu-corp/ascii-diagram

Convert ASCII art diagrams to beautiful HTML with SVG line rendering. Full support for Japanese/CJK characters.

## Installation

```bash
npm install @gu-corp/ascii-diagram
```

## Usage

### Simple API (Recommended)

The simple API uses a grid-based (方眼紙方式) approach for precise alignment:

```typescript
import { asciiToHtmlSimple, generateSimpleCSS } from '@gu-corp/ascii-diagram';

const diagram = `
┌─────────────┐     ┌─────────────┐
│   ユーザー   │────▶│   Exchange  │
└─────────────┘     └─────────────┘
`.trim();

const html = asciiToHtmlSimple(diagram);
const css = generateSimpleCSS();

// Use in your HTML
document.body.innerHTML = `<style>${css}</style>${html}`;
```

### Options

```typescript
interface SimpleOptions {
  classPrefix?: string;  // Default: 'ascii'
  cellSize?: number;     // Default: 10 (pixels)
}

const html = asciiToHtmlSimple(diagram, {
  classPrefix: 'my-diagram',
  cellSize: 12,
});

const css = generateSimpleCSS({
  classPrefix: 'my-diagram',
  cellSize: 12,
});
```

### Advanced API

For more control over parsing and rendering:

```typescript
import { parse, render, asciiToHtml, generateCSS } from '@gu-corp/ascii-diagram';

// Parse to AST
const diagram = parse(asciiArt);

// Render AST to HTML
const html = render(diagram);

// Or use the combined function
const html = asciiToHtml(asciiArt, options);
```

## Features

- **SVG Line Rendering** - Clean lines without font dependencies
- **Japanese/CJK Support** - Accurate character width calculation
- **Grid-based Layout** - 方眼紙方式 for precise alignment
- **Arrow Highlighting** - Arrows rendered in green (`→←↑↓▶◀▲▼`)
- **Dark Mode** - Automatic `prefers-color-scheme: dark` support
- **Box Drawing Characters** - `┌─┐│└┘├┤┬┴┼` and double-line variants

## Supported Characters

### Box Drawing

```
角:     ┌ ┐ └ ┘
線:     ─ │
T字:    ├ ┤ ┬ ┴
交差:   ┼
二重線: ═ ║ ╔ ╗ ╚ ╝ ╠ ╣ ╦ ╩ ╬
ASCII:  - | + (basic support)
```

### Arrows

```
方向矢印: → ← ↑ ↓
三角矢印: ▶ ◀ ▲ ▼
```

## Character Width Rules

| Character Type | Width | Examples |
|---------------|-------|----------|
| Half-width | 1 | `A`, `1`, `-`, `│` |
| Full-width Japanese | 2 | `あ`, `漢`, `（`, `）` |
| Box drawing | 1 | `┌`, `─`, `┐`, `│` |
| Arrows | 1 | `→`, `←`, `↑`, `↓` |

## Framework Integration

For use with Remark-based frameworks (Nextra, Docusaurus, etc.), see [@gu-corp/remark-ascii-diagram](../remark-plugin).

## License

MIT
