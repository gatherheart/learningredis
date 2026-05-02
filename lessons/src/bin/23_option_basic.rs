fn first_word(s: &str) -> Option<&str> {
    s.split_whitespace().next()
}

fn main() {
    let s = "hello world";
    let empty = "";
    println!("{:?}", first_word(s));
    println!("{:?}", first_word(empty));
    println!("default: {}", first_word(empty).unwrap_or("none"));
}
