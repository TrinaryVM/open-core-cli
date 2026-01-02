import { Command, Flags } from '@oclif/core';
import { RustCli } from '../utils/rustCli';
import * as fs from 'fs';
import * as path from 'path';

export default class Decrypt extends Command {
  static description = 'Decrypt a file using TriFHE secret key';

  static examples = [
    '<%= config.bin %> <%= command.id %> encrypted.trit --secret-key ./keys/secret.pem',
    '<%= config.bin %> <%= command.id %> encrypted.trit --secret-key ./keys/secret.pem --output decrypted.txt',
  ];

  static flags = {
    file: Flags.string({
      char: 'f',
      description: 'File to decrypt',
      required: true,
    }),
    'secret-key': Flags.string({
      char: 'k',
      description: 'Path to TriFHE secret key file',
      required: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    help: Flags.help({ char: 'h' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Decrypt);
    const filePath = flags.file;
    
    if (!fs.existsSync(filePath)) {
      this.error(`❌ File not found: ${filePath}`);
    }
    
    if (!fs.existsSync(flags['secret-key'])) {
      this.error(`❌ Secret key not found: ${flags['secret-key']}`);
    }
    
    this.log(`🔓 Decrypting file: ${path.basename(filePath)}`);
    this.log(`🔑 Using secret key: ${path.basename(flags['secret-key'])}`);
    
    try {
      const outputPath = flags.output || filePath.replace(/\.trit$/, '');
      const result = await RustCli.decrypt([
        filePath,
        '--secret-key', flags['secret-key'],
        '--output', outputPath
      ]);
      
      if (result.success) {
        this.log(`✅ File decrypted successfully: ${outputPath}`);
        this.log(result.output);
      } else {
        this.error(`❌ Decryption failed: ${result.error}`);
      }
    } catch (error: any) {
      this.error(`❌ Error: ${error.message}`);
    }
  }
}
