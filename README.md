# TrinaryVM CLI - Open Core

Public command-line interface for TrinaryVM.

> **⚠️ Important Disclaimers:**
> 
> - **Active Development**: This CLI is still in active development. Issues and incomplete features are expected.
> - **Experimental Cryptography**: Cryptographic operations are experimental and should not be used for production security-critical applications.
> - **Blockchain Operations**: All blockchain-related operations (Solana $TRIT token, Base/Sol/Trit bridges) are **pending release** and not yet available in this CLI.

## Installation

Download pre-compiled binaries from [Releases](https://github.com/TrinaryVM/open-core-cli/releases)

## Runtime Binary Requirement

Some commands require the TrinaryVM runtime binary (`trinaryvm`). The CLI will automatically detect if the binary is available and provide installation instructions if not.

### Installing the Runtime Binary

**Option 1: Pre-compiled Binaries**
- Download from: https://github.com/TrinaryVM/trinaryvm-core/releases
- Extract and add to PATH: `export PATH="$PATH:/path/to/trinaryvm/bin"`

**Option 2: Build from Source** (requires access to private repository)
```bash
git clone git@github.com:TrinaryVM/trinaryvm-core.git
cd trinaryvm-core/runtime
cargo build --release
```

**Option 3: Enterprise/Partner Access**
Contact: partnerships@trinaryvm.org

## Commands

### Tetragram Commands (Standalone)
These commands work without the runtime:
- `tetragram convert` - Convert between formats (text, sm, hex, binary)
- `tetragram validate` - Validate .sm file structure
- `tetragram execute` - Execute Supreme Mystery programs
- `tetragram analyze` - Analyze gas usage and optimization
- `tetragram compile` - Compile TritLang to .sm format
- `tetragram create` - Create new .sm template
- `validate-alignment` - Tesla 3-6-9 alignment validation

### Runtime-Dependent Commands
These commands require the `trinaryvm` runtime binary:
- `run` - Execute TrinaryVM bytecode (requires runtime)
- `benchmark` - Performance benchmarking (requires runtime)
- `keys` - Generate TriFHE keypairs (requires runtime)
- `encrypt` / `decrypt` - TriFHE encryption/decryption (requires runtime)
- `hash` - SHA3-2187 hashing (requires runtime)
- `validate-impl` - Implementation validation (requires runtime)
- `gas-estimate` - Gas estimation (requires runtime)

### Blockchain Operations
**Status**: Pending Release

Blockchain-related operations are planned but not yet available:
- Solana $TRIT token integration
- Base/Sol/Trit bridge prototypes
- Blockchain storage encoding

These features are under active development and will be released in a future version.

> **⚠️ Important Disclaimers:**
> 
> - **Active Development**: This CLI is still in active development. Issues and incomplete features are expected.
> - **Experimental Cryptography**: Cryptographic operations are experimental and should not be used for production security-critical applications.
> - **Blockchain Operations**: All blockchain-related operations (Solana $TRIT token, Base/Sol/Trit bridges) are **pending release** and not yet available in this CLI.
> - **Runtime Binary Required**: Some commands require the `trinaryvm` runtime binary (see [Open-Core Scope](/docs/open-core-scope) for details).


## Architecture

This CLI is a thin wrapper that invokes the external `trinaryvm` binary for runtime operations. This design provides:

- **Clean separation**: CLI code is public, runtime remains private
- **IP protection**: Cryptographic implementations stay proprietary
- **Familiar model**: Similar to Docker, Terraform, Rust toolchains

## License

See [LICENSE](LICENSE) file.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
