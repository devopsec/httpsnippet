/**
 * @description
 * HTTP code snippet generator for C3 that runs the curl command-line tool through
 * `std::os::process` (c3c 0.8.x).
 */

import { CodeBuilder } from '../../../helpers/code-builder';
import { Client } from '../../targets';
import { c3String } from '../helpers';

export const curl: Client = {
  info: {
    key: 'curl',
    title: 'curl (std::os::process)',
    link: 'https://c3-lang.org/standard-library/',
    description: 'Runs the curl CLI with the C3 standard library process API',
  },
  convert: ({ method, fullUrl, headersObj, allHeaders, postData }, options) => {
    const opts = {
      indent: '\t',
      ...options,
    };

    const { push, blank, join } = new CodeBuilder({ indent: opts.indent });
    const str = (value: string) => `"${c3String(value)}"`;

    push('module example;');
    push('import std::io, std::os::process;');
    blank();
    push('fn int main()');
    push('{');
    push('String[] command = {', 1);
    push('"curl",', 2);
    push(`"--request", ${str(method.toUpperCase())},`, 2);
    push(`"--url", ${str(fullUrl)},`, 2);

    Object.keys(headersObj).forEach(header => {
      push(`"--header", ${str(`${header}: ${headersObj[header]}`)},`, 2);
    });

    if (allHeaders.cookie) {
      push(`"--cookie", ${str(String(allHeaders.cookie))},`, 2);
    }

    if (postData.text) {
      push(`"--data-raw", ${str(postData.text)},`, 2);
    }

    push('};', 1);
    blank();
    push('int? status = process::run(command, INHERIT_ENV | INHERIT_STDIO);', 1);
    push('if (catch err = status)', 1);
    push('{', 1);
    push('io::eprintfn("failed to run curl: %s", err);', 2);
    push('return 1;', 2);
    push('}', 1);
    push('return status;', 1);
    push('}');

    return join();
  },
};
