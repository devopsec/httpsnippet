fn main() -> attohttpc::Result {
    let response = attohttpc::post("http://mockbin.com/har?foo=bar&foo=baz&baz=abc&key=value")
        .header("cookie", "foo=bar; bar=baz")
        .header("accept", "application/json")
        .header("content-type", "application/x-www-form-urlencoded")
        .text("foo=bar")
        .send()?;

    println!("status: {}", response.status());
    println!("{}", response.text()?);
    Ok(())
}