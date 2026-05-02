fn main() {
    let s1: &str = "hello";
    let s2: String = String::from("world");
    let combined = format!("{s1}, {s2}!");
    println!("{combined}");
    println!("len={}", combined.len());
}
