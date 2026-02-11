/**
 * Options for ASCII diagram conversion
 */
export interface AsciiDiagramOptions {
  /** Theme: 'light', 'dark', or 'auto' */
  theme?: 'light' | 'dark' | 'auto';

  /** CSS class prefix (default: 'ascii') */
  classPrefix?: string;

  /** Output inline styles instead of classes */
  inlineStyles?: boolean;

  /** Font family for text */
  fontFamily?: string;
}

/**
 * Base node type
 */
export interface BaseNode {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Box node (rectangle with optional text)
 */
export interface BoxNode extends BaseNode {
  type: 'box';
  text: string;
  style: 'single' | 'double' | 'ascii' | 'rounded';
}

/**
 * Arrow node (connector between elements)
 */
export interface ArrowNode extends BaseNode {
  type: 'arrow';
  direction: 'left' | 'right' | 'up' | 'down';
  style: 'solid' | 'dashed';
  headStyle: 'filled' | 'open' | 'none';
}

/**
 * Text node (standalone text)
 */
export interface TextNode extends BaseNode {
  type: 'text';
  text: string;
}

/**
 * Line node (horizontal or vertical line)
 */
export interface LineNode extends BaseNode {
  type: 'line';
  direction: 'horizontal' | 'vertical';
  style: 'solid' | 'dashed' | 'double';
}

/**
 * Union type for all diagram nodes
 */
export type DiagramNode = BoxNode | ArrowNode | TextNode | LineNode;

/**
 * Parsed diagram structure
 */
export interface Diagram {
  nodes: DiagramNode[];
  width: number;
  height: number;
}
