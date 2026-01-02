---
sidebar_position: 1
---

# Welcome to TrinaryVM Open-Core CLI

**Public command-line interface for tetragram encoding, hybrid codecs, and symbolic processing experimentation.**

> **⚠️ Important Disclaimers:**
> 
> - **Active Development**: This CLI is still in active development. Issues and incomplete features are expected.
> - **Experimental Cryptography**: Cryptographic operations are experimental and should not be used for production security-critical applications.
> - **Blockchain Operations**: All blockchain-related operations (Solana $TRIT token, Base/Sol/Trit bridges) are **pending release** and not yet available in this CLI.

## What is TrinaryVM Open-Core CLI?

TrinaryVM Open-Core CLI is a public tool for experimenting with tetragram encoding and hybrid codecs. It provides basic symbolic encoding capabilities using Supreme Mystery (.sm) tetragrams.

### Key Features

- **Tetragram Encoding**: Convert text/data to Supreme Mystery (.sm) tetragram format
- **Hybrid Codecs**: Experimental lossless JSON encoding/decoding (under development)
- **CLI Tools**: Command-line interface for tetragram conversion, validation, and execution
- **Experimentation**: Tools for testing symbolic encoding concepts

## Quick Start

### Prerequisites

- Node.js 18+ (for CLI)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/TrinaryVM/open-core-cli.git
cd open-core-cli

# Install CLI dependencies
cd cli
npm install

# Build the CLI
npm run build
```

### Your First Encoding

Encode text to tetragrams:

```bash
# Encode text to Supreme Mystery format
trinaryvm encode --input "Hello World" --output hello.sm

# Decode back to text
trinaryvm decode --input hello.sm --output hello.txt
```

### Encode JSON with Hybrid Codec

```bash
# Encode JSON data
echo '{"message": "Hello", "value": 42}' | trinaryvm encode --format json --output data.sm

# Decode back to JSON
trinaryvm decode --input data.sm --format json
```

## Core Concepts

### Tetragram Encoding

Tetragrams are 4-trit (ternary digit) units mapped to Unicode glyphs. Each tetragram represents a unique combination of three states (-1, 0, +1):

```bash
# Encode text to tetragrams
trinaryvm encode --input "test" --output test.sm

# View tetragram representation
cat test.sm
# Output:  (tetragram glyphs)
```

### Hybrid Codec

Lossless JSON encoding/decoding using tetragram strings:

```bash
# Round-trip JSON encoding
echo '{"key": "value"}' | trinaryvm encode --format json --output json.sm
trinaryvm decode --input json.sm --format json
# Output: {"key": "value"}  (identical)
```

### Execute Tetragram Programs

Execute Supreme Mystery (.sm) programs:

```bash
# Execute a .sm program
trinaryvm tetragram execute --program program.sm

# With debug output
trinaryvm tetragram execute --program program.sm --debug
```

## What's Next?

- [Open-Core Scope](/docs/open-core-scope) - What's included and what's not
- [Getting Started](/docs/getting-started) - Complete setup guide
- [CLI Reference](/docs/development/cli) - Command-line interface documentation
- [API Reference](/docs/api) - API documentation

## Note on Enterprise Features

The full TrinaryVM platform includes:
- **VLIW Dashboard**: 27×81 tetragram grid visualization (Enterprise)
- **Full VM Runtime**: Bytecode execution engine (Private)
- **TriFHE Implementation**: Complete homomorphic encryption (Enterprise/Private)
- **Blockchain Integration**: Solana $TRIT token, Base/Sol/Trit bridges (Pending Release)

These features require the `trinaryvm` runtime binary or enterprise access. See [Open-Core Scope](/docs/open-core-scope) for details.

## Blockchain Operations Status

**Status**: Pending Release

Blockchain-related operations are planned but not yet available:
- Solana $TRIT token integration
- Base/Sol/Trit bridge prototypes
- Blockchain storage encoding

These features are under active development and will be released in a future version.