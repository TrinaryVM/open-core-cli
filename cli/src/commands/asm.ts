import { Command, Flags, Args } from '@oclif/core';
import * as fs from 'fs';
import { TetragramUtils, TetragramError } from '../utils/tetragram';
import { InstructionParser, TritVMInstruction } from '../utils/instructionParser';

interface AssemblyLine {
  label?: string;
  directive?: string;
  mnemonic?: string;
  operands?: string[];
  comment?: string;
}

async function asmMain(input: string | undefined, options: { 
  disassemble?: boolean; 
  output?: string; 
  verbose?: boolean;
  showGas?: boolean;
  addresses?: boolean;
}, log = console.log, errorLog = console.error): Promise<number> {
  if (!input && !process.argv.includes('--help') && !process.argv.includes('-h')) {
    errorLog("error: missing required argument 'input'");
    return 1;
  }
  try {
    if (!input) return 0; // If help, just exit
    // Read input
    const content = fs.readFileSync(input, 'utf8');

    if (options.disassemble) {
      // Implement disassembly
      const result = await disassemble(content, options);
      if (options.output) {
        fs.writeFileSync(options.output, result);
        log(`Disassembled to ${options.output}`);
      } else {
        log(result);
      }
      if (options.verbose) {
        log('\nDisassembly Statistics:');
        log(`Input Size: ${content.length} bytes`);
        log(`Output Size: ${result.length} bytes`);
      }
    } else {
      // Parse assembly
      const lines = parseAssembly(content);
      const output: string[] = [];
      const instructionParser = new InstructionParser();
      let instructionCount = 0;
      let glyphCount = 0;
      for (const line of lines) {
        if (line.directive === 'glyph') {
          if (!line.operands || line.operands.length !== 1) {
            throw new TetragramError(
              '.glyph directive requires exactly one operand',
              'INVALID_DIRECTIVE'
            );
          }
          // Validate glyphs
          const glyphs = line.operands[0];
          if (!TetragramUtils.validate(glyphs)) {
            throw new TetragramError(
              'Invalid tetragram glyphs in .glyph directive',
              'INVALID_GLYPHS'
            );
          }
          // Convert glyphs to binary
          const { text } = TetragramUtils.decode(glyphs);
          output.push(text);
          glyphCount++;
        } else if (line.mnemonic) {
          // Handle regular instructions
          if (!line.operands) {
            line.operands = [];
          }
          try {
            const instructionBytes = instructionParser.assembleInstruction(line.mnemonic, line.operands);
            const hexBytes = Array.from(instructionBytes)
              .map(b => b.toString(16).padStart(2, '0').toUpperCase())
              .join(' ');
            output.push(hexBytes);
            instructionCount++;
          } catch (error) {
            throw new Error(`Error assembling instruction ${line.mnemonic}: ${error}`);
          }
        }
      }
      const result = output.join('\n');
      if (options.output) {
        fs.writeFileSync(options.output, result);
        log(`Assembled ${lines.length} lines to ${result.length} bytes`);
      } else {
        log(result);
      }
      if (options.verbose) {
        log('\nAssembly Statistics:');
        log(`Input Lines: ${lines.length}`);
        log(`Output Size: ${result.length} bytes`);
        log(`Instructions: ${instructionCount}`);
        log(`Glyph Directives: ${glyphCount}`);
      }
    }
    return 0;
  } catch (error) {
    if (error instanceof TetragramError) {
      errorLog(`Error: ${error.message}`);
      return 1;
    }
    errorLog(`Error: ${error}`);
    return 1;
  }
}

export default class Asm extends Command {
  static description = 'Assemble or disassemble TrinaryVM assembly code';

  static examples = [
    '$ trinaryvm asm assemble source.asm output.tritvm',
    '$ trinaryvm asm disassemble input.tritvm output.asm',
    '$ trinaryvm asm --disassemble --verbose input.tritvm',
  ];

