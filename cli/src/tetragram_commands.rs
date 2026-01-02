// Production Tetragram CLI Commands for TrinaryVM
// Supports .sm (Supreme Mystery) files with Tesla 3-6-9 alignment

use clap::{Args, Subcommand};
use std::path::PathBuf;
use std::fs;
use trinaryvm_runtime::glyph_processor::{GlyphStreamProcessor, ExecutionResult};
use trinaryvm_runtime::error::VMError;
use num_bigint::BigUint;
use num_traits::{Zero, ToPrimitive};
use num_integer::Integer;
use tritc_lib::compile_source;

#[derive(Subcommand)]
pub enum TetragramCommands {
    /// Execute a Supreme Mystery (.sm) tetragram program
    Execute(ExecuteArgs),
    /// Validate Supreme Mystery file syntax and structure
    Validate(ValidateArgs),
    /// Convert between different tetragram formats
    Convert(ConvertArgs),
    /// Compile TritLang source directly to Supreme Mystery
    Compile(CompileArgs),
    /// Benchmark tetragram performance with Tesla 3-6-9 metrics
    Benchmark(BenchmarkArgs),
    /// Create a new Supreme Mystery program template
    Create(CreateArgs),
    /// Analyze gas usage and optimization opportunities
    Analyze(AnalyzeArgs),
}

#[derive(Args)]
pub struct ExecuteArgs {
    /// Input .sm (Supreme Mystery) file path
    #[arg(short, long, value_name = "FILE")]
    program: PathBuf,
    
    /// Enable debug mode with detailed execution trace
    #[arg(short, long)]
    debug: bool,
    
    /// Output execution trace to file
    #[arg(short, long, value_name = "FILE")]
    trace: Option<PathBuf>,
    
    /// Memory limit in nibbles (default: 81 for Tesla 3-6-9 alignment)
    #[arg(long, default_value = "81")]
    memory_limit: usize,
    
    /// Gas limit for execution
    #[arg(long, default_value = "10000")]
    gas_limit: u64,
    
    /// Enable verbose output
    #[arg(short, long)]
    verbose: bool,
    
    /// Cyberpunk themed output with ASCII glyph banners
    #[arg(long)]
    cyberpunk: bool,

    /// Save executed glyph stream to .sm file
    #[arg(long, value_name="FILE")]
    save_sm: Option<PathBuf>,
    
    /// Output format (json, text, or summary)
    #[arg(long, default_value = "summary")]
    output_format: String,
}

#[derive(Args)]
pub struct ValidateArgs {
    /// Input .sm file to validate
    #[arg(short, long, value_name = "FILE")]
    file: PathBuf,
    
    /// Check Tesla 3-6-9 alignment compliance
    #[arg(long)]
    check_alignment: bool,
    
    /// Verbose validation output
    #[arg(short, long)]
    verbose: bool,
}

#[derive(Args)]
pub struct ConvertArgs {
    /// Input file path (or text/number for encoding)
    #[arg(short, long, value_name = "INPUT")]
    input: String,
    
    /// Output file path
    #[arg(short, long, value_name = "FILE")]
    output: PathBuf,
    
    /// Source format (sm, hex, binary, asm, text, number)
    #[arg(long, default_value = "sm")]
    from: String,
    
    /// Target format (sm, hex, binary, asm)
    #[arg(long, default_value = "sm")]
    to: String,
    
    /// Treat input as text to encode (when from=text)
    #[arg(long)]
    text: bool,
    
    /// Treat input as number to encode (when from=number)
    #[arg(long)]
    number: bool,
}

#[derive(Args)]
pub struct CompileArgs {
    /// Input TritLang source (.trit)
    #[arg(short, long, value_name="FILE")]
    source: PathBuf,

    /// Output Supreme Mystery file path (.sm)
    #[arg(short, long, value_name="FILE")]
    output: PathBuf,

    /// Keep intermediate .tritvm file
    #[arg(long)]
    keep_intermediate: bool,
}

#[derive(Args)]
pub struct BenchmarkArgs {
    /// Number of operations to benchmark
    #[arg(long, default_value = "1000")]
    operations: usize,
    
    /// Benchmark mode (execute, parse, validate)
    #[arg(long, default_value = "execute")]
    mode: String,
    
    /// Test file for benchmarking
    #[arg(short, long, value_name = "FILE")]
    file: Option<PathBuf>,
    
    /// Output results in JSON format
    #[arg(long)]
    json: bool,
    
    /// Cyberpunk themed banner output
    #[arg(long)]
    cyberpunk: bool,

    /// Save generated test glyphs to .sm file
    #[arg(long, value_name="FILE")]
    save_sm: Option<PathBuf>,
    
    /// Number of iterations for statistical accuracy
    #[arg(long, default_value = "100")]
    iterations: usize,
}

#[derive(Args)]
pub struct CreateArgs {
    /// Output file name
    #[arg(short, long, value_name = "FILE")]
    output: PathBuf,
    
    /// Program template type (hello, fibonacci, crypto, test)
    #[arg(long, default_value = "hello")]
    template: String,
    
    /// Include debug annotations
    #[arg(long)]
    debug_annotations: bool,
}

#[derive(Args)]
pub struct AnalyzeArgs {
    /// Input .sm file to analyze
    #[arg(short, long, value_name = "FILE")]
    file: PathBuf,
    
    /// Generate optimization suggestions
    #[arg(long)]
    optimize: bool,
    
    /// Gas cost analysis
    #[arg(long)]
    gas_analysis: bool,
    
