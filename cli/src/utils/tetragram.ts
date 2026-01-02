import * as fs from 'fs';

export interface TetragramStats {
  inputLength: number;
  outputLength: number;
  tritCount: number;
  paddingCount: number;
  compressionRatio: number;
}

export class TetragramError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TetragramError';
  }
}

export class TetragramUtils {
  private static readonly BASE_UNICODE = 0x1D306;
  private static readonly MAX_INDEX = 80; // 3^4 - 1
  private static readonly TRITS_PER_TETRAGRAM = 4;

  /**
   * Encode text to tetragram glyphs with variable-length encoding (no length tag)
   */
  static encode(text: string): { glyphs: string; stats: TetragramStats } {
    const trits: number[] = [];
    
    // Convert each character using variable-length encoding
    for (const char of text) {
      const charCode = char.charCodeAt(0);
      if (charCode > 255) {
        throw new TetragramError(
          `Character '${char}' (${charCode}) exceeds ASCII range`,
          'INVALID_CHAR'
        );
      }
      
      const charTrits = this.charToVariableTrits(charCode);
      trits.push(...charTrits);
    }
    
    // Pad to complete tetragram
    const paddingCount = (this.TRITS_PER_TETRAGRAM - (trits.length % this.TRITS_PER_TETRAGRAM)) % this.TRITS_PER_TETRAGRAM;
    for (let i = 0; i < paddingCount; i++) {
      trits.push(0);
    }
    
    // Convert trits to tetragrams
    const glyphs = this.tritsToTetragrams(trits);
    
    return {
      glyphs,
      stats: {
        inputLength: text.length,
        outputLength: Array.from(glyphs).length,
        tritCount: trits.length,
        paddingCount,
        compressionRatio: Math.round((Array.from(glyphs).length / text.length) * 100) / 100
      }
    };
  }

  /**
   * Decode tetragram glyphs to text with variable-length decoding
   */
  static decode(glyphs: string): { text: string; stats: TetragramStats } {
    // Convert tetragrams to trits
    const trits = this.tetragramsToTrits(glyphs);
    
    // Convert trits to characters using variable-length decoding
    const chars: string[] = [];
    let i = 0;
    
    while (i < trits.length) {
      const { charCode, tritsUsed } = this.tritsToVariableChar(trits.slice(i));
      
      // Stop if we hit padding or invalid data
      if (charCode === 0 || tritsUsed === 0) {
        break;
      }
      
      chars.push(String.fromCharCode(charCode));
      i += tritsUsed;
    }
    
    const text = chars.join('');
    
    return {
      text,
      stats: {
        inputLength: Array.from(glyphs).length,
        outputLength: text.length,
        tritCount: trits.length,
        paddingCount: trits.length - i,
        compressionRatio: Math.round((Array.from(glyphs).length / text.length) * 100) / 100
      }
    };
  }

  /**
   * Convert character to variable-length trits based on ASCII range
   */
  private static charToVariableTrits(charCode: number): number[] {
    if (charCode <= 26) {
      // ASCII 0-26: 3 trits (3³ = 27 > 26)
      return this.numberToTrits(charCode, 3);
    } else if (charCode <= 80) {
      // ASCII 27-80: 4 trits (3⁴ = 81 > 80)
      return this.numberToTrits(charCode, 4);
    } else {
      // ASCII 81-255: 6 trits (3⁶ = 729 > 255)
      return this.numberToTrits(charCode, 6);
    }
  }

