import type { Diagram, DiagramNode, BoxNode, AsciiDiagramOptions } from '../types';
import { parse } from '../parser';
import { generateCSS, getDefaultCSS } from './css';

const DEFAULT_OPTIONS: Required<AsciiDiagramOptions> = {
  theme: 'auto',
  classPrefix: 'ascii',
  inlineStyles: false,
  fontFamily: 'ui-monospace, monospace',
};

/**
 * Render a parsed Diagram to HTML
 */
export function render(diagram: Diagram, options?: AsciiDiagramOptions): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const prefix = opts.classPrefix;

  const nodeHtml = diagram.nodes.map((node) => renderNode(node, opts)).join('\n');

  return `<div class="${prefix}-diagram">\n${nodeHtml}\n</div>`;
}

/**
 * Convert ASCII art string directly to HTML
 */
export function asciiToHtml(input: string, options?: AsciiDiagramOptions): string {
  const diagram = parse(input);
  return render(diagram, options);
}

/**
 * Render a single node to HTML
 */
function renderNode(node: DiagramNode, opts: Required<AsciiDiagramOptions>): string {
  const prefix = opts.classPrefix;

  switch (node.type) {
    case 'box':
      return renderBox(node, prefix);
    case 'arrow':
      return `<div class="${prefix}-arrow ${prefix}-arrow-${node.direction}"></div>`;
    case 'text':
      return `<span class="${prefix}-text">${escapeHtml(node.text)}</span>`;
    case 'line':
      return `<div class="${prefix}-line ${prefix}-line-${node.direction}"></div>`;
    default:
      return '';
  }
}

/**
 * Render a box node to HTML
 */
function renderBox(box: BoxNode, prefix: string): string {
  const styleClass = `${prefix}-box-${box.style}`;
  const content = escapeHtml(box.text);

  return `  <div class="${prefix}-box ${styleClass}">${content}</div>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export { generateCSS, getDefaultCSS } from './css';
