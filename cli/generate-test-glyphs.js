#!/usr/bin/env node

const { TetragramUtils } = require('./dist/utils/tetragram');

// Generate valid tetragram glyphs for "test"
try {
  const result = TetragramUtils.encode("test");
  console.log(`Encoded "test" to tetragram glyphs: ${result.glyphs}`);
  console.log(`Stats:`, result.stats);
  
  // Test decode
  const decoded = TetragramUtils.decode(result.glyphs);
  console.log(`Decoded back to: "${decoded.text}"`);
  
  // Show the glyphs that can be used in assembly
  console.log(`\nUse this in your .glyph directive:`);
  console.log(`.glyph ${result.glyphs}`);
  
} catch (error) {
  console.error('Error:', error);
} 