import type { ContainerNode, DiagramNode, Rect } from '../types';
import type { Token } from './tokenizer';
import stringWidth from 'string-width';

/**
 * Detect the outermost container box in the given bounds
 */
export function detectOuterContainer(
  tokens: Token[][],
  lines: string[],
  bounds?: Rect
): ContainerNode | null {
  const startX = bounds?.x ?? 0;
  const startY = bounds?.y ?? 0;
  const maxX = bounds ? bounds.x + bounds.width : Math.max(...lines.map(l => stringWidth(l)));
  const maxY = bounds ? bounds.y + bounds.height : lines.length;

  // Find top-left corner
  let topLeft: { row: number; col: number } | null = null;

  for (let row = startY; row < maxY && row < tokens.length; row++) {
    for (const token of tokens[row]) {
      if (token.col < startX || token.col >= maxX) continue;

      if (token.type === 'box-corner-tl') {
        topLeft = { row, col: token.col };
        break;
      }
    }
    if (topLeft) break;
  }

  if (!topLeft) return null;

  // Find top-right corner on the same row
  let topRight: { row: number; col: number } | null = null;
  for (const token of tokens[topLeft.row]) {
    if (token.col <= topLeft.col) continue;
    if (token.col >= maxX) break;

    if (token.type === 'box-corner-tr') {
      topRight = { row: topLeft.row, col: token.col };
      // Don't break - we want the rightmost corner for the outer box
    }
  }

  if (!topRight) return null;

  // Find bottom-left corner
  let bottomLeft: { row: number; col: number } | null = null;
  for (let row = topLeft.row + 1; row < maxY && row < tokens.length; row++) {
    const token = tokens[row]?.find(t => t.col === topLeft!.col);
    if (!token) continue;

    if (token.type === 'box-corner-bl') {
      bottomLeft = { row, col: token.col };
      // Don't break - we want the bottommost corner for the outer box
    } else if (token.type !== 'box-vertical' && token.type !== 'junction-l') {
      // If we hit something that's not a vertical line or junction, stop
      break;
    }
  }

  if (!bottomLeft) return null;

  // Check for header separator (├───┤)
  let headerSeparatorRow: number | null = null;
  for (let row = topLeft.row + 1; row < bottomLeft.row; row++) {
    const leftToken = tokens[row]?.find(t => t.col === topLeft!.col);
    if (leftToken?.type === 'junction-l') {
      headerSeparatorRow = row;
      break;
    }
  }

  // Extract header text if separator exists
  let header: string | undefined;
  if (headerSeparatorRow !== null) {
    header = extractTextBetweenRows(
      lines,
      topLeft.row + 1,
      headerSeparatorRow,
      topLeft.col + 1,
      topRight.col
    );
  }

  // Calculate content bounds
  const contentStartRow = headerSeparatorRow !== null ? headerSeparatorRow + 1 : topLeft.row + 1;

  // Parse children (recursive)
  const children = parseContainerContent(
    tokens,
    lines,
    {
      x: topLeft.col + 1,
      y: contentStartRow,
      width: topRight.col - topLeft.col - 1,
      height: bottomLeft.row - contentStartRow,
    }
  );

  return {
    type: 'container',
    x: topLeft.col,
    y: topLeft.row,
    width: topRight.col - topLeft.col + 1,
    height: bottomLeft.row - topLeft.row + 1,
    header,
    children,
    style: detectContainerStyle(tokens[topLeft.row], topLeft.col),
  };
}

/**
 * Extract text content between rows within column bounds
 */
function extractTextBetweenRows(
  lines: string[],
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number
): string {
  const textLines: string[] = [];

  for (let row = startRow; row < endRow; row++) {
    const line = lines[row] || '';
    let text = '';
    let col = 0;

    for (const char of line) {
      const charWidth = stringWidth(char);

      if (col >= startCol && col < endCol) {
        if (char !== '│' && char !== '║' && char !== '|') {
          text += char;
        }
      }

      col += charWidth;
      if (col >= endCol) break;
    }

    const trimmed = text.trim();
    if (trimmed.length > 0) {
      textLines.push(trimmed);
    }
  }

  return textLines.join('\n').trim();
}

