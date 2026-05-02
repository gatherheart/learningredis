fn main() {
    let nums = vec![1, 2, 3, 4];
    let sum = nums.iter().fold(0, |acc, x| acc + x);
    let product = nums.iter().fold(1, |acc, x| acc * x);
    println!("sum={sum}");
    println!("product={product}");
}