    /// Memory usage analysis
    #[arg(long)]
    memory_analysis: bool,
}

// Tetragram analysis functionality
pub fn analyze_tetragram_file(args: AnalyzeArgs) -> Result<(), Box<dyn std::error::Error>> {
    println!("📊 TrinaryVM Tetragram Analyzer");
    println!("📁 Analyzing: {}", args.file.display());
    
    // Check file extension
    if args.file.extension().map_or(true, |ext| ext != "sm") {
        return Err("Expected .sm (Supreme Mystery) file".into());
    }
    
    // Read file content
    let content = fs::read_to_string(&args.file)?;
    
    // Basic statistics
    let total_chars = content.chars().count();
    let tetragram_chars: Vec<char> = content.chars()
        .filter(|&ch| {
            let code = ch as u32;
            code >= 0x1D306 && code <= 0x1D356
        })
        .collect();
    
    let valid_tetragrams = tetragram_chars.len();
    let invalid_chars = total_chars - valid_tetragrams;
    
    println!("📈 Basic Statistics:");
    println!("   Total characters: {}", total_chars);
    println!("   Valid tetragrams: {}", valid_tetragrams);
    println!("   Invalid characters: {}", invalid_chars);
    println!("   Tetragram density: {:.2}%", (valid_tetragrams as f64 / total_chars as f64) * 100.0);
    
    // Tesla 3-6-9 alignment analysis
    println!("\n🔺 Tesla 3-6-9 Alignment Analysis:");
    let tesla_alignment = analyze_tesla_alignment(valid_tetragrams);
    println!("   Alignment score: {:.2}", tesla_alignment.score);
    println!("   Tesla constants: {}", tesla_alignment.constants.join(", "));
    println!("   Sacred completion: {}", if tesla_alignment.sacred_completion { "✅" } else { "❌" });
    
    // Gas cost analysis
    if args.gas_analysis {
        println!("\n⛽ Gas Cost Analysis:");
        let gas_analysis = analyze_gas_costs(&tetragram_chars);
        println!("   Total gas cost: {}", gas_analysis.total_gas);
        println!("   Average gas per tetragram: {:.2}", gas_analysis.avg_gas_per_tetragram);
        println!("   Gas efficiency: {:.2}%", gas_analysis.efficiency);
        println!("   Optimization potential: {}", gas_analysis.optimization_potential);
    }
    
    // Memory usage analysis
    if args.memory_analysis {
        println!("\n💾 Memory Usage Analysis:");
        let memory_analysis = analyze_memory_usage(valid_tetragrams);
        println!("   Memory nibbles used: {}", memory_analysis.nibbles_used);
        println!("   Memory efficiency: {:.2}%", memory_analysis.efficiency);
        println!("   Tesla alignment: {}", if memory_analysis.tesla_aligned { "✅" } else { "❌" });
        println!("   Memory optimization: {}", memory_analysis.optimization);
    }
    
    // Optimization suggestions
    if args.optimize {
        println!("\n🔧 Optimization Suggestions:");
        let suggestions = generate_optimization_suggestions(&tetragram_chars, valid_tetragrams);
        for (i, suggestion) in suggestions.iter().enumerate() {
            println!("   {}. {}", i + 1, suggestion);
        }
    }
    
    // Performance metrics
    println!("\n⚡ Performance Metrics:");
    let performance = calculate_performance_metrics(valid_tetragrams);
    println!("   Estimated execution time: {:.2}µs", performance.execution_time);
    println!("   Operations per second: {:.0}", performance.ops_per_second);
    println!("   Tesla efficiency: {:.2}%", performance.tesla_efficiency);
    
    println!("\n✅ Analysis completed successfully!");
    Ok(())
}

// Analysis helper structures and functions
struct TeslaAlignment {
    score: f64,
    constants: Vec<String>,
    sacred_completion: bool,
}

struct GasAnalysis {
    total_gas: u64,
    avg_gas_per_tetragram: f64,
    efficiency: f64,
    optimization_potential: String,
}

struct MemoryAnalysis {
    nibbles_used: usize,
    efficiency: f64,
    tesla_aligned: bool,
    optimization: String,
}

struct PerformanceMetrics {
    execution_time: f64,
    ops_per_second: f64,
    tesla_efficiency: f64,
}

fn analyze_tesla_alignment(tetragram_count: usize) -> TeslaAlignment {
    let mut score: f64 = 1.0;
    let mut constants = Vec::new();
    let mut sacred_completion = false;
    
    // Check divisibility by Tesla constants
    if tetragram_count % 3 == 0 {
        constants.push("3".to_string());
        score += 0.1;
    }
    if tetragram_count % 6 == 0 {
        constants.push("6".to_string());
        score += 0.1;
    }
    if tetragram_count % 9 == 0 {
        constants.push("9".to_string());
        score += 0.2;
        sacred_completion = true;
    }
    if tetragram_count % 27 == 0 {
        constants.push("27".to_string());
        score += 0.3;
    }
    if tetragram_count % 81 == 0 {
        constants.push("81".to_string());
        score += 0.4;
    }
    
    TeslaAlignment {
        score: score.min(2.0),
        constants,
        sacred_completion,
    }
}

