import { describe, it, expect } from 'vitest';
import { asciiToHtml, generateCSS } from './index';

describe('asciiToHtml', () => {
  it('should convert a simple box to HTML', () => {
    const input = `
┌─────┐
│Hello│
└─────┘
`.trim();

    const html = asciiToHtml(input);

    expect(html).toContain('ascii-diagram');
    expect(html).toContain('ascii-box');
    expect(html).toContain('Hello');
  });

  it('should escape HTML in text', () => {
    const input = `
┌───────────┐
│<b>bold</b│
└───────────┘
`.trim();

    const html = asciiToHtml(input);

    // Should escape < to &lt;
    expect(html).toContain('&lt;b');
    // Should not contain unescaped HTML tags (except wrapper divs)
    expect(html).not.toMatch(/<b>/);
  });

  it('should use custom class prefix', () => {
    const input = `
┌───┐
│ A │
└───┘
`.trim();

    const html = asciiToHtml(input, { classPrefix: 'my' });

    expect(html).toContain('my-diagram');
    expect(html).toContain('my-box');
  });
});

describe('generateCSS', () => {
  it('should generate CSS with default prefix', () => {
    const css = generateCSS();

    expect(css).toContain('.ascii-diagram');
    expect(css).toContain('.ascii-box');
    expect(css).toContain('--ascii-border-color');
  });

  it('should generate CSS with custom prefix', () => {
    const css = generateCSS({ classPrefix: 'diag' });

    expect(css).toContain('.diag-diagram');
    expect(css).toContain('.diag-box');
  });

  it('should include dark mode styles', () => {
    const css = generateCSS();

    expect(css).toContain('.dark');
    expect(css).toContain('[data-theme="dark"]');
  });
});
