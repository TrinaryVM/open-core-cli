#!/usr/bin/env node

const { TetragramUtils } = require('./dist/utils/tetragram');

// Extend the input to exactly 420 characters
const baseInput = "8088888888888888888888888888888888888888888888888888888888888888888888888888881111888881188888888811111111881188888888811111888888111118888888881118888881111111188888888118888811188111188888888811118888888888111888888888811888888811111188888888881118111111111111188888888811888811111111188888888888888888888888888888888888888888888888888888888888888881";

// Extend to 420 characters by repeating the pattern
let extendedInput = baseInput;
while (extendedInput.length < 420) {
  extendedInput += "8";
}
if (extendedInput.length > 420) {
  extendedInput = extendedInput.substring(0, 420);
}

console.log(`Original length: ${baseInput.length}`);
console.log(`Extended length: ${extendedInput.length}`);
console.log(`Extended input: ${extendedInput}`);

// Test the sacred 351-tetragram encoding
console.log("\n=== Testing Sacred 351-Tetragram Encoding ===");
try {
  const result = TetragramUtils.encodeTo351(extendedInput);
  console.log(`\nEncoded tetragrams: ${result.glyphs}`);
  console.log(`\nEncoding Statistics:`);
  console.log(`Input Length: ${result.stats.inputLength} characters`);
  console.log(`Output Length: ${result.stats.outputLength} glyphs`);
  console.log(`Trit Count: ${result.stats.tritCount}`);
  console.log(`Padding Count: ${result.stats.paddingCount}`);
  console.log(`Sacred 69-character savings: ${result.stats.inputLength - result.stats.outputLength} characters`);
  console.log(`Compression Ratio: ${result.stats.compressionRatio}`);
  
  // Test decoding
  console.log("\n=== Testing Decoding ===");
  const decoded = TetragramUtils.decodeFrom351(result.glyphs);
  console.log(`Decoded text: ${decoded.text}`);
  console.log(`Decoded length: ${decoded.text.length}`);
  console.log(`Perfect match: ${decoded.text === extendedInput}`);
  
} catch (error) {
  console.error("Error:", error.message);
} 