# ascii-diagram Requirements Specification

**Version**: 0.1.0
**Updated**: 2026-02-11
**Status**: Draft
**Repository**: `gu-corp/ascii-diagram`

[日本語版はこちら](./REQUIREMENTS.ja.md)

---

## 1. Overview

### 1.1 Purpose

A tool that automatically converts ASCII art diagrams in Markdown to HTML/CSS, rendering them as beautiful diagrams. Provides a developer experience similar to Mermaid.

### 1.2 Background

- ASCII art diagrams are widely used in technical documentation
- Existing tools (svgbob, etc.) have weak Japanese support
- Mermaid has a learning curve for its syntax
- ASCII art can be intuitively edited in any text editor

### 1.3 Goal

```
┌──────────────────────────────────────────────────────────┐
│  Markdown Source        →        Rendered Result          │
│                                                          │
│  ```ascii                       ┌─────────┐              │
│  ┌─────────┐                    │  User   │              │
│  │  User   │                    └─────────┘              │
│  └─────────┘                    (Beautiful HTML/CSS)     │
│  ```                                                     │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Target Users

| User | Needs |
|------|-------|
| Technical Writers | Add diagrams to documentation |
| Engineers | Create specifications and design documents |
| Product Managers | Create business flow diagrams |

### 2.1 User Stories

1. **US-01**: As a user, I want ASCII diagrams in Markdown to render as beautiful diagrams
2. **US-02**: As a user, I want diagrams containing Japanese to display correctly
3. **US-03**: As a user, I want to write diagrams in ```ascii``` blocks like Mermaid
4. **US-04**: As a user, I want diagrams that support dark mode
5. **US-05**: As a user, I want to select and copy text within diagrams

---

## 3. Functional Requirements

### 3.1 Supported Shapes

#### Phase 1 (MVP)

| Shape | ASCII Representation | Priority |
|-------|---------------------|:--------:|
| Box (corners) | `┌ ┐ └ ┘` | High |
| Box (lines) | `─ │` | High |
| Box (ASCII) | `+ - \|` | High |
| Arrow (horizontal) | `→ ← ─▶ ◀─ -->` | High |
| Text | Any string | High |

#### Phase 2

| Shape | ASCII Representation | Priority |
|-------|---------------------|:--------:|
| Arrow (vertical) | `↑ ↓ ▲ ▼` | Medium |
| Junctions | `├ ┤ ┬ ┴ ┼` | Medium |
| Double lines | `═ ║ ╔ ╗ ╚ ╝` | Medium |
| Rounded box | `╭ ╮ ╯ ╰` | Medium |

#### Phase 3

| Shape | ASCII Representation | Priority |
|-------|---------------------|:--------:|
| Diagonal lines | `/ \` | Low |
| Dashed lines | `┄ ┆ ╌ ╎` | Low |
| Shading | `░ ▒ ▓` | Low |

### 3.2 Input Format

````markdown
```ascii
┌─────────────┐     ┌─────────────┐
│    User     │────▶│   Exchange  │
└─────────────┘     └─────────────┘
```
````

### 3.3 Output Format

```html
<div class="ascii-diagram">
  <div class="ascii-row">
    <div class="ascii-box">User</div>
    <div class="ascii-connector">
      <div class="ascii-line"></div>
      <div class="ascii-arrow">▶</div>
    </div>
    <div class="ascii-box">Exchange</div>
  </div>
</div>
```

### 3.4 Styling

```css
/* Default theme */
.ascii-diagram {
  --ascii-border-color: #333;
  --ascii-bg-color: #fff;
  --ascii-text-color: #333;
}

