module example;
import std::io, std::net::tcp;

fn void? send_request()
{
	TcpSocket socket = tcp::connect("mockbin.com", 80)!;
	defer (void)socket.close();

	String request = "POST /har HTTP/1.1\r\n"
		"Host: mockbin.com\r\n"
		"content-type: multipart/form-data; boundary=---011000010111000001101001\r\n"
		"Content-Length: 266\r\n"
		"Connection: close\r\n"
		"\r\n"
		"-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"foo\"; filename=\"hello.txt\"\r\nContent-Type: text/plain\r\n\r\nHello World\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"bar\"\r\n\r\nBonjour le monde\r\n-----011000010111000001101001--\r\n";
	io::write_all(&socket, request)!;

	char[4096] buffer;
	while (true)
	{
		sz n = socket.read(&buffer)!;
		if (n == 0) break;
		io::print((String)buffer[:n]);
	}
}

fn int main()
{
	if (catch err = send_request())
	{
		io::eprintfn("request failed: %s", err);
		return 1;
	}
	return 0;
}