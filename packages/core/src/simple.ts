/**
 * ASCII to HTML converter - Grid-based (方眼紙方式)
 */

export interface SimpleOptions {
  classPrefix?: string;
  cellSize?: number; // 1マスのサイズ(px)
}

const DEFAULT_OPTIONS: Required<SimpleOptions> = {
  classPrefix: 'ascii',
  cellSize: 10,
};

// 罫線の種類
type LineType = 'h' | 'v' | 'tl' | 'tr' | 'bl' | 'br' | 'cross' | 'td' | 'tu' | 'tl2' | 'tr2';

function getLineType(char: string): LineType | null {
  switch (char) {
    case '─': case '━': case '═': case '-': return 'h';
    case '│': case '┃': case '║': case '|': return 'v';
    case '┌': case '╔': return 'tl';
    case '┐': case '╗': return 'tr';
    case '└': case '╚': return 'bl';
    case '┘': case '╝': return 'br';
    case '┼': case '╬': return 'cross';
    case '┬': case '╦': return 'td';
    case '┴': case '╩': return 'tu';
    case '├': case '╠': return 'tl2';
    case '┤': case '╣': return 'tr2';
    default: return null;
  }
}

const ARROW_CHARS = new Set(['→', '←', '↑', '↓', '▶', '◀', '▲', '▼']);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 文字幅（半角=1, 全角=2）
function charWidth(char: string): number {
  const code = char.charCodeAt(0);
  if ((code >= 0x1100 && code <= 0x11FF) ||
      (code >= 0x2E80 && code <= 0x9FFF) ||
      (code >= 0xAC00 && code <= 0xD7AF) ||
      (code >= 0xF900 && code <= 0xFAFF) ||
      (code >= 0xFE10 && code <= 0xFE6F) ||
      (code >= 0xFF00 && code <= 0xFF60) ||
      (code >= 0xFFE0 && code <= 0xFFE6) ||
      (code >= 0x3000 && code <= 0x303F)) {
    return 2;
  }
  return 1;
}

// 行を列単位で分解（各セルの文字と開始列を返す）
function parseLine(line: string): Array<{ char: string; col: number; width: number }> {
  const cells: Array<{ char: string; col: number; width: number }> = [];
  let col = 0;
  for (const char of line) {
    const w = charWidth(char);
    cells.push({ char, col, width: w });
    col += w;
  }
  return cells;
}

export function asciiToHtmlSimple(input: string, options?: SimpleOptions): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const p = opts.classPrefix;
  const cs = opts.cellSize;
  const lines = input.split('\n');

  // 各行を解析し、最大幅を計算
  const parsedLines = lines.map(line => parseLine(line));
  let maxCols = 0;
  for (const cells of parsedLines) {
    if (cells.length > 0) {
      const lastCell = cells[cells.length - 1];
      maxCols = Math.max(maxCols, lastCell.col + lastCell.width);
    }
  }

  const rowCount = lines.length;
  const rowHeight = cs * 1.6; // 行の高さ
  const width = maxCols * cs;
  const height = rowCount * rowHeight;

  // SVGとテキストレイヤーを生成
  const svgLines: string[] = [];
  const textRows: string[] = [];

  parsedLines.forEach((cells, row) => {
    const y = row * rowHeight;

    // テキストを連続した塊として収集
    let textRun: { startCol: number; chars: string[]; isArrow: boolean } | null = null;

    const flushTextRun = () => {
      if (textRun && textRun.chars.length > 0) {
        const x = textRun.startCol * cs;
        const text = textRun.chars.join('');
        const cls = textRun.isArrow ? `${p}-a` : `${p}-t`;
        textRows.push(`<span class="${cls}" style="left:${x}px;top:${y}px">${textRun.isArrow ? text : escapeHtml(text)}</span>`);
      }
      textRun = null;
    };

    for (const { char, col, width: w } of cells) {
      const x = col * cs;
      const lineType = getLineType(char);

      if (lineType) {
        // 罫線はSVGで描画（グリッドに厳密配置）
        flushTextRun();
        svgLines.push(generateSvgLine(lineType, x, y, cs, rowHeight));
      } else if (ARROW_CHARS.has(char)) {
        // 矢印は個別に配置（色が違う）
        flushTextRun();
        textRows.push(`<span class="${p}-a" style="left:${x}px;top:${y}px">${char}</span>`);
      } else if (char !== ' ') {
        // テキストは連続配置（方眼をはみ出してもOK）
        if (textRun === null) {
          textRun = { startCol: col, chars: [char], isArrow: false };
        } else {
          textRun.chars.push(char);
        }
      } else {
        // スペースでテキスト塊を区切る
        flushTextRun();
      }
    }

    flushTextRun();
  });

  const svg = `<svg class="${p}-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <g stroke="#6366f1" stroke-width="2" fill="none">
      ${svgLines.join('\n      ')}
    </g>
  </svg>`;

  return `<div class="${p}-diagram" style="width:${width}px;height:${height}px">
  ${svg}
  <div class="${p}-text">
    ${textRows.join('\n    ')}
  </div>
</div>`;
}

