import { Command, Flags } from '@oclif/core';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export default class Compile extends Command {
  static description = 'Compile TritLang source code to TrinaryVM bytecode';

  static examples = [
    '$ trinaryvm compile --file contract.trit',
    '$ trinaryvm compile --file contract.trit --output contract.tritvm',
  ];

  static flags = {
    file: Flags.string({ 
      char: 'f', 
      description: 'Path to .trit source file', 
      required: true 
    }),
    output: Flags.string({ 
      char: 'o', 
      description: 'Output .tritvm file path (optional)' 
    }),
  };

  async run() {
    const { flags } = await this.parse(Compile);
    const inputPath = path.resolve(flags.file);
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      this.error(`Source file not found: ${flags.file}`);
    }
    
    // Check if file has correct extension
    if (!inputPath.endsWith('.trit')) {
      this.error(`Invalid file type. Expected .trit file, got: ${path.extname(inputPath)}`);
    }
    
    // Determine output path
    const outputPath = flags.output || inputPath.replace('.trit', '.tritvm');
    
    this.log(`🔨 Compiling TritLang source: ${path.basename(inputPath)}`);
    this.log(`📦 Output bytecode: ${path.basename(outputPath)}`);
    
    try {
      // Find the TritLang compiler binary
      const compilerPath = this.findCompilerBinary();
      
      // Execute the compiler
      const command = `"${compilerPath}" "${inputPath}" "${outputPath}"`;
      const output = execSync(command, { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      // Display compiler output (filter out full paths)
      const filteredOutput = this.filterPaths(output.trim());
      this.log(filteredOutput);
      
      // Verify output file was created
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        this.log(`✅ Compilation successful!`);
        this.log(`   Bytecode size: ${stats.size} bytes`);
        this.log(`   Output: ${path.basename(outputPath)}`);
      } else {
        this.error('❌ Compilation failed: Output file not created');
      }
      
    } catch (error: any) {
      if (error.stderr) {
        const filteredError = this.filterPaths(error.stderr.trim());
        this.error(`❌ Compilation failed:\n${filteredError}`);
      } else {
        this.error(`❌ Compiler error: ${error.message}`);
      }
    }
  }
  
  private filterPaths(text: string): string {
    // Replace full paths with just filenames
    return text.replace(/\/[^\s]*\/([^\/\s]+\.(trit|tritvm))/g, '$1')
               .replace(/\/[^\s]*\/([^\/\s]+)/g, '$1')
               .replace(/Input:\s+\/[^\s]*\/([^\/\s]+)/g, 'Input:  $1')
               .replace(/Output:\s+\/[^\s]*\/([^\/\s]+)/g, 'Output: $1')
               .replace(/written to \/[^\s]*\/([^\/\s]+)/g, 'written to $1');
  }
  
  private findCompilerBinary(): string {
    // Look for the compiler binary in common locations
    const possiblePaths = [
      // Development build
      path.join(__dirname, '../../../compiler/target/debug/tritc'),
      path.join(__dirname, '../../../compiler/target/release/tritc'),
      // Relative to CLI
      path.join(process.cwd(), 'compiler/target/debug/tritc'),
      path.join(process.cwd(), 'compiler/target/release/tritc'),
      // System PATH
      'tritc'
    ];
    
    for (const compilerPath of possiblePaths) {
      if (compilerPath === 'tritc') {
        // Check if it's in PATH
        try {
          execSync('which tritc', { stdio: 'pipe' });
          return 'tritc';
        } catch {
          continue;
        }
      } else if (fs.existsSync(compilerPath)) {
        return compilerPath;
      }
    }
    
    throw new Error(
      'TritLang compiler not found. Please build the compiler first:\n' +
      '  cd compiler && cargo build'
    );
  }
}
