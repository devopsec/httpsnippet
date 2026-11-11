fn main() -> attohttpc::Result {
    let response = attohttpc::get("http://mockbin.com/har?foo%5Bbar%5D=baz%2Czap&fiz=buz&key=value")
        .send()?;

    println!("status: {}", response.status());
    println!("{}", response.text()?);
    Ok(())
}