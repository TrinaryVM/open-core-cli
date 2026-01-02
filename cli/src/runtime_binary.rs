//! Runtime binary detection and invocation utilities
//! 
//! This module handles detection and invocation of the external `trinaryvm` binary
//! which contains the actual VM runtime implementation.

use std::process::{Command, Stdio};
use std::io::{self, Write};

/// Binary name to look for
const RUNTIME_BINARY: &str = "trinaryvm";

/// Check if the runtime binary is available in PATH
pub fn is_runtime_available() -> bool {
    Command::new(RUNTIME_BINARY)
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

/// Get the runtime binary path, or None if not found
pub fn find_runtime_binary() -> Option<String> {
    // First try direct invocation
    if is_runtime_available() {
        return Some(RUNTIME_BINARY.to_string());
    }
    
    // Try common installation paths
    let common_paths = [
        "/usr/local/bin/trinaryvm",
        "/usr/bin/trinaryvm",
        "~/.local/bin/trinaryvm",
        "./trinaryvm",
    ];
    
    for path in &common_paths {
        let expanded = shellexpand::tilde(path).to_string();
        if Command::new(&expanded)
            .arg("--version")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
        {
            return Some(expanded);
        }
    }
    
    None
}

/// Invoke the runtime binary with arguments
pub fn invoke_runtime(args: &[&str]) -> Result<String, String> {
    let binary = find_runtime_binary()
        .ok_or_else(|| format!("{}", get_install_instructions()))?;
    
    let output = Command::new(&binary)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to execute {}: {}", binary, e))?;
    
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Runtime execution failed:\n{}", stderr));
    }
    
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

/// Get install instructions for the runtime binary
pub fn get_install_instructions() -> String {
    format!(
        r#"
❌ TrinaryVM runtime binary not found

The 'trinaryvm' runtime binary is required for this command.

📦 Installation Options:

1. Download pre-compiled binaries:
   Visit: https://github.com/TrinaryVM/trinaryvm-core/releases
   
2. Build from source (requires access to private repository):
   git clone git@github.com:TrinaryVM/trinaryvm-core.git
   cd trinaryvm-core/runtime
   cargo build --release
   
3. Enterprise/Partner access:
   Contact: favourablegroup@gmail.com
   
4. Add to PATH:
   After installation, ensure 'trinaryvm' is in your PATH:
   export PATH="$PATH:/path/to/trinaryvm/bin"
"#
    )
}

/// Print install instructions to stderr
pub fn print_install_instructions() {
    eprintln!("{}", get_install_instructions());
}

