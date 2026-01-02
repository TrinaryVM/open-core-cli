#![allow(dead_code)]

use clap::{Parser, Subcommand, ValueEnum};
use std::fs;
use std::path::PathBuf;
use std::path::Path;
use std::time::Instant;
use std::process::Command;

mod runtime_binary;
mod tetragram_commands;

use runtime_binary::{invoke_runtime, print_install_instructions, is_runtime_available};
use tetragram_commands::TetragramCommands;

#[derive(Parser)]
#[command(name = "trinaryvm-cli")]
#[command(about = "TrinaryVM Production CLI with Supreme Mystery (.sm) support")]
#[command(version = "1.0.0")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Execute TrinaryVM bytecode
    Run {
        /// Input bytecode file
        #[arg(short, long)]
        file: String,
        
        /// Gas limit
        #[arg(long, default_value = "1000000")]
        gas_limit: u64,
        
        /// Enable debug mode
        #[arg(short, long)]
        debug: bool,
    },
    
    /// Tetragram operations with Supreme Mystery (.sm) files
    #[command(subcommand)]
    Tetragram(TetragramCommands),
    
    /// Benchmark TrinaryVM performance
    Benchmark {
        /// Number of iterations
        #[arg(long, default_value = "1000")]
        iterations: usize,
        
        /// Output JSON results
        #[arg(long)]
        json: bool,

        /// Benchmark suite (basic | trifhe)
        #[arg(long, default_value = "basic")]
        suite: String,
    },
    
    /// Validate Tesla 3-6-9 alignment
    ValidateAlignment {
        /// File to validate
        #[arg(short, long)]
        file: String,
    },
    
    /// API Gateway management
    ApiGateway {
        /// Action to perform
        action: ApiAction,

        /// Target environment (e.g. prod, staging)
        #[arg(short, long)]
        env: Option<String>,
    },

    /// Generate TriFHE keypair
    Keys {
        /// Output directory
        #[arg(short, long, value_name="DIR", default_value = "vm_outputs")]
        out_dir: PathBuf,

        /// Key file prefix
        #[arg(short, long, default_value = "keys")]
        name: String,
    },

    /// Encrypt a file using TriFHE public key
    Encrypt {
        /// Input file
        #[arg(short, long)]
        input: PathBuf,

        /// Public key file
        #[arg(long)]
        pk: PathBuf,

        /// Output ciphertext path
        #[arg(short, long)]
        output: PathBuf,
    },

    /// Decrypt a file using TriFHE secret key
    Decrypt {
        #[arg(short, long)]
        input: PathBuf,

        #[arg(long)]
        sk: PathBuf,

        #[arg(short, long)]
        output: PathBuf,
    },

    /// Compute SHA3-2187 hash of file
    Hash {
        #[arg(short, long)]
        input: PathBuf,

        #[arg(short, long)]
        output: Option<PathBuf>,

        /// Output hex instead of raw bytes
        #[arg(long)]
        hex: bool,
    },

    /// Comprehensive TriFHE implementation validation
    ValidateImpl {
        /// Run comprehensive tests
        #[arg(long)]
        comprehensive: bool,
    },
    
    /// Estimate gas for contracts and transactions
    GasEstimate {
        /// Input bytecode file or transaction data
        #[arg(short, long)]
        file: Option<String>,
        
        /// Estimate for specific operation type
        #[arg(long)]
        operation: Option<String>,
        
        /// Data size in trits (for homomorphic operations)
        #[arg(long)]
        data_size: Option<usize>,
        
        /// Check if data is tetragram-compressed
        #[arg(long)]
        compressed: bool,
        
        /// Show detailed breakdown
        #[arg(long)]
        detailed: bool,
        
        /// Output JSON format
        #[arg(long)]
        json: bool,
    },
}

#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, ValueEnum, Debug)]
enum ApiAction { Deploy, Rollback, Status }

