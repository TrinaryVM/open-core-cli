import { Command, Flags, Args } from '@oclif/core';
import { TetragramUtils, TetragramError } from '../utils/tetragram';

export default class Decode extends Command {
  static description = 'Decode Tai Xuan Jing tetragrams to text';

  static examples = [
    '$ trinaryvm decode "𝌆𝌮𝍖𝌆"',
    '$ trinaryvm decode --glyphs "𝌆𝌮𝍖𝌆"',
  ];

  static flags = {
    glyphs: Flags.string({ 
      char: 'g', 
      description: 'Tetragrams to decode' 
    }),
    verbose: Flags.boolean({
      char: 'v',
      description: 'Show detailed decoding statistics',
      default: false,
    }),
  };

  static args = {
    message: Args.string({
      description: 'Tetragrams to decode (alternative to --glyphs flag)',
      required: false,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(Decode);
    const glyphs = flags.glyphs || args.message;
    
    if (!glyphs) {
      this.error('Please provide tetragrams to decode using --glyphs flag or as an argument');
    }
    
    this.log(`🧩 Decoding: ${glyphs}`);
    
    try {
      const result = TetragramUtils.decode(glyphs);
      const { text, stats } = result;
      
      this.log(`🔤 Text: "${text}"`);
      this.log(`📏 Length: ${text.length} characters (${Array.from(glyphs).length} glyphs)`);
      
      if (flags.verbose) {
        this.log('\n📊 Decoding Statistics:');
        this.log(`Input Length: ${stats.inputLength} glyphs`);
        this.log(`Output Length: ${stats.outputLength} characters`);
        this.log(`Trit Count: ${stats.tritCount}`);
        this.log(`Padding Count: ${stats.paddingCount}`);
        this.log(`Compression Ratio: ${stats.compressionRatio}`);
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
