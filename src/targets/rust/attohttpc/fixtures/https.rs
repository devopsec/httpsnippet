fn main() -> attohttpc::Result {
    let response = attohttpc::get("https://mockbin.com/har")
        .send()?;

    println!("status: {}", response.status());
    println!("{}", response.text()?);
    Ok(())
}