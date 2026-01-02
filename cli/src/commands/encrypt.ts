import { Command, Flags } from '@oclif/core';
import { RustCli } from '../utils/rustCli';
import * as fs from 'fs';
import * as path from 'path';

export default class Encrypt extends Command {
  static description = 'Encrypt a file using TriFHE public key';

  static examples = [
    '<%= config.bin %> <%= command.id %> input.txt --public-key ./keys/public.pem',
    '<%= config.bin %> <%= command.id %> input.txt --public-key ./keys/public.pem --output encrypted.trit',
  ];

  static flags = {
    file: Flags.string({
      char: 'f',
      description: 'File to encrypt',
      required: true,
    }),
    'public-key': Flags.string({
      char: 'k',
      description: 'Path to TriFHE public key file',
      required: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    help: Flags.help({ char: 'h' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Encrypt);
    const filePath = flags.file;
    
    if (!fs.existsSync(filePath)) {
      this.error(`❌ File not found: ${filePath}`);
    }
    
    if (!fs.existsSync(flags['public-key'])) {
      this.error(`❌ Public key not found: ${flags['public-key']}`);
    }
    
    this.log(`🔒 Encrypting file: ${path.basename(filePath)}`);
    this.log(`🔑 Using public key: ${path.basename(flags['public-key'])}`);
    
    try {
      const outputPath = flags.output || `${filePath}.trit`;
      const result = await RustCli.encrypt([
        filePath,
        '--public-key', flags['public-key'],
        '--output', outputPath
      ]);
      
      if (result.success) {
        this.log(`✅ File encrypted successfully: ${outputPath}`);
        this.log(result.output);
      } else {
        this.error(`❌ Encryption failed: ${result.error}`);
      }
    } catch (error: any) {
      this.error(`❌ Error: ${error.message}`);
    }
  }
}