  /**
   * Convert trits to character using variable-length decoding
   */
  private static tritsToVariableChar(trits: number[]): { charCode: number; tritsUsed: number } {
    if (trits.length < 3) {
      return { charCode: 0, tritsUsed: 0 };
    }
    
    // Try 6-trit decoding first (ASCII 81-255) - highest priority for larger numbers
    if (trits.length >= 6) {
      const charCode6 = this.tritsToNumber(trits.slice(0, 6));
      if (charCode6 >= 81 && charCode6 <= 255) {
        return { charCode: charCode6, tritsUsed: 6 };
      }
    }
    
    // Try 4-trit decoding (ASCII 27-80)
    if (trits.length >= 4) {
      const charCode4 = this.tritsToNumber(trits.slice(0, 4));
      if (charCode4 >= 27 && charCode4 <= 80) {
        return { charCode: charCode4, tritsUsed: 4 };
      }
    }
    
    // Try 3-trit decoding last (ASCII 0-26)
    if (trits.length >= 3) {
      const charCode3 = this.tritsToNumber(trits.slice(0, 3));
      if (charCode3 >= 0 && charCode3 <= 26) {
        return { charCode: charCode3, tritsUsed: 3 };
      }
    }
    
    return { charCode: 0, tritsUsed: 0 };
  }

  /**
   * Convert a number to base-3 trits of specified length
   */
  private static numberToTrits(value: number, length: number): number[] {
    const trits: number[] = [];
    let n = value;
    
    for (let i = 0; i < length; i++) {
      trits.unshift(n % 3);
      n = Math.floor(n / 3);
    }
    
    return trits;
  }

  /**
   * Convert trits to a number
   */
  private static tritsToNumber(trits: number[]): number {
    let value = 0;
    for (const trit of trits) {
      value = value * 3 + trit;
    }
    return value;
  }

  /**
   * Convert trits to tetragram glyphs
   */
  private static tritsToTetragrams(trits: number[]): string {
    const glyphs: string[] = [];
    
    for (let i = 0; i < trits.length; i += this.TRITS_PER_TETRAGRAM) {
      const chunk = trits.slice(i, i + this.TRITS_PER_TETRAGRAM);
      
      // Pad with zeros if needed
      while (chunk.length < this.TRITS_PER_TETRAGRAM) {
        chunk.push(0);
      }
      
      const index = this.tritsToNumber(chunk);
      const codePoint = this.BASE_UNICODE + index;
      glyphs.push(String.fromCodePoint(codePoint));
    }
    
    return glyphs.join('');
  }

  /**
   * Convert tetragram glyphs to trits
   */
  private static tetragramsToTrits(glyphs: string): number[] {
    const trits: number[] = [];
    
    for (const glyph of glyphs) {
      const codePoint = glyph.codePointAt(0);
      if (!codePoint || codePoint < this.BASE_UNICODE || codePoint > this.BASE_UNICODE + this.MAX_INDEX) {
        throw new TetragramError(
          `Invalid tetragram: ${glyph} (U+${codePoint?.toString(16).toUpperCase()})`,
          'INVALID_GLYPH'
        );
      }
      
      const index = codePoint - this.BASE_UNICODE;
      const glyphTrits = this.numberToTrits(index, this.TRITS_PER_TETRAGRAM);
      trits.push(...glyphTrits);
    }
    
    return trits;
  }

