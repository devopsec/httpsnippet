module example;
import std::io, std::net::tcp;

fn void? send_request()
{
	TcpSocket socket = tcp::connect("mockbin.com", 80)!;
	defer (void)socket.close();

	String request = "GET /har HTTP/1.1\r\n"
		"Host: mockbin.com\r\n"
		"Connection: close\r\n"
		"\r\n";
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