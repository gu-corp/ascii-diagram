import { visit } from 'unist-util-visit';
import { asciiToHtml, type AsciiDiagramOptions } from '@gu-corp/ascii-diagram';
import type { Root, Code } from 'mdast';

export interface RemarkAsciiDiagramOptions extends AsciiDiagramOptions {
  /**
   * Code block language to match (default: 'ascii')
   */
  lang?: string | string[];
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

  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (!node.lang || !langs.includes(node.lang)) {
        return;
      }

      if (index === undefined || !parent) {
        return;
      }

      const html = asciiToHtml(node.value, options);

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

export { asciiToHtml, type AsciiDiagramOptions };