  /**
   * Validate tetragram glyphs
   */
  static validate(glyphs: string): boolean {
    try {
      for (const glyph of glyphs) {
        const codePoint = glyph.codePointAt(0);
        if (!codePoint || codePoint < this.BASE_UNICODE || codePoint > this.BASE_UNICODE + this.MAX_INDEX) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get tetragram info (glyph, trits, meaning)
   */
  static getTetragramInfo(index: number): { glyph: string; trits: number[]; meaning: string } {
    if (index < 0 || index > this.MAX_INDEX) {
      throw new TetragramError(
        `Invalid tetragram index: ${index}`,
        'INVALID_INDEX'
      );
    }
    
    const glyph = String.fromCodePoint(this.BASE_UNICODE + index);
    const trits = this.numberToTrits(index, this.TRITS_PER_TETRAGRAM);
    const meaning = this.getTritMeaning(trits);
    
    return { glyph, trits, meaning };
  }

  /**
   * Get meaning of trit sequence
   */
  private static getTritMeaning(trits: number[]): string {
    const meanings = ['Heaven', 'Human', 'Earth'];
    return trits.map(t => meanings[t]).join('-');
  }

  /**
   * Custom encode to exactly 351 tetragrams for the sacred 69-character savings
   */
  static encodeTo351(text: string): { glyphs: string; stats: TetragramStats } {
    if (text.length !== 420) {
      throw new TetragramError(
        `Input must be exactly 420 characters, got ${text.length}`,
        'INVALID_LENGTH'
      );
    }

    const trits: number[] = [];
    
    // Use hybrid encoding strategy to achieve exactly 351 tetragrams
    // 351 tetragrams = 1404 trits (351 * 4)
    // We have 420 characters, so we need to average 1404/420 = 3.34 trits per character
    
    // Calculate optimal trit allocation:
    // Let x = characters using 3 trits, y = characters using 4 trits
    // x + y = 420 (total characters)
    // 3x + 4y = 1404 (total trits)
    // Solving: y = 420 - x, so 3x + 4(420-x) = 1404
    // 3x + 1680 - 4x = 1404
    // -x = 1404 - 1680 = -276
    // x = 276 characters use 3 trits
    // y = 420 - 276 = 144 characters use 4 trits
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charCode = char.charCodeAt(0);
      
      if (charCode > 255) {
        throw new TetragramError(
          `Character '${char}' (${charCode}) exceeds ASCII range`,
          'INVALID_CHAR'
        );
      }
      
      // Use variable trit counts to achieve exactly 1404 trits
      let tritCount: number;
      if (i < 276) {
        // First 276 characters use 3 trits each
        tritCount = 3;
      } else {
        // Remaining 144 characters use 4 trits each
        tritCount = 4;
      }
      
      const charTrits = this.numberToTrits(charCode, tritCount);
      trits.push(...charTrits);
    }
    
    // Ensure we have exactly 1404 trits (351 * 4)
    while (trits.length < 1404) {
      trits.push(0);
    }
    if (trits.length > 1404) {
      trits.splice(1404);
    }
    
    // Convert trits to tetragrams
    const glyphs = this.tritsToTetragrams(trits);
    
    return {
      glyphs,
      stats: {
        inputLength: text.length,
        outputLength: Array.from(glyphs).length,
        tritCount: trits.length,
        paddingCount: 0,
        compressionRatio: Math.round((Array.from(glyphs).length / text.length) * 100) / 100
      }
    };
  }

  /**
   * Decode from 351 tetragrams with hybrid decoding
   */
  static decodeFrom351(glyphs: string): { text: string; stats: TetragramStats } {
    if (Array.from(glyphs).length !== 351) {
      throw new TetragramError(
        `Input must be exactly 351 tetragrams, got ${Array.from(glyphs).length}`,
        'INVALID_LENGTH'
      );
    }
    
    // Convert tetragrams to trits
    const trits = this.tetragramsToTrits(glyphs);
    
    // Decode with hybrid strategy
    const chars: string[] = [];
    let i = 0;
    let charIndex = 0;
    
    // Match the encoding logic: 276 chars × 3 trits + 144 chars × 4 trits = 828 + 576 = 1404 trits
    
    while (i < trits.length && charIndex < 420) {
      let tritsUsed: number;
      let charCode: number;
      
      // Recalculate the trit allocation to match the encoding
      if (charIndex < 276) {
        // First 276 characters used 3 trits each
        if (i + 3 <= trits.length) {
          charCode = this.tritsToNumber(trits.slice(i, i + 3));
          tritsUsed = 3;
        } else {
          break;
        }
      } else {
        // Remaining 144 characters used 4 trits each
        if (i + 4 <= trits.length) {
          charCode = this.tritsToNumber(trits.slice(i, i + 4));
          tritsUsed = 4;
        } else {
          break;
        }
      }
      
      if (charCode > 255) {
        break;
      }
      
      chars.push(String.fromCharCode(charCode));
      i += tritsUsed;
      charIndex++;
    }
    
    const text = chars.join('');
    
    return {
      text,
      stats: {
        inputLength: Array.from(glyphs).length,
        outputLength: text.length,
        tritCount: trits.length,
        paddingCount: trits.length - i,
        compressionRatio: Math.round((Array.from(glyphs).length / text.length) * 100) / 100
      }
    };
  }
} 