import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseBinds } from '../dist/binds.js';

describe('parseBinds', () => {
  it('parses positional comma-separated types', () => {
    assert.deepStrictEqual(parseBinds('int,text'), {
      mode: 'positional',
      binds: [
        { index: 1, type: 'int' },
        { index: 2, type: 'text' },
      ],
    });
  });

  it('parses named comma-separated key/value types', () => {
    assert.deepStrictEqual(parseBinds('id=int,name=text'), {
      mode: 'named',
      binds: [
        { name: 'id', type: 'int' },
        { name: 'name', type: 'text' },
      ],
    });
  });

  it('rejects mixed bind syntax', () => {
    assert.throws(() => parseBinds('id=int,text'), /Mixed bind syntax/);
  });
});
