module example;
import std::io, std::os::process;

fn int main()
{
	String[] command = {
		"curl",
		"--request", "GET",
		"--url", "http://mockbin.com/har",
		"--header", "accept: application/json",
		"--header", "x-foo: Bar",
		"--header", "quoted-value: \"quoted\" 'string'",
	};

	int? status = process::run(command, INHERIT_ENV | INHERIT_STDIO);
	if (catch err = status)
	{
		io::eprintfn("failed to run curl: %s", err);
		return 1;
	}
	return status;
}