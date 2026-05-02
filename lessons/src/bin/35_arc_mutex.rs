use std::sync::{Arc, Mutex};

fn main() {
    let count = Arc::new(Mutex::new(0));
    let shared = Arc::clone(&count);

    {
        let mut value = shared.lock().unwrap();
        *value += 2;
    }

    println!("count={}", count.lock().unwrap());
}