const DEFAULT_OUTPUT_DIR: &str = "vm_outputs";

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Ensure default output directory exists
    if !Path::new(DEFAULT_OUTPUT_DIR).exists() {
        fs::create_dir_all(DEFAULT_OUTPUT_DIR)?;
    }

    let cli = Cli::parse();
    
    match cli.command {
        Commands::Run { file, gas_limit, debug } => {
            println!("🔺 TrinaryVM Runtime Executor");
            if debug {
                println!("🐛 Debug mode enabled");
            }
            
            // Invoke external runtime binary
            let mut args = vec!["run", "--file", &file, "--gas-limit", &gas_limit.to_string()];
            if debug {
                args.push("--debug");
            }
            
            let output = invoke_runtime(&args)?;
            print!("{}", output);
            
            Ok(())
        }
        
        Commands::Tetragram(tetragram_cmd) => {
            use tetragram_commands::*;
            
            match tetragram_cmd {
                TetragramCommands::Execute(args) => execute_tetragram_program(args),
                TetragramCommands::Validate(args) => validate_tetragram_file(args),
                TetragramCommands::Benchmark(args) => benchmark_tetragram_performance(args),
                TetragramCommands::Create(args) => create_tetragram_template(args),
                TetragramCommands::Convert(args) => tetragram_commands::convert_tetragram_file(args),
                TetragramCommands::Compile(args) => tetragram_commands::compile_pipeline(args),
                TetragramCommands::Analyze(args) => tetragram_commands::analyze_tetragram_file(args),
            }
        }
        
        Commands::Benchmark { iterations, json, suite } => {
            println!("⚡ TrinaryVM Performance Benchmark");
            println!("🔄 Running {} iterations...", iterations);

            let mut args = vec!["benchmark", "--iterations", &iterations.to_string()];
            if json {
                args.push("--json");
            }
            args.push("--suite");
            args.push(&suite);
            
            let output = invoke_runtime(&args)?;
            print!("{}", output);
            
            Ok(())
        }
        
        Commands::ValidateAlignment { file } => {
            println!("🔺 Tesla 3-6-9 Alignment Validator");
            println!("📁 Checking: {}", file);
            
            let content = std::fs::read_to_string(&file)?;
            let char_count = content.chars().count();
            
            println!("📏 Character count: {}", char_count);
            
            // Semantic pattern detection (simple heuristic)
            if content.contains("3-6-9") || content.contains("369") {
                println!("🔍 Detected 3-6-9 motif inside file (semantic alignment)");
            }
            
            if char_count % 3 == 0 {
                println!("✅ Divisible by 3 (Tesla aligned)");
            } else {
                println!("❌ Not divisible by 3");
            }
            
            if char_count % 9 == 0 {
                println!("✅ Divisible by 9 (Sacred completion)");
            } else {
                println!("❌ Not divisible by 9");
            }
            
            if char_count % 27 == 0 {
                println!("✅ Divisible by 27 (Perfect harmony)");
            } else {
                println!("❌ Not divisible by 27");
            }
            
            Ok(())
        }
        
        Commands::ApiGateway { action, env } => {
            println!("🛡️  API Gateway command: {:?}", action);
            let env_label = env.unwrap_or_else(|| "default".into());
            match action {
                ApiAction::Deploy | ApiAction::Rollback | ApiAction::Status => {
                    let script = "scripts/api_gateway.sh";
                    let status = Command::new(script)
                        .arg(match action { ApiAction::Deploy => "deploy", ApiAction::Rollback => "rollback", ApiAction::Status => "status" })
                        .arg(&env_label)
                        .status()?;
                    if !status.success() {
                        eprintln!("❌ Script {} failed with status {:?}", script, status.code());
                        std::process::exit(1);
                    }
                }
            }
            Ok(())
        },

        Commands::Keys { out_dir, name } => {
            let args = vec![
                "keys",
                "--out-dir", &out_dir.to_string_lossy(),
                "--name", &name,
            ];
            let output = invoke_runtime(&args)?;
            print!("{}", output);
            Ok(())
        }

        Commands::Encrypt { input, pk, output } => {
            let args = vec![
                "encrypt",
                "--input", &input.to_string_lossy(),
                "--pk", &pk.to_string_lossy(),
                "--output", &output.to_string_lossy(),
            ];
            let output = invoke_runtime(&args)?;
            print!("{}", output);
            Ok(())
        }

        Commands::Decrypt { input, sk, output } => {
            let args = vec![
                "decrypt",
                "--input", &input.to_string_lossy(),
                "--sk", &sk.to_string_lossy(),
                "--output", &output.to_string_lossy(),
            ];
            let output = invoke_runtime(&args)?;
            print!("{}", output);
            Ok(())
        }

        Commands::Hash { input, output, hex } => {
            let mut args = vec![
                "hash",
                "--input", &input.to_string_lossy(),
            ];
            if let Some(out) = output {
                args.push("--output");
                args.push(&out.to_string_lossy());
            }
            if hex {
                args.push("--hex");
            }
            let output = invoke_runtime(&args)?;
            print!("{}", output);
            Ok(())
        }

        Commands::ValidateImpl { comprehensive } => {
            let mut args = vec!["validate-impl"];
            if comprehensive {
                args.push("--comprehensive");
            }
            let output = invoke_runtime(&args)?;
            print!("{}", output);
            Ok(())
        }
        
        Commands::GasEstimate { file, operation, data_size, compressed, detailed, json } => {
            let mut args = vec!["gas-estimate"];
            
            if let Some(file_path) = file {
                args.push("--file");
                args.push(&file_path);
                if compressed {
                    args.push("--compressed");
                }
            } else if let Some(op_str) = operation {
                args.push("--operation");
                args.push(&op_str);
                if let Some(size) = data_size {
                    args.push("--data-size");
                    args.push(&size.to_string());
                }
            } else {
                eprintln!("Usage: trinaryvm gas-estimate --file <bytecode> OR --operation <op> --data-size <size>");
                eprintln!("Use --help for more information");
                std::process::exit(1);
            }
            
            if detailed {
                args.push("--detailed");
            }
            if json {
                args.push("--json");
            }
            
            let output = invoke_runtime(&args)?;
            print!("{}", output);
            Ok(())
        }
    }
}

