/**
 * @description
 * HTTP code snippet generator for Zig using the lower-level `std.http.Client.request` API
 * (Zig 0.17): explicit send, response head and streamed body.
 */

import { CodeBuilder } from '../../../helpers/code-builder';
import { Client } from '../../targets';
import { ZIG_STD_METHODS, zigHeaders, zigString } from '../helpers';

export const request: Client = {
  info: {
    key: 'request',
    title: 'std.http.Client.request',
    link: 'https://ziglang.org/documentation/master/std/#std.http.Client.request',
    description: 'Zig standard library HTTP client, low-level request API (Zig 0.17)',
  },
  convert: ({ method, fullUrl, allHeaders, postData }, options) => {
    const opts = {
      indent: '    ',
      ...options,
    };

    const { push, blank, join } = new CodeBuilder({ indent: opts.indent });
    const upperMethod = method.toUpperCase();
    const supported = ZIG_STD_METHODS.includes(upperMethod);
    const headers = zigHeaders(allHeaders);

    push('const std = @import("std");');
    blank();
    push('pub fn main(init: std.process.Init) !void {');
    push('const gpa = init.gpa;', 1);
    push('const io = init.io;', 1);
    blank();
    push('var client: std.http.Client = .{ .allocator = gpa, .io = io };', 1);
    push('defer client.deinit();', 1);
    blank();
    push(`const uri = try std.Uri.parse("${zigString(fullUrl)}");`, 1);

    if (!supported) {
      push(
        `// std.http.Method has no ${upperMethod}; use the libcurl client for custom methods.`,
        1,
      );
    }

    const methodTag = supported ? upperMethod : 'GET';
    if (headers.length) {
      push(`var req = try client.request(.${methodTag}, uri, .{`, 1);
      push('.extra_headers = &.{', 2);
      headers.forEach(header => push(header, 3));
      push('},', 2);
      push('});', 1);
    } else {
      push(`var req = try client.request(.${methodTag}, uri, .{});`, 1);
    }
    push('defer req.deinit();', 1);
    blank();

    if (postData.text) {
      push(`var payload = "${zigString(postData.text)}".*;`, 1);
      push('try req.sendBodyComplete(&payload);', 1);
    } else {
      push('try req.sendBodiless();', 1);
    }

    blank();
    push('var redirect_buffer: [8 * 1024]u8 = undefined;', 1);
    push('var response = try req.receiveHead(&redirect_buffer);', 1);
    push('std.debug.print("status: {d}\\n", .{@backingInt(response.head.status)});', 1);
    blank();
    push('var transfer_buffer: [64]u8 = undefined;', 1);
    push('const body = try response.reader(&transfer_buffer).allocRemaining(gpa, .unlimited);', 1);
    push('defer gpa.free(body);', 1);
    push('std.debug.print("{s}\\n", .{body});', 1);
    push('}');

    return join();
  },
};