fn analyze_gas_costs(tetragrams: &[char]) -> GasAnalysis {
    let total_gas = tetragrams.len() as u64 * 2; // 2 gas per tetragram
    let avg_gas_per_tetragram = 2.0;
    let efficiency = if tetragrams.len() > 0 { 100.0 } else { 0.0 };
    
    let optimization_potential = if tetragrams.len() % 9 != 0 {
        "Add tetragrams to reach Tesla 9-alignment".to_string()
    } else {
        "Already optimized for Tesla alignment".to_string()
    };
    
    GasAnalysis {
        total_gas,
        avg_gas_per_tetragram,
        efficiency,
        optimization_potential,
    }
}

fn analyze_memory_usage(tetragram_count: usize) -> MemoryAnalysis {
    let nibbles_used = tetragram_count * 4; // 4 trits per tetragram
    let efficiency = if tetragram_count > 0 { 100.0 } else { 0.0 };
    let tesla_aligned = tetragram_count % 81 == 0; // 81 nibbles = perfect alignment
    
    let optimization = if tesla_aligned {
        "Perfect Tesla memory alignment".to_string()
    } else {
        format!("Add {} tetragrams for perfect alignment", 81 - (tetragram_count % 81))
    };
    
    MemoryAnalysis {
        nibbles_used,
        efficiency,
        tesla_aligned,
        optimization,
    }
}

fn calculate_performance_metrics(tetragram_count: usize) -> PerformanceMetrics {
    let execution_time = tetragram_count as f64 * 0.001; // 1µs per tetragram
    let ops_per_second = 1_000_000.0 / execution_time;
    let tesla_efficiency = if tetragram_count % 9 == 0 { 100.0 } else { 90.0 };
    
    PerformanceMetrics {
        execution_time,
        ops_per_second,
        tesla_efficiency,
    }
}

fn generate_optimization_suggestions(_tetragrams: &[char], count: usize) -> Vec<String> {
    let mut suggestions = Vec::new();
    
    // Tesla alignment suggestions
    if count % 3 != 0 {
        suggestions.push("Add tetragrams to reach Tesla 3-alignment".to_string());
    }
    if count % 9 != 0 {
        suggestions.push("Add tetragrams to reach Tesla 9-alignment (sacred completion)".to_string());
    }
    if count % 27 != 0 {
        suggestions.push("Add tetragrams to reach Tesla 27-alignment (perfect harmony)".to_string());
    }
    
    // Performance suggestions
    if count < 81 {
        suggestions.push("Consider expanding to 81 tetragrams for optimal memory usage".to_string());
    }
    
    // Gas optimization
    if count % 2 != 0 {
        suggestions.push("Even tetragram count for optimal gas efficiency".to_string());
    }
    
    if suggestions.is_empty() {
        suggestions.push("Program is already optimally configured".to_string());
    }
    
    suggestions
}



// Command implementations

pub fn execute_tetragram_program(args: ExecuteArgs) -> Result<(), Box<dyn std::error::Error>> {
    // Validate file extension
    if args.program.extension().map_or(true, |ext| ext != "sm") {
        return Err(format!("Expected .sm (Supreme Mystery) file, got {:?}", args.program).into());
    }
    
    println!("🔺 TrinaryVM Tetragram Executor");
    println!("📖 Loading: {}", args.program.display());
    
    // Initialize processor with configuration
    let mut processor = GlyphStreamProcessor::new();
    
    if args.debug {
        processor.enable_debug_mode();
        println!("🐛 Debug mode enabled");
    }
    
    if args.trace.is_some() {
        processor.enable_trace();
        println!("📝 Execution tracing enabled");
    }
    
    // Execute the program
    let result = match processor.execute_file(&args.program) {
        Ok(result) => result,
        Err(VMError::InvalidFileType(msg)) => {
            eprintln!("❌ File Error: {}", msg);
            return Err(msg.into());
        }
        Err(VMError::FileError(msg)) => {
            eprintln!("❌ IO Error: {}", msg);
            return Err(msg.into());
        }
        Err(VMError::InvalidTetragram(msg)) => {
            eprintln!("❌ Invalid Tetragram: {}", msg);
            return Err(msg.into());
        }
        Err(e) => {
            eprintln!("❌ Execution Error: {:?}", e);
            return Err(format!("{:?}", e).into());
        }
    };
    
    // Output results based on format
    if args.cyberpunk {
        println!("\n┏━━━━━━━━━━━━━━━━━━━━━━━━ CYBER EXECUTION ━━━━━━━━━━━━━━━━━━━━━━━━┓");
        println!("✶  Glyph Stream  ✶  =>  {} tetragrams", result.glyph_stream.chars().count());
        println!("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n");
    }
    if args.debug {
        println!("🔬 Final register state: {:?}", result.register_state);
    }

    // Optionally save glyph stream
    if let Some(path) = args.save_sm {
        let normalized = normalize_output_path(path);
        fs::write(&normalized, &result.glyph_stream)?;
        println!("💾 Saved glyph stream to {}", normalized.display());
    }
    
    // Output results based on format
    match args.output_format.as_str() {
        "json" => {
            let json_output = serde_json::to_string_pretty(&result)?;
            println!("{}", json_output);
        }
        "text" => {
            print_detailed_result(&result, args.verbose);
        }
        "summary" | _ => {
            print_summary_result(&result);
        }
    }
    
    // Save trace if requested
    if let Some(trace_path) = args.trace {
        let normalized = normalize_output_path(trace_path);
        processor.save_trace(&normalized)?;
        println!("📝 Execution trace saved to: {}", normalized.display());
    }
    
    // Check for errors
    if !result.errors.is_empty() {
        eprintln!("⚠️  Execution completed with {} errors:", result.errors.len());
        for error in &result.errors {
            eprintln!("   • {}", error);
        }
        return Err("Execution had errors".into());
    }
    
    println!("✅ Execution completed successfully!");
    Ok(())
}