fn generate_keys(output_dir: &PathBuf, name: &str) -> Result<(), Box<dyn std::error::Error>> {
    println!("🔑 Generating TriFHE key pair for 3^2187 keyspace...");
    let start = Instant::now();
    
    let mut ctx = TriFHEContext::new();
    let keys = ctx.generate_keys()?;
    
    let duration = start.elapsed();
    println!("✅ Key generation completed in {:.2?}", duration);
    
    // Save keys to files
    let pk_path = output_dir.join(format!("{}_public.key", name));
    let sk_path = output_dir.join(format!("{}_secret.key", name));
    let evk_path = output_dir.join(format!("{}_evaluation.key", name));
    let bk_path = output_dir.join(format!("{}_bootstrap.key", name));
    
    save_public_key(&keys.public_key, &pk_path)?;
    save_secret_key(&keys.secret_key, &sk_path)?;
    save_evaluation_key(&keys.evaluation_key, &evk_path)?;
    save_bootstrapping_key(&keys.bootstrapping_key, &bk_path)?;
    
    println!("📁 Keys saved to:");
    println!("   Public key: {}", pk_path.display());
    println!("   Secret key: {}", sk_path.display());
    println!("   Evaluation key: {}", evk_path.display());
    println!("   Bootstrap key: {}", bk_path.display());
    
    // Display key statistics
    println!("\n📊 Key Statistics:");
    println!("   Security level: {} bits", keys.public_key.params.security_level);
    println!("   Ring dimension: {}", keys.public_key.params.n);
    println!("   Modulus: {}", keys.public_key.params.q);
    println!("   Plain modulus: {}", keys.public_key.params.plain_modulus);
    
    Ok(())
}

fn encrypt_file(input_path: &PathBuf, pk_path: &PathBuf, output_path: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    println!("🔒 Encrypting file with TriFHE...");
    let start = Instant::now();
    
    // Read input file
    let input_data = fs::read(input_path)?;
    println!("📖 Read {} bytes from {}", input_data.len(), input_path.display());
    
    // Convert to trits
    let trits = bytes_to_trits(&input_data);
    println!("🔄 Converted to {} trits", trits.len());
    
    // Load public key
    let public_key = load_public_key(pk_path)?;
    
    // Encrypt
    let mut ctx = TriFHEContext::new();
    let ciphertext = ctx.encrypt(&trits, &public_key)?;
    
    let duration = start.elapsed();
    println!("✅ Encryption completed in {:.2?}", duration);
    
    // Save ciphertext
    let normalized = normalize_output_path(output_path);
    save_ciphertext(&ciphertext, &normalized)?;
    println!("💾 Encrypted data saved to {}", normalized.display());
    
    // Display encryption statistics
    println!("\n📊 Encryption Statistics:");
    println!("   Input size: {} bytes", input_data.len());
    println!("   Trit count: {}", trits.len());
    println!("   Ciphertext size: {} trit pairs", ciphertext.size());
    println!("   Noise level: {:.3}", ciphertext.noise_level);
    
    Ok(())
}

