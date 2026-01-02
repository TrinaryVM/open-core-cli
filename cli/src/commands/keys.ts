import { Command, Flags } from '@oclif/core';
import * as path from 'path';
import { RustCli } from '../utils/rustCli';
import { PqKeystoreBuilder } from '../utils/pqKeystore';

export default class Keys extends Command {
  static description = 'Generate PQ+TriFHE keystore (ML-DSA / ML-KEM / TriFHE)';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --output-dir ./keys',
  ];

  static flags = {
    'output-dir': Flags.string({
      char: 'o',
      description: 'Directory to save keypair files',
      default: './keys',
    }),
    name: Flags.string({
      char: 'n',
      description: 'Keystore filename (without directory)',
      default: 'pq-keystore.json',
    }),
    passphrase: Flags.string({
      char: 'p',
      description: 'Passphrase for PQ keystore (min 12 chars)',
      env: 'TRINARYVM_KEYSTORE_PASSPHRASE',
    }),
    iterations: Flags.integer({
      description: 'PBKDF2 iterations (default 200000)',
      default: 200000,
    }),
    owner: Flags.string({
      description: 'Override keystore owner (defaults to derived address)',
    }),
    'legacy-trifhe': Flags.boolean({
      description: 'Also invoke legacy Rust CLI key generation (writes .key files)',
      default: false,
    }),
    help: Flags.help({ char: 'h' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Keys);

    const passphrase = flags.passphrase;
    if (!passphrase) {
      this.error('❌ Passphrase is required. Use --passphrase or TRINARYVM_KEYSTORE_PASSPHRASE env.');
    }

    this.log('🔐 Generating PQ+TriFHE keystore…');
    this.log(`📁 Output directory: ${flags['output-dir']}`);
    this.log(`📝 Keystore file: ${flags.name}`);

    try {
      const { filePath } = PqKeystoreBuilder.create({
        outputDir: flags['output-dir'],
        filename: flags.name,
        passphrase,
        iterations: flags.iterations,
        owner: flags.owner,
      });

      this.log('✅ PQ keystore created!');
      this.log(`   → ${path.resolve(filePath)}`);
    } catch (error: any) {
      this.error(`❌ Failed to create PQ keystore: ${error.message}`);
    }

    if (flags['legacy-trifhe']) {
      this.log('🌀 Legacy TriFHE key generation requested (Rust CLI)…');
      try {
        const legacyResult = await RustCli.keys([
          '--out-dir', flags['output-dir'],
          '--name', path.parse(flags.name).name,
        ]);
        if (legacyResult.success) {
          this.log('   ↳ Legacy TriFHE keys generated.');
        } else {
          this.warn(`   ↳ Legacy generation failed: ${legacyResult.error}`);
        }
      } catch (legacyError: any) {
        this.warn(`   ↳ Legacy generation error: ${legacyError.message}`);
      }
    }
  }
}
