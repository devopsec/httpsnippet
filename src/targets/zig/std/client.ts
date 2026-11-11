/**
 * @description
 * HTTP code snippet generator for Zig using `std.http.Client.fetch` (Zig 0.17).
 */

import { CodeBuilder } from '../../../helpers/code-builder';
import { Client } from '../../targets';
import { ZIG_STD_METHODS, zigHeaders, zigString } from '../helpers';

export const std: Client = {
  info: {
    key: 'std',
    title: 'std.http.Client.fetch',
    link: 'https://ziglang.org/documentation/master/std/#std.http.Client.fetch',
    description: 'Zig standard library HTTP client, one-call fetch API (Zig 0.17)',
  },
  convert: ({ method, fullUrl, allHeaders, postData }, options) => {
    const opts = {
      indent: '    ',
      ...options,
    };

    const { push, blank, join } = new CodeBuilder({ indent: opts.indent });
    const upperMethod = method.toUpperCase();
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
    push('var response_body: std.Io.Writer.Allocating = .init(gpa);', 1);
    push('defer response_body.deinit();', 1);
    blank();

    if (!ZIG_STD_METHODS.includes(upperMethod)) {
      push(
        `// std.http.Method has no ${upperMethod}; use the libcurl client for custom methods.`,
        1,
      );
    }

    push('const result = try client.fetch(.{', 1);
    push(`.location = .{ .url = "${zigString(fullUrl)}" },`, 2);

    if (ZIG_STD_METHODS.includes(upperMethod)) {
      push(`.method = .${upperMethod},`, 2);
    }

    if (postData.text) {
      push(`.payload = "${zigString(postData.text)}",`, 2);
    }

    if (headers.length) {
      push('.extra_headers = &.{', 2);
      headers.forEach(header => push(header, 3));
      push('},', 2);
    }

    push('.response_writer = &response_body.writer,', 2);
    push('});', 1);
    blank();
    push('std.debug.print("status: {d}\\n", .{@backingInt(result.status)});', 1);
    push('std.debug.print("{s}\\n", .{response_body.written()});', 1);
    push('}');

    return join();
  },
};
