const std = @import("std");

// Build with: zig build-exe main.zig -lc -lcurl
const CURL = opaque {};
const curl_slist = opaque {};
const CURLcode = c_int;

const CURLOPT_URL: c_int = 10002;
const CURLOPT_COOKIE: c_int = 10022;
const CURLOPT_HTTPHEADER: c_int = 10023;
const CURLOPT_POSTFIELDS: c_int = 10015;
const CURLOPT_CUSTOMREQUEST: c_int = 10036;

extern "c" fn curl_easy_init() ?*CURL;
extern "c" fn curl_easy_setopt(handle: *CURL, option: c_int, ...) CURLcode;
extern "c" fn curl_easy_perform(handle: *CURL) CURLcode;
extern "c" fn curl_easy_cleanup(handle: *CURL) void;
extern "c" fn curl_easy_strerror(code: CURLcode) [*:0]const u8;
extern "c" fn curl_slist_append(list: ?*curl_slist, value: [*:0]const u8) ?*curl_slist;
extern "c" fn curl_slist_free_all(list: ?*curl_slist) void;

fn check(code: CURLcode) !void {
    if (code != 0) {
        std.debug.print("curl error: {s}\n", .{curl_easy_strerror(code)});
        return error.CurlFailed;
    }
}

pub fn main() !void {
    const hnd = curl_easy_init() orelse return error.CurlInitFailed;
    defer curl_easy_cleanup(hnd);

    try check(curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, @as([*:0]const u8, "PROPFIND")));
    try check(curl_easy_setopt(hnd, CURLOPT_URL, @as([*:0]const u8, "http://mockbin.com/har")));

    try check(curl_easy_perform(hnd));
}