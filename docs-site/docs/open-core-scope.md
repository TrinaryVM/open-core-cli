# Open-Core CLI Scope

> **⚠️ Important Disclaimers:**
> 
> - **Active Development**: This CLI is still in active development. Issues and incomplete features are expected.
> - **Experimental Cryptography**: Cryptographic operations are experimental and should not be used for production security-critical applications.
> - **Blockchain Operations**: All blockchain-related operations are **pending release** and not yet available.

## What's Included

The TrinaryVM Open-Core CLI provides:

### **Tetragram Encoding**
- Encode text/data to Supreme Mystery (.sm) tetragram format
- Decode tetragram strings back to original data
- Validate tetragram alignment (Tesla 3-6-9)

### **Hybrid Codec**
- Lossless JSON encoding/decoding
- Round-trip conversion: JSON → Tetragrams → JSON
- Experimental passphrase-based encoding (proof of concept)

### **CLI Tools**
- `encode` / `decode` - Basic encoding operations
- `validate-alignment` - Tesla 3-6-9 validation
- `tetragram` - Tetragram-specific operations

## What's NOT Included

The following features are **enterprise/private** and not available in open-core:

- **Full VLIW Dashboard**: 27×81 tetragram grid visualization
- **TriFHE Encryption**: Full homomorphic encryption (keys, encrypt, decrypt commands require runtime binary)
- **VM Execution**: Bytecode execution (requires runtime binary)
- **Compiler**: TritLang compiler (private repository)

## Use Cases

### **Experimentation**
- Test tetragram encoding concepts
- Experiment with symbolic encoding
- Build proof-of-concept applications

### **Blockchain Integration** (Pending Release)
> **Status**: Blockchain operations are **pending release** and not yet available in this CLI.
> 
> Planned features:
> - Solana $TRIT token integration
> - Base/Sol/Trit bridge prototypes
> - Encode JSON data for blockchain storage
> - Tetragram-based message encoding for blockchain
> 
> These features are under active development and will be released in a future version.

### **Hybrid Codec Development** (Experimental)
> **Status**: Hybrid codec for lossless JSON round-trips is **experimental** and under active development.
> 
> Current focus is on basic tetragram conversion and validation. Full JSON encoding/decoding is planned but not yet fully implemented.

## Getting the Runtime Binary

Some CLI commands require the `trinaryvm` runtime binary:

- `run` - Execute bytecode
- `keys` - Generate TriFHE keys
- `encrypt` / `decrypt` - TriFHE operations
- `hash` - SHA3-2187 hashing

See the main README for installation instructions.