/**
 * Parse content inside a container recursively
 */
function parseContainerContent(
  tokens: Token[][],
  lines: string[],
  bounds: Rect
): DiagramNode[] {
  const nodes: DiagramNode[] = [];

  // Look for nested containers first
  const nestedContainer = detectOuterContainer(tokens, lines, bounds);
  if (nestedContainer) {
    nodes.push(nestedContainer);

    // Parse content before and after the nested container
    // Content before
    if (nestedContainer.y > bounds.y) {
      const beforeBounds: Rect = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: nestedContainer.y - bounds.y,
      };
      const beforeContent = parseSimpleContent(tokens, lines, beforeBounds);
      nodes.push(...beforeContent);
    }

    // Content after
    const nestedEndY = nestedContainer.y + nestedContainer.height;
    if (nestedEndY < bounds.y + bounds.height) {
      const afterBounds: Rect = {
        x: bounds.x,
        y: nestedEndY,
        width: bounds.width,
        height: bounds.y + bounds.height - nestedEndY,
      };
      const afterContent = parseSimpleContent(tokens, lines, afterBounds);
      nodes.push(...afterContent);
    }
  } else {
    // No nested container, parse as simple content
    const content = parseSimpleContent(tokens, lines, bounds);
    nodes.push(...content);
  }

  // Sort by vertical position
  nodes.sort((a, b) => a.y - b.y);

  return nodes;
}

/**
 * Parse simple content (text, arrows) without nested containers
 */
function parseSimpleContent(
  tokens: Token[][],
  lines: string[],
  bounds: Rect
): DiagramNode[] {
  const nodes: DiagramNode[] = [];

  for (let row = bounds.y; row < bounds.y + bounds.height && row < tokens.length; row++) {
    const lineTokens = tokens[row] || [];
    let textBuffer = '';
    let textStartCol = -1;

    for (const token of lineTokens) {
      if (token.col < bounds.x || token.col >= bounds.x + bounds.width) continue;

      // Skip border characters
      if (token.type === 'box-vertical' || token.type === 'box-horizontal') {
        // Flush text buffer
        if (textBuffer.trim().length > 0) {
          nodes.push({
            type: 'text',
            x: textStartCol,
            y: row,
            width: token.col - textStartCol,
            height: 1,
            text: textBuffer.trim(),
          });
        }
        textBuffer = '';
        textStartCol = -1;
        continue;
      }

      // Handle arrows
      if (token.type === 'arrow-down' || token.type === 'arrow-up' ||
          token.type === 'arrow-left' || token.type === 'arrow-right') {
        // Flush text buffer
        if (textBuffer.trim().length > 0) {
          nodes.push({
            type: 'text',
            x: textStartCol,
            y: row,
            width: token.col - textStartCol,
            height: 1,
            text: textBuffer.trim(),
          });
          textBuffer = '';
          textStartCol = -1;
        }

        const direction = token.type.replace('arrow-', '') as 'down' | 'up' | 'left' | 'right';
        nodes.push({
          type: 'arrow',
          x: token.col,
          y: row,
          width: token.width,
          height: 1,
          direction,
          style: 'solid',
          headStyle: 'filled',
        });
        continue;
      }

      // Collect text
      if (token.type === 'text' || token.type === 'space') {
        if (textStartCol === -1 && token.type === 'text') {
          textStartCol = token.col;
        }
        if (textStartCol !== -1) {
          textBuffer += token.char;
        }
      }
    }

    // Flush remaining text
    if (textBuffer.trim().length > 0) {
      nodes.push({
        type: 'text',
        x: textStartCol,
        y: row,
        width: stringWidth(textBuffer),
        height: 1,
        text: textBuffer.trim(),
      });
    }
  }

  return nodes;
}

/**
 * Detect container style from corner character
 */
function detectContainerStyle(
  lineTokens: Token[],
  col: number
): ContainerNode['style'] {
  const token = lineTokens.find(t => t.col === col);
  if (!token) return 'single';

  switch (token.char) {
    case '╔':
      return 'double';
    case '+':
      return 'ascii';
    default:
      return 'single';
  }
}
