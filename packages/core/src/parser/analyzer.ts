import type { DiagramNode, BoxNode } from '../types';
import type { Token } from './tokenizer';

/**
 * Analyze tokenized input and extract diagram nodes
 */
export function analyzeStructure(
  tokens: Token[][],
  lines: string[]
): DiagramNode[] {
  const nodes: DiagramNode[] = [];

  // Find boxes
  const boxes = findBoxes(tokens, lines);
  nodes.push(...boxes);

  // TODO: Find arrows
  // TODO: Find standalone text

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
    // This is a simplified extraction - real implementation needs to handle CJK width
    let text = '';
    let col = 0;

    for (const char of line) {
      if (col > startCol && col < endCol) {
        if (char !== '│' && char !== '║' && char !== '|') {
          text += char;
        }
      }
      col++;
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