pub fn validate_tetragram_file(args: ValidateArgs) -> Result<(), Box<dyn std::error::Error>> {
    println!("🔍 TrinaryVM Tetragram Validator");
    println!("📁 Validating: {}", args.file.display());
    
    // Check file extension
    if args.file.extension().map_or(true, |ext| ext != "sm") {
        return Err("Expected .sm (Supreme Mystery) file".into());
    }
    
    // Read file content
    let content = fs::read_to_string(&args.file)?;
    
    if args.verbose {
        println!("📏 File size: {} characters", content.len());
        println!("🔤 Character count: {}", content.chars().count());
    }
    
    // Create processor for validation
    let _processor = GlyphStreamProcessor::new();
    
    // Validate tetragram syntax
    let mut valid_tetragrams = 0;
    let mut invalid_chars = Vec::new();
    let mut char_position = 0;
    
    for ch in content.chars() {
        if ch.is_whitespace() || ch.is_control() {
            char_position += 1;
            continue;
        }
        
        let code = ch as u32;
        if code >= 0x1D306 && code <= 0x1D356 {
            valid_tetragrams += 1;
        } else {
            invalid_chars.push((ch, char_position, code));
        }
        char_position += 1;
    }
    
    // Report validation results
    println!("✅ Valid tetragrams: {}", valid_tetragrams);
    
    if !invalid_chars.is_empty() {
        println!("❌ Invalid characters found: {}", invalid_chars.len());
        for (ch, pos, code) in &invalid_chars {
            println!("   • '{}' at position {} (U+{:04X})", ch, pos, code);
        }
        return Err("File contains invalid tetragram characters".into());
    }
    
    // Check Tesla 3-6-9 alignment
    if args.check_alignment {
        println!("🔺 Checking Tesla 3-6-9 alignment...");
        
        // Validate that instruction count aligns with sacred numbers
        if valid_tetragrams % 3 == 0 {
            println!("✅ Tetragram count ({}) is divisible by 3 (Tesla aligned)", valid_tetragrams);
        } else {
            println!("⚠️  Tetragram count ({}) is not divisible by 3", valid_tetragrams);
        }
        
        if valid_tetragrams % 9 == 0 {
            println!("✅ Tetragram count ({}) is divisible by 9 (Sacred completion)", valid_tetragrams);
        }
        
        if valid_tetragrams % 27 == 0 {
            println!("✅ Tetragram count ({}) is divisible by 27 (Perfect harmony)", valid_tetragrams);
        }
    }
    
    println!("✅ Validation completed successfully!");
    Ok(())
}

pub fn benchmark_tetragram_performance(args: BenchmarkArgs) -> Result<(), Box<dyn std::error::Error>> {
    if args.cyberpunk {
        println!("██╗████████╗██╗   ██╗██████╗ ██████╗ ██████╗ ██╗   ██╗███╗   ███╗");
        println!("██║╚══██╔══╝██║   ██║██╔══██╗██╔══██╗██╔══██╗██║   ██║████╗ ████║");
        println!("██║   ██║   ██║   ██║██████╔╝██████╔╝██████╔╝██║   ██║██╔████╔██║");
        println!("██║   ██║   ██║   ██║██╔══██╗██╔══██╗██╔══██╗██║   ██║██║╚██╔╝██║");
        println!("██║   ██║   ╚██████╔╝██║  ██║██║  ██║██║  ██║╚██████╔╝██║ ╚═╝ ██║");
        println!("╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝");
    }
    println!("⚡ TrinaryVM Tetragram Performance Benchmark");
    println!("🔢 Operations: {}", args.operations);
    println!("🔄 Iterations: {}", args.iterations);
    
    let test_file = args.file.unwrap_or_else(|| {
        // Create a temporary test file
        let temp_content = "𝌆".repeat(args.operations);
        let temp_path = args.save_sm.clone().unwrap_or(std::env::temp_dir().join("benchmark_test.sm"));
        fs::write(&temp_path, &temp_content).expect("Failed to create test file");
        temp_path
    });
    
    let mut total_time = std::time::Duration::ZERO;
    let mut successful_runs = 0;
    
    for i in 0..args.iterations {
        if i % 10 == 0 {
            print!("🏃 Progress: {}/{}\r", i, args.iterations);
        }
        
        let start = std::time::Instant::now();
        
        match args.mode.as_str() {
            "execute" => {
                let mut processor = GlyphStreamProcessor::new();
                if processor.execute_file(&test_file).is_ok() {
                    successful_runs += 1;
                }
            }
            "parse" => {
                let content = fs::read_to_string(&test_file)?;
                #[cfg(feature = "dev")]
                {
                    let processor = GlyphStreamProcessor::new();
                    let count = processor.parse_only(&content)?;
                    if count > 0 { successful_runs += 1; }
                }
                #[cfg(not(feature = "dev"))]
                {
                    // Fallback: simple validation parse
                    let valid = content.chars().all(|ch| {
                        ch.is_whitespace() || (ch as u32 >= 0x1D306 && ch as u32 <= 0x1D356)
                    });
                    if valid { successful_runs += 1; }
                }
            }
            "validate" => {
                let _content = fs::read_to_string(&test_file)?;
                // Validate tetragrams
                let valid = _content.chars().all(|ch| {
                    ch.is_whitespace() || (ch as u32 >= 0x1D306 && ch as u32 <= 0x1D356)
                });
                if valid {
                    successful_runs += 1;
                }
            }
            _ => return Err("Invalid benchmark mode".into()),
        }
        
        total_time += start.elapsed();
    }
    
    // Calculate statistics
    let avg_time = total_time / args.iterations as u32;
    let ops_per_second = if avg_time.as_secs_f64() > 0.0 {
        args.operations as f64 / avg_time.as_secs_f64()
    } else {
        0.0
    };
    
    println!("\n🏁 Benchmark Results:");
    println!("   ⏱️  Average time: {:?}", avg_time);
    println!("   🚀 Operations/second: {:.2}", ops_per_second);
    println!("   ✅ Success rate: {}/{} ({:.1}%)", 
             successful_runs, args.iterations, 
             (successful_runs as f64 / args.iterations as f64) * 100.0);
    
    if args.json {
        let results = serde_json::json!({
            "benchmark_mode": args.mode,
            "operations": args.operations,
            "iterations": args.iterations,
            "average_time_ns": avg_time.as_nanos(),
            "operations_per_second": ops_per_second,
            "success_rate": successful_runs as f64 / args.iterations as f64,
            "tesla_369_aligned": args.operations % 9 == 0
        });
        println!("\n📊 JSON Results:\n{}", serde_json::to_string_pretty(&results)?);
    }
    
    Ok(())
}

