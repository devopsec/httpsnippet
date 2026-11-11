fn main() -> attohttpc::Result {
    let response = attohttpc::RequestBuilder::new(
        attohttpc::Method::from_bytes(b"PROPFIND").expect("valid HTTP method"),
        "http://mockbin.com/har",
    )
        .send()?;

    println!("status: {}", response.status());
    println!("{}", response.text()?);
    Ok(())
}