fn decrypt_file(input_path: &PathBuf, sk_path: &PathBuf, output_path: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    println!("🔓 Decrypting file with TriFHE...");
    let start = Instant::now();
    
    // Load encrypted data
    let ciphertext = load_ciphertext(input_path)?;
    println!("📖 Loaded ciphertext with {} trit pairs", ciphertext.size());
    
    // Load secret key
    let secret_key = load_secret_key(sk_path)?;
    
    // Decrypt
    let ctx = TriFHEContext::new();
    let decrypted_trits = ctx.decrypt(&ciphertext, &secret_key)?;
    
    let duration = start.elapsed();
    println!("✅ Decryption completed in {:.2?}", duration);
    
    // Convert back to bytes
    let decrypted_bytes = trits_to_bytes(&decrypted_trits);
    
    // Save decrypted data
    let normalized = normalize_output_path(output_path);
    if let Some(parent) = normalized.parent() { fs::create_dir_all(parent)?; }
    fs::write(&normalized, &decrypted_bytes)?;
    println!("💾 Decrypted data saved to {}", normalized.display());
    
    // Display decryption statistics
    println!("\n📊 Decryption Statistics:");
    println!("   Ciphertext size: {} trit pairs", ciphertext.size());
    println!("   Decrypted trits: {}", decrypted_trits.len());
    println!("   Output size: {} bytes", decrypted_bytes.len());
    
    Ok(())
}

fn hash_file(input_path: &PathBuf, output_path: Option<&PathBuf>, hex_output: bool) -> Result<(), Box<dyn std::error::Error>> {
    println!("🔗 Computing SHA3-2187 hash...");
    let start = Instant::now();
    
    // Read input file
    let input_data = fs::read(input_path)?;
    println!("📖 Read {} bytes from {}", input_data.len(), input_path.display());
    
    // Convert to trits
    let trits = bytes_to_trits(&input_data);
    
    // Compute hash
    let hash_trits = sha3_2187_hash(&trits)?;
    
    let duration = start.elapsed();
    println!("✅ Hash computation completed in {:.2?}", duration);
    
    // Convert hash to bytes for display/storage
    let hash_bytes = trits_to_bytes(&hash_trits);
    
    if hex_output {
        let hex_hash = hex::encode(&hash_bytes);
        println!("🔗 SHA3-2187 Hash (hex): {}", hex_hash);
        
        if let Some(output_path) = output_path {
            let normalized = normalize_output_path(output_path);
            if let Some(parent) = normalized.parent() { fs::create_dir_all(parent)?; }
            fs::write(&normalized, hex_hash)?;
            println!("💾 Hash saved to {}", normalized.display());
        }
    } else {
        println!("🔗 SHA3-2187 Hash: {} trits", hash_trits.len());
        
        if let Some(output_path) = output_path {
            let normalized = normalize_output_path(output_path);
            if let Some(parent) = normalized.parent() { fs::create_dir_all(parent)?; }
            fs::write(&normalized, &hash_bytes)?;
            println!("💾 Hash saved to {}", normalized.display());
        }
    }
    
    // Display hash statistics
    println!("\n📊 Hash Statistics:");
    println!("   Input size: {} bytes", input_data.len());
    println!("   Input trits: {}", trits.len());
    println!("   Hash size: {} trits (3^2187 keyspace)", hash_trits.len());
    println!("   Hash bytes: {}", hash_bytes.len());
    
    Ok(())
}

fn handle_homomorphic_operation(operation: &str) -> Result<(), Box<dyn std::error::Error>> {
    match operation {
        "add" | "multiply" | "bootstrap" => {
            println!("🔬 Executing homomorphic {} demo", operation);
            // Sample data
            let plaintext_a = vec![Trit::PosOne; 10];
            let plaintext_b = vec![Trit::NegOne; 10];
            let mut ctx = TriFHEContext::new();
            let keys = ctx.generate_keys()?;
            let ct_a = ctx.encrypt(&plaintext_a, &keys.public_key)?;
            let ct_b = ctx.encrypt(&plaintext_b, &keys.public_key)?;

            let ct_result = match operation {
                "add" => ctx.add(&ct_a, &ct_b)?,
                "multiply" => ctx.multiply(&ct_a, &ct_b, &keys.evaluation_key)?,
                "bootstrap" => {
                    let noisy = ctx.add(&ct_a, &ct_b)?; // produce some noise
                    ctx.bootstrap(&noisy, &keys.bootstrapping_key)?
                }
                _ => unreachable!(),
            };
            let result = ctx.decrypt(&ct_result, &keys.secret_key)?;
            println!("✅ Operation completed. First trit of result: {:?}", result.get(0));
        }
        _ => {
            println!("❌ Unknown homomorphic operation: {}", operation);
            println!("Available operations: add, multiply, bootstrap");
        }
    }
    Ok(())
}

