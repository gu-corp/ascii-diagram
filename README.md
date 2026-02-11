# ascii-diagram

Convert ASCII art diagrams to beautiful HTML/CSS - with full Japanese support.

```
┌─────────────┐     ┌─────────────┐
│   ユーザー   │────▶│   Exchange  │
└─────────────┘     └─────────────┘
```

↓ Automatically rendered as styled HTML

## Features

- **Japanese-friendly** - Full support for CJK characters
- **Mermaid-like DX** - Use \`\`\`ascii\`\`\` code blocks
- **HTML/CSS output** - Text remains selectable and searchable
- **Dark mode** - Automatic theme support
- **Framework integrations** - Nextra, Docusaurus, VitePress

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

### Programmatic API

```typescript
import { asciiToHtml } from '@gu-corp/ascii-diagram';

const html = asciiToHtml(`
┌─────────────┐
│   Hello!    │
└─────────────┘
`);
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

See [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) for full specification.

## License

MIT
