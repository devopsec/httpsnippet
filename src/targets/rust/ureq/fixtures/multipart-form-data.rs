fn main() -> Result<(), ureq::Error> {
    let mut response = ureq::post("http://mockbin.com/har")
        .header("content-type", "multipart/form-data; boundary=---011000010111000001101001")
        .send("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"foo\"\r\n\r\nbar\r\n-----011000010111000001101001--\r\n")?;

    println!("status: {}", response.status());
    println!("{}", response.body_mut().read_to_string()?);
    Ok(())
}