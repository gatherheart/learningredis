trait Animal {
    fn name(&self) -> String;
    fn sound(&self) -> String {
        String::from("...")
    }
}

struct Cat;
struct Dog;

impl Animal for Cat {
    fn name(&self) -> String {
        String::from("cat")
    }
    fn sound(&self) -> String {
        String::from("meow")
    }
}

impl Animal for Dog {
    fn name(&self) -> String {
        String::from("dog")
    }
}

fn main() {
    let c = Cat;
    let d = Dog;
    println!("{}: {}", c.name(), c.sound());
    println!("{}: {}", d.name(), d.sound());
}
