fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {
    let mut max = list[0];
    for &item in list {
        if item > max {
            max = item;
        }
    }
    max
}

fn main() {
    let ints = [10, 25, 3, 47, 8];
    let floats = [1.1, 2.2, 0.5];
    println!("max int = {}", largest(&ints));
    println!("max float = {}", largest(&floats));
}
