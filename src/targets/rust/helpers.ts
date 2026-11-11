function concatValues(
  concatType: 'array' | 'object',
  values: any,
  pretty: boolean,
  indentation: string,
  indentLevel: number,
): string {
  const currentIndent = indentation.repeat(indentLevel);
  const closingBraceIndent = indentation.repeat(indentLevel - 1);
  const join = pretty ? `,\n${currentIndent}` : ', ';
  const openingBrace = concatType === 'object' ? 'json!({' : '(';
  const closingBrace = concatType === 'object' ? '})' : ')';

  if (pretty) {
    return `${openingBrace}\n${currentIndent}${values.join(
      join,
    )}\n${closingBraceIndent}${closingBrace}`;
  }

  return `${openingBrace}${values.join(join)}${closingBrace}`;
}

/**
 * Create a valid Rust string of a literal value using serde_json according to its type.
 *
 * @param {*} value Any Javascript literal
 * @param {Object} opts Target options
 * @return {string}
 */
export const literalRepresentation = (
  value: any,
  opts: Record<string, any>,
  indentLevel?: number,
): any => {
  /*
   * Note: this version is almost entirely borrowed from the Python client helper. The
   * only real modification involves the braces and the types. The helper
   * could potentially be parameterised for reuse.
   */
  indentLevel = indentLevel === undefined ? 1 : indentLevel + 1;

  switch (Object.prototype.toString.call(value)) {
    case '[object Number]':
      return value;

    case '[object Array]': {
      let pretty = false;
      const valuesRep: any = (value as any[]).map(v => {
        // Switch to prettify if the value is a dict with more than one key.
        if (Object.prototype.toString.call(v) === '[object Object]') {
          pretty = Object.keys(v).length > 1;
        }
        return literalRepresentation(v, opts, indentLevel);
      });
      return concatValues('array', valuesRep, pretty, opts.indent, indentLevel);
    }

    case '[object Object]': {
      const keyValuePairs = [];
      for (const key in value) {
        keyValuePairs.push(`"${key}": ${literalRepresentation(value[key], opts, indentLevel)}`);
      }
      return concatValues(
        'object',
        keyValuePairs,
        opts.pretty && keyValuePairs.length > 1,
        opts.indent,
        indentLevel,
      );
    }

    case '[object Null]':
      return 'json!(null)';

    case '[object Boolean]':
      return value ? 'true' : 'false';

    default:
      if (value === null || value === undefined) {
        return '';
      }
      return `"${value.toString().replace(/"/g, '\\"')}"`;
  }
};

/**
 * Render a value as the body of a Rust string literal. Control characters use `\u{..}`
 * escapes and non-ASCII text is kept as raw UTF-8.
 */
export const rustString = (value: string): string =>
  [...value]
    .map(c => {
      if (c === '\\') return '\\\\';
      if (c === '"') return '\\"';
      if (c === '\n') return '\\n';
      if (c === '\r') return '\\r';
      if (c === '\t') return '\\t';
      const code = c.codePointAt(0) as number;
      if (code < 0x20 || code === 0x7f) return `\\u{${code.toString(16)}}`;
      return c;
    })
    .join('');
