module example;
import std::io, std::net::tcp;

fn void? send_request()
{
	TcpSocket socket = tcp::connect("mockbin.com", 80)!;
	defer (void)socket.close();

	String request = "POST /har HTTP/1.1\r\n"
		"Host: mockbin.com\r\n"
		"content-type: application/json\r\n"
		"Content-Length: 12\r\n"
		"Connection: close\r\n"
		"\r\n"
		"{\"foo\":null}";
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