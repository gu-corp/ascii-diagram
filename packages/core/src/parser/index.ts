import type { Diagram, DiagramNode, BoxNode } from '../types';
import { tokenize, type Token } from './tokenizer';
import { analyzeStructure } from './analyzer';

/**
 * Parse ASCII art string into a Diagram structure
 */
export function parse(input: string): Diagram {
  // Split into lines
  const lines = input.split('\n');

  // Tokenize each line
  const tokens = tokenize(lines);

  // Analyze structure and extract nodes
  const nodes = analyzeStructure(tokens, lines);

  // Calculate dimensions
  const width = Math.max(...lines.map((l) => l.length), 0);
  const height = lines.length;

  return {
    nodes,
    width,
    height,
  };
}

export { tokenize, type Token } from './tokenizer';
export { analyzeStructure } from './analyzer';
