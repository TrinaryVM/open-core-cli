export interface TritVMInstruction {
  address: number;
  opcode: number;
  mnemonic: string;
  operands: string[];
  rawBytes: Uint8Array;
  gasCost: number;
  description: string;
  category: InstructionCategory;
}

export interface BytecodeHeader {
  magic: string;
  version: number;
  instructionCount: number;
  isValid: boolean;
}

export enum InstructionCategory {
  DataMovement = 'Data Movement',
  Arithmetic = 'Arithmetic',
  TernaryLogic = 'Ternary Logic',
  ControlFlow = 'Control Flow',
  Cryptographic = 'Cryptographic',
  Homomorphic = 'Homomorphic',
  System = 'System'
}

export class InstructionParser {
  private readonly MAGIC_NUMBER = 'TRITVM';
  private readonly SUPPORTED_VERSION = 1;
  
  // Instruction set mapping
  private readonly instructionSet: Map<number, {
    mnemonic: string;
    operandCount: number;
    gasCost: number;
    description: string;
    category: InstructionCategory;
  }> = new Map([
    // Data Movement Instructions (0x20-0x2F)
    [0x20, { mnemonic: 'PUSH', operandCount: 1, gasCost: 1, description: 'Push immediate value onto stack', category: InstructionCategory.DataMovement }],
    [0x21, { mnemonic: 'POP', operandCount: 1, gasCost: 1, description: 'Pop value from stack to register', category: InstructionCategory.DataMovement }],
    [0x22, { mnemonic: 'LOAD', operandCount: 2, gasCost: 3, description: 'Load from memory to register', category: InstructionCategory.DataMovement }],
    [0x23, { mnemonic: 'STORE', operandCount: 2, gasCost: 5, description: 'Store from register to memory', category: InstructionCategory.DataMovement }],
    [0x24, { mnemonic: 'MOV', operandCount: 2, gasCost: 1, description: 'Move between registers', category: InstructionCategory.DataMovement }],
    [0x25, { mnemonic: 'SWAP', operandCount: 2, gasCost: 1, description: 'Swap register contents', category: InstructionCategory.DataMovement }],
    
    // Arithmetic Instructions (0x01-0x0F)
    [0x01, { mnemonic: 'ADD', operandCount: 3, gasCost: 1, description: 'Add registers', category: InstructionCategory.Arithmetic }],
    [0x02, { mnemonic: 'SUB', operandCount: 3, gasCost: 1, description: 'Subtract registers', category: InstructionCategory.Arithmetic }],
    [0x03, { mnemonic: 'MUL', operandCount: 3, gasCost: 2, description: 'Multiply registers', category: InstructionCategory.Arithmetic }],
    [0x04, { mnemonic: 'DIV', operandCount: 3, gasCost: 3, description: 'Divide registers', category: InstructionCategory.Arithmetic }],
    [0x05, { mnemonic: 'MOD', operandCount: 3, gasCost: 3, description: 'Modulo operation', category: InstructionCategory.Arithmetic }],
    [0x06, { mnemonic: 'NEG', operandCount: 2, gasCost: 1, description: 'Negate register', category: InstructionCategory.Arithmetic }],
    [0x07, { mnemonic: 'INC', operandCount: 1, gasCost: 1, description: 'Increment register', category: InstructionCategory.Arithmetic }],
    [0x08, { mnemonic: 'DEC', operandCount: 1, gasCost: 1, description: 'Decrement register', category: InstructionCategory.Arithmetic }],
    
    // Ternary Logic Instructions (0x40-0x4F)
    [0x40, { mnemonic: 'TAND', operandCount: 3, gasCost: 1, description: 'Ternary AND', category: InstructionCategory.TernaryLogic }],
    [0x41, { mnemonic: 'TOR', operandCount: 3, gasCost: 1, description: 'Ternary OR', category: InstructionCategory.TernaryLogic }],
    [0x42, { mnemonic: 'TXOR', operandCount: 3, gasCost: 1, description: 'Ternary XOR', category: InstructionCategory.TernaryLogic }],
    [0x43, { mnemonic: 'TNOT', operandCount: 2, gasCost: 1, description: 'Ternary NOT', category: InstructionCategory.TernaryLogic }],
    [0x44, { mnemonic: 'TSHIFT', operandCount: 3, gasCost: 1, description: 'Ternary shift', category: InstructionCategory.TernaryLogic }],
    [0x45, { mnemonic: 'TROTATE', operandCount: 3, gasCost: 1, description: 'Ternary rotate', category: InstructionCategory.TernaryLogic }],
    
    // Control Flow Instructions (0x10-0x1F)
    [0x10, { mnemonic: 'JMP', operandCount: 1, gasCost: 2, description: 'Unconditional jump', category: InstructionCategory.ControlFlow }],
    [0x11, { mnemonic: 'JEQ', operandCount: 3, gasCost: 2, description: 'Jump if equal', category: InstructionCategory.ControlFlow }],
    [0x12, { mnemonic: 'JNE', operandCount: 3, gasCost: 2, description: 'Jump if not equal', category: InstructionCategory.ControlFlow }],
    [0x13, { mnemonic: 'JLT', operandCount: 3, gasCost: 2, description: 'Jump if less than', category: InstructionCategory.ControlFlow }],
    [0x14, { mnemonic: 'JGT', operandCount: 3, gasCost: 2, description: 'Jump if greater than', category: InstructionCategory.ControlFlow }],
    [0x15, { mnemonic: 'JLE', operandCount: 3, gasCost: 2, description: 'Jump if less than or equal', category: InstructionCategory.ControlFlow }],
    [0x16, { mnemonic: 'JGE', operandCount: 3, gasCost: 2, description: 'Jump if greater than or equal', category: InstructionCategory.ControlFlow }],
    [0x17, { mnemonic: 'CALL', operandCount: 1, gasCost: 5, description: 'Call subroutine', category: InstructionCategory.ControlFlow }],
    [0x18, { mnemonic: 'RET', operandCount: 0, gasCost: 3, description: 'Return from subroutine', category: InstructionCategory.ControlFlow }],
    
    // Cryptographic Instructions (0x50-0x5F)
    [0x50, { mnemonic: 'HASH', operandCount: 3, gasCost: 50, description: 'Compute ternary hash', category: InstructionCategory.Cryptographic }],
    [0x51, { mnemonic: 'VERIFY', operandCount: 3, gasCost: 100, description: 'Verify signature', category: InstructionCategory.Cryptographic }],
    [0x52, { mnemonic: 'ENCRYPT', operandCount: 3, gasCost: 75, description: 'Encrypt data', category: InstructionCategory.Cryptographic }],
    [0x53, { mnemonic: 'DECRYPT', operandCount: 3, gasCost: 75, description: 'Decrypt data', category: InstructionCategory.Cryptographic }],
    
    // Homomorphic Instructions (0x60-0x6F)
    [0x60, { mnemonic: 'HADD', operandCount: 3, gasCost: 100, description: 'Homomorphic addition', category: InstructionCategory.Homomorphic }],
    [0x61, { mnemonic: 'HMUL', operandCount: 3, gasCost: 150, description: 'Homomorphic multiplication', category: InstructionCategory.Homomorphic }],
    [0x62, { mnemonic: 'HENC', operandCount: 3, gasCost: 200, description: 'Homomorphic encryption', category: InstructionCategory.Homomorphic }],
    [0x63, { mnemonic: 'HDEC', operandCount: 3, gasCost: 200, description: 'Homomorphic decryption', category: InstructionCategory.Homomorphic }],
    
    // System Instructions (0x30-0x3F)
    [0x30, { mnemonic: 'HALT', operandCount: 0, gasCost: 0, description: 'Halt execution', category: InstructionCategory.System }],
    [0x31, { mnemonic: 'GAS', operandCount: 1, gasCost: 1, description: 'Get remaining gas', category: InstructionCategory.System }],
    [0x32, { mnemonic: 'REVERT', operandCount: 0, gasCost: 0, description: 'Revert state changes', category: InstructionCategory.System }],
    [0x33, { mnemonic: 'RETURN', operandCount: 1, gasCost: 0, description: 'Return value', category: InstructionCategory.System }],
  ]);