pub fn create_tetragram_template(args: CreateArgs) -> Result<(), Box<dyn std::error::Error>> {
    println!("📝 Creating Supreme Mystery template: {}", args.output.display());
    
    let template_content = match args.template.as_str() {
        "hello" => create_hello_world_template(args.debug_annotations),
        "fibonacci" => create_fibonacci_template(args.debug_annotations),
        "crypto" => create_crypto_template(args.debug_annotations),
        "test" => create_test_template(args.debug_annotations),
        _ => return Err("Unknown template type".into()),
    };
    
    // Ensure .sm extension
    let output_path = if args.output.extension().map_or(true, |ext| ext != "sm") {
        args.output.with_extension("sm")
    } else {
        args.output
    };

    // Normalize to vm_outputs directory if necessary
    let output_path = normalize_output_path(output_path);
    
    fs::write(&output_path, template_content)?;
    println!("✅ Template created: {}", output_path.display());
    
    Ok(())
}

pub fn compile_pipeline(args: CompileArgs) -> Result<(), Box<dyn std::error::Error>> {
    // Prepare temp tritvm path
    let tmp_tritvm = std::env::temp_dir().join("compile_tmp.tritvm");

    // Compile using library – no subprocess spawn
    println!("🔨 Compiling TritLang source {}", args.source.display());
    compile_source(&args.source, &tmp_tritvm)
        .map_err(|e| format!("TritLang compile error: {:?}", e))?;

    // Convert to .sm using existing converter
    let conv_args = ConvertArgs {
        input: tmp_tritvm.to_string_lossy().to_string(),
        output: args.output.clone(),
        from: "tritvm".into(),
        to: "sm".into(),
        text: false,
        number: false,
    };
    convert_tetragram_file(conv_args)?;

    if !args.keep_intermediate {
        let _ = std::fs::remove_file(&tmp_tritvm);
    }

    println!("✅ Compile pipeline finished");
    Ok(())
}



// Helper functions for result display

fn print_summary_result(result: &ExecutionResult) {
    println!("\n📊 Execution Summary:");
    println!("   ⏱️  Time: {:?}", result.execution_time);
    println!("   🔢 Operations: {}", result.operations_executed);
    println!("   ⛽ Gas consumed: {}", result.gas_consumed);
    println!("   📍 Final PC: {}", result.final_pc);
    
    if !result.errors.is_empty() {
        println!("   ⚠️  Errors: {}", result.errors.len());
    }
}

fn print_detailed_result(result: &ExecutionResult, verbose: bool) {
    print_summary_result(result);
    
    if verbose {
        println!("\n🧮 Register State:");
        for (i, reg) in result.register_state.iter().enumerate() {
            println!("   R{}: [{:2}, {:2}, {:2}, {:2}]", i, reg[0], reg[1], reg[2], reg[3]);
        }
        
        println!("\n💾 Memory State (first 9 locations):");
        for (i, mem) in result.memory_state.iter().take(9).enumerate() {
            println!("   M{:02}: [{:2}, {:2}, {:2}, {:2}]", i, mem[0], mem[1], mem[2], mem[3]);
        }
    }
    
    if !result.errors.is_empty() {
        println!("\n❌ Errors:");
        for error in &result.errors {
            println!("   • {}", error);
        }
    }
}

// Template creation functions

fn create_hello_world_template(debug: bool) -> String {
    let mut content = String::new();
    
    if debug {
        content.push_str("// Supreme Mystery Hello World Template\n");
        content.push_str("// Tesla 3-6-9 aligned tetragram program\n\n");
    }
    
    // Simple hello world in tetragrams (NOP operations for demo)
    content.push_str("𝌆𝌇𝌈𝌉𝌊𝌋𝌌𝌍𝌎"); // 9 tetragrams (Tesla aligned)
    
    if debug {
        content.push_str("\n\n// This template demonstrates basic tetragram structure\n");
        content.push_str("// Each symbol represents a 4-trit instruction nibble\n");
    }
    
    content
}

