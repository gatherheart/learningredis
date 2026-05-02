#[derive(Copy, Clone)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p1 = Point { x: 1, y: 2 };
    let p2 = p1;
    println!("p1 = {}, {}", p1.x, p1.y);
    println!("p2 = {}, {}", p2.x, p2.y);
}
