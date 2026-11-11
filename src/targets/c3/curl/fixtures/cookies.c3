module example;
import std::io, std::os::process;

fn int main()
{
	String[] command = {
		"curl",
		"--request", "POST",
		"--url", "http://mockbin.com/har",
		"--cookie", "foo=bar; bar=baz",
	};

	int? status = process::run(command, INHERIT_ENV | INHERIT_STDIO);
	if (catch err = status)
	{
		io::eprintfn("failed to run curl: %s", err);
		return 1;
	}
	return status;
}