/* Dark mode */
.dark .ascii-diagram {
  --ascii-border-color: #ccc;
  --ascii-bg-color: #1a1a1a;
  --ascii-text-color: #eee;
}
```

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Item | Requirement |
|------|-------------|
| Conversion speed | Convert ASCII diagrams under 100 lines within 50ms |
| Bundle size | Core package under 20KB (gzip) |

### 4.2 Compatibility

| Item | Requirement |
|------|-------------|
| Node.js | 18.x or higher |
| Browsers | Latest 2 versions of Chrome/Firefox/Safari/Edge |
| Frameworks | Nextra, Docusaurus, VitePress, Astro |

### 4.3 Internationalization

| Item | Requirement |
|------|-------------|
| Japanese | Correct width calculation for full-width characters |
| CJK | Support for Chinese and Korean |
| RTL | Future support (Phase 3+) |

### 4.4 Accessibility

| Item | Requirement |
|------|-------------|
| Text | Selectable and copyable |
| Screen readers | Appropriate aria-labels |
| Keyboard | Focus support |

---

## 5. Technology Stack

### 5.1 Languages & Runtime

| Item | Choice | Reason |
|------|--------|--------|
| Language | TypeScript | Ecosystem, type safety |
| Runtime | Node.js 18+ | LTS |
| Package manager | pnpm | Fast, workspace support |

### 5.2 Dependencies

| Library | Purpose |
|---------|---------|
| `string-width` | Full-width character width calculation |
| `unified` | Markdown processing foundation |
| `unist-util-visit` | AST traversal |

### 5.3 Development Tools

| Tool | Purpose |
|------|---------|
| Vitest | Testing |
| tsup | Build |
| Turborepo | Monorepo management |
| Changesets | Version management |

---

## 6. Package Structure

```
ascii-diagram/
├── packages/
│   ├── core/                 # Core library
│   │   ├── src/
│   │   │   ├── parser/       # ASCII parser
│   │   │   │   ├── tokenizer.ts
│   │   │   │   ├── analyzer.ts
│   │   │   │   └── unicode.ts
│   │   │   ├── renderer/     # HTML generation
│   │   │   │   ├── html.ts
│   │   │   │   └── css.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── remark-plugin/        # Remark plugin
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── demo/                 # Demo site
│       ├── src/
│       └── package.json
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 7. API Design

### 7.1 Core API

```typescript
import { parse, render } from '@gu-corp/ascii-diagram';

// Parse ASCII to get AST
const ast = parse(`
┌─────────┐
│  Hello  │
└─────────┘
`);

// Convert AST to HTML
const html = render(ast);

// One-step conversion
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
  // Theme
  theme?: 'light' | 'dark' | 'auto';

  // CSS class prefix
  classPrefix?: string;

  // Inline style output
  inlineStyles?: boolean;

  // Font settings
  fontFamily?: string;
}
```

---

## 8. Milestones

### Phase 1: MVP (2 weeks)

- [x] Project setup (monorepo structure)
- [x] Basic parser (box recognition)
- [x] HTML renderer (basic form)
- [x] Japanese support (full-width width calculation)
- [x] Remark plugin
- [ ] Demo site

### Phase 2: Feature Expansion (2 weeks)

- [x] Arrow/connector support
- [x] Junction support
- [x] Dark mode
- [ ] Theme customization
- [ ] Docusaurus plugin

### Phase 3: Advanced Features (Future)

- [ ] Diagonal line support
- [ ] SVG output option
- [ ] AI assistance (ambiguous pattern recognition)
- [ ] Editor extension (VS Code)

---

## 9. Competitive Analysis

| Tool | Japanese | HTML Output | Remark Support | Maintenance |
|------|:--------:|:-----------:|:--------------:|:-----------:|
| svgbob | ✗ | ✗ (SVG) | △ | Active |
| asciidoctor-diagram | △ | ✗ | ✗ | Active |
| ditaa | △ | ✗ (PNG) | ✗ | Stagnant |
| **ascii-diagram** | ◎ | ◎ | ◎ | - |

---

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| npm downloads | 1,000/month (after 6 months) |
| GitHub stars | 100 (after 6 months) |
| Documentation site adoption | 5 sites |

---

## Changelog

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1.0 | 2026-02-11 | Initial version | - |
