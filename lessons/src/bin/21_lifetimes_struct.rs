struct Borrower<'a> {
    name: &'a str,
}

impl<'a> Borrower<'a> {
    fn announce(&self) {
        println!("Borrower: {}", self.name);
    }
}

fn main() {
    let owner = String::from("Alice");
    let b = Borrower { name: &owner };
    b.announce();
}