  // Reverse mapping for assembly to opcode
  private readonly mnemonicToOpcode: Map<string, number> = new Map();

  constructor() {
    // Build reverse mapping
    for (const [opcode, info] of this.instructionSet) {
      this.mnemonicToOpcode.set(info.mnemonic, opcode);
    }
  }

  parseBytecodeBuffer(bytecode: Uint8Array): { header: BytecodeHeader; instructions: TritVMInstruction[] } {
    const header = this.parseHeader(bytecode);
    if (!header.isValid) {
      throw new Error('Invalid bytecode header');
    }

    const instructions = this.parseInstructions(bytecode, header);
    return { header, instructions };
  }

  parseHeader(bytecode: Uint8Array): BytecodeHeader {
    if (bytecode.length < 14) {
      return {
        magic: '',
        version: 0,
        instructionCount: 0,
        isValid: false
      };
    }

    // Check magic number "TRITVM" (6 bytes)
    const magic = new TextDecoder().decode(bytecode.slice(0, 6));
    if (magic !== this.MAGIC_NUMBER) {
      return {
        magic,
        version: 0,
        instructionCount: 0,
        isValid: false
      };
    }

    // Read version (4 bytes, little-endian)
    const version = new DataView(bytecode.buffer).getUint32(6, true);
    
    // Read instruction count (4 bytes, little-endian)
    const instructionCount = new DataView(bytecode.buffer).getUint32(10, true);

    return {
      magic,
      version,
      instructionCount,
      isValid: version === this.SUPPORTED_VERSION
    };
  }

