fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn double(x: i32) -> i32 {
    x * 2
}

fn main() {
    let s = add(2, 3);
    let d = double(s);
    println!("s={s}, d={d}");
}
