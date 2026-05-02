use std::rc::Rc;

fn main() {
    let a = Rc::new(String::from("hello"));
    let b = Rc::clone(&a);
    let c = Rc::clone(&a);
    println!("count={}", Rc::strong_count(&a));
    println!("a={a}, b={b}, c={c}");
}
