fn main() -> attohttpc::Result {
    let response = attohttpc::post("http://mockbin.com/har")
        .header("content-type", "multipart/form-data")
        .send()?;

    println!("status: {}", response.status());
    println!("{}", response.text()?);
    Ok(())
}