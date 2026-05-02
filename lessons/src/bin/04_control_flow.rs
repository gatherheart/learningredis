fn main() {
    let n = 5;
    if n > 3 {
        println!("big");
    } else {
        println!("small");
    }

    let mut i = 0;
    while i < 3 {
        println!("i={i}");
        i += 1;
    }

    for x in 0..3 {
        println!("x={x}");
    }
}
