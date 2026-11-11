/**
 * @description
 * HTTP code snippet generator for C3 writing a raw HTTP/1.1 request over
 * `std::net::tcp` (c3c 0.8.x). Plain HTTP only: the standard library has no TLS.
 */

import { CodeBuilder } from '../../../helpers/code-builder';
import { Client } from '../../targets';
import { c3String } from '../helpers';

/** UTF-8 byte length without Buffer/TextEncoder, so the generator also runs in browsers. */
const utf8Length = (value: string): number =>
  [...value].reduce((total, c) => {
    const code = c.codePointAt(0) as number;
    return total + (code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4);
  }, 0);

export const tcp: Client = {
  info: {
    key: 'tcp',
    title: 'std::net::tcp',
    link: 'https://c3-lang.org/standard-library/',
    description: 'Raw HTTP/1.1 over a C3 standard library TCP socket (no TLS)',
  },
  convert: ({ method, uriObj, allHeaders, postData }, options) => {
    const opts = {
      indent: '\t',
      ...options,
    };

    const { push, blank, join } = new CodeBuilder({ indent: opts.indent });

    const isHttps = uriObj.protocol === 'https:';
    const host = uriObj.hostname ?? '';
    const port = uriObj.port ? Number(uriObj.port) : isHttps ? 443 : 80;
    const path = uriObj.path || '/';
    const body = postData.text ?? '';

    const lines = [`${method.toUpperCase()} ${path} HTTP/1.1`];
    const headerNames = Object.keys(allHeaders).map(name => name.toLowerCase());
    if (!headerNames.includes('host')) {
      lines.push(`Host: ${uriObj.host}`);
    }
    Object.entries(allHeaders).forEach(([name, value]) => lines.push(`${name}: ${value}`));
    if (body && !headerNames.includes('content-length')) {
      lines.push(`Content-Length: ${utf8Length(body)}`);
    }
    lines.push('Connection: close');

    push('module example;');
    push('import std::io, std::net::tcp;');
    blank();
    push('fn void? send_request()');
    push('{');
    if (isHttps) {
      push('// std::net has no TLS support; use the libcurl or curl client for https URLs.', 1);
    }
    push(`TcpSocket socket = tcp::connect("${c3String(host)}", ${port})!;`, 1);
    push('defer (void)socket.close();', 1);
    blank();
    push(`String request = "${c3String(`${lines[0]}\r\n`)}"`, 1);
    lines.slice(1).forEach(line => push(`"${c3String(`${line}\r\n`)}"`, 2));
    push(`"\\r\\n"${body ? '' : ';'}`, 2);
    if (body) {
      push(`"${c3String(body)}";`, 2);
    }
    push('io::write_all(&socket, request)!;', 1);
    blank();
    push('char[4096] buffer;', 1);
    push('while (true)', 1);
    push('{', 1);
    push('sz n = socket.read(&buffer)!;', 2);
    push('if (n == 0) break;', 2);
    push('io::print((String)buffer[:n]);', 2);
    push('}', 1);
    push('}');
    blank();
    push('fn int main()');
    push('{');
    push('if (catch err = send_request())', 1);
    push('{', 1);
    push('io::eprintfn("request failed: %s", err);', 2);
    push('return 1;', 2);
    push('}', 1);
    push('return 0;', 1);
    push('}');

    return join();
  },
};
