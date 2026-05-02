use std::cell::RefCell;

fn main() {
    let cell = RefCell::new(5);
    {
        let mut x = cell.borrow_mut();
        *x += 10;
    }
    println!("value={}", cell.borrow());
}
