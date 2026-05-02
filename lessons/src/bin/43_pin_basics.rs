use std::pin::Pin;

fn main() {
    let value = String::from("pinned");
    let pinned = Pin::new(Box::new(value));
    println!("{}", pinned.as_ref().get_ref());
}