fn run_benchmarks(iterations: usize, operation: &str, output_file: Option<&PathBuf>) -> Result<(), Box<dyn std::error::Error>> {
    println!("🏃 Running TriFHE benchmarks...");
    println!("   Iterations: {}", iterations);
    println!("   Operation: {}", operation);
    
    let mut results = BenchmarkResults::new();
    
    if operation == "all" || operation == "keygen" {
        results.key_generation = Some(benchmark_key_generation(iterations)?);
    }
    
    if operation == "all" || operation == "encrypt" {
        results.encryption = Some(benchmark_encryption(iterations)?);
    }
    
    if operation == "all" || operation == "decrypt" {
        results.decryption = Some(benchmark_decryption(iterations)?);
    }
    
    if operation == "all" || operation == "hash" {
        results.hashing = Some(benchmark_hashing(iterations)?);
    }
    
    if operation == "all" || operation == "homomorphic" {
        results.homomorphic_add = Some(benchmark_homomorphic_add(iterations)?);
        results.homomorphic_mul = Some(benchmark_homomorphic_mul(iterations)?);
    }
    
    // Display results
    results.display();
    
    // Save to file if requested
    if let Some(output_path) = output_file {
        results.save_to_file(output_path)?;
        println!("📊 Benchmark results saved to {}", output_path.display());
    }
    
    Ok(())
}

fn validate_implementation(comprehensive: bool) -> Result<(), Box<dyn std::error::Error>> {
    println!("🔍 Validating TriFHE implementation...");
    
    let mut passed = 0;
    let mut failed = 0;
    
    // Basic functionality tests
    println!("\n🧪 Basic Functionality Tests:");
    
    if test_key_generation() {
        println!("   ✅ Key generation");
        passed += 1;
    } else {
        println!("   ❌ Key generation");
        failed += 1;
    }
    
    if test_encryption_decryption() {
        println!("   ✅ Encryption/Decryption");
        passed += 1;
    } else {
        println!("   ❌ Encryption/Decryption");
        failed += 1;
    }
    
    if test_homomorphic_operations() {
        println!("   ✅ Homomorphic operations");
        passed += 1;
    } else {
        println!("   ❌ Homomorphic operations");
        failed += 1;
    }
    
    if test_sha3_2187() {
        println!("   ✅ SHA3-2187 hashing");
        passed += 1;
    } else {
        println!("   ❌ SHA3-2187 hashing");
        failed += 1;
    }
    
    if comprehensive {
        println!("\n🔬 Comprehensive Tests:");
        
        if test_large_data_handling() {
            println!("   ✅ Large data handling");
            passed += 1;
        } else {
            println!("   ❌ Large data handling");
            failed += 1;
        }
        
        if test_edge_cases() {
            println!("   ✅ Edge cases");
            passed += 1;
        } else {
            println!("   ❌ Edge cases");
            failed += 1;
        }
        
        if test_security_properties() {
            println!("   ✅ Security properties");
            passed += 1;
        } else {
            println!("   ❌ Security properties");
            failed += 1;
        }
    }
    
    println!("\n📊 Validation Results:");
    println!("   Passed: {}", passed);
    println!("   Failed: {}", failed);
    println!("   Success rate: {:.1}%", (passed as f64 / (passed + failed) as f64) * 100.0);
    
    if failed > 0 {
        println!("⚠️  Some tests failed. Implementation may need fixes.");
        std::process::exit(1);
    } else {
        println!("🎉 All tests passed! Implementation is validated.");
    }
    
    Ok(())
}

// Benchmark functions
fn benchmark_key_generation(iterations: usize) -> Result<BenchmarkResult, Box<dyn std::error::Error>> {
    println!("   🔑 Benchmarking key generation...");
    
    let mut times = Vec::new();
    
    for _ in 0..iterations {
        let start = Instant::now();
        let mut ctx = TriFHEContext::new();
        let _keys = ctx.generate_keys()?;
        times.push(start.elapsed());
    }
    
    Ok(BenchmarkResult::from_times(times))
}

