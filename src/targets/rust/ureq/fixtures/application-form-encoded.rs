fn main() -> Result<(), ureq::Error> {
    let mut response = ureq::post("http://mockbin.com/har")
        .header("content-type", "application/x-www-form-urlencoded")
        .send("foo=bar&hello=world")?;

    println!("status: {}", response.status());
    println!("{}", response.body_mut().read_to_string()?);
    Ok(())
}