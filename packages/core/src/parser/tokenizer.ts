import stringWidth from 'string-width';

/**
 * Token types for ASCII diagram elements
 */
export type TokenType =
  | 'box-corner-tl' // ┌ ╔ +
  | 'box-corner-tr' // ┐ ╗ +
  | 'box-corner-bl' // └ ╚ +
  | 'box-corner-br' // ┘ ╝ +
  | 'box-horizontal' // ─ ═ -
  | 'box-vertical' // │ ║ |
  | 'junction-t' // ┬ ╦
  | 'junction-b' // ┴ ╩
  | 'junction-l' // ├ ╠
  | 'junction-r' // ┤ ╣
  | 'junction-cross' // ┼ ╬
  | 'arrow-right' // → ▶ >
  | 'arrow-left' // ← ◀ <
  | 'arrow-up' // ↑ ▲ ^
  | 'arrow-down' // ↓ ▼ v
  | 'text' // any other character
  | 'space'; // whitespace

/**
 * Token representing a single element in the diagram
 */
export interface Token {
  type: TokenType;
  char: string;
  row: number;
  col: number;
  width: number; // character width (1 for ASCII, 2 for CJK)
}

/**
 * Character to token type mapping
 */
const CHAR_MAP: Record<string, TokenType> = {
  // Box corners - single line
  '┌': 'box-corner-tl',
  '┐': 'box-corner-tr',
  '└': 'box-corner-bl',
  '┘': 'box-corner-br',
  // Box corners - double line
  '╔': 'box-corner-tl',
  '╗': 'box-corner-tr',
  '╚': 'box-corner-bl',
  '╝': 'box-corner-br',
  // Box corners - ASCII
  '+': 'box-corner-tl', // context-dependent

  // Horizontal lines
  '─': 'box-horizontal',
  '═': 'box-horizontal',
  '-': 'box-horizontal',

  // Vertical lines
  '│': 'box-vertical',
  '║': 'box-vertical',
  '|': 'box-vertical',

  // Junctions
  '┬': 'junction-t',
  '┴': 'junction-b',
  '├': 'junction-l',
  '┤': 'junction-r',
  '┼': 'junction-cross',
  '╦': 'junction-t',
  '╩': 'junction-b',
  '╠': 'junction-l',
  '╣': 'junction-r',
  '╬': 'junction-cross',

  // Arrows
  '→': 'arrow-right',
  '▶': 'arrow-right',
  '>': 'arrow-right',
  '←': 'arrow-left',
  '◀': 'arrow-left',
  '<': 'arrow-left',
  '↑': 'arrow-up',
  '▲': 'arrow-up',
  '^': 'arrow-up',
  '↓': 'arrow-down',
  '▼': 'arrow-down',
  // 'v': 'arrow-down', // conflict with text
};

/**
 * Tokenize lines of ASCII art
 */
export function tokenize(lines: string[]): Token[][] {
  return lines.map((line, row) => tokenizeLine(line, row));
}

/**
 * Tokenize a single line
 */
function tokenizeLine(line: string, row: number): Token[] {
  const tokens: Token[] = [];
  let col = 0;

  for (const char of line) {
    const width = stringWidth(char);
    const type = getTokenType(char);

    tokens.push({
      type,
      char,
      row,
      col,
      width,
    });

    col += width;
  }

  return tokens;
}

/**
 * Get token type for a character
 */
function getTokenType(char: string): TokenType {
  if (char === ' ' || char === '\t') {
    return 'space';
  }

  return CHAR_MAP[char] || 'text';
}
