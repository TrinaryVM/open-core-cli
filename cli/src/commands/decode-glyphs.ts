import { Command, Flags, Args } from '@oclif/core';
import * as fs from 'fs';
import { TetragramUtils, TetragramError } from '../utils/tetragram';

export default class DecodeGlyphs extends Command {
  static description = 'Decode tetragram glyphs to text';

  static examples = [
    '$ trinaryvm decode-glyphs "𝌆𝌇𝌈𝌉𝌊"',
    '$ trinaryvm decode-glyphs --file input.sm --output output.txt',
    '$ trinaryvm decode-glyphs --verbose "𝌆𝌇𝌈𝌉𝌊"',
  ];

  static flags = {
    file: Flags.boolean({
      char: 'f',
      description: 'Treat input as file path',
      default: false,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path (default: stdout)',
    }),
    verbose: Flags.boolean({
      char: 'v',
      description: 'Show detailed statistics',
      default: false,
    }),
  };

  static args = {
    input: Args.string({
      description: 'Input glyphs or file path',
      required: true,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(DecodeGlyphs);
    
    try {
      // Read input
      let glyphs: string;
      if (flags.file) {
        glyphs = fs.readFileSync(args.input, 'utf8');
      } else {
        glyphs = args.input;
      }

      this.log(`🔤 Decoding: "${glyphs}"`);

      // Validate glyphs
      if (!TetragramUtils.validate(glyphs)) {
        throw new TetragramError('Invalid tetragram glyphs in input', 'INVALID_GLYPHS');
      }

      // Decode glyphs
      const { text, stats } = TetragramUtils.decode(glyphs);

      // Output result
      if (flags.output) {
        fs.writeFileSync(flags.output, text);
        this.log(`✅ Decoded ${stats.inputLength} glyphs to ${stats.outputLength} characters`);
        this.log(`📁 Saved to: ${flags.output}`);
      } else {
        this.log(`📝 Text: ${text}`);
      }

      // Show statistics if verbose
      if (flags.verbose) {
        this.log('\n📊 Decoding Statistics:');
        this.log(`Input Length: ${stats.inputLength} glyphs`);
        this.log(`Output Length: ${stats.outputLength} characters`);
        this.log(`Trit Count: ${stats.tritCount}`);
        this.log(`Padding Count: ${stats.paddingCount}`);
      }
    } catch (error: any) {
      if (error instanceof TetragramError) {
        this.error(`❌ Tetragram Error: ${error.message}`);
      } else {
        this.error(`❌ Decoding failed: ${error.message}`);
      }
    }
  }
}
