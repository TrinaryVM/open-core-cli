import { Command, Flags } from '@oclif/core';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { promisify } from 'util';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  gasUsed?: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

export default class Test extends Command {
  static description = 'Run tests for TritLang contracts and TrinaryVM bytecode';

  static flags = {
    dir: Flags.string({ char: 'd', description: 'Directory containing test files', required: false }),
    file: Flags.string({ char: 'f', description: 'Specific test file to run', required: false }),
    ci: Flags.boolean({ description: 'Run in CI mode (JUnit XML output)', default: false }),
    coverage: Flags.boolean({ description: 'Collect code coverage', default: false }),
    verbose: Flags.boolean({ char: 'v', description: 'Verbose output', default: false }),
    timeout: Flags.integer({ description: 'Test timeout in seconds', default: 30 }),
    parallel: Flags.boolean({ description: 'Run tests in parallel', default: false }),
  };

  private testSuites: TestSuite[] = [];

  async run() {
    const { flags } = await this.parse(Test);
    
    this.log('🧪 TrinaryVM Test Runner');
    this.log('========================');

    const startTime = Date.now();
    
    try {
      if (flags.file) {
        await this.runSingleTest(flags.file, flags);
      } else {
        const testDir = flags.dir || this.findTestDirectory();
        await this.runTestSuite(testDir, flags);
      }

      const totalDuration = Date.now() - startTime;
      await this.generateReport(flags, totalDuration);
      
    } catch (error) {
      this.error(`Test execution failed: ${error}`);
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

  private async runSingleTest(filePath: string, flags: any): Promise<void> {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      this.error(`Test file not found: ${path.basename(filePath)}`);
    }

    const testSuite: TestSuite = {
      name: path.basename(filePath),
      tests: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0
    };

    const startTime = Date.now();
    const result = await this.executeTest(resolvedPath, flags);
    testSuite.duration = Date.now() - startTime;
    
    testSuite.tests.push(result);
    testSuite.totalTests = 1;
    
    if (result.status === 'passed') testSuite.passed = 1;
    else if (result.status === 'failed') testSuite.failed = 1;
    else testSuite.skipped = 1;

    this.testSuites.push(testSuite);
  }

  private async runTestSuite(testDir: string, flags: any): Promise<void> {
    if (!fs.existsSync(testDir)) {
      this.error(`Test directory not found: ${testDir}`);
    }

    const testFiles = this.discoverTestFiles(testDir);
    if (testFiles.length === 0) {
      this.log('No test files found.');
      return;
    }

    this.log(`Found ${testFiles.length} test files`);
    
    if (flags.parallel) {
      await this.runTestsParallel(testFiles, flags);
    } else {
      await this.runTestsSequential(testFiles, flags);
    }
  }

  private discoverTestFiles(dir: string): string[] {
    const files: string[] = [];
    
    const scan = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir);
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (this.isTestFile(entry)) {
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

  private async runTestsSequential(testFiles: string[], flags: any): Promise<void> {
    for (const testFile of testFiles) {
      const testSuite: TestSuite = {
        name: path.basename(testFile),
        tests: [],
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      };

      const startTime = Date.now();
      
      try {
        const result = await this.executeTest(testFile, flags);
        testSuite.tests.push(result);
        testSuite.totalTests = 1;
        
        if (result.status === 'passed') testSuite.passed = 1;
        else if (result.status === 'failed') testSuite.failed = 1;
        else testSuite.skipped = 1;
        
      } catch (error) {
        const result: TestResult = {
          name: path.basename(testFile),
          status: 'failed',
          duration: 0,
          error: String(error)
        };
        testSuite.tests.push(result);
        testSuite.totalTests = 1;
        testSuite.failed = 1;
      }
      
      testSuite.duration = Date.now() - startTime;
      this.testSuites.push(testSuite);
      
      this.displayTestResult(testSuite.tests[0]);
    }
  }

  private async runTestsParallel(testFiles: string[], flags: any): Promise<void> {
    const promises = testFiles.map(async (testFile) => {
      const testSuite: TestSuite = {
        name: path.basename(testFile),
        tests: [],
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      };

      const startTime = Date.now();
      
      try {
        const result = await this.executeTest(testFile, flags);
        testSuite.tests.push(result);
        testSuite.totalTests = 1;
        
        if (result.status === 'passed') testSuite.passed = 1;
        else if (result.status === 'failed') testSuite.failed = 1;
        else testSuite.skipped = 1;
        
      } catch (error) {
        const result: TestResult = {
          name: path.basename(testFile),
          status: 'failed',
          duration: 0,
          error: String(error)
        };
        testSuite.tests.push(result);
        testSuite.totalTests = 1;
        testSuite.failed = 1;
      }
      
      testSuite.duration = Date.now() - startTime;
      return testSuite;
    });

    const results = await Promise.all(promises);
    this.testSuites.push(...results);
    
    // Display results
    for (const suite of results) {
      this.displayTestResult(suite.tests[0]);
    }
  }

  private async executeTest(testFile: string, flags: any): Promise<TestResult> {
    const startTime = Date.now();
    const testName = path.basename(testFile);
    
    try {
      // Compile test file
      const compiledFile = testFile.replace(/\.trit$/, '.tritvm');
      await this.compileTest(testFile, compiledFile);
      
      // Execute test
      const result = await this.runCompiledTest(compiledFile, flags);
      
      return {
        name: testName,
        status: result.success ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: result.error,
        gasUsed: result.gasUsed
      };
      
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        duration: Date.now() - startTime,
        error: String(error)
      };
    }
  }

  private async compileTest(sourceFile: string, outputFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const compiler = this.findBinary('tritc');
      const args = [sourceFile, '-o', outputFile];
      
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

  private async runCompiledTest(bytecodeFile: string, flags: any): Promise<{success: boolean, error?: string, gasUsed?: number}> {
    return new Promise((resolve) => {
      const runtime = this.findBinary('trinaryvm');
      const args = [bytecodeFile, '--gas-limit', '1000000'];
      
      const child = spawn(runtime, args, { stdio: 'pipe' });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      const timeout = setTimeout(() => {
        child.kill();
        resolve({ success: false, error: 'Test timeout' });
      }, flags.timeout * 1000);
      
      child.on('close', (code) => {
        clearTimeout(timeout);
        
        // Extract gas usage from output
        const gasMatch = stdout.match(/Gas used: (\d+)/);
        const gasUsed = gasMatch ? parseInt(gasMatch[1]) : undefined;
        
        if (code === 0) {
          resolve({ success: true, gasUsed });
        } else {
          resolve({ success: false, error: stderr || 'Test failed', gasUsed });
        }
      });
    });
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

  private displayTestResult(result: TestResult): void {
    const status = result.status === 'passed' ? '✅' : 
                  result.status === 'failed' ? '❌' : '⏭️';
    
    const gasInfo = result.gasUsed ? ` (${result.gasUsed} gas)` : '';
    const duration = `${result.duration}ms`;
    
    this.log(`${status} ${result.name} ${duration}${gasInfo}`);
    
    if (result.status === 'failed' && result.error) {
      this.log(`   Error: ${result.error}`);
    }
  }

  private async generateReport(flags: any, totalDuration: number): Promise<void> {
    const totalTests = this.testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = this.testSuites.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.testSuites.reduce((sum, suite) => sum + suite.failed, 0);
    const totalSkipped = this.testSuites.reduce((sum, suite) => sum + suite.skipped, 0);

    this.log('\n📊 Test Results Summary');
    this.log('=======================');
    this.log(`Total: ${totalTests}`);
    this.log(`✅ Passed: ${totalPassed}`);
    this.log(`❌ Failed: ${totalFailed}`);
    this.log(`⏭️  Skipped: ${totalSkipped}`);
    this.log(`⏱️  Duration: ${totalDuration}ms`);
    
    if (flags.ci) {
      await this.generateJUnitXML();
    }
    
    if (totalFailed > 0) {
      process.exit(1);
    }
  }

  private async generateJUnitXML(): Promise<void> {
    const xml = this.buildJUnitXML();
    const outputPath = 'test-results.xml';
    fs.writeFileSync(outputPath, xml);
    this.log(`\n📄 JUnit XML report generated: ${outputPath}`);
  }

  private buildJUnitXML(): string {
    const totalTests = this.testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalFailures = this.testSuites.reduce((sum, suite) => sum + suite.failed, 0);
    const totalDuration = this.testSuites.reduce((sum, suite) => sum + suite.duration, 0) / 1000;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<testsuites tests="${totalTests}" failures="${totalFailures}" time="${totalDuration}">\n`;
    
    for (const suite of this.testSuites) {
      xml += `  <testsuite name="${suite.name}" tests="${suite.totalTests}" failures="${suite.failed}" time="${suite.duration / 1000}">\n`;
      
      for (const test of suite.tests) {
        xml += `    <testcase name="${test.name}" time="${test.duration / 1000}"`;
        
        if (test.status === 'failed') {
          xml += '>\n';
          xml += `      <failure message="${this.escapeXML(test.error || 'Test failed')}">${this.escapeXML(test.error || '')}</failure>\n`;
          xml += '    </testcase>\n';
        } else if (test.status === 'skipped') {
          xml += '>\n';
          xml += '      <skipped/>\n';
          xml += '    </testcase>\n';
        } else {
          xml += '/>\n';
        }
      }
      
      xml += '  </testsuite>\n';
    }
    
    xml += '</testsuites>\n';
    return xml;
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
