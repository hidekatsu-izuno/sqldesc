import type { BindSpec } from './types.js';

export function parseBinds(spec?: string): BindSpec {
  if (!spec || spec.trim() === '') {
    return { mode: 'none', binds: [] };
  }

  const parts = spec.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { mode: 'none', binds: [] };
  }

  const hasNamed = parts.some((part) => part.includes('='));
  const hasPositional = parts.some((part) => !part.includes('='));
  if (hasNamed && hasPositional) {
    throw new Error('Mixed bind syntax is not supported. Use either "int,text" or "id=int,name=text".');
  }

  if (hasNamed) {
    const seen = new Set<string>();
    return {
      mode: 'named',
      binds: parts.map((part) => {
        const [rawName, ...rest] = part.split('=');
        const name = rawName.trim();
        const type = rest.join('=').trim();
        if (!name || !type) {
          throw new Error(`Invalid named bind "${part}". Expected name=type.`);
        }
        if (seen.has(name)) {
          throw new Error(`Duplicate bind name "${name}".`);
        }
        seen.add(name);
        return { name, type };
      }),
    };
  }

  return {
    mode: 'positional',
    binds: parts.map((type, index) => {
      if (!type) {
        throw new Error(`Invalid positional bind at index ${index + 1}.`);
      }
      return { index: index + 1, type };
    }),
  };
}
