use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        println!("worker thread");
    });

    handle.join().unwrap();
    println!("main thread");
}
