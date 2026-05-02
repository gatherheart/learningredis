fn main() {
    let mut x = 10;
    let p: *mut i32 = &mut x;
    unsafe {
        *p = *p + 5;
    }
    println!("x={x}");
}
