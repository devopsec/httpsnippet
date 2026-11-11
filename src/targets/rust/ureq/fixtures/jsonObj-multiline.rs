fn main() -> Result<(), ureq::Error> {
    let mut response = ureq::post("http://mockbin.com/har")
        .header("content-type", "application/json")
        .send("{\n  \"foo\": \"bar\"\n}")?;

    println!("status: {}", response.status());
    println!("{}", response.body_mut().read_to_string()?);
    Ok(())
}