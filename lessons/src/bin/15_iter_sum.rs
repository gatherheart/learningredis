fn main() {
    let nums = vec![1, 2, 3, 4, 5];
    let total: i32 = nums.iter().sum();
    let max = nums.iter().max().unwrap();
    println!("total={total}");
    println!("max={max}");
}
