fn main() -> attohttpc::Result {
    let response = attohttpc::post("http://mockbin.com/har")
        .header("cookie", "foo=bar; bar=baz")
        .send()?;

    println!("status: {}", response.status());
    println!("{}", response.text()?);
    Ok(())
}