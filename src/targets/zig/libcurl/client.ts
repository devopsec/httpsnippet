/**
 * @description
 * HTTP code snippet generator for Zig calling libcurl through `extern` declarations,
 * so no curl headers or translate-c step are needed.
 */

import { CodeBuilder } from '../../../helpers/code-builder';
import { Client } from '../../targets';
import { zigString } from '../helpers';

export const libcurl: Client = {
  info: {
    key: 'libcurl',
    title: 'libcurl',
    link: 'https://curl.se/libcurl/c/',
    description: 'libcurl easy interface called from Zig (link with -lc -lcurl)',
  },
  convert: ({ method, fullUrl, headersObj, allHeaders, postData }, options) => {
    const opts = {
      indent: '    ',
      ...options,
    };

    const { push, blank, join } = new CodeBuilder({ indent: opts.indent });
    const cstr = (value: string) => `@as([*:0]const u8, "${zigString(value)}")`;

    push('const std = @import("std");');
    blank();
    push('// Build with: zig build-exe main.zig -lc -lcurl');
    push('const CURL = opaque {};');
    push('const curl_slist = opaque {};');
    push('const CURLcode = c_int;');
    blank();
    push('const CURLOPT_URL: c_int = 10002;');
    push('const CURLOPT_COOKIE: c_int = 10022;');
    push('const CURLOPT_HTTPHEADER: c_int = 10023;');
    push('const CURLOPT_POSTFIELDS: c_int = 10015;');
    push('const CURLOPT_CUSTOMREQUEST: c_int = 10036;');
    blank();
    push('extern "c" fn curl_easy_init() ?*CURL;');
    push('extern "c" fn curl_easy_setopt(handle: *CURL, option: c_int, ...) CURLcode;');
    push('extern "c" fn curl_easy_perform(handle: *CURL) CURLcode;');
    push('extern "c" fn curl_easy_cleanup(handle: *CURL) void;');
    push('extern "c" fn curl_easy_strerror(code: CURLcode) [*:0]const u8;');
    push('extern "c" fn curl_slist_append(list: ?*curl_slist, value: [*:0]const u8) ?*curl_slist;');
    push('extern "c" fn curl_slist_free_all(list: ?*curl_slist) void;');
    blank();
    push('fn check(code: CURLcode) !void {');
    push('if (code != 0) {', 1);
    push('std.debug.print("curl error: {s}\\n", .{curl_easy_strerror(code)});', 2);
    push('return error.CurlFailed;', 2);
    push('}', 1);
    push('}');
    blank();
    push('pub fn main() !void {');
    push('const hnd = curl_easy_init() orelse return error.CurlInitFailed;', 1);
    push('defer curl_easy_cleanup(hnd);', 1);
    blank();
    push(
      `try check(curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, ${cstr(method.toUpperCase())}));`,
      1,
    );
    push(`try check(curl_easy_setopt(hnd, CURLOPT_URL, ${cstr(fullUrl)}));`, 1);

    const headers = Object.keys(headersObj);
    if (headers.length) {
      blank();
      push('var headers: ?*curl_slist = null;', 1);
      push('defer curl_slist_free_all(headers);', 1);
      headers.forEach(header => {
        push(
          `headers = curl_slist_append(headers, "${zigString(
            `${header}: ${headersObj[header]}`,
          )}");`,
          1,
        );
      });
      push('try check(curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers));', 1);
    }

    if (allHeaders.cookie) {
      blank();
      push(
        `try check(curl_easy_setopt(hnd, CURLOPT_COOKIE, ${cstr(String(allHeaders.cookie))}));`,
        1,
      );
    }

    if (postData.text) {
      blank();
      push(`try check(curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, ${cstr(postData.text)}));`, 1);
    }

    blank();
    push('try check(curl_easy_perform(hnd));', 1);
    push('}');

    return join();
  },
};
