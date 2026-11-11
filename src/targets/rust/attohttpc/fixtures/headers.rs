fn main() -> attohttpc::Result {
    let response = attohttpc::get("http://mockbin.com/har")
        .header("accept", "application/json")
        .header("x-foo", "Bar")
        .header("quoted-value", "\"quoted\" 'string'")
        .send()?;

    println!("status: {}", response.status());
    println!("{}", response.text()?);
    Ok(())
}