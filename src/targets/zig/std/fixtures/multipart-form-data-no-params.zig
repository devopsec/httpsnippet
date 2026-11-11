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
        .method = .POST,
        .extra_headers = &.{
            .{ .name = "Content-Type", .value = "multipart/form-data" },
        },
        .response_writer = &response_body.writer,
    });

    std.debug.print("status: {d}\n", .{@backingInt(result.status)});
    std.debug.print("{s}\n", .{response_body.written()});
}