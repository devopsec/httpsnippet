const std = @import("std");

pub fn main(init: std.process.Init) !void {
    const gpa = init.gpa;
    const io = init.io;

    var client: std.http.Client = .{ .allocator = gpa, .io = io };
    defer client.deinit();

    const uri = try std.Uri.parse("http://mockbin.com/har");
    var req = try client.request(.POST, uri, .{
        .extra_headers = &.{
            .{ .name = "content-type", .value = "application/json" },
        },
    });
    defer req.deinit();

    var payload = "{\"number\":1,\"string\":\"f\\\"oo\",\"arr\":[1,2,3],\"nested\":{\"a\":\"b\"},\"arr_mix\":[1,\"a\",{\"arr_mix_nested\":{}}],\"boolean\":false}".*;
    try req.sendBodyComplete(&payload);

    var redirect_buffer: [8 * 1024]u8 = undefined;
    var response = try req.receiveHead(&redirect_buffer);
    std.debug.print("status: {d}\n", .{@backingInt(response.head.status)});

    var transfer_buffer: [64]u8 = undefined;
    const body = try response.reader(&transfer_buffer).allocRemaining(gpa, .unlimited);
    defer gpa.free(body);
    std.debug.print("{s}\n", .{body});
}