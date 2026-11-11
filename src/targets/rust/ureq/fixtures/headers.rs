fn main() -> Result<(), ureq::Error> {
    let mut response = ureq::get("http://mockbin.com/har")
        .header("accept", "application/json")
        .header("x-foo", "Bar")
        .header("quoted-value", "\"quoted\" 'string'")
        .call()?;

    println!("status: {}", response.status());
    println!("{}", response.body_mut().read_to_string()?);
    Ok(())
}