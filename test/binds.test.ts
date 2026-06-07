import { describe, expect, it } from 'vitest';
import { parseBinds } from '../src/binds.js';

describe('parseBinds', () => {
  it('parses positional comma-separated types', () => {
    expect(parseBinds('int,text')).toEqual({
      mode: 'positional',
      binds: [
        { index: 1, type: 'int' },
        { index: 2, type: 'text' },
      ],
    });
  });

  it('parses named comma-separated key/value types', () => {
    expect(parseBinds('id=int,name=text')).toEqual({
      mode: 'named',
      binds: [
        { name: 'id', type: 'int' },
        { name: 'name', type: 'text' },
      ],
    });
  });

  it('rejects mixed bind syntax', () => {
    expect(() => parseBinds('id=int,text')).toThrow(/Mixed bind syntax/);
  });
});
