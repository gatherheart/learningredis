use std::sync::Arc;
use std::thread;

fn main() {
    let data = Arc::new(String::from("shared"));
    let cloned = Arc::clone(&data);
    let handle = thread::spawn(move || {
        println!("{cloned}");
    });
    handle.join().unwrap();
}
