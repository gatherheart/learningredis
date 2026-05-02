fn main() {
    let b: Box<i32> = Box::new(5);
    println!("b={b}");
    println!("doubled={}", *b * 2);
}
