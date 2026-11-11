const std = @import("std");

pub fn main(init: std.process.Init) !void {
    const gpa = init.gpa;
    const io = init.io;

    var client: std.http.Client = .{ .allocator = gpa, .io = io };
    defer client.deinit();

    var response_body: std.Io.Writer.Allocating = .init(gpa);
    defer response_body.deinit();

    const result = try client.fetch(.{
        .location = .{ .url = "http://mockbin.com/har?foo=bar&foo=baz&baz=abc&key=value" },
        .method = .POST,
        .payload = "foo=bar",
        .extra_headers = &.{
            .{ .name = "cookie", .value = "foo=bar; bar=baz" },
            .{ .name = "accept", .value = "application/json" },
            .{ .name = "content-type", .value = "application/x-www-form-urlencoded" },
        },
        .response_writer = &response_body.writer,
    });

    std.debug.print("status: {d}\n", .{@backingInt(result.status)});
    std.debug.print("{s}\n", .{response_body.written()});
}