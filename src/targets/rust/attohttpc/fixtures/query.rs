fn main() -> attohttpc::Result {
    let response = attohttpc::get("http://mockbin.com/har?foo=bar&foo=baz&baz=abc&key=value")
        .send()?;

    println!("status: {}", response.status());
    println!("{}", response.text()?);
    Ok(())
}