  static flags = {
    disassemble: Flags.boolean({
      char: 'd',
      description: 'Disassemble bytecode to assembly',
      default: false,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path (default: stdout)',
    }),
    verbose: Flags.boolean({
      char: 'v',
      description: 'Show detailed statistics',
      default: false,
    }),
    'show-gas': Flags.boolean({
      description: 'Show gas costs in disassembly output',
      default: false,
    }),
    'no-addresses': Flags.boolean({
      description: 'Hide addresses in disassembly output',
      default: false,
    }),
  };

  static args = {
    input: Args.string({
      description: 'Input assembly file or bytecode',
      required: true,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(Asm);
    
    const options = {
      disassemble: flags.disassemble,
      output: flags.output,
      verbose: flags.verbose,
      showGas: flags['show-gas'],
      addresses: !flags['no-addresses'],
    };

    const code = await asmMain(args.input, options, this.log.bind(this), this.error.bind(this));
    if (code !== 0) {
      this.exit(code);
    }
  }
}

async function disassemble(content: string, options: { showGas?: boolean; addresses?: boolean }): Promise<string> {
  const isTetragram = TetragramUtils.validate(content.trim());
  if (isTetragram) {
    try {
      const { text } = TetragramUtils.decode(content.trim());
      return `; Tetragram Disassembly\n; Decoded text: ${text}\n\n.glyph ${content.trim()}`;
    } catch (error) {
      throw new Error(`Failed to decode tetragram glyphs: ${error}`);
    }
  } else {
    try {
      // Remove whitespace and newlines
      const cleanHex = content.replace(/\s+/g, '');
      if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
        throw new Error('Invalid hex string');
      }
      if (cleanHex.length % 2 !== 0) {
        throw new Error('Hex string must have even number of characters');
      }
      const bytecode = new Uint8Array(cleanHex.length / 2);
      for (let i = 0; i < cleanHex.length; i += 2) {
        bytecode[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
      }
      const instructionParser = new InstructionParser();
      let header, instructions;
      try {
        ({ header, instructions } = instructionParser.parseBytecodeBuffer(bytecode));
      } catch (err) {
        if (String(err).includes('Invalid bytecode header')) {
          throw new Error('Invalid bytecode header');
        }
        throw err;
      }
      if (!header.isValid) {
        throw new Error('Invalid bytecode header');
      }
      return instructionParser.formatAsAssembly(
        instructions, 
        options.addresses !== false, 
        options.showGas || false
      );
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : String(error);
      throw new Error(`Failed to parse bytecode: ${errMsg}`);
    }
  }
}

function parseHexString(hexString: string): Uint8Array {
  const cleanHex = hexString.replace(/\s+/g, '');
  if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
    throw new Error('Invalid hex string');
  }
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Hex string must have even number of characters');
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes;
}

function parseAssembly(content: string): AssemblyLine[] {
  const lines: AssemblyLine[] = [];
  const lineRegex = /^(?:(\w+):)?\s*(?:\.(\w+)\s+(.+)|(\w+)(?:\s+(.+))?)?\s*(?:;.*)?$/;
  for (const contentLine of content.split('\n')) {
    const match = contentLine.match(lineRegex);
    if (!match) continue;
    const [_, label, directive, directiveOperands, mnemonic, mnemonicOperands] = match;
    const assemblyLine: AssemblyLine = {};
    if (label) assemblyLine.label = label;
    if (directive) {
      assemblyLine.directive = directive;
      if (directiveOperands) {
        assemblyLine.operands = directiveOperands.split(',').map((op: string) => op.trim());
      }
    }
    if (mnemonic) {
      assemblyLine.mnemonic = mnemonic;
      if (mnemonicOperands) {
        assemblyLine.operands = mnemonicOperands.split(',').map((op: string) => op.trim());
      }
    }
    lines.push(assemblyLine);
  }
  return lines;
}

// Export the main function for testing
export { asmMain };
