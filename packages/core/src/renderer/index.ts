import type {
  Diagram,
  DiagramNode,
  BoxNode,
  ContainerNode,
  FlowNode,
  ArrowNode,
  TextNode,
  ListNode,
  SectionNode,
  AsciiDiagramOptions,
} from '../types';
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
    case 'container':
      return renderContainer(node, opts);
    case 'flow':
      return renderFlow(node, opts);
    case 'arrow':
      return renderArrow(node, prefix);
    case 'text':
      return renderText(node, prefix);
    case 'list':
      return renderList(node, prefix);
    case 'section':
      return renderSection(node, opts);
    case 'line':
      return `<div class="${prefix}-line ${prefix}-line-${node.direction}"></div>`;
    default:
      return '';
  }
}

/**
 * Render a simple box
 */
function renderBox(box: BoxNode, prefix: string): string {
  const styleClass = `${prefix}-box-${box.style}`;
  const content = escapeHtml(box.text);

  return `<div class="${prefix}-box ${styleClass}">${formatContent(content)}</div>`;
}

/**
 * Render a container with optional header
 */
function renderContainer(container: ContainerNode, opts: Required<AsciiDiagramOptions>): string {
  const prefix = opts.classPrefix;
  const styleClass = `${prefix}-container-${container.style}`;

  let html = `<div class="${prefix}-container ${styleClass}">`;

  // Header
  if (container.header) {
    html += `\n  <div class="${prefix}-container-header">${escapeHtml(container.header)}</div>`;
  }

  // Body with children
  html += `\n  <div class="${prefix}-container-body">`;

  // Render children
  for (const child of container.children) {
    html += '\n    ' + renderNode(child, opts);
  }

  html += `\n  </div>`;
  html += `\n</div>`;

  return html;
}

/**
 * Render a flow (vertical or horizontal sequence)
 */
function renderFlow(flow: FlowNode, opts: Required<AsciiDiagramOptions>): string {
  const prefix = opts.classPrefix;
  const dirClass = `${prefix}-flow-${flow.direction}`;

  let html = `<div class="${prefix}-flow ${dirClass}">`;

  for (const child of flow.children) {
    html += '\n  ' + renderNode(child, opts);
  }

  html += '\n</div>';

  return html;
}

/**
 * Render an arrow
 */
function renderArrow(arrow: ArrowNode, prefix: string): string {
  const dirClass = `${prefix}-arrow-${arrow.direction}`;
  const styleClass = arrow.style === 'dashed' ? `${prefix}-arrow-dashed` : '';

  if (arrow.label) {
    return `<div class="${prefix}-arrow-with-label">
  <div class="${prefix}-arrow ${dirClass} ${styleClass}"></div>
  <span class="${prefix}-arrow-label">${escapeHtml(arrow.label)}</span>
</div>`;
  }

  return `<div class="${prefix}-arrow ${dirClass} ${styleClass}"></div>`;
}

/**
 * Render text
 */
function renderText(text: TextNode, prefix: string): string {
  const content = escapeHtml(text.text);

  // Check if it's a label (short text, often a title)
  if (text.text.length < 30 && !text.text.includes('\n')) {
    return `<span class="${prefix}-label">${content}</span>`;
  }

  return `<div class="${prefix}-text">${formatContent(content)}</div>`;
}

/**
 * Render a list
 */
function renderList(list: ListNode, prefix: string): string {
  const items = list.items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('\n    ');

  return `<ul class="${prefix}-list">\n    ${items}\n  </ul>`;
}

/**
 * Render a section with title
 */
function renderSection(section: SectionNode, opts: Required<AsciiDiagramOptions>): string {
  const prefix = opts.classPrefix;

  let html = `<div class="${prefix}-section">`;
  html += `\n  <div class="${prefix}-section-title">${escapeHtml(section.title)}</div>`;
  html += `\n  <div class="${prefix}-section-content">`;

  for (const child of section.content) {
    html += '\n    ' + renderNode(child, opts);
  }

  html += '\n  </div>';
  html += '\n</div>';

  return html;
}

/**
 * Format content text (handle bullet points, sections, etc.)
 */
function formatContent(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  for (const line of lines) {
    // Check for bullet point
    if (line.match(/^[・\-\*]\s*/)) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(line.replace(/^[・\-\*]\s*/, ''));
    } else {
      // Flush list if we were in one
      if (inList) {
        result.push('<ul>' + listItems.map(i => `<li>${i}</li>`).join('') + '</ul>');
        inList = false;
        listItems = [];
      }

      // Check for section header【】
      const sectionMatch = line.match(/^【(.+?)】$/);
      if (sectionMatch) {
        result.push(`<strong>${sectionMatch[1]}</strong>`);
      } else if (line.trim()) {
        result.push(`<p>${line}</p>`);
      }
    }
  }

  // Flush any remaining list
  if (inList) {
    result.push('<ul>' + listItems.map(i => `<li>${i}</li>`).join('') + '</ul>');
  }

  return result.join('\n');
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
