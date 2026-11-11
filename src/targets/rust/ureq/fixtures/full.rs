fn main() -> Result<(), ureq::Error> {
    let mut response = ureq::post("http://mockbin.com/har?foo=bar&foo=baz&baz=abc&key=value")
        .header("cookie", "foo=bar; bar=baz")
        .header("accept", "application/json")
        .header("content-type", "application/x-www-form-urlencoded")
        .send("foo=bar")?;

    println!("status: {}", response.status());
    println!("{}", response.body_mut().read_to_string()?);
    Ok(())
}