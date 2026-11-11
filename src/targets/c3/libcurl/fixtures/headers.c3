module example;
import std::io;

// Build with: c3c compile main.c3 -l curl
alias Curl = void*;
alias CurlSlist = void*;

extern fn Curl curl_easy_init();
extern fn CInt curl_easy_setopt(Curl handle, CInt option, ...);
extern fn CInt curl_easy_perform(Curl handle);
extern fn void curl_easy_cleanup(Curl handle);
extern fn ZString curl_easy_strerror(CInt code);
extern fn CurlSlist curl_slist_append(CurlSlist list, ZString value);
extern fn void curl_slist_free_all(CurlSlist list);

const CInt CURLOPT_URL = 10002;
const CInt CURLOPT_COOKIE = 10022;
const CInt CURLOPT_HTTPHEADER = 10023;
const CInt CURLOPT_POSTFIELDS = 10015;
const CInt CURLOPT_CUSTOMREQUEST = 10036;

fn int main()
{
	Curl hnd = curl_easy_init();
	if (!hnd) return 1;
	defer curl_easy_cleanup(hnd);

	curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, (ZString)"GET");
	curl_easy_setopt(hnd, CURLOPT_URL, (ZString)"http://mockbin.com/har");

	CurlSlist headers = null;
	defer curl_slist_free_all(headers);
	headers = curl_slist_append(headers, "accept: application/json");
	headers = curl_slist_append(headers, "x-foo: Bar");
	headers = curl_slist_append(headers, "quoted-value: \"quoted\" 'string'");
	curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

	CInt ret = curl_easy_perform(hnd);
	if (ret != 0)
	{
		io::eprintfn("curl_easy_perform() failed: %s", curl_easy_strerror(ret));
		return 1;
	}
	return 0;
}