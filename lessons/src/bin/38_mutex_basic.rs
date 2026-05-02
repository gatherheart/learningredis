use std::sync::Mutex;

fn main() {
    let counter = Mutex::new(0);

    {
        let mut value = counter.lock().unwrap();
        *value += 5;
    }

    println!("count={}", *counter.lock().unwrap());
}
