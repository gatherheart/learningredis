fn main() {
    let v = vec![1, 2, 3];
    println!("{:?}", v);

    let formatted = format!("{}+{}={}", 2, 3, 2 + 3);
    println!("{formatted}");

    println!("debug: {:?}", v);
}
