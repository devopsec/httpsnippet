const std = @import("std");

pub fn main(init: std.process.Init) !void {
    const gpa = init.gpa;
    const io = init.io;

    var client: std.http.Client = .{ .allocator = gpa, .io = io };
    defer client.deinit();

    const uri = try std.Uri.parse("http://mockbin.com/har");
    var req = try client.request(.POST, uri, .{
        .extra_headers = &.{
            .{ .name = "cookie", .value = "foo=bar; bar=baz" },
        },
    });
    defer req.deinit();

    try req.sendBodiless();

    var redirect_buffer: [8 * 1024]u8 = undefined;
    var response = try req.receiveHead(&redirect_buffer);
    std.debug.print("status: {d}\n", .{@backingInt(response.head.status)});

    var transfer_buffer: [64]u8 = undefined;
    const body = try response.reader(&transfer_buffer).allocRemaining(gpa, .unlimited);
    defer gpa.free(body);
    std.debug.print("{s}\n", .{body});
}