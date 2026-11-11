module example;
import std::io, std::os::process;

fn int main()
{
	String[] command = {
		"curl",
		"--request", "POST",
		"--url", "http://mockbin.com/har",
		"--header", "content-type: multipart/form-data; boundary=---011000010111000001101001",
		"--data-raw", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"foo\"; filename=\"hello.txt\"\r\nContent-Type: text/plain\r\n\r\n\r\n-----011000010111000001101001--\r\n",
	};

	int? status = process::run(command, INHERIT_ENV | INHERIT_STDIO);
	if (catch err = status)
	{
		io::eprintfn("failed to run curl: %s", err);
		return 1;
	}
	return status;
}