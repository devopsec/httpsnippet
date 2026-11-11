/**
 * @description
 * HTTP code snippet generator for C3 calling libcurl through `extern fn` bindings
 * (c3c 0.8.x). The C3 standard library has no HTTP client.
 */

import { CodeBuilder } from '../../../helpers/code-builder';
import { Client } from '../../targets';
import { c3String } from '../helpers';

export const libcurl: Client = {
  info: {
    key: 'libcurl',
    title: 'libcurl',
    link: 'https://curl.se/libcurl/c/',
    description: 'libcurl easy interface called from C3 (link with -l curl)',
  },
  convert: ({ method, fullUrl, headersObj, allHeaders, postData }, options) => {
    const opts = {
      indent: '\t',
      ...options,
    };

    const { push, blank, join } = new CodeBuilder({ indent: opts.indent });
    const zstr = (value: string) => `(ZString)"${c3String(value)}"`;

    push('module example;');
    push('import std::io;');
    blank();
    push('// Build with: c3c compile main.c3 -l curl');
    push('alias Curl = void*;');
    push('alias CurlSlist = void*;');
    blank();
    push('extern fn Curl curl_easy_init();');
    push('extern fn CInt curl_easy_setopt(Curl handle, CInt option, ...);');
    push('extern fn CInt curl_easy_perform(Curl handle);');
    push('extern fn void curl_easy_cleanup(Curl handle);');
    push('extern fn ZString curl_easy_strerror(CInt code);');
    push('extern fn CurlSlist curl_slist_append(CurlSlist list, ZString value);');
    push('extern fn void curl_slist_free_all(CurlSlist list);');
    blank();
    push('const CInt CURLOPT_URL = 10002;');
    push('const CInt CURLOPT_COOKIE = 10022;');
    push('const CInt CURLOPT_HTTPHEADER = 10023;');
    push('const CInt CURLOPT_POSTFIELDS = 10015;');
    push('const CInt CURLOPT_CUSTOMREQUEST = 10036;');
    blank();
    push('fn int main()');
    push('{');
    push('Curl hnd = curl_easy_init();', 1);
    push('if (!hnd) return 1;', 1);
    push('defer curl_easy_cleanup(hnd);', 1);
    blank();
    push(`curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, ${zstr(method.toUpperCase())});`, 1);
    push(`curl_easy_setopt(hnd, CURLOPT_URL, ${zstr(fullUrl)});`, 1);

    const headers = Object.keys(headersObj);
    if (headers.length) {
      blank();
      push('CurlSlist headers = null;', 1);
      push('defer curl_slist_free_all(headers);', 1);
      headers.forEach(header => {
        push(
          `headers = curl_slist_append(headers, "${c3String(
            `${header}: ${headersObj[header]}`,
          )}");`,
          1,
        );
      });
      push('curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);', 1);
    }

    if (allHeaders.cookie) {
      blank();
      push(`curl_easy_setopt(hnd, CURLOPT_COOKIE, ${zstr(String(allHeaders.cookie))});`, 1);
    }

    if (postData.text) {
      blank();
      push(`curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, ${zstr(postData.text)});`, 1);
    }

    blank();
    push('CInt ret = curl_easy_perform(hnd);', 1);
    push('if (ret != 0)', 1);
    push('{', 1);
    push('io::eprintfn("curl_easy_perform() failed: %s", curl_easy_strerror(ret));', 2);
    push('return 1;', 2);
    push('}', 1);
    push('return 0;', 1);
    push('}');

    return join();
  },
};
