import { Command, Flags } from '@oclif/core';
import { RustCli } from '../utils/rustCli';

export default class ValidateAlignment extends Command {
  static description = 'Validate Tesla 3-6-9 alignment in TrinaryVM operations';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --strict',
    '<%= config.bin %> <%= command.id %> --file operations.json',
  ];

  static flags = {
    strict: Flags.boolean({
      char: 's',
      description: 'Use strict validation (higher precision)',
      default: false,
    }),
    file: Flags.string({
      char: 'f',
      description: 'File containing operations to validate',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file for validation results',
    }),
    help: Flags.help({ char: 'h' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ValidateAlignment);
    
    this.log('🔍 Tesla 3-6-9 Alignment Validation');
    this.log('⚡ Validating mathematical alignment in TrinaryVM operations');
    
    try {
      const args: string[] = [];
      
      if (flags.strict) {
        args.push('--strict');
      }
      
      if (flags.file) {
        args.push('--file', flags.file);
      }
      
      if (flags.output) {
        args.push('--output', flags.output);
      }
      
      this.log(`🎯 Validation mode: ${flags.strict ? 'Strict' : 'Standard'}`);
      if (flags.file) {
        this.log(`📄 Validating file: ${flags.file}`);
      }
      
      const result = await RustCli.validateAlignment(args);
      
      if (result.success) {
        this.log('✅ Tesla 3-6-9 alignment validation completed!');
        this.log(result.output);
        
        if (flags.output) {
          this.log(`💾 Results saved to: ${flags.output}`);
        }
      } else {
        this.error(`❌ Validation failed: ${result.error}`);
      }
      
    } catch (error: any) {
      this.error(`❌ Validation error: ${error.message}`);
    }
  }
}
