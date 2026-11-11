fn main() -> Result<(), ureq::Error> {
    let mut response = ureq::get("http://mockbin.com/har?foo=bar&foo=baz&baz=abc&key=value")
        .call()?;

    println!("status: {}", response.status());
    println!("{}", response.body_mut().read_to_string()?);
    Ok(())
}