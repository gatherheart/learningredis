fn divide(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        Err(String::from("div by zero"))
    } else {
        Ok(a / b)
    }
}

fn main() {
    match divide(10, 2) {
        Ok(n) => println!("ok: {n}"),
        Err(e) => println!("err: {e}"),
    }
    match divide(10, 0) {
        Ok(n) => println!("ok: {n}"),
        Err(e) => println!("err: {e}"),
    }
}
