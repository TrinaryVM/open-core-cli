# Supreme Mystery Canon Test

This test demonstrates executing a minimal Supreme Mystery (tetragram) program with the TrinaryVM runtime

use std::io::Write;
use std::process::Command;

// ─── STEP 1: Create minimal TritLang program that pushes 243 and repeatedly divides by 3 ──
let src = r#"
contract main {
    fn factors() {
        let n = 243;
        while n > 1 {
            push 3;
            n = n / 3;
        }
    }
}
"#;

let temp_src = std::env::temp_dir().join("factors.trit");
std::fs::write(&temp_src, src).unwrap();

let out_sm = std::env::temp_dir().join("factors.sm");

// ─── STEP 2: Run compile pipeline via CLI binary ───────────────────────────
let status = Command::new("cargo")
    .args(["run", "--quiet", "--package", "trinaryvm-cli", "--", "tetragram", "compile", "--source", temp_src.to_str().unwrap(), "--output", out_sm.to_str().unwrap()])
    .status()
    .unwrap();
assert!(status.success());

// Ensure .sm file was generated and non-empty.
let glyphs = std::fs::read_to_string(&out_sm).unwrap();
assert!(!glyphs.trim().is_empty(), "Generated glyph stream empty");
assert!(glyphs.chars().all(|c| (0x1D306..=0x1D356).contains(&(c as u32))), "Contains only tetragram glyphs");
``` 