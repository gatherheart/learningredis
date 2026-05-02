struct Point {
    x: i32,
    y: i32,
}

impl Point {
    fn distance(&self) -> f64 {
        ((self.x * self.x + self.y * self.y) as f64).sqrt()
    }
}

fn main() {
    let p = Point { x: 3, y: 4 };
    println!("x={}, y={}", p.x, p.y);
    println!("dist={}", p.distance());
}