  parseInstructions(bytecode: Uint8Array, header: BytecodeHeader): TritVMInstruction[] {
    const instructions: TritVMInstruction[] = [];
    let offset = 14; // Skip header
    let address = 0;

    // Parse instructions until we hit the end of bytecode or reach instruction count
    while (offset < bytecode.length && instructions.length < header.instructionCount) {
      try {
        const opcode = bytecode[offset];
        const instructionInfo = this.instructionSet.get(opcode);
        
        if (!instructionInfo) {
          throw new Error(`Unknown opcode: 0x${opcode.toString(16).padStart(2, '0')} at offset ${offset}`);
        }

        const operands: string[] = [];
        const instructionStart = offset;
        offset++; // Skip opcode

        // Check if we have enough bytes for operands
        const operandBytes = instructionInfo.operandCount * 2;
        if (offset + operandBytes > bytecode.length) {
          throw new Error(`Incomplete instruction ${instructionInfo.mnemonic} at offset ${offset-1}: needs ${operandBytes} more bytes`);
        }

        // Parse operands
        for (let j = 0; j < instructionInfo.operandCount; j++) {
          const operandValue = new DataView(bytecode.buffer).getUint16(offset, true);
          operands.push(this.formatOperand(operandValue, instructionInfo.mnemonic, j));
          offset += 2; // Each operand is 2 bytes
        }

        const rawBytes = bytecode.slice(instructionStart, offset);

        instructions.push({
          address,
          opcode,
          mnemonic: instructionInfo.mnemonic,
          operands,
          rawBytes,
          gasCost: instructionInfo.gasCost,
          description: instructionInfo.description,
          category: instructionInfo.category
        });

        address = offset - 14; // Address relative to instruction start

      } catch (error) {
        // Log the error but try to continue parsing
        console.error(`Error parsing instruction at offset ${offset}: ${error}`);
        
        // Skip to next potential instruction
        offset++;
        
        // If we've skipped too many bytes, abort
        if (offset - 14 > bytecode.length) {
          break;
        }
      }
    }

    return instructions;
  }

  private formatOperand(value: number, mnemonic: string, operandIndex: number): string {
    // Format operands based on instruction type and position
    switch (mnemonic) {
      case 'PUSH':
        return `#${this.formatImmediate(value)}`;
      
      case 'LOAD':
      case 'STORE':
        if (operandIndex === 0) {
          return this.formatRegister(value);
        } else {
          return `[${this.formatRegister(value)}]`;
        }
      
      case 'JMP':
      case 'CALL':
        return `0x${value.toString(16).padStart(4, '0')}`;
      
      case 'JEQ':
      case 'JNE':
      case 'JLT':
      case 'JGT':
      case 'JLE':
      case 'JGE':
        if (operandIndex < 2) {
          return this.formatRegister(value);
        } else {
          return `0x${value.toString(16).padStart(4, '0')}`;
        }
      
      default:
        // Most instructions use registers
        return this.formatRegister(value);
    }
  }

