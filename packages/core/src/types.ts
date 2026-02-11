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
 * Box node (simple rectangle with text)
 */
export interface BoxNode extends BaseNode {
  type: 'box';
  text: string;
  style: 'single' | 'double' | 'ascii' | 'rounded';
}

/**
 * Container node (nested box with optional header)
 */
export interface ContainerNode extends BaseNode {
  type: 'container';
  header?: string;
  children: DiagramNode[];
  style: 'single' | 'double' | 'ascii';
}

/**
 * Flow node (vertical or horizontal flow of elements)
 */
export interface FlowNode extends BaseNode {
  type: 'flow';
  direction: 'vertical' | 'horizontal';
  children: DiagramNode[];
}

/**
 * Arrow node (connector between elements)
 */
export interface ArrowNode extends BaseNode {
  type: 'arrow';
  direction:
    | 'left'
    | 'right'
    | 'up'
    | 'down'
    | 'bidirectional-h'
    | 'bidirectional-v';
  style: 'solid' | 'dashed';
  headStyle: 'filled' | 'open' | 'none';
  label?: string; // annotation text next to arrow
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
 * List node (bulleted list)
 */
export interface ListNode extends BaseNode {
  type: 'list';
  items: string[];
}

/**
 * Section node (titled section with content)
 */
export interface SectionNode extends BaseNode {
  type: 'section';
  title: string;
  content: DiagramNode[];
}

/**
 * Union type for all diagram nodes
 */
export type DiagramNode =
  | BoxNode
  | ContainerNode
  | FlowNode
  | ArrowNode
  | TextNode
  | LineNode
  | ListNode
  | SectionNode;

/**
 * Bounding rectangle
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Parsed diagram structure
 */
export interface Diagram {
  nodes: DiagramNode[];
  width: number;
  height: number;
}
