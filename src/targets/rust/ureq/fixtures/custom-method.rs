fn main() -> Result<(), ureq::Error> {
    let request = ureq::http::Request::builder()
        .method("PROPFIND")
        .uri("http://mockbin.com/har")
        .body(())?;
    let mut response = ureq::run(request)?;

    println!("status: {}", response.status());
    println!("{}", response.body_mut().read_to_string()?);
    Ok(())
}