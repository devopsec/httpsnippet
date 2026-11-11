fn main() -> attohttpc::Result {
    let response = attohttpc::post("http://mockbin.com/har")
        .header("content-type", "application/x-www-form-urlencoded")
        .text("foo=bar&hello=world")
        .send()?;

    println!("status: {}", response.status());
    println!("{}", response.text()?);
    Ok(())
}