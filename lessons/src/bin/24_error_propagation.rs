use std::num::ParseIntError;

fn parse_and_double(s: &str) -> Result<i32, ParseIntError> {
    let n: i32 = s.parse()?;
    Ok(n * 2)
}

fn main() {
    match parse_and_double("21") {
        Ok(n) => println!("ok: {n}"),
        Err(e) => println!("err: {e}"),
    }
    match parse_and_double("xyz") {
        Ok(n) => println!("ok: {n}"),
        Err(e) => println!("err: {e}"),
    }
}
