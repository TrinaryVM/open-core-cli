#!/usr/bin/env node

const { TetragramUtils } = require('./dist/utils/tetragram');

// Test string length calculation for tetragrams
function testLength() {
  console.log("=== Testing tetragram length calculation ===");
  
  const result = TetragramUtils.encode("8");
  const glyphs = result.glyphs;
  
  console.log(`Glyphs: "${glyphs}"`);
  console.log(`String.length: ${glyphs.length}`);
  console.log(`Array.from().length: ${Array.from(glyphs).length}`);
  console.log(`[...glyphs].length: ${[...glyphs].length}`);
  
  // Check each character individually
  console.log("\nIndividual characters:");
  for (let i = 0; i < glyphs.length; i++) {
    const char = glyphs[i];
    const codePoint = char.codePointAt(0);
    console.log(`  Index ${i}: "${char}" (U+${codePoint?.toString(16).toUpperCase()}) - length: ${char.length}`);
  }
  
  // Check with spread operator
  const chars = [...glyphs];
  console.log(`\nSpread operator result: [${chars.map(c => `"${c}"`).join(', ')}]`);
  console.log(`Spread length: ${chars.length}`);
  
  // Manual count
  let manualCount = 0;
  for (const char of glyphs) {
    manualCount++;
  }
  console.log(`Manual count: ${manualCount}`);
  
  return glyphs;
}

// Test with different inputs
console.log("=== Single character test ===");
const singleGlyphs = testLength();

console.log("\n=== Two character test ===");
const result2 = TetragramUtils.encode("88");
console.log(`"88" glyphs: "${result2.glyphs}"`);
console.log(`"88" length: ${result2.glyphs.length}`);
console.log(`"88" spread length: ${[...result2.glyphs].length}`);

console.log("\n=== Large number test ===");
const largeResult = TetragramUtils.encode("8088888888888888888888888888888888888888888888888888888888888888888888888888881111888881188888888811111111881188888888811111888888111118888888881118888881111111188888888118888811188111188888888811118888888888111888888888811888888811111188888888881118111111111111188888888811888811111111188888888888888888888888888888888888888888888888888888888888888881");
console.log(`Large number glyphs length: ${largeResult.glyphs.length}`);
console.log(`Large number spread length: ${[...largeResult.glyphs].length}`);
console.log(`Large number stats outputLength: ${largeResult.stats.outputLength}`); 