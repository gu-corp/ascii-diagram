import type { Diagram, DiagramNode } from '../types';
import { tokenize, type Token } from './tokenizer';
import { detectOuterContainer } from './container';
import { analyzeStructure } from './analyzer';

/**
 * Parse ASCII art string into a Diagram structure
 */
export function parse(input: string): Diagram {
  // Split into lines
  const lines = input.split('\n');

  // Tokenize each line
  const tokens = tokenize(lines);

  // Calculate dimensions
  const width = Math.max(...lines.map((l) => l.length), 0);
  const height = lines.length;

  // Try to detect outer container first (for complex nested diagrams)
  const container = detectOuterContainer(tokens, lines);

  if (container) {
    // Found a container structure
    return {
      nodes: [container],
      width,
      height,
    };
  }

  // Fall back to simple analysis (for basic box diagrams)
  const nodes = analyzeStructure(tokens, lines);

  return {
    nodes,
    width,
    height,
  };
}

export { tokenize, type Token } from './tokenizer';
export { analyzeStructure } from './analyzer';
export { detectOuterContainer } from './container';
