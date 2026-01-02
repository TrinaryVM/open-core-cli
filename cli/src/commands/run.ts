import { Command, Flags } from '@oclif/core';
import { RustCli } from '../utils/rustCli';
import * as fs from 'fs';
import * as path from 'path';

export default class Run extends Command {
  static description = 'Execute a compiled .tritvm file in the TrinaryVM runtime';

  static examples = [
    '$ trinaryvm run --file contract.tritvm',
    '$ trinaryvm run --file contract.tritvm --gas 200000',
  ];

  static flags = {
    file: Flags.string({ 
      char: 'f', 
      description: 'Path to .tritvm file', 
      required: true 
    }),
    gas: Flags.integer({ 
      description: 'Gas limit', 
      default: 100000 
    }),
  };

  async run() {
    const { flags } = await this.parse(Run);
    const filePath = path.resolve(flags.file);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      this.error(`File not found: ${flags.file}`);
    }
    
    // Check if file has correct extension
    if (!filePath.endsWith('.tritvm')) {
      this.error(`Invalid file type. Expected .tritvm file, got: ${path.extname(filePath)}`);
    }
    
    this.log(`🚀 Executing TrinaryVM bytecode: ${path.basename(filePath)}`);
    this.log(`⛽ Gas limit: ${flags.gas.toLocaleString()}`);
    
    try {
      // Use Rust CLI for execution
      const result = await RustCli.run([filePath, '--gas', flags.gas.toString()]);
      
      if (result.success) {
        // Display output (filter out full paths)
        const filteredOutput = this.filterPaths(result.output);
        this.log(filteredOutput);
      } else {
        if (result.exitCode === 2) {
          this.error('⛽ Out of gas! Try increasing the gas limit with --gas');
        } else {
          const filteredError = this.filterPaths(result.error || 'Unknown error');
          this.error(`❌ Execution failed: ${filteredError}`);
        }
      }
      
    } catch (error: any) {
      this.error(`❌ Runtime error: ${error.message}`);
    }
  }
  
  private filterPaths(text: string): string {
    // Replace full paths with just filenames
    return text.replace(/Loading bytecode from: \/[^\s]*\/([^\/\s]+)/g, 'Loading bytecode from: $1')
               .replace(/\/[^\s]*\/([^\/\s]+\.(tritvm|trit))/g, '$1')
               .replace(/\/[^\s]*\/([^\/\s]+)/g, '$1');
  }
  
}
