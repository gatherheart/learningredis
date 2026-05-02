fn main() {
    let pair = (1, "two");
    let (a, b) = pair;
    println!("a={a} b={b}");

    let arr = [10, 20, 30];
    println!("first={}", arr[0]);
    println!("len={}", arr.len());
}
