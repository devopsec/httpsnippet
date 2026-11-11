fn main() -> Result<(), ureq::Error> {
    let mut response = ureq::get("http://mockbin.com/har?foo%5Bbar%5D=baz%2Czap&fiz=buz&key=value")
        .call()?;

    println!("status: {}", response.status());
    println!("{}", response.body_mut().read_to_string()?);
    Ok(())
}