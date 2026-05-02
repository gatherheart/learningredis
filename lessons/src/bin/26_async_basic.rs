async fn one() -> i32 {
    1
}

async fn two() -> i32 {
    2
}

fn main() {
    let result = pollster::block_on(async { one().await + two().await });
    println!("result={result}");
}
