import type { DiagramNode, BoxNode, ArrowNode, TextNode } from '../types';
import type { Token } from './tokenizer';
import stringWidth from 'string-width';

/**
 * Analyze tokenized input and extract diagram nodes
 */
export function analyzeStructure(
  tokens: Token[][],
  lines: string[]
): DiagramNode[] {
  const nodes: DiagramNode[] = [];

  // Find boxes first
  const boxes = findBoxes(tokens, lines);
  nodes.push(...boxes);

  // Find arrows/connectors
  const arrows = findArrows(tokens, boxes);
  nodes.push(...arrows);

  // Find standalone text (not inside boxes)
  const texts = findStandaloneText(tokens, lines, boxes);
  nodes.push(...texts);

  return nodes;
}

/**
 * Find box structures in the token grid
 */
function findBoxes(tokens: Token[][], lines: string[]): BoxNode[] {
  const boxes: BoxNode[] = [];
  const visited = new Set<string>();

  for (let row = 0; row < tokens.length; row++) {
    for (let i = 0; i < tokens[row].length; i++) {
      const token = tokens[row][i];

      // Look for top-left corner
      if (token.type === 'box-corner-tl') {
        const key = `${row},${token.col}`;
        if (visited.has(key)) continue;

        const box = traceBox(tokens, lines, row, token.col);
        if (box) {
          boxes.push(box);
          visited.add(key);
        }
      }
    }
  }

  return boxes;
}

/**
 * Trace a box starting from top-left corner
 */
function traceBox(
  tokens: Token[][],
  lines: string[],
  startRow: number,
  startCol: number
): BoxNode | null {
  // Find top-right corner (follow horizontal line)
  let endCol = startCol;
  const topLine = tokens[startRow];

  for (let i = 0; i < topLine.length; i++) {
    const token = topLine[i];
    if (token.col <= startCol) continue;

    if (token.type === 'box-corner-tr') {
      endCol = token.col;
      break;
    }
    if (token.type !== 'box-horizontal' && token.type !== 'space') {
      break;
    }
  }

  if (endCol === startCol) return null;

  // Find bottom-left corner (follow vertical line)
  let endRow = startRow;
  for (let row = startRow + 1; row < tokens.length; row++) {
    const lineTokens = tokens[row];
    const firstToken = lineTokens.find((t) => t.col === startCol);

    if (!firstToken) break;

    if (firstToken.type === 'box-corner-bl') {
      endRow = row;
      break;
    }
    if (firstToken.type !== 'box-vertical') {
      break;
    }
  }

  if (endRow === startRow) return null;

  // Extract text content from inside the box
  const text = extractBoxText(lines, startRow, endRow, startCol, endCol);

  // Determine box style
  const style = detectBoxStyle(tokens[startRow], startCol);

  return {
    type: 'box',
    x: startCol,
    y: startRow,
    width: endCol - startCol + 1,
    height: endRow - startRow + 1,
    text: text.trim(),
    style,
  };
}

/**
 * Extract text content from inside a box
 */
function extractBoxText(
  lines: string[],
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number
): string {
  const textLines: string[] = [];

  for (let row = startRow + 1; row < endRow; row++) {
    const line = lines[row] || '';
    // Extract characters between the vertical borders
    // Handle CJK character widths properly
    let text = '';
    let col = 0;

    for (const char of line) {
      const charWidth = stringWidth(char);

      if (col > startCol && col < endCol) {
        // Skip border characters
        if (char !== '│' && char !== '║' && char !== '|') {
          text += char;
        }
      }

      col += charWidth;

      // Stop if we've passed the end column
      if (col >= endCol) break;
    }

    textLines.push(text.trim());
  }

  return textLines.filter((l) => l.length > 0).join('\n');
}

/**
 * Detect box style from corner character
 */
function detectBoxStyle(
  lineTokens: Token[],
  col: number
): BoxNode['style'] {
  const token = lineTokens.find((t) => t.col === col);
  if (!token) return 'single';

  switch (token.char) {
    case '╔':
      return 'double';
    case '+':
      return 'ascii';
    case '╭':
      return 'rounded';
    default:
      return 'single';
  }
}

/**
 * Find arrows and connectors between boxes
 */
function findArrows(tokens: Token[][], boxes: BoxNode[]): ArrowNode[] {
  const arrows: ArrowNode[] = [];

  for (let row = 0; row < tokens.length; row++) {
    const lineTokens = tokens[row];
    let i = 0;

    while (i < lineTokens.length) {
      const token = lineTokens[i];

      // Check for arrow patterns
      if (isArrowToken(token.type)) {
        // Check if this arrow is inside a box
        if (!isInsideBox(token.row, token.col, boxes)) {
          const arrow = parseArrow(lineTokens, i, row);
          if (arrow) {
            arrows.push(arrow);
            // Skip processed tokens
            i += arrow.width;
            continue;
          }
        }
      }

      // Check for horizontal line that could be a connector
      if (token.type === 'box-horizontal' && !isInsideBox(row, token.col, boxes)) {
        const connector = parseHorizontalConnector(lineTokens, i, row, boxes);
        if (connector) {
          arrows.push(connector);
          i += connector.width;
          continue;
        }
      }

      i++;
    }
  }

  return arrows;
}