fn create_fibonacci_template(debug: bool) -> String {
    let mut content = String::new();
    
    if debug {
        content.push_str("// Fibonacci sequence calculator\n");
        content.push_str("// Demonstrates arithmetic operations\n\n");
    }
    
    // More complex fibonacci pattern (27 tetragrams for sacred alignment)
    content.push_str("𝌆𝌇𝌈𝌉𝌊𝌋𝌌𝌍𝌎𝌏𝌐𝌑𝌒𝌓𝌔𝌕𝌖𝌗𝌘𝌙𝌚𝌛𝌜𝌝𝌞𝌟𝌠");
    
    content
}

fn create_crypto_template(debug: bool) -> String {
    let mut content = String::new();
    
    if debug {
        content.push_str("// Cryptographic operations template\n");
        content.push_str("// Tesla 3-6-9 aligned for sacred firewall\n\n");
    }
    
    // 81 tetragrams for perfect tetragram alignment
    let base_pattern = "𝌆𝌇𝌈𝌉𝌊𝌋𝌌𝌍𝌎";
    content.push_str(&base_pattern.repeat(9)); // 9 × 9 = 81 tetragrams
    
    content
}

fn create_test_template(debug: bool) -> String {
    let mut content = String::new();
    
    if debug {
        content.push_str("// Test template for validation\n");
        content.push_str("// Contains all instruction types\n\n");
    }
    
    // Test pattern with various instruction types
    content.push_str("𝌆𝌇𝌈𝌉𝌊𝌋𝌌𝌍𝌎𝌏𝌐𝌑"); // 12 tetragrams for testing
    
    content
} 

const DEFAULT_OUTPUT_DIR: &str = "vm_outputs";

fn normalize_output_path(initial: PathBuf) -> PathBuf {
    // If path is absolute or already contains directory separators, keep as is
    if initial.is_absolute() || initial.components().count() > 1 {
        return initial;
    }
    let mut out = PathBuf::from(DEFAULT_OUTPUT_DIR);
    out.push(initial);
    out
} 

// Universal tetragram encoding using proper lossless scheme
fn encode_universal_to_tetragrams(input: &[u8], output: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    println!("🔢 Encoding {} bytes using lossless tetragram mapping", input.len());
    
    // Use a proper lossless encoding: convert bytes to base-81 digits
    const GLYPH_BASE: u32 = 0x1D306;
    let mut tetragrams: Vec<char> = Vec::new();
    
    // Convert input bytes to a single large number (little-endian)
    let mut big_number = BigUint::from(0u32);
    for (i, &byte) in input.iter().enumerate() {
        let byte_value = BigUint::from(byte);
        let shift = BigUint::from(256u32).pow(i as u32);
        big_number += byte_value * shift;
    }
    
    // Convert to base-81 digits
    let base = BigUint::from(81u32);
    let mut digits: Vec<u8> = Vec::new();
    let mut value = big_number.clone();
    
    while !value.is_zero() {
        let (quotient, remainder) = value.div_rem(&base);
        digits.push(remainder.to_u8().unwrap());
        value = quotient;
    }
    
    // If input was all zeros, ensure we have at least one digit
    if digits.is_empty() {
        digits.push(0);
    }
    
    // Convert digits to tetragrams
    for &digit in digits.iter() {
        if let Some(glyph) = std::char::from_u32(GLYPH_BASE + digit as u32) {
            tetragrams.push(glyph);
        }
    }
    
    // Ensure Tesla 3-6-9 alignment (pad to multiple of 9)
    while tetragrams.len() % 9 != 0 {
        if let Some(glyph) = std::char::from_u32(GLYPH_BASE) {
            tetragrams.push(glyph);
        }
    }
    
    let glyph_stream: String = tetragrams.iter().collect();
    
    // Ensure output has .sm extension
    let mut out_path = output.clone();
    if out_path.extension().map_or(true, |ext| ext != "sm") {
        out_path = out_path.with_extension("sm");
    }
    let normalized_out_path = normalize_output_path(out_path);
    
    std::fs::write(&normalized_out_path, glyph_stream)?;
    println!("✅ Encoded {} tetragrams to {}", tetragrams.len(), normalized_out_path.display());
    println!("🔢 Original bytes: {}", input.len());
    println!("📊 Efficiency: {:.2} bytes per tetragram", input.len() as f64 / tetragrams.len() as f64);
    
    Ok(())
}

// Lossless tetragram decoding using base-81 conversion
fn decode_tetragrams_to_bytes(input: &str) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    // Remove whitespace and validate glyphs
    let glyphs: Vec<char> = input.chars().filter(|c| !c.is_whitespace()).collect();
    if glyphs.is_empty() {
        return Err("No tetragram glyphs found in input".into());
    }
    
    // Convert tetragrams back to base-81 digits
    const GLYPH_BASE: u32 = 0x1D306;
    let mut digits: Vec<u8> = Vec::new();
    
    for ch in glyphs {
        let code = ch as u32;
        if code < GLYPH_BASE || code > GLYPH_BASE + 80 {
            return Err(format!("Invalid tetragram: '{}' (U+{:X})", ch, code).into());
        }
        
        let digit = (code - GLYPH_BASE) as u8;
        digits.push(digit);
    }
    
    // Convert base-81 digits back to a large number
    let base = BigUint::from(81u32);
    let mut big_number = BigUint::from(0u32);
    
    for (i, &digit) in digits.iter().enumerate() {
        let digit_value = BigUint::from(digit);
        let power = base.pow(i as u32);
        big_number += digit_value * power;
    }
    
    // Convert large number back to bytes (little-endian)
    let mut bytes: Vec<u8> = Vec::new();
    let mut value = big_number.clone();
    let byte_base = BigUint::from(256u32);
    
    while !value.is_zero() {
        let (quotient, remainder) = value.div_rem(&byte_base);
        bytes.push(remainder.to_u8().unwrap());
        value = quotient;
    }
    
    Ok(bytes)
}