function generateSvgLine(type: LineType, x: number, y: number, w: number, h: number): string {
  const cx = x + w / 2;
  const cy = y + h / 2;

  switch (type) {
    case 'h':
      return `<line x1="${x}" y1="${cy}" x2="${x + w}" y2="${cy}" />`;
    case 'v':
      return `<line x1="${cx}" y1="${y}" x2="${cx}" y2="${y + h}" />`;
    case 'tl':
      return `<path d="M${cx},${cy} H${x + w} M${cx},${cy} V${y + h}" />`;
    case 'tr':
      return `<path d="M${x},${cy} H${cx} M${cx},${cy} V${y + h}" />`;
    case 'bl':
      return `<path d="M${cx},${cy} H${x + w} M${cx},${y} V${cy}" />`;
    case 'br':
      return `<path d="M${x},${cy} H${cx} M${cx},${y} V${cy}" />`;
    case 'cross':
      return `<path d="M${x},${cy} H${x + w} M${cx},${y} V${y + h}" />`;
    case 'td':
      return `<path d="M${x},${cy} H${x + w} M${cx},${cy} V${y + h}" />`;
    case 'tu':
      return `<path d="M${x},${cy} H${x + w} M${cx},${y} V${cy}" />`;
    case 'tl2':
      return `<path d="M${cx},${cy} H${x + w} M${cx},${y} V${y + h}" />`;
    case 'tr2':
      return `<path d="M${x},${cy} H${cx} M${cx},${y} V${y + h}" />`;
    default:
      return '';
  }
}

export function generateSimpleCSS(options?: SimpleOptions): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const p = opts.classPrefix;
  const rowHeight = opts.cellSize * 1.6;

  return `
.${p}-diagram {
  position: relative;
  background: #fafafa;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Noto Sans JP', 'Hiragino Sans', 'Meiryo', sans-serif;
  font-size: ${opts.cellSize * 1.2}px;
  line-height: ${rowHeight}px;
}
.${p}-svg {
  position: absolute;
  top: 1rem;
  left: 1rem;
}
.${p}-text {
  position: absolute;
  top: 1rem;
  left: 1rem;
}
.${p}-t, .${p}-a {
  position: absolute;
  white-space: nowrap;
  height: ${rowHeight}px;
  display: flex;
  align-items: center;
}
.${p}-t { color: #333; }
.${p}-a { color: #10b981; font-size: ${opts.cellSize}px; }

@media (prefers-color-scheme: dark) {
  .${p}-diagram { background: #1e1e1e; }
  .${p}-t { color: #e5e5e5; }
  .${p}-svg g { stroke: #818cf8; }
  .${p}-a { color: #34d399; }
}
`.trim();
}
