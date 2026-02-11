# @gu-corp/remark-ascii-diagram

Remark plugin to convert ASCII diagram code blocks to styled HTML. Integrates with Nextra, Docusaurus, and other MDX-based frameworks.

## Installation

```bash
npm install @gu-corp/remark-ascii-diagram
```

## Usage

### With Nextra

```javascript
// next.config.mjs
import nextra from 'nextra';
import remarkAsciiDiagram from '@gu-corp/remark-ascii-diagram';

const withNextra = nextra({
  mdxOptions: {
    remarkPlugins: [remarkAsciiDiagram],
  },
});

export default withNextra({
  // your Next.js config
});
```

### With Docusaurus

```javascript
// docusaurus.config.js
module.exports = {
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          remarkPlugins: [require('@gu-corp/remark-ascii-diagram').default],
        },
      },
    ],
  ],
};
```

### In Markdown

Use `ascii` or `ascii-diagram` as the code block language:

````markdown
```ascii
┌─────────────┐     ┌─────────────┐
│   ユーザー   │────▶│   Exchange  │
└─────────────┘     └─────────────┘
```
````

## Options

```typescript
interface RemarkAsciiDiagramOptions {
  // Code block language to match
  // Default: ['ascii', 'ascii-diagram']
  lang?: string | string[];

  // CSS class prefix
  // Default: 'ascii'
  classPrefix?: string;

  // Cell size in pixels
  // Default: 10
  cellSize?: number;
}
```

### Example with Options

```javascript
import remarkAsciiDiagram from '@gu-corp/remark-ascii-diagram';

const withNextra = nextra({
  mdxOptions: {
    remarkPlugins: [
      [remarkAsciiDiagram, {
        lang: 'diagram',
        classPrefix: 'my-diagram',
        cellSize: 12,
      }],
    ],
  },
});
```

## Adding CSS

The plugin generates HTML but you need to include the CSS. Add this to your global styles:

```javascript
import { generateSimpleCSS } from '@gu-corp/ascii-diagram';

// In your _app.tsx or global CSS
const css = generateSimpleCSS();
```

Or include it directly in your CSS file:

```css
/* styles/globals.css */
.ascii-diagram {
  position: relative;
  background: #fafafa;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Noto Sans JP', 'Hiragino Sans', 'Meiryo', sans-serif;
}

/* See generateSimpleCSS() output for full styles */
```

## Features

- **Automatic conversion** - ASCII code blocks become styled diagrams
- **Japanese support** - Full CJK character width handling
- **SVG rendering** - Clean lines without font dependencies
- **Dark mode** - Automatic `prefers-color-scheme` support
- **Configurable** - Custom languages, prefixes, and sizing

## Related

- [@gu-corp/ascii-diagram](../core) - Core conversion library
- [ASCII Diagram Guide](../../ASCII_DIAGRAM_GUIDE.md) - How to create ASCII diagrams

## License

MIT
