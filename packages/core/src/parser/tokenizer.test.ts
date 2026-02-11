import { describe, it, expect } from 'vitest';
import { tokenize } from './tokenizer';

describe('tokenizer', () => {
  it('should tokenize box corners', () => {
    const lines = ['┌─┐'];
    const tokens = tokenize(lines);

    expect(tokens[0]).toHaveLength(3);
    expect(tokens[0][0].type).toBe('box-corner-tl');
    expect(tokens[0][1].type).toBe('box-horizontal');
    expect(tokens[0][2].type).toBe('box-corner-tr');
  });

  it('should tokenize vertical lines', () => {
    const lines = ['│A│'];
    const tokens = tokenize(lines);

    expect(tokens[0][0].type).toBe('box-vertical');
    expect(tokens[0][1].type).toBe('text');
    expect(tokens[0][2].type).toBe('box-vertical');
  });

  it('should handle Japanese characters with correct width', () => {
    const lines = ['│日本語│'];
    const tokens = tokenize(lines);

    // 日本語 is 3 characters, each with width 2
    const textTokens = tokens[0].filter((t) => t.type === 'text');
    expect(textTokens).toHaveLength(3);
    expect(textTokens[0].width).toBe(2); // 日
    expect(textTokens[1].width).toBe(2); // 本
    expect(textTokens[2].width).toBe(2); // 語
  });

  it('should tokenize arrows', () => {
    const lines = ['→←↑↓'];
    const tokens = tokenize(lines);

    expect(tokens[0][0].type).toBe('arrow-right');
    expect(tokens[0][1].type).toBe('arrow-left');
    expect(tokens[0][2].type).toBe('arrow-up');
    expect(tokens[0][3].type).toBe('arrow-down');
  });

  it('should tokenize ASCII style box', () => {
    const lines = ['+--+', '|Hi|', '+--+'];
    const tokens = tokenize(lines);

    expect(tokens[0][0].type).toBe('box-corner-tl');
    expect(tokens[0][1].type).toBe('box-horizontal');
    expect(tokens[1][0].type).toBe('box-vertical');
  });
});
