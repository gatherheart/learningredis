fn main() {
    let value: Option<i32> = Some(42);
    let n = value.unwrap();
    println!("n={n}");

    let result: Result<i32, &str> = Ok(7);
    let r = result.expect("should be ok");
    println!("r={r}");
}
