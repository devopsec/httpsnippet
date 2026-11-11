fn main() -> Result<(), ureq::Error> {
    let mut response = ureq::post("http://mockbin.com/har")
        .header("content-type", "application/json")
        .send("{\"number\":1,\"string\":\"f\\\"oo\",\"arr\":[1,2,3],\"nested\":{\"a\":\"b\"},\"arr_mix\":[1,\"a\",{\"arr_mix_nested\":{}}],\"boolean\":false}")?;

    println!("status: {}", response.status());
    println!("{}", response.body_mut().read_to_string()?);
    Ok(())
}