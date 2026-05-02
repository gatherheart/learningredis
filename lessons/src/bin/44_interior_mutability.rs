use std::cell::RefCell;

fn main() {
    let value = RefCell::new(1);
    *value.borrow_mut() += 1;
    println!("{}", value.borrow());
}