  private formatRegister(value: number): string {
    if (value <= 26) {
      return `R${value}`;
    } else {
      // Special registers
      switch (value) {
        case 27: return 'PC';
        case 28: return 'SP';
        case 29: return 'FP';
        case 30: return 'SR';
        case 31: return 'GR';
        default: return `R${value}`;
      }
    }
  }

  private formatImmediate(value: number): string {
    return value.toString();
  }

  formatAsAssembly(instructions: TritVMInstruction[], showAddresses: boolean = true, showGas: boolean = false): string {
    const lines: string[] = [];
    
    lines.push('; TrinaryVM Bytecode Disassembly');
    lines.push('; Generated by TrinaryVM CLI');
    lines.push('');

    for (const instruction of instructions) {
      let line = '';
      
      if (showAddresses) {
        line += `0x${instruction.address.toString(16).padStart(4, '0').toUpperCase()}:  `;
      }
      
      line += instruction.mnemonic.padEnd(8);
      
      if (instruction.operands.length > 0) {
        line += instruction.operands.join(', ');
      }
      
      if (showGas) {
        line += `  ; Gas: ${instruction.gasCost}`;
      } else {
        line += `  ; ${instruction.description}`;
      }
      
      lines.push(line);
    }

    return lines.join('\n');
  }

  getInstructionInfo(mnemonic: string): { gasCost: number; description: string; category: InstructionCategory } | undefined {
    for (const [, info] of this.instructionSet) {
      if (info.mnemonic === mnemonic) {
        return {
          gasCost: info.gasCost,
          description: info.description,
          category: info.category
        };
      }
    }
    return undefined;
  }

  getAllInstructions(): Array<{ mnemonic: string; gasCost: number; description: string; category: InstructionCategory }> {
    return Array.from(this.instructionSet.values());
  }

  // Assembly to bytecode conversion
  assembleInstruction(mnemonic: string, operands: string[]): Uint8Array {
    const opcode = this.mnemonicToOpcode.get(mnemonic.toUpperCase());
    if (!opcode) {
      throw new Error(`Unknown mnemonic: ${mnemonic}`);
    }

    const instructionInfo = this.instructionSet.get(opcode);
    if (!instructionInfo) {
      throw new Error(`Invalid opcode: 0x${opcode.toString(16)}`);
    }

    if (operands.length !== instructionInfo.operandCount) {
      throw new Error(`Invalid operand count for ${mnemonic}: expected ${instructionInfo.operandCount}, got ${operands.length}`);
    }

    const bytes: number[] = [opcode];
    
    // Convert operands to bytes
    for (const operand of operands) {
      const value = this.parseOperand(operand, mnemonic);
      bytes.push(value & 0xFF, (value >> 8) & 0xFF); // Little-endian
    }

    return new Uint8Array(bytes);
  }

  private parseOperand(operand: string, mnemonic: string): number {
    // Handle memory references [register]
    if (operand.startsWith('[') && operand.endsWith(']')) {
      const register = operand.slice(1, -1);
      return this.parseOperand(register, mnemonic);
    }

    // Handle immediate values
    if (operand.startsWith('#')) {
      return parseInt(operand.slice(1), 10);
    }

    // Handle hex values
    if (operand.startsWith('0x')) {
      return parseInt(operand, 16);
    }

    // Handle registers
    if (operand.startsWith('R')) {
      return parseInt(operand.slice(1), 10);
    }

    // Handle special registers
    switch (operand) {
      case 'PC': return 27;
      case 'SP': return 28;
      case 'FP': return 29;
      case 'SR': return 30;
      case 'GR': return 31;
      default:
        // Try as decimal number
        const num = parseInt(operand, 10);
        if (!isNaN(num)) {
          return num;
        }
        throw new Error(`Invalid operand: ${operand}`);
    }
  }
} 