import { Command, Flags, Args } from '@oclif/core';
import * as path from 'path';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ProfileResults {
  timestamp: string;
  metrics: {
    memory?: number;
    cpu?: number;
  };
  functions: {
    [key: string]: {
      calls: number;
      totalTime: number;
      avgTime: number;
      minTime: number;
      maxTime: number;
    };
  };
}

export default class Profile extends Command {
  static description = 'Profile a TrinaryVM program';

  static args = {
    file: Args.string({
      description: 'Path to the program to profile',
      required: true,
    }),
  };

  static flags = {
    function: Flags.string({
      description: 'Function to profile',
      required: false,
    }),
    iterations: Flags.integer({
      description: 'Number of iterations to run',
      default: 1000,
    }),
    output: Flags.string({
      description: 'Output file path',
      required: false,
    }),
    format: Flags.string({
      description: 'Output format (json or text)',
      default: 'text',
      options: ['json', 'text'],
    }),
    benchmark: Flags.boolean({
      description: 'Run in benchmark mode',
      default: false,
    }),
    verbose: Flags.boolean({
      description: 'Show verbose output',
      default: false,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(Profile);
    const filePath = path.resolve(args.file);
    const outputPath = flags.output ? path.resolve(flags.output) : null;

    // Validate file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      this.error(`File not found: ${filePath}`);
    }

    // Validate output directory if specified
    if (outputPath) {
      const outputDir = path.dirname(outputPath);
      try {
        await fs.access(outputDir);
      } catch (error) {
        this.error(`Output directory not found: ${outputDir}`);
      }
    }

    // Build profiling command
    const cmd = [
      'trinaryvm',
      filePath,
      '--profile',
      `--iterations=${flags.iterations}`,
    ];

    if (flags.function) {
      cmd.push(`--function=${flags.function}`);
    }

    if (flags.benchmark) {
      cmd.push('--benchmark');
    }

    if (flags.verbose) {
      cmd.push('--verbose');
    }

    try {
      // Run profiling
      const { stdout, stderr } = await execAsync(cmd.join(' '));

      if (stderr) {
        this.warn(stderr);
      }

      // Parse and format results
      const results = this.parseProfileResults(stdout);

      // Output results
      if (outputPath) {
        await this.writeResults(results, outputPath, flags.format);
      } else {
        this.printResults(results, flags.format);
      }

    } catch (error) {
      if (error instanceof Error) {
        this.error(`Profiling failed: ${error.message}`);
      } else {
        this.error('Profiling failed with unknown error');
      }
    }
  }

  private parseProfileResults(output: string): ProfileResults {
    // Parse the profiling output
    const lines = output.split('\n');
    const results: ProfileResults = {
      timestamp: new Date().toISOString(),
      metrics: {},
      functions: {},
    };

    let currentFunction: string | null = null;

    for (const line of lines) {
      if (line.startsWith('Function:')) {
        currentFunction = line.split(':')[1].trim();
        results.functions[currentFunction] = {
          calls: 0,
          totalTime: 0,
          avgTime: 0,
          minTime: Infinity,
          maxTime: 0,
        };
      } else if (line.startsWith('Calls:')) {
        if (currentFunction) {
          results.functions[currentFunction].calls = parseInt(line.split(':')[1]);
        }
      } else if (line.startsWith('Total time:')) {
        if (currentFunction) {
          results.functions[currentFunction].totalTime = parseFloat(line.split(':')[1]);
        }
      } else if (line.startsWith('Average time:')) {
        if (currentFunction) {
          results.functions[currentFunction].avgTime = parseFloat(line.split(':')[1]);
        }
      } else if (line.startsWith('Min time:')) {
        if (currentFunction) {
          results.functions[currentFunction].minTime = parseFloat(line.split(':')[1]);
        }
      } else if (line.startsWith('Max time:')) {
        if (currentFunction) {
          results.functions[currentFunction].maxTime = parseFloat(line.split(':')[1]);
        }
      } else if (line.startsWith('Memory usage:')) {
        results.metrics.memory = parseFloat(line.split(':')[1]);
      } else if (line.startsWith('CPU usage:')) {
        results.metrics.cpu = parseFloat(line.split(':')[1]);
      }
    }

    return results;
  }

  private async writeResults(results: ProfileResults, outputPath: string, format: string) {
    const content = format === 'json' 
      ? JSON.stringify(results, null, 2)
      : this.formatResultsText(results);

    await fs.writeFile(outputPath, content);
  }

  private printResults(results: ProfileResults, format: string) {
    const output = format === 'json'
      ? JSON.stringify(results, null, 2)
      : this.formatResultsText(results);

    this.log(output);
  }

  private formatResultsText(results: ProfileResults): string {
    let output = `Profile Results (${results.timestamp})\n\n`;

    // Add metrics
    output += 'System Metrics:\n';
    output += `Memory Usage: ${results.metrics.memory} MB\n`;
    output += `CPU Usage: ${results.metrics.cpu}%\n\n`;

    // Add function results
    output += 'Function Results:\n';
    for (const [name, data] of Object.entries(results.functions)) {
      output += `\n${name}:\n`;
      output += `  Calls: ${data.calls}\n`;
      output += `  Total Time: ${data.totalTime}ms\n`;
      output += `  Average Time: ${data.avgTime}ms\n`;
      output += `  Min Time: ${data.minTime}ms\n`;
      output += `  Max Time: ${data.maxTime}ms\n`;
    }

    return output;
  }
}
