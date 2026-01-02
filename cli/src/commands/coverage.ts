import { Command, Flags } from '@oclif/core';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

interface CoverageData {
  file: string;
  totalInstructions: number;
  executedInstructions: number;
  coverage: number;
  lines: LineCoverage[];
  gasUsage: GasUsage;
}

interface LineCoverage {
  line: number;
  instruction: string;
  executed: boolean;
  hitCount: number;
  gasUsed: number;
}

interface GasUsage {
  total: number;
  byInstruction: Map<string, number>;
  byLine: Map<number, number>;
}

interface CoverageReport {
  summary: {
    totalFiles: number;
    totalInstructions: number;
    executedInstructions: number;
    overallCoverage: number;
    totalGasUsed: number;
  };
  files: CoverageData[];
  timestamp: string;
}

export default class Coverage extends Command {
  static description = 'Collect and report code coverage for TritLang contracts and TrinaryVM bytecode';

  static flags = {
    dir: Flags.string({ char: 'd', description: 'Directory containing test files', required: false }),
    file: Flags.string({ char: 'f', description: 'Specific test file to run with coverage', required: false }),
    output: Flags.string({ char: 'o', description: 'Output coverage report file', required: false }),
    format: Flags.string({ description: 'Coverage report format (text, html, json, lcov)', default: 'text' }),
    threshold: Flags.integer({ description: 'Minimum coverage threshold percentage', default: 80 }),
    exclude: Flags.string({ description: 'Exclude files matching pattern', required: false }),
    include: Flags.string({ description: 'Include only files matching pattern', required: false }),
  };

  private coverageData: CoverageData[] = [];

  async run() {
    const { flags } = await this.parse(Coverage);
    
    this.log('📊 TrinaryVM Coverage Collector');
    this.log('===============================');

    try {
      if (flags.file) {
        await this.collectSingleFileCoverage(flags.file, flags);
      } else {
        const testDir = flags.dir || this.findTestDirectory();
        await this.collectTestSuiteCoverage(testDir, flags);
      }

      const report = this.generateCoverageReport();
      await this.outputReport(report, flags);
      
      this.checkThreshold(report, flags.threshold);
      
    } catch (error) {
      this.error(`Coverage collection failed: ${error}`);
    }
  }

  private findTestDirectory(): string {
    const candidates = ['./test', './tests', './spec'];
    for (const dir of candidates) {
      if (fs.existsSync(dir)) {
        return dir;
      }
    }
    throw new Error('No test directory found. Create ./test or ./tests directory.');
  }

  private async collectSingleFileCoverage(filePath: string, flags: any): Promise<void> {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      this.error(`Test file not found: ${path.basename(filePath)}`);
    }