// Encode number to tetragrams using universal byte mapping
fn encode_number_to_tetragrams(input: &str, output: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    // Parse the input number
    let number = input.parse::<BigUint>()
        .map_err(|_| format!("Failed to parse number: {}", input))?;
    
    println!("🔢 Encoding number: {}", number);
    
    // Convert BigUint to bytes (little-endian, matching bytecode_to_glyphs)
    let bytes = number.to_bytes_le();
    
    // Use universal encoding
    encode_universal_to_tetragrams(&bytes, output)
}

// Encode text to tetragrams using universal byte mapping
fn encode_text_to_tetragrams(input: &str, output: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    println!("📝 Encoding text: {}", input);
    
    // Convert text to bytes (UTF-8)
    let bytes = input.as_bytes();
    
    // Use universal encoding
    encode_universal_to_tetragrams(bytes, output)
}

// Decode tetragrams to number using universal byte mapping
fn decode_tetragrams_to_number(input: &str) -> Result<String, Box<dyn std::error::Error>> {
    let bytes = decode_tetragrams_to_bytes(input)?;
    
    // Convert bytes back to BigUint (little-endian)
    let number = BigUint::from_bytes_le(&bytes);
    
    Ok(number.to_str_radix(10))
}

// Decode tetragrams to text using universal byte mapping
fn decode_tetragrams_to_text(input: &str) -> Result<String, Box<dyn std::error::Error>> {
    let bytes = decode_tetragrams_to_bytes(input)?;
    
    // Convert bytes back to text (UTF-8)
    let text = String::from_utf8(bytes)
        .map_err(|e| format!("Invalid UTF-8: {}", e))?;
    
    Ok(text)
}

// Trit-to-Tetragram direct mapping (Tesla 3-6-9 aligned)
fn encode_trits_to_tetragrams_direct(trits: &[i8]) -> String {
    const TETRAGRAM_BASE: u32 = 0x1D306;
    let mut tetragrams = String::new();
    
    for &trit in trits {
        // Map trit values (-1, 0, 1) to tetragram indices (0-80)
        let tetragram_index = match trit {
            -1 => 0,   // First tetragram for negative
            0  => 27,  // Middle tetragram for zero (Tesla 3^3)
            1  => 54,  // Last tetragram for positive
            _  => panic!("Invalid trit value: {}", trit),
        };
        
        // Convert to tetragram glyph
        let glyph_code = TETRAGRAM_BASE + tetragram_index;
        if let Some(glyph) = std::char::from_u32(glyph_code) {
            tetragrams.push(glyph);
        }
    }
    
    tetragrams
}

// Decode tetragrams back to trits
fn decode_tetragrams_to_trits_direct(tetragrams: &str) -> Vec<i8> {
    const TETRAGRAM_BASE: u32 = 0x1D306;
    let mut trits = Vec::new();
    
    for ch in tetragrams.chars() {
        let code = ch as u32;
        if code >= TETRAGRAM_BASE && code <= TETRAGRAM_BASE + 80 {
            let index = code - TETRAGRAM_BASE;
            let trit = match index {
                0..=26  => -1,  // First 27 tetragrams = negative
                27..=53 => 0,   // Middle 27 tetragrams = zero
                54..=80 => 1,   // Last 27 tetragrams = positive
                _ => panic!("Invalid tetragram index: {}", index),
            };
            trits.push(trit);
        }
    }
    
    trits
}

// Convert text to trits using Tesla-aligned mapping
fn text_to_trits(text: &str) -> Vec<i8> {
    let mut trits = Vec::new();
    
    for byte in text.as_bytes() {
        // Convert each byte to trits using Tesla 3-6-9 alignment
        let mut value = *byte as i32;
        
        // Convert to base-3 representation
        while value > 0 {
            let remainder = value % 3;
            let trit = match remainder {
                0 => 0,
                1 => 1,
                2 => -1,  // Tesla negative encoding
                _ => unreachable!(),
            };
            trits.push(trit);
            value = value / 3;
        }
        
        // Pad to 4 trits per byte for Tesla alignment
        while trits.len() % 4 != 0 {
            trits.push(0);
        }
    }
    
    trits
}

// Convert trits back to text
fn trits_to_text(trits: &[i8]) -> String {
    let mut bytes = Vec::new();
    let mut current_byte = 0;
    let mut trit_count = 0;
    
    for &trit in trits {
        let value = match trit {
            -1 => 2,
            0  => 0,
            1  => 1,
            _  => panic!("Invalid trit: {}", trit),
        };
        
        current_byte = current_byte * 3 + value;
        trit_count += 1;
        
        if trit_count == 4 {
            bytes.push(current_byte as u8);
            current_byte = 0;
            trit_count = 0;
        }
    }
    
    String::from_utf8(bytes).unwrap_or_else(|_| "Invalid UTF-8".to_string())
}

