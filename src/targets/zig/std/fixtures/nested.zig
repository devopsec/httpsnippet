const std = @import("std");

pub fn main(init: std.process.Init) !void {
    const gpa = init.gpa;
    const io = init.io;

    var client: std.http.Client = .{ .allocator = gpa, .io = io };
    defer client.deinit();

    var response_body: std.Io.Writer.Allocating = .init(gpa);
    defer response_body.deinit();

    const result = try client.fetch(.{
        .location = .{ .url = "http://mockbin.com/har?foo%5Bbar%5D=baz%2Czap&fiz=buz&key=value" },
        .method = .GET,
        .response_writer = &response_body.writer,
    });

    std.debug.print("status: {d}\n", .{@backingInt(result.status)});
    std.debug.print("{s}\n", .{response_body.written()});
}