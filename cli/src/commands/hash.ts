import { Command, Flags } from '@oclif/core';
import { RustCli } from '../utils/rustCli';
import * as fs from 'fs';

export default class Hash extends Command {
  static description = 'Compute SHA3-2187 hash of a file';

  static examples = [
    '<%= config.bin %> <%= command.id %> input.txt',
    '<%= config.bin %> <%= command.id %> input.txt --format hex',
  ];

  static flags = {
    input: Flags.string({
      char: 'i',
      description: 'File to hash',
      required: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    hex: Flags.boolean({
      description: 'Output hex instead of raw bytes',
      default: true,
    }),
    help: Flags.help({ char: 'h' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Hash);
    const filePath = flags.input;
    
    if (!fs.existsSync(filePath)) {
      this.error(`❌ File not found: ${filePath}`);
    }
    
    this.log(`🔍 Computing SHA3-2187 hash of: ${filePath}`);
    this.log(`📋 Output format: ${flags.hex ? 'hex' : 'raw bytes'}`);
    
    try {
      const args = ['--input', filePath];
      if (flags.hex) {
        args.push('--hex');
      }
      if (flags.output) {
        args.push('--output', flags.output);
      }
      
      const result = await RustCli.hash(args);
      
      if (result.success) {
        this.log(`✅ Hash computed successfully:`);
        this.log(result.output);
      } else {
        this.error(`❌ Hashing failed: ${result.error}`);
      }
    } catch (error: any) {
      this.error(`❌ Error: ${error.message}`);
    }
  }
}