fn benchmark_encryption(iterations: usize) -> Result<BenchmarkResult, Box<dyn std::error::Error>> {
    println!("   🔒 Benchmarking encryption...");
    
    // Generate keys once
    let mut ctx = TriFHEContext::new();
    let keys = ctx.generate_keys()?;
    
    let test_data = vec![Trit::PosOne; 1000];  // 1000 trits
    let mut times = Vec::new();
    
    for _ in 0..iterations {
        let start = Instant::now();
        let _ciphertext = ctx.encrypt(&test_data, &keys.public_key)?;
        times.push(start.elapsed());
    }
    
    Ok(BenchmarkResult::from_times(times))
}

fn benchmark_decryption(iterations: usize) -> Result<BenchmarkResult, Box<dyn std::error::Error>> {
    println!("   🔓 Benchmarking decryption...");
    
    // Generate keys and encrypt data once
    let mut ctx = TriFHEContext::new();
    let keys = ctx.generate_keys()?;
    let test_data = vec![Trit::PosOne; 1000];
    let ciphertext = ctx.encrypt(&test_data, &keys.public_key)?;
    
    let mut times = Vec::new();
    
    for _ in 0..iterations {
        let start = Instant::now();
        let _plaintext = ctx.decrypt(&ciphertext, &keys.secret_key)?;
        times.push(start.elapsed());
    }
    
    Ok(BenchmarkResult::from_times(times))
}

fn benchmark_hashing(iterations: usize) -> Result<BenchmarkResult, Box<dyn std::error::Error>> {
    println!("   🔗 Benchmarking SHA3-2187...");
    
    let test_data = vec![Trit::PosOne; 1000];
    let mut times = Vec::new();
    
    for _ in 0..iterations {
        let start = Instant::now();
        let _hash = sha3_2187_hash(&test_data)?;
        times.push(start.elapsed());
    }
    
    Ok(BenchmarkResult::from_times(times))
}

fn benchmark_homomorphic_add(iterations: usize) -> Result<BenchmarkResult, Box<dyn std::error::Error>> {
    println!("   ➕ Benchmarking homomorphic addition...");
    
    // Setup
    let mut ctx = TriFHEContext::new();
    let keys = ctx.generate_keys()?;
    let test_data = vec![Trit::PosOne; 100];
    let ct1 = ctx.encrypt(&test_data, &keys.public_key)?;
    let ct2 = ctx.encrypt(&test_data, &keys.public_key)?;
    
    let mut times = Vec::new();
    
    for _ in 0..iterations {
        let start = Instant::now();
        let _result = ctx.add(&ct1, &ct2)?;
        times.push(start.elapsed());
    }
    
    Ok(BenchmarkResult::from_times(times))
}

fn benchmark_homomorphic_mul(iterations: usize) -> Result<BenchmarkResult, Box<dyn std::error::Error>> {
    println!("   ✖️ Benchmarking homomorphic multiplication...");
    
    // Setup
    let mut ctx = TriFHEContext::new();
    let keys = ctx.generate_keys()?;
    let test_data = vec![Trit::PosOne; 100];
    let ct1 = ctx.encrypt(&test_data, &keys.public_key)?;
    let ct2 = ctx.encrypt(&test_data, &keys.public_key)?;
    
    let mut times = Vec::new();
    
    for _ in 0..iterations {
        let start = Instant::now();
        let _result = ctx.multiply(&ct1, &ct2, &keys.evaluation_key)?;
        times.push(start.elapsed());
    }
    
    Ok(BenchmarkResult::from_times(times))
}

// Validation test functions
fn test_key_generation() -> bool {
    let mut ctx = TriFHEContext::new();
    match ctx.generate_keys() {
        Ok(keys) => keys.public_key.params.security_level == 2187,
        Err(_) => false,
    }
}

fn test_encryption_decryption() -> bool {
    let mut ctx = TriFHEContext::new();
    match ctx.generate_keys() {
        Ok(keys) => {
            let plaintext = vec![Trit::PosOne, Trit::Zero, Trit::NegOne];
            match ctx.encrypt(&plaintext, &keys.public_key) {
                Ok(ciphertext) => {
                    match ctx.decrypt(&ciphertext, &keys.secret_key) {
                        Ok(decrypted) => {
                            // Check first few trits match
                            for i in 0..plaintext.len() {
                                if decrypted[i] != plaintext[i] {
                                    return false;
                                }
                            }
                            true
                        }
                        Err(_) => false,
                    }
                }
                Err(_) => false,
            }
        }
        Err(_) => false,
    }
}

