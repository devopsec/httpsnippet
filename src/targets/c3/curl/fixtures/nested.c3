module example;
import std::io, std::os::process;

fn int main()
{
	String[] command = {
		"curl",
		"--request", "GET",
		"--url", "http://mockbin.com/har?foo%5Bbar%5D=baz%2Czap&fiz=buz&key=value",
	};

	int? status = process::run(command, INHERIT_ENV | INHERIT_STDIO);
	if (catch err = status)
	{
		io::eprintfn("failed to run curl: %s", err);
		return 1;
	}
	return status;
}