---
sidebar_position: 2
---

# Getting Started

This guide will help you set up and start using the TrinaryVM Open-Core CLI for tetragram encoding and hybrid codec experimentation.

> **⚠️ Important Disclaimers:**
> 
> - **Active Development**: This CLI is still in active development. Issues and incomplete features are expected.
> - **Experimental Cryptography**: Cryptographic operations are experimental and should not be used for production security-critical applications.
> - **Blockchain Operations**: All blockchain-related operations (Solana $TRIT token, Base/Sol/Trit bridges) are **pending release** and not yet available in this CLI.
> - **Runtime Binary Required**: Some commands require the `trinaryvm` runtime binary (see [Open-Core Scope](/docs/open-core-scope) for details).

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - JavaScript runtime (for CLI)
- **Git** - Version control
- **npm** or **yarn** - Package manager

## Installation

### Quick Start

```bash
# Clone the repository
git clone https://github.com/TrinaryVM/open-core-cli.git
cd open-core-cli

# Install CLI dependencies
cd cli
npm install

# Build the CLI
npm run build

# The CLI is now available
./bin/trinaryvm --help
```

### Using Pre-compiled Binaries

Download pre-compiled binaries from [Releases](https://github.com/TrinaryVM/open-core-cli/releases):

```bash
# Extract and add to PATH
export PATH="$PATH:/path/to/trinaryvm/bin"
trinaryvm --version
```

## Basic Usage

### Encode Text to Tetragrams

```bash
# Convert text to Supreme Mystery (.sm) format
trinaryvm tetragram convert --input "Hello World" --output hello.sm --from text

# View the encoded tetragrams
cat hello.sm
```

### Decode Tetragrams to Text

```bash
# Convert tetragram file back to text
trinaryvm tetragram convert --input hello.sm --output hello.txt --from sm --to text

# Verify round-trip
cat hello.txt
# Output: Hello World
```

### Validate Tetragram Files

```bash
# Validate a .sm file
trinaryvm tetragram validate --file hello.sm --check-alignment

# Check Tesla 3-6-9 alignment
trinaryvm validate-alignment --file hello.sm
```

### Validate Tesla 3-6-9 Alignment

```bash
# Check if a file is aligned to Tesla 3-6-9
trinaryvm validate-alignment --file hello.sm
```

## First Steps

### 1. Convert Text to Tetragrams

```bash
# Convert text to Supreme Mystery (.sm) format
trinaryvm tetragram convert --input "Hello World" --output hello.sm --from text

# View the encoded file
cat hello.sm
```

### 2. Convert Back to Text

```bash
# Convert tetragrams back to text
trinaryvm tetragram convert --input hello.sm --output hello.txt --from sm --to text

# Verify it worked
cat hello.txt
# Output: Hello World
```

### 3. Validate Alignment

```bash
# Check Tesla 3-6-9 alignment
trinaryvm validate-alignment --file hello.sm

# Validate tetragram file structure
trinaryvm tetragram validate --file hello.sm --check-alignment
```

## Core Concepts

### Tetragram Encoding

Tetragrams are 4-trit (ternary digit) units mapped to Unicode glyphs. Each tetragram represents a unique combination of three states (-1, 0, +1):

```bash
# Convert text to tetragrams
trinaryvm tetragram convert --input "test" --output test.sm --from text

# The output contains tetragram glyphs representing the encoded data
```

### Hybrid Codec (Experimental)

The hybrid codec for lossless JSON encoding/decoding is **experimental** and under active development:

> **Note**: Full JSON round-trip encoding/decoding is planned but not yet fully implemented. Current focus is on basic tetragram conversion and validation.

### Tesla 3-6-9 Alignment

TrinaryVM uses Tesla 3-6-9 alignment for validation:

```bash
# Validate alignment
trinaryvm validate-alignment --file data.sm

# Output shows:
# - Aligned to 3: ✅
# - Aligned to 6: ✅
# - Aligned to 9: ✅
```

## Examples

### Convert Multiple Files

```bash
# Convert multiple text files to .sm format
for file in *.txt; do
  trinaryvm tetragram convert --input "$file" --output "${file%.txt}.sm" --from text
done
```

### Execute Tetragram Programs

```bash
# Execute a Supreme Mystery (.sm) program
trinaryvm tetragram execute --program program.sm

# With debug output
trinaryvm tetragram execute --program program.sm --debug
```

### Analyze Tetragram Files

```bash
# Analyze gas usage and optimization opportunities
trinaryvm tetragram analyze --file program.sm
```

## Available Commands

### Tetragram Commands
- `trinaryvm tetragram convert` - Convert between formats (text, sm, hex, binary)
- `trinaryvm tetragram validate` - Validate .sm file structure
- `trinaryvm tetragram execute` - Execute Supreme Mystery programs
- `trinaryvm tetragram analyze` - Analyze gas usage and optimization
- `trinaryvm tetragram compile` - Compile TritLang to .sm format
- `trinaryvm tetragram create` - Create new .sm template

### Validation Commands
- `trinaryvm validate-alignment` - Check Tesla 3-6-9 alignment

### Runtime-Dependent Commands
These require the `trinaryvm` runtime binary:
- `trinaryvm run` - Execute bytecode (requires runtime)
- `trinaryvm keys` - Generate TriFHE keys (requires runtime)
- `trinaryvm encrypt` / `decrypt` - TriFHE operations (requires runtime)
- `trinaryvm hash` - SHA3-2187 hashing (requires runtime)
- `trinaryvm benchmark` - Performance benchmarking (requires runtime)

### Blockchain Operations
**Status**: Pending release. Blockchain integration (Solana $TRIT token, Base/Sol/Trit bridges) is planned but not yet available in this CLI.

## Troubleshooting

### Common Issues

**Runtime binary not found:**
```bash
# Some commands require the trinaryvm runtime binary
# The CLI will show installation instructions if needed

# Basic tetragram commands work without runtime
trinaryvm tetragram convert --input "test" --output test.sm --from text  # Works
trinaryvm run program.tritvm  # Requires runtime binary
```

**Command not found:**
```bash
# If commands don't exist, check available commands
trinaryvm --help
trinaryvm tetragram --help
```

**Invalid tetragram file:**
```bash
# Validate alignment
trinaryvm validate-alignment --file data.sm

# Check file encoding
file data.sm
```

**JSON encoding fails:**
```bash
# Ensure valid JSON input
echo '{"key": "value"}' | jq . > valid.json
trinaryvm encode --input valid.json --format json --output data.sm
```

### Getting Help

- Check [Troubleshooting](/docs/troubleshooting) for common questions
- Review [Open-Core Scope](/docs/open-core-scope) to understand what's included
- Open an issue on [GitHub](https://github.com/TrinaryVM/open-core-cli/issues)

## Next Steps

- [Open-Core Scope](/docs/open-core-scope) - Understand what's included and what's not
- [CLI Reference](/docs/development/cli) - Complete CLI command documentation
- [API Reference](/docs/api) - API documentation

## Note on Enterprise Features

The full TrinaryVM platform includes enterprise features that require the runtime binary or enterprise access:

- **VLIW Dashboard**: 27×81 tetragram grid visualization (Enterprise)
- **Full VM Runtime**: Bytecode execution engine (Private)
- **TriFHE Implementation**: Complete homomorphic encryption (Enterprise/Private)

See [Open-Core Scope](/docs/open-core-scope) for details on what's available in the public CLI.

This completes the getting started guide. You're now ready to experiment with tetragram encoding and hybrid codecs!
