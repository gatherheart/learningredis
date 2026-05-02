enum Shape {
    Circle(f64),
    Square(f64),
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle(r) => 3.14 * r * r,
        Shape::Square(side) => side * side,
    }
}

fn main() {
    let c = Shape::Circle(2.0);
    let s = Shape::Square(3.0);
    println!("circle={}", area(&c));
    println!("square={}", area(&s));
}