fn test_homomorphic_operations() -> bool {
    let mut ctx = TriFHEContext::new();
    match ctx.generate_keys() {
        Ok(keys) => {
            let pt1 = vec![Trit::PosOne];
            let pt2 = vec![Trit::PosOne];
            
            match (ctx.encrypt(&pt1, &keys.public_key), ctx.encrypt(&pt2, &keys.public_key)) {
                (Ok(ct1), Ok(ct2)) => {
                    match ctx.add(&ct1, &ct2) {
                        Ok(ct_sum) => {
                            match ctx.decrypt(&ct_sum, &keys.secret_key) {
                                Ok(pt_sum) => pt_sum[0] == Trit::NegOne,  // 1 + 1 = -1 (mod 3)
                                Err(_) => false,
                            }
                        }
                        Err(_) => false,
                    }
                }
                _ => false,
            }
        }
        Err(_) => false,
    }
}

fn test_sha3_2187() -> bool {
    let input = vec![Trit::PosOne, Trit::Zero, Trit::NegOne];
    match sha3_2187_hash(&input) {
        Ok(hash) => hash.len() == 2187,
        Err(_) => false,
    }
}

fn test_large_data_handling() -> bool {
    // Test with large data sets
    let large_data = vec![Trit::PosOne; 10000];
    match sha3_2187_hash(&large_data) {
        Ok(hash) => hash.len() == 2187,
        Err(_) => false,
    }
}

fn test_edge_cases() -> bool {
    // Test empty input
    match sha3_2187_hash(&[]) {
        Ok(hash) => hash.len() == 2187,
        Err(_) => false,
    }
}

fn test_security_properties() -> bool {
    // Test that different inputs produce different hashes
    let input1 = vec![Trit::PosOne];
    let input2 = vec![Trit::NegOne];
    
    match (sha3_2187_hash(&input1), sha3_2187_hash(&input2)) {
        (Ok(hash1), Ok(hash2)) => hash1 != hash2,
        _ => false,
    }
}

// Benchmark result structures
#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct BenchmarkResult {
    min: std::time::Duration,
    max: std::time::Duration,
    avg: std::time::Duration,
    median: std::time::Duration,
}

impl BenchmarkResult {
    fn from_times(mut times: Vec<std::time::Duration>) -> Self {
        times.sort();
        let min = times[0];
        let max = times[times.len() - 1];
        let avg = times.iter().sum::<std::time::Duration>() / times.len() as u32;
        let median = times[times.len() / 2];
        
        Self { min, max, avg, median }
    }
}

#[derive(Debug, Default, serde::Serialize, serde::Deserialize)]
struct BenchmarkResults {
    key_generation: Option<BenchmarkResult>,
    encryption: Option<BenchmarkResult>,
    decryption: Option<BenchmarkResult>,
    hashing: Option<BenchmarkResult>,
    homomorphic_add: Option<BenchmarkResult>,
    homomorphic_mul: Option<BenchmarkResult>,
}

impl BenchmarkResults {
    fn new() -> Self {
        Self::default()
    }
    
    fn display(&self) {
        println!("\n📊 Benchmark Results:");
        
        if let Some(ref result) = self.key_generation {
            println!("   🔑 Key Generation:");
            println!("      Min: {:.2?}, Max: {:.2?}, Avg: {:.2?}, Median: {:.2?}", 
                     result.min, result.max, result.avg, result.median);
        }
        
        if let Some(ref result) = self.encryption {
            println!("   🔒 Encryption:");
            println!("      Min: {:.2?}, Max: {:.2?}, Avg: {:.2?}, Median: {:.2?}", 
                     result.min, result.max, result.avg, result.median);
        }
        
        if let Some(ref result) = self.decryption {
            println!("   🔓 Decryption:");
            println!("      Min: {:.2?}, Max: {:.2?}, Avg: {:.2?}, Median: {:.2?}", 
                     result.min, result.max, result.avg, result.median);
        }
        
        if let Some(ref result) = self.hashing {
            println!("   🔗 SHA3-2187 Hashing:");
            println!("      Min: {:.2?}, Max: {:.2?}, Avg: {:.2?}, Median: {:.2?}", 
                     result.min, result.max, result.avg, result.median);
        }
        
        if let Some(ref result) = self.homomorphic_add {
            println!("   ➕ Homomorphic Addition:");
            println!("      Min: {:.2?}, Max: {:.2?}, Avg: {:.2?}, Median: {:.2?}", 
                     result.min, result.max, result.avg, result.median);
        }
        
        if let Some(ref result) = self.homomorphic_mul {
            println!("   ✖️ Homomorphic Multiplication:");
            println!("      Min: {:.2?}, Max: {:.2?}, Avg: {:.2?}, Median: {:.2?}", 
                     result.min, result.max, result.avg, result.median);
        }
    }
    