    this.log(`Collecting coverage for: ${path.basename(filePath)}`);
    const coverage = await this.runCoverageAnalysis(resolvedPath, flags);
    this.coverageData.push(coverage);
  }

  private async collectTestSuiteCoverage(testDir: string, flags: any): Promise<void> {
    if (!fs.existsSync(testDir)) {
      this.error(`Test directory not found: ${testDir}`);
    }

    const testFiles = this.discoverTestFiles(testDir, flags);
    if (testFiles.length === 0) {
      this.log('No test files found.');
      return;
    }

    this.log(`Found ${testFiles.length} test files for coverage analysis`);
    
    for (const testFile of testFiles) {
      this.log(`Analyzing: ${path.basename(testFile)}`);
      try {
        const coverage = await this.runCoverageAnalysis(testFile, flags);
        this.coverageData.push(coverage);
      } catch (error) {
        this.log(`⚠️  Failed to analyze ${path.basename(testFile)}: ${error}`);
      }
    }
  }

  private discoverTestFiles(dir: string, flags: any): string[] {
    const files: string[] = [];
    
    const scan = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir);
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (this.isTestFile(entry) && this.shouldIncludeFile(entry, flags)) {
          files.push(fullPath);
        }
      }
    };

    scan(dir);
    return files;
  }

  private isTestFile(filename: string): boolean {
    return filename.endsWith('.test.trit') || 
           filename.endsWith('.spec.trit') ||
           filename.endsWith('_test.trit');
  }

  private shouldIncludeFile(filename: string, flags: any): boolean {
    if (flags.exclude && filename.match(new RegExp(flags.exclude))) {
      return false;
    }
    
    if (flags.include && !filename.match(new RegExp(flags.include))) {
      return false;
    }
    
    return true;
  }

  private async runCoverageAnalysis(testFile: string, flags: any): Promise<CoverageData> {
    // Compile test file
    const compiledFile = testFile.replace(/\.trit$/, '.tritvm');
    await this.compileTest(testFile, compiledFile);
    
    // Run with coverage instrumentation
    const traceData = await this.runWithTracing(compiledFile);
    
    // Analyze bytecode for instruction mapping
    const bytecodeAnalysis = await this.analyzeBytecode(compiledFile);
    
    // Generate coverage data
    return this.processCoverageData(testFile, traceData, bytecodeAnalysis);
  }

  private async compileTest(sourceFile: string, outputFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const compiler = this.findBinary('tritc');
      const args = [sourceFile, '-o', outputFile, '--debug-info'];
      
      const child = spawn(compiler, args, { stdio: 'pipe' });
      
      let stderr = '';
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Compilation failed: ${stderr}`));
        }
      });
    });
  }

  private async runWithTracing(bytecodeFile: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const runtime = this.findBinary('trinaryvm');
      const args = [bytecodeFile, '--trace', '--gas-limit', '1000000'];
      
      const child = spawn(runtime, args, { stdio: 'pipe' });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve(this.parseTraceOutput(stdout));
        } else {
          reject(new Error(`Execution failed: ${stderr}`));
        }
      });
    });
  }

  private parseTraceOutput(output: string): any {
    const lines = output.split('\n');
    const trace = [];
    
    for (const line of lines) {
      if (line.startsWith('TRACE:')) {
        const parts = line.substring(6).split('|');
        if (parts.length >= 4) {
          trace.push({
            pc: parseInt(parts[0].trim()),
            opcode: parts[1].trim(),
            gas: parseInt(parts[2].trim()),
            registers: parts[3].trim()
          });
        }
      }
    }
    
    return trace;
  }

  private async analyzeBytecode(bytecodeFile: string): Promise<any> {
    const bytecode = fs.readFileSync(bytecodeFile);
    const instructions = [];
    
    // Parse bytecode header
    let offset = 8; // Skip magic number and version
    
    while (offset < bytecode.length) {
      const opcode = bytecode[offset];
      const instruction = this.decodeInstruction(opcode, bytecode, offset);
      instructions.push({
        offset,
        opcode,
        instruction: instruction.name,
        size: instruction.size
      });
      offset += instruction.size;
    }
    
    return instructions;
  }

  private decodeInstruction(opcode: number, bytecode: Buffer, offset: number): {name: string, size: number} {
    // Simplified instruction decoding - in practice this would be more comprehensive
    const opcodeMap: {[key: number]: {name: string, size: number}} = {
      0x00: { name: 'NOP', size: 1 },
      0x01: { name: 'ADD', size: 1 },
      0x02: { name: 'SUB', size: 1 },
      0x03: { name: 'MUL', size: 1 },
      0x04: { name: 'DIV', size: 1 },
      0x05: { name: 'MOD', size: 1 },
      0x10: { name: 'PUSH', size: 5 }, // 1 byte opcode + 4 bytes value
      0x11: { name: 'POP', size: 1 },
      0x12: { name: 'LOAD', size: 2 }, // 1 byte opcode + 1 byte register
      0x13: { name: 'STORE', size: 2 },
      0x20: { name: 'JMP', size: 3 }, // 1 byte opcode + 2 bytes address
      0x21: { name: 'JZ', size: 3 },
      0x22: { name: 'JNZ', size: 3 },
      0x30: { name: 'CALL', size: 3 },
      0x31: { name: 'RET', size: 1 },
      0xFF: { name: 'HALT', size: 1 }
    };
    
    return opcodeMap[opcode] || { name: 'UNKNOWN', size: 1 };
  }

  private processCoverageData(testFile: string, traceData: any[], bytecodeAnalysis: any[]): CoverageData {
    const executedInstructions = new Set<number>();
    const gasUsage = new Map<string, number>();
    const lineGasUsage = new Map<number, number>();
    
    // Process trace data
    for (const trace of traceData) {
      executedInstructions.add(trace.pc);
      
      const instruction = bytecodeAnalysis.find(inst => inst.offset === trace.pc);
      if (instruction) {
        const currentGas = gasUsage.get(instruction.instruction) || 0;
        gasUsage.set(instruction.instruction, currentGas + trace.gas);
        
        // Map to source line (simplified - would need debug info)
        const line = Math.floor(trace.pc / 4) + 1;
        const currentLineGas = lineGasUsage.get(line) || 0;
        lineGasUsage.set(line, currentLineGas + trace.gas);
      }
    }
    
    // Generate line coverage
    const lines: LineCoverage[] = [];
    for (const instruction of bytecodeAnalysis) {
      const line = Math.floor(instruction.offset / 4) + 1;
      const executed = executedInstructions.has(instruction.offset);
      
      lines.push({
        line,
        instruction: instruction.instruction,
        executed,
        hitCount: executed ? 1 : 0,
        gasUsed: lineGasUsage.get(line) || 0
      });
    }
    
    const totalInstructions = bytecodeAnalysis.length;
    const executedCount = executedInstructions.size;
    const coverage = totalInstructions > 0 ? (executedCount / totalInstructions) * 100 : 0;
    
    return {
      file: path.basename(testFile),
      totalInstructions,
      executedInstructions: executedCount,
      coverage,
      lines,
      gasUsage: {
        total: Array.from(gasUsage.values()).reduce((sum, gas) => sum + gas, 0),
        byInstruction: gasUsage,
        byLine: lineGasUsage
      }
    };
  }

  private generateCoverageReport(): CoverageReport {
    const totalFiles = this.coverageData.length;
    const totalInstructions = this.coverageData.reduce((sum, data) => sum + data.totalInstructions, 0);
    const executedInstructions = this.coverageData.reduce((sum, data) => sum + data.executedInstructions, 0);
    const overallCoverage = totalInstructions > 0 ? (executedInstructions / totalInstructions) * 100 : 0;
    const totalGasUsed = this.coverageData.reduce((sum, data) => sum + data.gasUsage.total, 0);

    return {
      summary: {
        totalFiles,
        totalInstructions,
        executedInstructions,
        overallCoverage,
        totalGasUsed
      },
      files: this.coverageData,
      timestamp: new Date().toISOString()
    };
  }

  private async outputReport(report: CoverageReport, flags: any): Promise<void> {
    switch (flags.format) {
      case 'text':
        this.outputTextReport(report);
        break;
      case 'json':
        await this.outputJsonReport(report, flags.output);
        break;
      case 'html':
        await this.outputHtmlReport(report, flags.output);
        break;
      case 'lcov':
        await this.outputLcovReport(report, flags.output);
        break;
      default:
        this.error(`Unsupported format: ${flags.format}`);
    }
  }

  private outputTextReport(report: CoverageReport): void {
    this.log('\n📊 Coverage Report');
    this.log('==================');
    this.log(`Overall Coverage: ${report.summary.overallCoverage.toFixed(2)}%`);
    this.log(`Total Files: ${report.summary.totalFiles}`);
    this.log(`Total Instructions: ${report.summary.totalInstructions}`);
    this.log(`Executed Instructions: ${report.summary.executedInstructions}`);
    this.log(`Total Gas Used: ${report.summary.totalGasUsed}`);
    
    this.log('\n📁 File Coverage:');
    for (const file of report.files) {
      const status = file.coverage >= 80 ? '✅' : file.coverage >= 60 ? '⚠️' : '❌';
      this.log(`${status} ${file.file}: ${file.coverage.toFixed(2)}% (${file.executedInstructions}/${file.totalInstructions})`);
    }
    
    this.log('\n⛽ Gas Usage by Instruction:');
    const allInstructions = new Map<string, number>();
    for (const file of report.files) {
      for (const [instruction, gas] of file.gasUsage.byInstruction) {
        const current = allInstructions.get(instruction) || 0;
        allInstructions.set(instruction, current + gas);
      }
    }
    
    const sortedInstructions = Array.from(allInstructions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [instruction, gas] of sortedInstructions) {
      const percentage = ((gas / report.summary.totalGasUsed) * 100).toFixed(1);
      this.log(`  ${instruction}: ${gas} gas (${percentage}%)`);
    }
  }

  private async outputJsonReport(report: CoverageReport, outputPath?: string): Promise<void> {
    const json = JSON.stringify(report, null, 2);
    const filePath = outputPath || 'coverage-report.json';
    fs.writeFileSync(filePath, json);
    this.log(`\n📄 JSON coverage report generated: ${filePath}`);
  }

  private async outputHtmlReport(report: CoverageReport, outputPath?: string): Promise<void> {
    const html = this.generateHtmlReport(report);
    const filePath = outputPath || 'coverage-report.html';
    fs.writeFileSync(filePath, html);
    this.log(`\n📄 HTML coverage report generated: ${filePath}`);
  }

  private generateHtmlReport(report: CoverageReport): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>TrinaryVM Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .file { margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .file-header { background: #e9e9e9; padding: 10px; font-weight: bold; }
        .coverage-high { color: green; }
        .coverage-medium { color: orange; }
        .coverage-low { color: red; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .executed { background-color: #d4edda; }
        .not-executed { background-color: #f8d7da; }
    </style>
</head>
<body>
    <h1>🧪 TrinaryVM Coverage Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Overall Coverage:</strong> ${report.summary.overallCoverage.toFixed(2)}%</p>
        <p><strong>Total Files:</strong> ${report.summary.totalFiles}</p>
        <p><strong>Total Instructions:</strong> ${report.summary.totalInstructions}</p>
        <p><strong>Executed Instructions:</strong> ${report.summary.executedInstructions}</p>
        <p><strong>Total Gas Used:</strong> ${report.summary.totalGasUsed}</p>
        <p><strong>Generated:</strong> ${report.timestamp}</p>
    </div>
    
    <h2>File Coverage</h2>
    ${report.files.map(file => `
    <div class="file">
        <div class="file-header">
            ${file.file} - ${file.coverage.toFixed(2)}% 
            (${file.executedInstructions}/${file.totalInstructions})
        </div>
        <table>
            <tr><th>Line</th><th>Instruction</th><th>Executed</th><th>Gas Used</th></tr>
            ${file.lines.map(line => `
            <tr class="${line.executed ? 'executed' : 'not-executed'}">
                <td>${line.line}</td>
                <td>${line.instruction}</td>
                <td>${line.executed ? '✅' : '❌'}</td>
                <td>${line.gasUsed}</td>
            </tr>
            `).join('')}
        </table>
    </div>
    `).join('')}
</body>
</html>`;
  }

  private async outputLcovReport(report: CoverageReport, outputPath?: string): Promise<void> {
    let lcov = '';
    
    for (const file of report.files) {
      lcov += `SF:${file.file}\n`;
      
      for (const line of file.lines) {
        lcov += `DA:${line.line},${line.hitCount}\n`;
      }
      
      lcov += `LF:${file.totalInstructions}\n`;
      lcov += `LH:${file.executedInstructions}\n`;
      lcov += 'end_of_record\n';
    }
    
    const filePath = outputPath || 'coverage.lcov';
    fs.writeFileSync(filePath, lcov);
    this.log(`\n📄 LCOV coverage report generated: ${filePath}`);
  }

  private checkThreshold(report: CoverageReport, threshold: number): void {
    if (report.summary.overallCoverage < threshold) {
      this.error(`Coverage ${report.summary.overallCoverage.toFixed(2)}% is below threshold ${threshold}%`);
    } else {
      this.log(`\n✅ Coverage ${report.summary.overallCoverage.toFixed(2)}% meets threshold ${threshold}%`);
    }
  }

  private findBinary(name: string): string {
    // Check development build first
    const devPath = path.join(process.cwd(), 'target', 'debug', name);
    if (fs.existsSync(devPath)) {
      return devPath;
    }
    
    // Check release build
    const releasePath = path.join(process.cwd(), 'target', 'release', name);
    if (fs.existsSync(releasePath)) {
      return releasePath;
    }
    
    // Fallback to system PATH
    return name;
  }
}