/**
 * Check if a token type is an arrow
 */
function isArrowToken(type: string): boolean {
  return type.startsWith('arrow-');
}

/**
 * Check if a position is inside any box
 */
function isInsideBox(row: number, col: number, boxes: BoxNode[]): boolean {
  for (const box of boxes) {
    if (
      row >= box.y &&
      row <= box.y + box.height - 1 &&
      col >= box.x &&
      col <= box.x + box.width - 1
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Parse an arrow starting at given position
 */
function parseArrow(
  lineTokens: Token[],
  startIndex: number,
  row: number
): ArrowNode | null {
  const token = lineTokens[startIndex];

  let direction: ArrowNode['direction'];
  switch (token.type) {
    case 'arrow-right':
      direction = 'right';
      break;
    case 'arrow-left':
      direction = 'left';
      break;
    case 'arrow-up':
      direction = 'up';
      break;
    case 'arrow-down':
      direction = 'down';
      break;
    default:
      return null;
  }

  // Look for preceding/following line characters
  let width = 1;
  let startCol = token.col;

  // Check for preceding horizontal lines (for patterns like ───▶)
  if (direction === 'right') {
    let j = startIndex - 1;
    while (j >= 0 && lineTokens[j].type === 'box-horizontal') {
      width++;
      startCol = lineTokens[j].col;
      j--;
    }
  }

  // Check for following horizontal lines (for patterns like ◀───)
  if (direction === 'left') {
    let j = startIndex + 1;
    while (j < lineTokens.length && lineTokens[j].type === 'box-horizontal') {
      width++;
      j++;
    }
  }

  return {
    type: 'arrow',
    x: startCol,
    y: row,
    width,
    height: 1,
    direction,
    style: 'solid',
    headStyle: 'filled',
  };
}

/**
 * Parse a horizontal connector (line between boxes)
 */
function parseHorizontalConnector(
  lineTokens: Token[],
  startIndex: number,
  row: number,
  boxes: BoxNode[]
): ArrowNode | null {
  let endIndex = startIndex;
  let hasArrow = false;
  let direction: ArrowNode['direction'] = 'right';

  // Follow the horizontal line
  while (endIndex < lineTokens.length) {
    const token = lineTokens[endIndex];
    if (token.type === 'box-horizontal') {
      endIndex++;
    } else if (token.type === 'arrow-right') {
      hasArrow = true;
      direction = 'right';
      endIndex++;
      break;
    } else if (token.type === 'arrow-left') {
      hasArrow = true;
      direction = 'left';
      endIndex++;
      break;
    } else {
      break;
    }
  }

  const width = endIndex - startIndex;
  if (width < 2) return null; // Too short to be a connector

  const startToken = lineTokens[startIndex];

  return {
    type: 'arrow',
    x: startToken.col,
    y: row,
    width,
    height: 1,
    direction,
    style: 'solid',
    headStyle: hasArrow ? 'filled' : 'none',
  };
}

/**
 * Find standalone text (not inside boxes)
 */
function findStandaloneText(
  tokens: Token[][],
  lines: string[],
  boxes: BoxNode[]
): TextNode[] {
  const texts: TextNode[] = [];

  for (let row = 0; row < tokens.length; row++) {
    const lineTokens = tokens[row];
    let textStart = -1;
    let textChars: string[] = [];

    for (let i = 0; i < lineTokens.length; i++) {
      const token = lineTokens[i];

      // Skip if inside a box
      if (isInsideBox(row, token.col, boxes)) {
        if (textChars.length > 0) {
          const text = textChars.join('').trim();
          if (text.length > 0) {
            texts.push({
              type: 'text',
              x: textStart,
              y: row,
              width: token.col - textStart,
              height: 1,
              text,
            });
          }
          textChars = [];
          textStart = -1;
        }
        continue;
      }

      // Collect text characters
      if (token.type === 'text') {
        if (textStart === -1) {
          textStart = token.col;
        }
        textChars.push(token.char);
      } else if (token.type === 'space' && textChars.length > 0) {
        textChars.push(' ');
      } else {
        // Non-text token, flush accumulated text
        if (textChars.length > 0) {
          const text = textChars.join('').trim();
          if (text.length > 0) {
            texts.push({
              type: 'text',
              x: textStart,
              y: row,
              width: token.col - textStart,
              height: 1,
              text,
            });
          }
          textChars = [];
          textStart = -1;
        }
      }
    }

    // Flush remaining text
    if (textChars.length > 0) {
      const text = textChars.join('').trim();
      if (text.length > 0) {
        texts.push({
          type: 'text',
          x: textStart,
          y: row,
          width: text.length,
          height: 1,
          text,
        });
      }
    }
  }

  return texts;
}
