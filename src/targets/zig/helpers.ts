/** Methods supported by the exhaustive `std.http.Method` enum (Zig 0.17). */
export const ZIG_STD_METHODS = [
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'CONNECT',
  'OPTIONS',
  'TRACE',
  'PATCH',
  'QUERY',
];

/**
 * Render a value as the body of a Zig string literal. Zig rejects JSON-style `\uXXXX`
 * escapes, so control characters become `\xNN` and non-ASCII text is kept as raw UTF-8.
 */
export const zigString = (value: string): string =>
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

/** `std.http.Header` initializers for every request header, including cookies. */
export const zigHeaders = (allHeaders: Record<string, string | string[]>): string[] =>
  Object.entries(allHeaders).map(
    ([name, value]) => `.{ .name = "${zigString(name)}", .value = "${zigString(String(value))}" },`,
  );
