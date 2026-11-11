module example;
import std::io, std::os::process;

fn int main()
{
	String[] command = {
		"curl",
		"--request", "POST",
		"--url", "http://mockbin.com/har",
		"--header", "content-type: application/json",
		"--data-raw", "{\"number\":1,\"string\":\"f\\\"oo\",\"arr\":[1,2,3],\"nested\":{\"a\":\"b\"},\"arr_mix\":[1,\"a\",{\"arr_mix_nested\":{}}],\"boolean\":false}",
	};

	int? status = process::run(command, INHERIT_ENV | INHERIT_STDIO);
	if (catch err = status)
	{
		io::eprintfn("failed to run curl: %s", err);
		return 1;
	}
	return status;
}