import { describe, it, expect } from 'vitest';
import { parse } from './index';

describe('parse', () => {
  it('should parse a simple box', () => {
    const input = `
┌─────┐
│Hello│
└─────┘
`.trim();

    const result = parse(input);

    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].type).toBe('box');
    expect((result.nodes[0] as any).text).toBe('Hello');
  });

  it('should parse a box with Japanese text', () => {
    const input = `
┌──────┐
│ユーザー│
└──────┘
`.trim();

    const result = parse(input);

    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].type).toBe('box');
    expect((result.nodes[0] as any).text).toBe('ユーザー');
  });

  it('should parse multiple boxes', () => {
    const input = `
┌───┐  ┌───┐
│ A │  │ B │
└───┘  └───┘
`.trim();

    const result = parse(input);

    expect(result.nodes).toHaveLength(2);
    expect((result.nodes[0] as any).text).toBe('A');
    expect((result.nodes[1] as any).text).toBe('B');
  });

  it('should detect box style', () => {
    const singleLine = `
┌───┐
│ A │
└───┘
`.trim();

    const doubleLine = `
╔═══╗
║ B ║
╚═══╝
`.trim();

    const single = parse(singleLine);
    const double = parse(doubleLine);

    expect((single.nodes[0] as any).style).toBe('single');
    expect((double.nodes[0] as any).style).toBe('double');
  });
});
