fn main() -> attohttpc::Result {
    let response = attohttpc::get("http://mockbin.com/har")
        .send()?;

    println!("status: {}", response.status());
    println!("{}", response.text()?);
    Ok(())
}