# TrinaryVM Test Samples

This directory contains comprehensive test files for validating the TrinaryVM VS Code extension functionality.

## Bytecode Files (.tritvm)

### Basic Programs

**hello-world.tritvm** (28 bytes)
- Simple arithmetic demonstration
- PUSH/POP operations with basic addition
- Perfect for testing basic disassembly and gas analysis

**arithmetic-demo.tritvm** (55 bytes)
- Comprehensive mathematical operations (ADD, SUB, MUL, DIV)
- Register management demonstration
- Good for testing instruction parsing and gas calculation

### Advanced Features

**ternary-logic.tritvm** (59 bytes)
- Balanced ternary logic operations (TAND, TOR, TXOR, TNOT)
- Demonstrates ternary state handling (-1, 0, +1)
- Tests ternary-specific instruction highlighting

**homomorphic-demo.tritvm** (62 bytes)
- Homomorphic encryption operations (HE_ADD, HE_MUL)
- Privacy-preserving computation example
- Tests cryptographic instruction support

**control-flow.tritvm** (32 bytes)
- Function calls and returns (CALL, RET)
- Control flow demonstration
- Tests debugging and breakpoint functionality

### Testing and Validation

**invalid-bytecode.tritvm** (20 bytes)
- Intentionally malformed bytecode
- Tests error handling and validation
- Wrong magic number and invalid opcodes

**large-program.tritvm** (1308 bytes)
- Performance testing with 301 instructions
- Stress tests the parser and analysis engine
- Tests UI performance with large files

## Source Files (.trit)

### TritLang Examples

**hello-world.trit**
- Basic TritLang contract structure
- Event emission and state variables
- Perfect for syntax highlighting testing

**ternary-logic.trit**
- Balanced ternary logic in high-level language
- Demonstrates trit3 type usage
- Shows ternary operators (&, |, ^, ~)

**homomorphic-demo.trit**
- Homomorphic encryption library usage
- Import statements and library integration
- Privacy-preserving smart contract example

## Testing the Extension

### 1. Open Test Files
```bash
# Open VS Code in this directory
code test-samples/

# Or open specific files
code hello-world.tritvm
code ternary-logic.trit
```

### 2. Test Disassembly Views
- Right-click on any `.tritvm` file
- Select "View as Assembly", "View as Hex", or "View as Balanced Ternary"
- Verify syntax highlighting and formatting

### 3. Test Gas Analysis
- Open any `.tritvm` file
- Run command: "TritVM: Analyze Gas Usage" (Ctrl+Alt+G)
- Verify gas calculations and optimization suggestions

### 4. Test Debugging
- Set up debug configuration in `.vscode/launch.json`:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug Hello World",
            "type": "tritvm",
            "request": "launch",
            "program": "${workspaceFolder}/hello-world.tritvm",
            "stopOnEntry": true,
            "gas": 100000,
            "trace": true
        }
    ]
}
```
- Press F5 to start debugging
- Test breakpoints, step execution, and variable inspection

### 5. Test Validation
- Open `invalid-bytecode.tritvm`
- Verify error detection and reporting
- Test validation on save feature

## Expected Behavior

### Syntax Highlighting
- Instruction mnemonics should be colored
- Addresses and operands should have distinct colors
- Comments and metadata should be highlighted appropriately

### Gas Analysis
- hello-world.tritvm: ~15 total gas
- arithmetic-demo.tritvm: ~35 total gas
- large-program.tritvm: ~600+ total gas
- Expensive operations should be highlighted

### Error Handling
- invalid-bytecode.tritvm should show validation errors
- Malformed files should display helpful error messages
- Recovery from parsing errors should be graceful

### Performance
- large-program.tritvm should load and parse quickly (<1 second)
- Memory usage should remain reasonable
- UI should remain responsive during analysis

## File Format Reference

### .tritvm Bytecode Structure
```
Header (14 bytes):
- Magic: "TRITVM" (6 bytes)
- Version: uint32 (4 bytes)
- Instruction Count: uint32 (4 bytes)

Instructions (variable length):
- Opcode: 1 byte
- Operands: 2 bytes each (little-endian)
```

### Common Opcodes
- 0x01: ADD
- 0x02: SUB
- 0x03: MUL
- 0x04: DIV
- 0x17: CALL
- 0x18: RET
- 0x20: PUSH
- 0x21: POP
- 0x30: HALT
- 0x40-0x43: Ternary logic ops
- 0x60-0x63: Homomorphic ops

## Troubleshooting

### Extension Not Loading
1. Verify extension is installed: `code --list-extensions | grep tritvm`
2. Check VS Code developer console for errors
3. Restart VS Code and try again

### Files Not Opening Correctly
1. Verify file association in VS Code settings
2. Right-click file → "Open With" → "TrinaryVM Bytecode Viewer"
3. Check file permissions and encoding

### Debug Adapter Issues
1. Verify debug configuration syntax
2. Check if TrinaryVM runtime is available
3. Enable trace mode for additional debug output

### Performance Issues
1. Disable real-time gas analysis for large files
2. Increase memory limits in VS Code settings
3. Close unused files to free resources

## Contributing Test Cases

When adding new test files:

1. **Document the purpose** clearly in comments
2. **Keep files focused** on specific functionality
3. **Include both valid and invalid cases**
4. **Update this README** with new file descriptions
5. **Test on multiple platforms** (Windows, macOS, Linux)

For binary bytecode files, also provide:
- Corresponding .trit source if available
- Expected gas usage calculations
- Detailed instruction breakdown

---

**These test samples ensure comprehensive validation of the TrinaryVM VS Code extension across all supported features and edge cases.** 