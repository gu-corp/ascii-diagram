import type { AsciiDiagramOptions } from '../types';

/**
 * Generate CSS for ASCII diagrams
 */
export function generateCSS(options?: AsciiDiagramOptions): string {
  const prefix = options?.classPrefix || 'ascii';
  const fontFamily = options?.fontFamily || 'ui-monospace, monospace';

  return `
.${prefix}-diagram {
  --${prefix}-border-color: #374151;
  --${prefix}-bg-color: #ffffff;
  --${prefix}-text-color: #1f2937;
  --${prefix}-border-radius: 4px;

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  font-family: ${fontFamily};
}

/* Dark mode */
.dark .${prefix}-diagram,
[data-theme="dark"] .${prefix}-diagram {
  --${prefix}-border-color: #9ca3af;
  --${prefix}-bg-color: #1f2937;
  --${prefix}-text-color: #f3f4f6;
}

/* Box styles */
.${prefix}-box {
  border: 2px solid var(--${prefix}-border-color);
  border-radius: var(--${prefix}-border-radius);
  padding: 0.5rem 1rem;
  background-color: var(--${prefix}-bg-color);
  color: var(--${prefix}-text-color);
  white-space: pre-wrap;
}

.${prefix}-box-single {
  border-style: solid;
}

.${prefix}-box-double {
  border-width: 3px;
  border-style: double;
}

.${prefix}-box-ascii {
  border-radius: 0;
}

.${prefix}-box-rounded {
  border-radius: 12px;
}

/* Arrow styles */
.${prefix}-arrow {
  display: flex;
  align-items: center;
  color: var(--${prefix}-border-color);
  font-size: 1.25rem;
}

.${prefix}-arrow-right::after {
  content: '→';
}

.${prefix}-arrow-left::after {
  content: '←';
}

.${prefix}-arrow-up::after {
  content: '↑';
}

.${prefix}-arrow-down::after {
  content: '↓';
}

/* Line styles */
.${prefix}-line {
  background-color: var(--${prefix}-border-color);
}

.${prefix}-line-horizontal {
  height: 2px;
  min-width: 2rem;
}

.${prefix}-line-vertical {
  width: 2px;
  min-height: 2rem;
}

/* Text styles */
.${prefix}-text {
  color: var(--${prefix}-text-color);
}
`.trim();
}

/**
 * Get default CSS (convenience export)
 */
export function getDefaultCSS(): string {
  return generateCSS();
}
