import { Command, Flags } from '@oclif/core';
import { RustCli } from '../utils/rustCli';

export default class ValidateImpl extends Command {
  static description = 'Comprehensive TriFHE implementation validation';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --security-level 2187',
    '<%= config.bin %> <%= command.id %> --comprehensive --verbose',
  ];

  static flags = {
    'security-level': Flags.integer({
      char: 's',
      description: 'Security level for validation',
      default: 2187,
      options: ['1024', '2048', '2187', '4096'],
    }),
    comprehensive: Flags.boolean({
      char: 'c',
      description: 'Run comprehensive validation suite',
      default: false,
    }),
    verbose: Flags.boolean({
      char: 'v',
      description: 'Verbose output with detailed results',
      default: false,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file for validation report',
    }),
    help: Flags.help({ char: 'h' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ValidateImpl);
    
    this.log('🔐 TriFHE Implementation Validation');
    this.log('🛡️  Comprehensive security and correctness validation');
    
    try {
      const args: string[] = [];
      
      args.push('--security-level', flags['security-level'].toString());
      
      if (flags.comprehensive) {
        args.push('--comprehensive');
      }
      
      if (flags.verbose) {
        args.push('--verbose');
      }
      
      if (flags.output) {
        args.push('--output', flags.output);
      }
      
      this.log(`🔒 Security level: ${flags['security-level']} bits`);
      this.log(`📊 Validation mode: ${flags.comprehensive ? 'Comprehensive' : 'Standard'}`);
      this.log(`📝 Verbose output: ${flags.verbose ? 'Enabled' : 'Disabled'}`);
      
      const result = await RustCli.validateImpl(args);
      
      if (result.success) {
        this.log('✅ TriFHE implementation validation completed!');
        this.log(result.output);
        
        if (flags.output) {
          this.log(`💾 Validation report saved to: ${flags.output}`);
        }
      } else {
        this.error(`❌ Validation failed: ${result.error}`);
      }
      
    } catch (error: any) {
      this.error(`❌ Validation error: ${error.message}`);
    }
  }
}