// Enhanced text-to-tetragram conversion using direct trit mapping
fn encode_text_to_tetragrams_direct(input: &str, output: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    println!("📝 Encoding text using direct trit-to-tetragram mapping: {}", input);
    
    // Convert text to trits
    let trits = text_to_trits(input);
    println!("🔢 Generated {} trits", trits.len());
    
    // Convert trits to tetragrams
    let tetragrams = encode_trits_to_tetragrams_direct(&trits);
    println!("🔺 Generated {} tetragrams", tetragrams.chars().count());
    
    // Save to file
    let normalized = normalize_output_path(output.clone());
    let tetragram_count = tetragrams.chars().count();
    fs::write(&normalized, &tetragrams)?;
    println!("✅ Encoded {} tetragrams to {}", tetragram_count, normalized.display());
    
    // Tesla alignment analysis
    let tesla_alignment = analyze_tesla_alignment(tetragram_count);
    println!("🔺 Tesla alignment score: {:.2}", tesla_alignment.score);
    println!("🔺 Tesla constants: {}", tesla_alignment.constants.join(", "));
    
    Ok(())
}

// Enhanced tetragram-to-text conversion using direct trit mapping
fn decode_tetragrams_to_text_direct(input: &str) -> Result<String, Box<dyn std::error::Error>> {
    // Convert tetragrams to trits
    let trits = decode_tetragrams_to_trits_direct(input);
    println!("🔢 Decoded {} trits", trits.len());
    
    // Convert trits to text
    let text = trits_to_text(&trits);
    println!("📝 Decoded text: {}", text);
    
    Ok(text)
}

// Convert handler implementation
pub fn convert_tetragram_file(args: ConvertArgs) -> Result<(), Box<dyn std::error::Error>> {
    use std::io::Read;
    let from_fmt = args.from.to_lowercase();
    let to_fmt = args.to.to_lowercase();

    println!("🔄 Converting from {} to {}", from_fmt, to_fmt);

    if from_fmt == "number" && to_fmt == "sm" {
        // Encode number directly to tetragrams
        encode_number_to_tetragrams(&args.input, &args.output)
    } else if from_fmt == "text" && to_fmt == "sm" {
        // Encode text directly to tetragrams using direct trit mapping
        encode_text_to_tetragrams_direct(&args.input, &args.output)
    } else if from_fmt == "sm" && to_fmt == "number" {
        // Decode tetragrams to number
        // Read input as file or direct string
        let glyphs = if std::path::Path::new(&args.input).exists() {
            std::fs::read_to_string(&args.input)?
        } else {
            args.input.clone()
        };
        let number = decode_tetragrams_to_number(&glyphs)?;
        println!("🔢 Decoded number: {}", number);
        // Write to output file if specified
        if !args.output.as_os_str().is_empty() {
            let normalized = normalize_output_path(args.output.clone());
            std::fs::write(&normalized, number.as_bytes())?;
            println!("✅ Wrote decoded number to {}", normalized.display());
        }
        Ok(())
    } else if from_fmt == "sm" && to_fmt == "text" {
        // Decode tetragrams to text using direct trit mapping
        // Read input as file or direct string
        let glyphs = if std::path::Path::new(&args.input).exists() {
            std::fs::read_to_string(&args.input)?
        } else {
            args.input.clone()
        };
        let text = decode_tetragrams_to_text_direct(&glyphs)?;
        println!("📝 Decoded text: {}", text);
        // Write to output file if specified
        if !args.output.as_os_str().is_empty() {
            let normalized = normalize_output_path(args.output.clone());
            std::fs::write(&normalized, text.as_bytes())?;
            println!("✅ Wrote decoded text to {}", normalized.display());
        }
        Ok(())
    } else if from_fmt == "tritvm" && to_fmt == "sm" {
        // Read input bytecode
        let mut data = Vec::new();
        std::fs::File::open(&args.input)?.read_to_end(&mut data)?;

        // Use translator first; if it yields empty string fallback to BigUint encoder
        let glyph_stream_t = trinaryvm_runtime::translator::bytecode_to_glyphs(&data);
        if !glyph_stream_t.is_empty() {
            let mut out_path = args.output.clone();
            if out_path.extension().map_or(true, |ext| ext != "sm") {
                out_path = out_path.with_extension("sm");
            }
            let normalized = normalize_output_path(out_path);
            std::fs::write(&normalized, glyph_stream_t)?;
            println!("✅ Wrote glyph stream to {}", normalized.display());
            return Ok(());
        }
        // Fallback BigUint encoder
        let mut data = Vec::new();
        std::fs::File::open(&args.input)?.read_to_end(&mut data)?;

        // Convert entire byte stream into one BigUint (little-endian)
        let big = BigUint::from_bytes_le(&data);

        // Re-encode into base-81 digits
        const BASE: u32 = 81;
        let mut digits: Vec<u8> = Vec::new();
        let mut value = big.clone();
        let base = BigUint::from(BASE);
        while !value.is_zero() {
            let (q, r) = value.div_rem(&base);
            digits.push(r.to_u8().unwrap());
            value = q;
        }
        if digits.is_empty() {
            digits.push(0);
        }

        // Map digits to glyphs
        const GLYPH_BASE: u32 = 0x1D306;
        let glyph_stream: String = digits
            .iter()
            .map(|d| std::char::from_u32(GLYPH_BASE + *d as u32).unwrap())
            .collect();

        let mut out_path = args.output.clone();
        if out_path.extension().map_or(true, |ext| ext != "sm") {
            out_path = out_path.with_extension("sm");
        }
        let normalized = normalize_output_path(out_path);
        std::fs::write(&normalized, glyph_stream)?;
        println!("✅ Wrote {} glyphs to {}", digits.len(), normalized.display());
        Ok(())
    } else {
        Err(format!("Unsupported conversion: {} -> {}", from_fmt, to_fmt).into())
    }
} 

 