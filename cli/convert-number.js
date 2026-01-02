#!/usr/bin/env node

const { TetragramUtils } = require('./dist/utils/tetragram');

// The large number to convert
const largeNumber = "808888888888888888888888888888888888888888888888888888888888888888888888888888111188888118888888881111111188118888888881111188888811111888888888111888888111111118888888811888881118811118888888881111888888888811188888888881188888881111118888888888111811111111111118888888881188881111111188888888888888888888888888888888888888888888888888888888888888881";

console.log("Converting large number to tetragrams...");
console.log(`Input number length: ${largeNumber.length} digits`);

// Convert the number to base-3 trits
function numberToTrits(numStr) {
  const trits = [];
  let num = BigInt(numStr);
  const three = BigInt(3);
  
  while (num > 0n) {
    trits.unshift(Number(num % three));
    num = num / three;
  }
  
  return trits;
}

// Convert trits to tetragrams
function tritsToTetragrams(trits) {
  const BASE_UNICODE = 0x1D306;
  const TRITS_PER_TETRAGRAM = 4;
  const glyphs = [];
  
  for (let i = 0; i < trits.length; i += TRITS_PER_TETRAGRAM) {
    const chunk = trits.slice(i, i + TRITS_PER_TETRAGRAM);
    
    // Pad with zeros if needed
    while (chunk.length < TRITS_PER_TETRAGRAM) {
      chunk.push(0);
    }
    
    // Convert chunk to number
    let index = 0;
    for (const trit of chunk) {
      index = index * 3 + trit;
    }
    
    const codePoint = BASE_UNICODE + index;
    glyphs.push(String.fromCodePoint(codePoint));
  }
  
  return glyphs.join('');
}

// Convert number to trits
const trits = numberToTrits(largeNumber);
console.log(`Converted to ${trits.length} trits`);

// Convert trits to tetragrams
const tetragrams = tritsToTetragrams(trits);
console.log(`Converted to ${tetragrams.length} tetragrams`);

console.log("\nTetragram Output:");
console.log(tetragrams);

console.log("\nStatistics:");
console.log(`Input digits: ${largeNumber.length}`);
console.log(`Trits generated: ${trits.length}`);
console.log(`Tetragrams generated: ${tetragrams.length}`);
console.log(`Tetragrams per input digit: ${(tetragrams.length / largeNumber.length).toFixed(2)}`);

// Show first few tetragrams with their meanings
console.log("\nFirst 10 tetragrams with meanings:");
for (let i = 0; i < Math.min(10, tetragrams.length); i++) {
  const glyph = tetragrams[i];
  const codePoint = glyph.codePointAt(0);
  const index = codePoint - 0x1D306;
  const info = TetragramUtils.getTetragramInfo(index);
  console.log(`${i + 1}. ${glyph} (Index: ${index}) - ${info.meaning}`);
} 