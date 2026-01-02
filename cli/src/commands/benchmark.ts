import { Command, Flags } from '@oclif/core';
import { RustCli } from '../utils/rustCli';

export default class Benchmark extends Command {
  static description = 'Run comprehensive benchmarks with cryptographic proof generation';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --iterations 1000',
    '<%= config.bin %> <%= command.id %> --crypto --vm --tetragram',
  ];

  static flags = {
    iterations: Flags.integer({
      char: 'i',
      description: 'Number of benchmark iterations',
      default: 100,
    }),
    crypto: Flags.boolean({
      char: 'c',
      description: 'Include cryptographic benchmarks',
      default: true,
    }),
    vm: Flags.boolean({
      char: 'v',
      description: 'Include VM execution benchmarks',
      default: true,
    }),
    tetragram: Flags.boolean({
      char: 't',
      description: 'Include tetragram processing benchmarks',
      default: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file for benchmark results',
    }),
    help: Flags.help({ char: 'h' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Benchmark);

    this.log('🏃 TrinaryVM Performance Benchmark Suite');
    this.log('⚡ Comprehensive performance testing with Tesla 3-6-9 alignment');
    
    try {
      const args: string[] = [];
      
      if (flags.iterations) {
        args.push('--iterations', flags.iterations.toString());
      }
      
      if (flags.crypto) {
        args.push('--crypto');
      }
      
      if (flags.vm) {
        args.push('--vm');
      }
      
      if (flags.tetragram) {
        args.push('--tetragram');
      }
      
      if (flags.output) {
        args.push('--output', flags.output);
      }
      
      this.log(`🔬 Running benchmarks with ${flags.iterations} iterations`);
      this.log(`📊 Benchmarks: ${flags.crypto ? 'Crypto ' : ''}${flags.vm ? 'VM ' : ''}${flags.tetragram ? 'Tetragram' : ''}`);
      
      const result = await RustCli.benchmark(args);
      
      if (result.success) {
        this.log('✅ Benchmark completed successfully!');
        this.log(result.output);
        
        if (flags.output) {
          this.log(`💾 Results saved to: ${flags.output}`);
        }
      } else {
        this.error(`❌ Benchmark failed: ${result.error}`);
      }
      
    } catch (error: any) {
      this.error(`❌ Benchmark error: ${error.message}`);
    }
  }
} 