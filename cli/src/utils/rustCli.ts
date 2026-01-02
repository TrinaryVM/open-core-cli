import { execSync, ExecSyncOptions } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { PerformanceOptimizer } from './performance';

export interface RustCliResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}

export class RustCli {
  private static readonly RUST_BINARY_PATHS = [
    // Development paths
    path.join(__dirname, '../../../cli/bin/trinaryvm'),
    path.join(__dirname, '../../../target/release/trinaryvm-cli'),
    path.join(__dirname, '../../../VLIW/target/release/trinaryvm-cli'),
    // System paths
    'trinaryvm',
    'trinaryvm-cli'
  ];

  /**
   * Find the Rust CLI binary
   */
  private static findRustBinary(): string {
    for (const binaryPath of this.RUST_BINARY_PATHS) {
      if (binaryPath === 'trinaryvm' || binaryPath === 'trinaryvm-cli') {
        // Check if it's in PATH
        try {
          execSync(`which ${binaryPath}`, { stdio: 'pipe' });
          return binaryPath;
        } catch {
          continue;
        }
      } else if (fs.existsSync(binaryPath)) {
        return binaryPath;
      }
    }
    
    throw new Error(
      'TrinaryVM Rust CLI not found. Please build the Rust CLI first:\n' +
      '  cd VLIW && cargo build --release'
    );
  }

  /**
   * Execute a Rust CLI command with performance optimization
   */
  static async execute(args: string[], options: ExecSyncOptions = {}): Promise<RustCliResult> {
    const commandKey = `rust_cli_${args.join('_')}`;
    const operationType = this.getOperationType(args);
    
    return PerformanceOptimizer.executeWithCache(
      commandKey,
      async () => {
        try {
          const binaryPath = this.findRustBinary();
          const command = `${binaryPath} ${args.join(' ')}`;
          
          const output = execSync(command, {
            encoding: 'utf-8',
            stdio: 'pipe',
            ...options
          });
          
          return {
            success: true,
            output: typeof output === 'string' ? output.trim() : output.toString().trim(),
            exitCode: 0
          };
        } catch (error: any) {
          return {
            success: false,
            output: '',
            error: error.stderr?.trim() || error.message,
            exitCode: error.status || 1
          };
        }
      },
      this.getCacheTTL(operationType)
    );
  }

  /**
   * Determine operation type for cache optimization
   */
  private static getOperationType(args: string[]): 'quantum' | 'crypto' | 'vm' | 'default' {
    const command = args[0];
    
    if (command === 'quantum') {
      return 'quantum';
    } else if (['keys', 'encrypt', 'decrypt', 'hash', 'validate-impl'].includes(command)) {
      return 'crypto';
    } else if (['run', 'benchmark', 'validate-alignment'].includes(command)) {
      return 'vm';
    }
    
    return 'default';
  }

  /**
   * Get cache TTL based on operation type
   */
  private static getCacheTTL(operationType: string): number {
    switch (operationType) {
      case 'quantum':
        return 10 * 60 * 1000; // 10 minutes
      case 'crypto':
        return 30 * 60 * 1000; // 30 minutes
      case 'vm':
        return 2 * 60 * 1000; // 2 minutes
      default:
        return 2 * 60 * 1000; // 2 minutes
    }
  }

  /**
   * Execute tetragram operations
   */
  static async tetragram(subcommand: string, args: string[] = []): Promise<RustCliResult> {
    return this.execute(['tetragram', subcommand, ...args]);
  }

  /**
   * Execute core VM operations
   */
  static async run(args: string[] = []): Promise<RustCliResult> {
    return this.execute(['run', ...args]);
  }

  /**
   * Execute benchmarking
   */
  static async benchmark(args: string[] = []): Promise<RustCliResult> {
    return this.execute(['benchmark', ...args]);
  }

  /**
   * Execute validation
   */
  static async validateAlignment(args: string[] = []): Promise<RustCliResult> {
    return this.execute(['validate-alignment', ...args]);
  }

  /**
   * Execute cryptographic operations
   */
  static async keys(args: string[] = []): Promise<RustCliResult> {
    return this.execute(['keys', ...args]);
  }

  static async encrypt(args: string[] = []): Promise<RustCliResult> {
    return this.execute(['encrypt', ...args]);
  }

  static async decrypt(args: string[] = []): Promise<RustCliResult> {
    return this.execute(['decrypt', ...args]);
  }

  static async hash(args: string[] = []): Promise<RustCliResult> {
    return this.execute(['hash', ...args]);
  }

  static async validateImpl(args: string[] = []): Promise<RustCliResult> {
    return this.execute(['validate-impl', ...args]);
  }
}
