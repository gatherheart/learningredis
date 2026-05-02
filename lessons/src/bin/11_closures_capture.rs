fn main() {
    let x = 10;
    let print_x = || println!("x={x}");
    print_x();
    print_x();

    let mut counter = 0;
    let mut increment = || {
        counter += 1;
        println!("counter={counter}");
    };
    increment();
    increment();
}
