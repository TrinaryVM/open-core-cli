import { Command, Flags, Args } from '@oclif/core';
import * as fs from 'fs';
import { TetragramUtils, TetragramError } from '../utils/tetragram';

export default class EncodeGlyphs extends Command {
  static description = 'Encode text to tetragram glyphs';

  static examples = [
    '$ trinaryvm encode-glyphs "Hello World"',
    '$ trinaryvm encode-glyphs --file input.txt --output output.sm',
    '$ trinaryvm encode-glyphs --351 "420-character input for maximum compression"',
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
    '351': Flags.boolean({
      description: 'Use custom encoding to produce exactly 351 tetragrams (sacred 69-character savings)',
      default: false,
    }),
  };

  static args = {
    input: Args.string({
      description: 'Input text or file path',
      required: true,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(EncodeGlyphs);
    
    try {
      // Read input
      let text: string;
      if (flags.file) {
        text = fs.readFileSync(args.input, 'utf8');
      } else {
        text = args.input;
      }

      this.log(`🔤 Encoding: "${text}"`);

      // Encode text
      let result;
      if (flags['351']) {
        result = TetragramUtils.encodeTo351(text);
        this.log(`🎯 Sacred 351 encoding activated`);
      } else {
        result = TetragramUtils.encode(text);
      }
      const { glyphs, stats } = result;

      // Output result
      if (flags.output) {
        fs.writeFileSync(flags.output, glyphs);
        this.log(`✅ Encoded ${stats.inputLength} characters to ${stats.outputLength} glyphs`);
        this.log(`📁 Saved to: ${flags.output}`);
      } else {
        this.log(`🧩 Tetragrams: ${glyphs}`);
      }

      // Show statistics if verbose
      if (flags.verbose) {
        this.log('\n📊 Encoding Statistics:');
        this.log(`Input Length: ${stats.inputLength} characters`);
        this.log(`Output Length: ${stats.outputLength} glyphs`);
        this.log(`Trit Count: ${stats.tritCount}`);
        this.log(`Padding Count: ${stats.paddingCount}`);
        if (flags['351']) {
          this.log(`Sacred 69-character savings: ${stats.inputLength - stats.outputLength} characters`);
        }
      }
    } catch (error: any) {
      if (error instanceof TetragramError) {
        this.error(`❌ Tetragram Error: ${error.message}`);
      } else {
        this.error(`❌ Encoding failed: ${error.message}`);
      }
    }
  }
}
