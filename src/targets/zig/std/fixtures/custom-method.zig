const std = @import("std");

pub fn main(init: std.process.Init) !void {
    const gpa = init.gpa;
    const io = init.io;

    var client: std.http.Client = .{ .allocator = gpa, .io = io };
    defer client.deinit();

    var response_body: std.Io.Writer.Allocating = .init(gpa);
    defer response_body.deinit();

    // std.http.Method has no PROPFIND; use the libcurl client for custom methods.
    const result = try client.fetch(.{
        .location = .{ .url = "http://mockbin.com/har" },
        .response_writer = &response_body.writer,
    });

    std.debug.print("status: {d}\n", .{@backingInt(result.status)});
    std.debug.print("{s}\n", .{response_body.written()});
}