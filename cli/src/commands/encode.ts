import { Command, Flags, Args } from '@oclif/core';
import { TetragramUtils, TetragramError } from '../utils/tetragram';

export default class Encode extends Command {
  static description = 'Encode text using Tai Xuan Jing tetragrams with Sierpinski fractal compression';

  static examples = [
    '$ trinaryvm encode "Hello, TrinaryVM!"',
    '$ trinaryvm encode --text "Secret message"',
    '$ trinaryvm encode --351 "420-character input for maximum compression"',
  ];

  static flags = {
    text: Flags.string({ 
      char: 't', 
      description: 'Text to encode' 
    }),
    '351': Flags.boolean({
      description: 'Use sacred 351 encoding for maximum compression (requires exactly 420 characters)',
      default: false,
    }),
    verbose: Flags.boolean({
      char: 'v',
      description: 'Show detailed encoding statistics',
      default: false,
    }),
  };

  static args = {
    message: Args.string({
      description: 'Text to encode (alternative to --text flag)',
      required: false,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(Encode);
    const text = flags.text || args.message;
    
    if (!text) {
      this.error('Please provide text to encode using --text flag or as an argument');
    }
    
    this.log(`🔤 Encoding: "${text}"`);
    
    try {
      let result;
      if (flags['351']) {
        result = TetragramUtils.encodeTo351(text);
        this.log(`🎯 Sacred 351 encoding activated`);
      } else {
        result = TetragramUtils.encode(text);
      }
      
      const { glyphs, stats } = result;
      this.log(`🧩 Tetragrams: ${glyphs}`);
      this.log(`📏 Length: ${Array.from(glyphs).length} glyphs (${text.length} characters)`);
      
      if (flags.verbose) {
        this.log('\n📊 Encoding Statistics:');
        this.log(`Input Length: ${stats.inputLength} characters`);
        this.log(`Output Length: ${stats.outputLength} glyphs`);
        this.log(`Trit Count: ${stats.tritCount}`);
        this.log(`Padding Count: ${stats.paddingCount}`);
        this.log(`Compression Ratio: ${stats.compressionRatio}`);
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
  
  // Removed inefficient encoding method - now using TetragramUtils
}
