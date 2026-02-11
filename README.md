# ascii-diagram

Convert ASCII art diagrams to beautiful HTML/CSS - with full Japanese support.

```
┌─────────────┐     ┌─────────────┐
│   ユーザー   │────▶│   Exchange  │
└─────────────┘     └─────────────┘
```

↓ Automatically rendered as styled HTML

## Features

- **SVG Line Rendering** - Clean lines without font dependencies
- **Japanese-friendly** - Full support for CJK character width calculation
- **Grid-based Layout** - 方眼紙方式 for precise alignment
- **Arrow Highlighting** - Arrows rendered in green
- **Dark mode** - Automatic `prefers-color-scheme` support
- **Framework integrations** - Nextra, Docusaurus, VitePress (planned)

## Installation

```bash
npm install @gu-corp/ascii-diagram
```

## Usage

### With Remark (Nextra, Docusaurus, etc.)

```javascript
// next.config.mjs
import remarkAsciiDiagram from '@gu-corp/remark-ascii-diagram';

const withNextra = nextra({
  mdxOptions: {
    remarkPlugins: [remarkAsciiDiagram]
  }
});
```

Then in your Markdown:

````markdown
```ascii
┌─────────────┐
│   Hello!    │
└─────────────┘
```
````

### Programmatic API (Simple)

```typescript
import { asciiToHtmlSimple, generateSimpleCSS } from '@gu-corp/ascii-diagram';

const diagram = `
┌─────────────┐
│   Hello!    │
└─────────────┘
`.trim();

const html = asciiToHtmlSimple(diagram);
const css = generateSimpleCSS();

// Use in your HTML
document.body.innerHTML = `<style>${css}</style>${html}`;
```

## Supported Patterns

### Boxes

```
┌─────┐    +-----+    ╔═════╗
│ Box │    | Box |    ║ Box ║
└─────┘    +-----+    ╚═════╝
```

### Arrows

```
───▶  ◀───  ────>  <────  →  ←  ↑  ↓
```

### Connections

```
┌───┬───┐
│   │   │
├───┼───┤
│   │   │
└───┴───┘
```

## Documentation

- [ASCII_DIAGRAM_GUIDE.md](./ASCII_DIAGRAM_GUIDE.md) - AI向け図作成ガイド
- [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) - 詳細仕様

## Development

```bash
# Install dependencies
npm install

# Generate demo
npx tsx demo-simple.ts
open demo-simple.html

# Run E2E tests
npx playwright test
```

## License

MIT
