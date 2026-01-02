#!/usr/bin/env node

const { TetragramUtils } = require('./dist/utils/tetragram');

// Debug the encoding process step by step
function debugEncoding(text) {
  console.log(`\n=== Debugging encoding for: "${text}" ===`);
  
  // Step 1: Convert each character to trits
  const allTrits = [];
  for (const char of text) {
    const charCode = char.charCodeAt(0);
    console.log(`\nCharacter: '${char}' (ASCII: ${charCode})`);
    
    let tritCount;
    if (charCode <= 26) {
      tritCount = 3;
      console.log(`  Range: ASCII 0-26, using ${tritCount} trits`);
    } else if (charCode <= 80) {
      tritCount = 4;
      console.log(`  Range: ASCII 27-80, using ${tritCount} trits`);
    } else {
      tritCount = 6;
      console.log(`  Range: ASCII 81-255, using ${tritCount} trits`);
    }
    
    const charTrits = [];
    let n = charCode;
    for (let i = 0; i < tritCount; i++) {
      charTrits.unshift(n % 3);
      n = Math.floor(n / 3);
    }
    
    console.log(`  Trits: [${charTrits.join(', ')}]`);
    allTrits.push(...charTrits);
  }
  
  console.log(`\nTotal trits: ${allTrits.length}`);
  console.log(`All trits: [${allTrits.join(', ')}]`);
  
  // Step 2: Group into 4-trit chunks for tetragrams
  const tetragrams = [];
  for (let i = 0; i < allTrits.length; i += 4) {
    const chunk = allTrits.slice(i, i + 4);
    
    // Pad with zeros if needed
    while (chunk.length < 4) {
      chunk.push(0);
    }
    
    console.log(`\nChunk ${Math.floor(i/4) + 1}: [${chunk.join(', ')}]`);
    
    // Convert chunk to tetragram index
    let index = 0;
    for (let j = 0; j < 4; j++) {
      index = index * 3 + chunk[j];
    }
    
    console.log(`  Index: ${index}`);
    
    // Convert to Unicode tetragram
    const codePoint = 0x1D306 + index;
    const glyph = String.fromCodePoint(codePoint);
    tetragrams.push(glyph);
    
    console.log(`  CodePoint: U+${codePoint.toString(16).toUpperCase()}`);
    console.log(`  Glyph: ${glyph}`);
  }
  
  console.log(`\nTotal tetragrams: ${tetragrams.length}`);
  console.log(`Tetragram string: ${tetragrams.join('')}`);
  
  return tetragrams.join('');
}

// Test with single characters
console.log("=== Testing single character encoding ===");
debugEncoding("8");
debugEncoding("1");

console.log("\n=== Testing two character encoding ===");
debugEncoding("88");

// Compare with CLI output
console.log("\n=== CLI Output Comparison ===");
const result = TetragramUtils.encode("8");
console.log(`CLI encode("8"): ${result.glyphs}`);
console.log(`CLI stats:`, result.stats); 