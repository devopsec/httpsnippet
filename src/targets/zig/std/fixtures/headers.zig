const std = @import("std");

pub fn main(init: std.process.Init) !void {
    const gpa = init.gpa;
    const io = init.io;

    var client: std.http.Client = .{ .allocator = gpa, .io = io };
    defer client.deinit();

    var response_body: std.Io.Writer.Allocating = .init(gpa);
    defer response_body.deinit();

    const result = try client.fetch(.{
        .location = .{ .url = "http://mockbin.com/har" },
        .method = .GET,
        .extra_headers = &.{
            .{ .name = "accept", .value = "application/json" },
            .{ .name = "x-foo", .value = "Bar" },
            .{ .name = "quoted-value", .value = "\"quoted\" 'string'" },
        },
        .response_writer = &response_body.writer,
    });

    std.debug.print("status: {d}\n", .{@backingInt(result.status)});
    std.debug.print("{s}\n", .{response_body.written()});
}