module example;
import std::io, std::os::process;

fn int main()
{
	String[] command = {
		"curl",
		"--request", "POST",
		"--url", "http://mockbin.com/har?foo=bar&foo=baz&baz=abc&key=value",
		"--header", "accept: application/json",
		"--header", "content-type: application/x-www-form-urlencoded",
		"--cookie", "foo=bar; bar=baz",
		"--data-raw", "foo=bar",
	};

	int? status = process::run(command, INHERIT_ENV | INHERIT_STDIO);
	if (catch err = status)
	{
		io::eprintfn("failed to run curl: %s", err);
		return 1;
	}
	return status;
}