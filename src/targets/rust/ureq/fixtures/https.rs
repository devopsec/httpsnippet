fn main() -> Result<(), ureq::Error> {
    let mut response = ureq::get("https://mockbin.com/har")
        .call()?;

    println!("status: {}", response.status());
    println!("{}", response.body_mut().read_to_string()?);
    Ok(())
}