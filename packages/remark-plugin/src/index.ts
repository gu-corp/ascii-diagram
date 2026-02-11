import { visit } from 'unist-util-visit';
import {
  asciiToHtml,
  asciiToHtmlSimple,
  generateSimpleCSS,
  type AsciiDiagramOptions,
  type SimpleOptions,
} from '@gu-corp/ascii-diagram';
import type { Root, Code } from 'mdast';

export interface RemarkAsciiDiagramOptions extends SimpleOptions {
  /**
   * Code block language to match (default: ['ascii', 'ascii-diagram'])
   */
  lang?: string | string[];

  /**
   * Whether to use the simple (SVG-based) renderer
   * Default: true
   */
  useSimple?: boolean;

  /**
   * Whether to include CSS inline with each diagram
   * Default: false (CSS should be added separately)
   */
  inlineCSS?: boolean;
}

/**
 * Remark plugin to convert ASCII diagram code blocks to HTML
 *
 * @example
 * ```javascript
 * import remarkAsciiDiagram from '@gu-corp/remark-ascii-diagram';
 *
 * const withNextra = nextra({
 *   mdxOptions: {
 *     remarkPlugins: [remarkAsciiDiagram]
 *   }
 * });
 * ```
 */
export default function remarkAsciiDiagram(
  options?: RemarkAsciiDiagramOptions
) {
  const langs = normalizeLang(options?.lang);
  const useSimple = options?.useSimple !== false; // Default true
  const inlineCSS = options?.inlineCSS ?? false;

  // Pre-generate CSS if inlineCSS is enabled
  const css = inlineCSS ? generateSimpleCSS(options) : '';

  return (tree: Root) => {
    let cssInjected = false;

    visit(tree, 'code', (node: Code, index, parent) => {
      if (!node.lang || !langs.includes(node.lang)) {
        return;
      }

      if (index === undefined || !parent) {
        return;
      }

      let html: string;

      if (useSimple) {
        html = asciiToHtmlSimple(node.value, options);
      } else {
        // Fallback to parser-based renderer (legacy)
        html = asciiToHtml(node.value, options as AsciiDiagramOptions);
      }

      // Inject CSS once if inlineCSS is enabled
      if (inlineCSS && !cssInjected) {
        html = `<style>${css}</style>\n${html}`;
        cssInjected = true;
      }

      // Replace code block with HTML
      parent.children[index] = {
        type: 'html',
        value: html,
      } as any;
    });
  };
}

/**
 * Normalize language option to array
 */
function normalizeLang(lang?: string | string[]): string[] {
  if (!lang) {
    return ['ascii', 'ascii-diagram'];
  }
  return Array.isArray(lang) ? lang : [lang];
}

export { asciiToHtml, asciiToHtmlSimple, generateSimpleCSS, type AsciiDiagramOptions, type SimpleOptions };
