import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkAsciiDiagram from './index';

async function processMarkdown(markdown: string, options?: Parameters<typeof remarkAsciiDiagram>[0]) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkAsciiDiagram, options)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);
  return String(result);
}

describe('remarkAsciiDiagram', () => {
  describe('basic transformation', () => {
    it('should transform ascii code blocks', async () => {
      const markdown = '```ascii\n┌─┐\n└─┘\n```';
      const html = await processMarkdown(markdown);
      expect(html).not.toContain('<code');
      expect(html).toContain('ascii-diagram');
    });

    it('should transform ascii-diagram code blocks', async () => {
      const markdown = '```ascii-diagram\n┌─┐\n└─┘\n```';
      const html = await processMarkdown(markdown);
      expect(html).toContain('ascii-diagram');
    });

    it('should preserve other code blocks', async () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const html = await processMarkdown(markdown);
      expect(html).toContain('<code');
      expect(html).toContain('const x = 1');
    });

    it('should handle empty code blocks', async () => {
      const markdown = '```ascii\n\n```';
      const html = await processMarkdown(markdown);
      expect(html).toContain('ascii-diagram');
    });

    it('should handle code blocks with only whitespace', async () => {
      const markdown = '```ascii\n   \n```';
      const html = await processMarkdown(markdown);
      expect(html).toContain('ascii-diagram');
    });

    it('should transform complex diagrams', async () => {
      const markdown = `
\`\`\`ascii
┌─────────────┐     ┌─────────────┐
│   ユーザー   │────▶│   Exchange  │
└─────────────┘     └─────────────┘
\`\`\`
`.trim();
      const html = await processMarkdown(markdown);
      expect(html).toContain('ユーザー');
      expect(html).toContain('Exchange');
    });

    it('should preserve surrounding content', async () => {
      const markdown = `
# Title

Some text before.

\`\`\`ascii
┌─┐
└─┘
\`\`\`

Some text after.
`.trim();
      const html = await processMarkdown(markdown);
      expect(html).toContain('<h1>Title</h1>');
      expect(html).toContain('Some text before');
      expect(html).toContain('Some text after');
      expect(html).toContain('ascii-diagram');
    });
  });

  describe('language normalization', () => {
    it('should match "ascii" by default', async () => {
      const markdown = '```ascii\n┌─┐\n└─┘\n```';
      const html = await processMarkdown(markdown);
      expect(html).toContain('ascii-diagram');
    });

    it('should match "ascii-diagram" by default', async () => {
      const markdown = '```ascii-diagram\n┌─┐\n└─┘\n```';
      const html = await processMarkdown(markdown);
      expect(html).toContain('ascii-diagram');
    });

    it('should not match other languages by default', async () => {
      const markdown = '```diagram\n┌─┐\n└─┘\n```';
      const html = await processMarkdown(markdown);
      expect(html).toContain('<code');
    });

    it('should accept custom single language', async () => {
      const markdown = '```diagram\n┌─┐\n└─┘\n```';
      const html = await processMarkdown(markdown, { lang: 'diagram' });
      expect(html).toContain('ascii-diagram');
    });

    it('should accept custom language array', async () => {
      const markdown1 = '```diagram\n┌─┐\n└─┘\n```';
      const markdown2 = '```box\n┌─┐\n└─┘\n```';
      const options = { lang: ['diagram', 'box'] };

      const html1 = await processMarkdown(markdown1, options);
      const html2 = await processMarkdown(markdown2, options);

      expect(html1).toContain('ascii-diagram');
      expect(html2).toContain('ascii-diagram');
    });

    it('should not match default languages when custom lang is set', async () => {
      const markdown = '```ascii\n┌─┐\n└─┘\n```';
      const html = await processMarkdown(markdown, { lang: 'diagram' });
      // When custom lang is set, default 'ascii' should still be treated as code
      expect(html).toContain('<code');
    });
  });

  describe('options processing', () => {
    it('should pass classPrefix to asciiToHtml', async () => {
      const markdown = '```ascii\n┌─┐\n└─┘\n```';
      const html = await processMarkdown(markdown, { classPrefix: 'my-prefix' });
      expect(html).toContain('my-prefix');
    });

    it('should work with default options', async () => {
      const markdown = '```ascii\n┌─┐\n└─┘\n```';
      const html = await processMarkdown(markdown);
      expect(html).toContain('ascii');
    });
  });

  describe('edge cases', () => {
    it('should handle multiple ascii code blocks', async () => {
      const markdown = `
\`\`\`ascii
┌─┐
└─┘
\`\`\`

\`\`\`ascii
┌──┐
└──┘
\`\`\`
`.trim();
      const html = await processMarkdown(markdown);
      const matches = html.match(/ascii-diagram/g);
      expect(matches?.length).toBe(2);
    });

    it('should handle mixed code blocks', async () => {
      const markdown = `
\`\`\`javascript
const x = 1;
\`\`\`

\`\`\`ascii
┌─┐
└─┘
\`\`\`

\`\`\`python
x = 1
\`\`\`
`.trim();
      const html = await processMarkdown(markdown);
      expect(html).toContain('ascii-diagram');
      expect(html).toContain('const x = 1');
      expect(html).toContain('x = 1');
    });

    it('should handle code blocks without language', async () => {
      const markdown = '```\n┌─┐\n└─┘\n```';
      const html = await processMarkdown(markdown);
      // No language = not converted
      expect(html).toContain('<code');
    });

    it('should handle indented code blocks in lists', async () => {
      const markdown = `
- Item 1
  \`\`\`ascii
  ┌─┐
  └─┘
  \`\`\`
- Item 2
`.trim();
      const html = await processMarkdown(markdown);
      expect(html).toContain('ascii-diagram');
    });
  });

  describe('exports', () => {
    it('should export asciiToHtml', async () => {
      const { asciiToHtml } = await import('./index');
      expect(typeof asciiToHtml).toBe('function');
    });

    it('should export default function', async () => {
      const mod = await import('./index');
      expect(typeof mod.default).toBe('function');
    });
  });
});
