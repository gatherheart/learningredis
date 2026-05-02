fn takes_ownership(s: String) {
    println!("got: {s}");
}

fn borrows(s: &String) {
    println!("borrowed: {s}");
}

fn main() {
    let owned = String::from("hello");
    borrows(&owned);
    println!("still here: {owned}");
    takes_ownership(owned);
    // owned cannot be used here — it has been moved.
    println!("done");
}
