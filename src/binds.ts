import type { Binds } from './types.js';

export function parseBinds(spec?: string): Binds | undefined {
  if (!spec || spec.trim() === '') {
    return undefined;
  }

  const parts = spec.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    return undefined;
  }

  const hasNamed = parts.some((part) => part.includes('='));
  const hasPositional = parts.some((part) => !part.includes('='));
  if (hasNamed && hasPositional) {
    throw new Error('Mixed bind syntax is not supported. Use either "int,text" or "id=int,name=text".');
  }

  if (hasNamed) {
    const binds: Record<string, string> = {};
    const seen = new Set<string>();
    for (const part of parts) {
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
      binds[name] = type;
    }
    return binds;
  }

  return parts.map((type, index) => {
    if (!type) {
      throw new Error(`Invalid positional bind at index ${index + 1}.`);
    }
    return type;
  });
}

export function mapBindTypes(binds: Binds | undefined, mapper: (type: string) => string): Binds | undefined {
  if (!binds) return undefined;
  if (Array.isArray(binds)) {
    return binds.map(mapper);
  }
  return Object.fromEntries(Object.entries(binds).map(([name, type]) => [name, mapper(type)]));
}

export function positionalBindType(binds: Binds | undefined, index: number): string | undefined {
  if (!binds || !Array.isArray(binds)) return undefined;
  return binds[index - 1];
}

export function namedBindType(binds: Binds | undefined, name: string): string | undefined {
  if (!binds || Array.isArray(binds)) return undefined;
  return binds[name];
}
