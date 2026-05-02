trait Draw {
    fn draw(&self);
}

struct Button;

impl Draw for Button {
    fn draw(&self) {
        println!("button");
    }
}

fn render(item: &dyn Draw) {
    item.draw();
}

fn main() {
    let button = Button;
    render(&button);
}