    fn save_to_file(&self, path: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
        let normalized = if path.is_absolute() || path.components().count() > 1 {
            path.clone()
        } else {
            let mut p = PathBuf::from(DEFAULT_OUTPUT_DIR);
            p.push(path);
            p
        };

        if let Some(parent) = normalized.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let json = serde_json::to_string_pretty(self)?;
        std::fs::write(&normalized, json)?;
        Ok(())
    }
}

// File I/O helper functions
fn normalize_output_path(path: &PathBuf) -> PathBuf {
    if path.is_absolute() || path.components().count() > 1 {
        return path.clone();
    }
    let mut p = PathBuf::from(DEFAULT_OUTPUT_DIR);
    p.push(path);
    p
}

fn save_public_key(key: &TriFHEPublicKey, path: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    let normalized = normalize_output_path(path);
    if let Some(parent) = normalized.parent() { fs::create_dir_all(parent)?; }
    let json = serde_json::to_string(key)?;
    fs::write(&normalized, json)?;
    Ok(())
}

fn load_public_key(path: &PathBuf) -> Result<TriFHEPublicKey, Box<dyn std::error::Error>> {
    let json = fs::read_to_string(path)?;
    let key = serde_json::from_str(&json)?;
    Ok(key)
}

fn save_secret_key(key: &TriFHESecretKey, path: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    let normalized = normalize_output_path(path);
    if let Some(parent) = normalized.parent() { fs::create_dir_all(parent)?; }
    let json = serde_json::to_string(key)?;
    fs::write(&normalized, json)?;
    Ok(())
}

fn load_secret_key(path: &PathBuf) -> Result<TriFHESecretKey, Box<dyn std::error::Error>> {
    let json = fs::read_to_string(path)?;
    let key = serde_json::from_str(&json)?;
    Ok(key)
}

fn save_evaluation_key(key: &TriFHEEvaluationKey, path: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    let normalized = normalize_output_path(path);
    if let Some(parent) = normalized.parent() { fs::create_dir_all(parent)?; }
    let json = serde_json::to_string(key)?;
    fs::write(&normalized, json)?;
    Ok(())
}

fn load_evaluation_key(path: &PathBuf) -> Result<TriFHEEvaluationKey, Box<dyn std::error::Error>> {
    let json = fs::read_to_string(path)?;
    let key = serde_json::from_str(&json)?;
    Ok(key)
}

fn save_bootstrapping_key(key: &TriFHEBootstrappingKey, path: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    let normalized = normalize_output_path(path);
    if let Some(parent) = normalized.parent() { fs::create_dir_all(parent)?; }
    let json = serde_json::to_string(key)?;
    fs::write(&normalized, json)?;
    Ok(())
}

fn load_bootstrapping_key(path: &PathBuf) -> Result<TriFHEBootstrappingKey, Box<dyn std::error::Error>> {
    let json = fs::read_to_string(path)?;
    let key = serde_json::from_str(&json)?;
    Ok(key)
}

fn save_ciphertext(ciphertext: &EncryptedTrit2187, path: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    let normalized = normalize_output_path(path);
    if let Some(parent) = normalized.parent() { fs::create_dir_all(parent)?; }
    let json = serde_json::to_string(ciphertext)?;
    fs::write(&normalized, json)?;
    Ok(())
}

fn load_ciphertext(path: &PathBuf) -> Result<EncryptedTrit2187, Box<dyn std::error::Error>> {
    let json = fs::read_to_string(path)?;
    let ciphertext = serde_json::from_str(&json)?;
    Ok(ciphertext)
} 