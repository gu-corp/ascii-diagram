import { describe, it, expect } from 'vitest';
import { asciiToHtmlSimple, generateSimpleCSS } from './simple';

// Export internal functions for testing
// Note: We're testing via the exported functions and verifying behavior

describe('simple.ts', () => {
  describe('charWidth (via asciiToHtmlSimple)', () => {
    it('should handle half-width characters (width=1)', () => {
      const input = 'ABC';
      const html = asciiToHtmlSimple(input);
      // 3 characters at width 1 each = 30px width (3 * 10px cellSize)
      expect(html).toContain('width:30px');
    });

    it('should handle full-width Japanese characters (width=2)', () => {
      const input = 'あいう';
      const html = asciiToHtmlSimple(input);
      // 3 full-width chars at width 2 each = 60px (6 * 10px)
      expect(html).toContain('width:60px');
    });

    it('should handle mixed half-width and full-width', () => {
      const input = 'Aあ';
      const html = asciiToHtmlSimple(input);
      // A(1) + あ(2) = 3 columns = 30px
      expect(html).toContain('width:30px');
    });

    it('should handle CJK unified ideographs (width=2)', () => {
      const input = '漢字';
      const html = asciiToHtmlSimple(input);
      // 2 CJK chars at width 2 each = 40px
      expect(html).toContain('width:40px');
    });

    it('should handle Korean characters (width=2)', () => {
      const input = '한글';
      const html = asciiToHtmlSimple(input);
      // 2 Korean chars at width 2 each = 40px
      expect(html).toContain('width:40px');
    });

    it('should handle box drawing characters (width=1)', () => {
      const input = '┌─┐';
      const html = asciiToHtmlSimple(input);
      // 3 box chars at width 1 each = 30px
      expect(html).toContain('width:30px');
    });

    it('should handle full-width parentheses (width=2)', () => {
      const input = '（）';
      const html = asciiToHtmlSimple(input);
      // 2 full-width parens at width 2 each = 40px
      expect(html).toContain('width:40px');
    });
  });

  describe('parseLine (via asciiToHtmlSimple)', () => {
    it('should correctly position text at column positions', () => {
      const input = 'A B';
      const html = asciiToHtmlSimple(input);
      // 'A' at col 0, space at col 1, 'B' at col 2
      expect(html).toContain('left:0px');
      expect(html).toContain('left:20px'); // B at column 2 * 10px
    });

    it('should correctly position full-width characters', () => {
      const input = 'あ い';
      const html = asciiToHtmlSimple(input);
      // 'あ' at col 0 (width 2), space at col 2, 'い' at col 3
      expect(html).toContain('left:0px');
      expect(html).toContain('left:30px'); // い at column 3 * 10px
    });
  });

  describe('getLineType (via asciiToHtmlSimple)', () => {
    it('should render horizontal lines', () => {
      const input = '───';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('<svg');
      expect(html).toContain('<line');
    });

    it('should render vertical lines', () => {
      const input = '│\n│\n│';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('<svg');
      expect(html).toContain('<line');
    });

    it('should render corners (top-left)', () => {
      const input = '┌─';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('<path');
    });

    it('should render corners (top-right)', () => {
      const input = '─┐';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('<path');
    });

    it('should render corners (bottom-left)', () => {
      const input = '└─';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('<path');
    });

    it('should render corners (bottom-right)', () => {
      const input = '─┘';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('<path');
    });

    it('should render cross junctions', () => {
      const input = '─┼─';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('<path');
    });

    it('should render T-down junctions', () => {
      const input = '─┬─';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('<path');
    });

    it('should render T-up junctions', () => {
      const input = '─┴─';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('<path');
    });

    it('should render T-left junctions', () => {
      const input = '│\n├\n│';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('<path');
    });

    it('should render T-right junctions', () => {
      const input = '│\n┤\n│';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('<path');
    });

    it('should render double-line characters', () => {
      const input = '╔═╗';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('<path');
      expect(html).toContain('<line');
    });

    it('should handle ASCII style lines (-)', () => {
      const input = '---';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('<line');
    });

    it('should handle ASCII style lines (|)', () => {
      const input = '|\n|\n|';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('<line');
    });
  });

  describe('generateSvgLine (via asciiToHtmlSimple)', () => {
    it('should use correct stroke color', () => {
      const input = '───';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('stroke="#6366f1"');
    });

    it('should use correct stroke width', () => {
      const input = '───';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('stroke-width="2"');
    });

    it('should set correct viewBox dimensions', () => {
      const input = '┌──┐\n│  │\n└──┘';
      const html = asciiToHtmlSimple(input);
      // 4 cols * 10px = 40, 3 rows * 16px (1.6 * 10) = 48
      expect(html).toContain('viewBox="0 0 40 48"');
    });
  });

  describe('asciiToHtmlSimple', () => {
    it('should wrap output in diagram container', () => {
      const input = 'test';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('class="ascii-diagram"');
    });

    it('should include SVG layer', () => {
      const input = '┌─┐';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('class="ascii-svg"');
    });

    it('should include text layer', () => {
      const input = 'Hello';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('class="ascii-text"');
    });

    it('should use custom classPrefix', () => {
      const input = 'test';
      const html = asciiToHtmlSimple(input, { classPrefix: 'my' });
      expect(html).toContain('class="my-diagram"');
      expect(html).toContain('class="my-text"');
    });

    it('should use custom cellSize', () => {
      const input = 'AB';
      const html = asciiToHtmlSimple(input, { cellSize: 20 });
      // 2 chars * 20px = 40px width
      expect(html).toContain('width:40px');
    });

    it('should escape HTML in text', () => {
      const input = '<script>';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>');
    });

    it('should highlight arrows with arrow class', () => {
      const input = '→';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('class="ascii-a"');
    });

    it('should handle all arrow types', () => {
      const arrows = ['→', '←', '↑', '↓', '▶', '◀', '▲', '▼'];
      for (const arrow of arrows) {
        const html = asciiToHtmlSimple(arrow);
        expect(html).toContain(arrow);
        expect(html).toContain('class="ascii-a"');
      }
    });

    it('should position text correctly across rows', () => {
      const input = 'A\nB\nC';
      const html = asciiToHtmlSimple(input);
      // Row 0: top:0px, Row 1: top:16px, Row 2: top:32px (rowHeight = 10 * 1.6 = 16)
      expect(html).toContain('top:0px');
      expect(html).toContain('top:16px');
      expect(html).toContain('top:32px');
    });

    it('should handle empty input', () => {
      const input = '';
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('class="ascii-diagram"');
    });

    it('should handle complex diagram with boxes and arrows', () => {
      const input = `┌───┐   ┌───┐
│ A │──▶│ B │
└───┘   └───┘`;
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('class="ascii-diagram"');
      expect(html).toContain('class="ascii-svg"');
      expect(html).toContain('class="ascii-text"');
      expect(html).toContain('A');
      expect(html).toContain('B');
      expect(html).toContain('▶');
    });

    it('should render Japanese text correctly', () => {
      const input = `┌─────────┐
│  日本語  │
└─────────┘`;
      const html = asciiToHtmlSimple(input);
      expect(html).toContain('日本語');
    });

    it('should handle continuous text runs', () => {
      const input = 'Hello World';
      const html = asciiToHtmlSimple(input);
      // 'Hello' and 'World' should be separate spans due to space
      expect(html).toContain('>Hello<');
      expect(html).toContain('>World<');
    });
  });

  describe('generateSimpleCSS', () => {
    it('should generate CSS with default options', () => {
      const css = generateSimpleCSS();
      expect(css).toContain('.ascii-diagram');
      expect(css).toContain('.ascii-svg');
      expect(css).toContain('.ascii-text');
      expect(css).toContain('.ascii-t');
      expect(css).toContain('.ascii-a');
    });

    it('should use custom classPrefix', () => {
      const css = generateSimpleCSS({ classPrefix: 'my' });
      expect(css).toContain('.my-diagram');
      expect(css).toContain('.my-svg');
      expect(css).toContain('.my-text');
      expect(css).toContain('.my-t');
      expect(css).toContain('.my-a');
    });

    it('should include font-family', () => {
      const css = generateSimpleCSS();
      expect(css).toContain('Noto Sans JP');
      expect(css).toContain('Hiragino Sans');
      expect(css).toContain('Meiryo');
    });

    it('should include background color', () => {
      const css = generateSimpleCSS();
      expect(css).toContain('background: #fafafa');
    });

    it('should include dark mode styles', () => {
      const css = generateSimpleCSS();
      expect(css).toContain('@media (prefers-color-scheme: dark)');
      expect(css).toContain('background: #1e1e1e');
    });

    it('should set correct font-size based on cellSize', () => {
      const css = generateSimpleCSS({ cellSize: 10 });
      // font-size = 10 * 1.2 = 12px
      expect(css).toContain('font-size: 12px');
    });

    it('should set correct line-height based on cellSize', () => {
      const css = generateSimpleCSS({ cellSize: 10 });
      // line-height = 10 * 1.6 = 16px
      expect(css).toContain('line-height: 16px');
    });

    it('should include text color', () => {
      const css = generateSimpleCSS();
      expect(css).toContain('.ascii-t { color: #333;');
    });

    it('should include arrow color (green)', () => {
      const css = generateSimpleCSS();
      expect(css).toContain('.ascii-a { color: #10b981');
    });

    it('should include dark mode arrow color', () => {
      const css = generateSimpleCSS();
      expect(css).toContain('.ascii-a { color: #34d399');
    });

    it('should include dark mode stroke color', () => {
      const css = generateSimpleCSS();
      expect(css).toContain('stroke: #818cf8');
    });

    it('should use custom cellSize for arrow font-size', () => {
      const css = generateSimpleCSS({ cellSize: 15 });
      // arrow font-size equals cellSize
      expect(css).toContain('font-size: 15px');
    });
  });

  describe('integration tests', () => {
    it('should render a complete flowchart', () => {
      const input = `
┌─────────┐
│ステップ1│
└────┬────┘
     │
     ▼
┌─────────┐
│ステップ2│
└─────────┘`.trim();

      const html = asciiToHtmlSimple(input);
      expect(html).toContain('ステップ1');
      expect(html).toContain('ステップ2');
      expect(html).toContain('▼');
      expect(html).toContain('<svg');
    });

    it('should render nested boxes', () => {
      const input = `
┌─────────────────────┐
│  外側              │
│  ┌───────────┐     │
│  │  内側     │     │
│  └───────────┘     │
└─────────────────────┘`.trim();

      const html = asciiToHtmlSimple(input);
      expect(html).toContain('外側');
      expect(html).toContain('内側');
    });

    it('should handle header boxes', () => {
      const input = `
┌─────────────────┐
│    タイトル     │
├─────────────────┤
│  本文内容       │
└─────────────────┘`.trim();

      const html = asciiToHtmlSimple(input);
      expect(html).toContain('タイトル');
      expect(html).toContain('本文内容');
    });
  });
});
