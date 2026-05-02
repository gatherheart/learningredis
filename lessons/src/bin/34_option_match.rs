fn describe(value: Option<i32>) -> &'static str {
    match value {
        Some(n) if n > 10 => "big",
        Some(_) => "small",
        None => "none",
    }
}

fn main() {
    println!("{}", describe(Some(3)));
    println!("{}", describe(Some(25)));
    println!("{}", describe(None));
}
