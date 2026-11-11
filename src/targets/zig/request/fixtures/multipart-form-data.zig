const std = @import("std");

pub fn main(init: std.process.Init) !void {
    const gpa = init.gpa;
    const io = init.io;

    var client: std.http.Client = .{ .allocator = gpa, .io = io };
    defer client.deinit();

    const uri = try std.Uri.parse("http://mockbin.com/har");
    var req = try client.request(.POST, uri, .{
        .extra_headers = &.{
            .{ .name = "Content-Type", .value = "multipart/form-data; boundary=---011000010111000001101001" },
        },
    });
    defer req.deinit();

    var payload = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"foo\"\r\n\r\nbar\r\n-----011000010111000001101001--\r\n".*;
    try req.sendBodyComplete(&payload);

    var redirect_buffer: [8 * 1024]u8 = undefined;
    var response = try req.receiveHead(&redirect_buffer);
    std.debug.print("status: {d}\n", .{@backingInt(response.head.status)});

    var transfer_buffer: [64]u8 = undefined;
    const body = try response.reader(&transfer_buffer).allocRemaining(gpa, .unlimited);
    defer gpa.free(body);
    std.debug.print("{s}\n", .{body});
}