/**
 * Render a value as the body of a C3 string literal. Control characters become `\xNN`
 * and non-ASCII text is kept as raw UTF-8.
 */
export const c3String = (value: string): string =>
  [...value]
    .map(c => {
      if (c === '\\') return '\\\\';
      if (c === '"') return '\\"';
      if (c === '\n') return '\\n';
      if (c === '\r') return '\\r';
      if (c === '\t') return '\\t';
      const code = c.codePointAt(0) as number;
      if (code < 0x20 || code === 0x7f) return `\\x${code.toString(16).padStart(2, '0')}`;
      return c;
    })
    .join('');
