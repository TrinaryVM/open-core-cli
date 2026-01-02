import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('CLI Integration', () => {
  const tmpDir = path.join(__dirname, '../../../.tmp_cli_test');
  const textFile = path.join(tmpDir, 'input.txt');
  const glyphFile = path.join(tmpDir, 'glyphs.txt');
  const asmFile = path.join(tmpDir, 'test.asm');
  const outFile = path.join(tmpDir, 'output.txt');

  beforeAll(() => {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('encodes and decodes text via CLI', () => {
    const input = 'IntegrationTest';
    fs.writeFileSync(textFile, input);
    // Encode
    execSync(`node ./dist/commands/encode-glyphs.js ${textFile} -f -o ${glyphFile}`);
    const glyphs = fs.readFileSync(glyphFile, 'utf8');
    expect(glyphs.length).toBeGreaterThan(0);
    // Decode
    execSync(`node ./dist/commands/decode-glyphs.js ${glyphFile} -f -o ${outFile}`);
    const output = fs.readFileSync(outFile, 'utf8');
    expect(output).toBe(input);
  });

  it('fails on invalid glyph input', () => {
    fs.writeFileSync(glyphFile, 'abc');
    expect(() => {
      execSync(`node ./dist/commands/decode-glyphs.js ${glyphFile} -f`);
    }).toThrow();
  });

  it('assembles a file with .glyph pseudo-op', () => {
    const input = 'GlyphTest';
    const { glyphs } = require('../utils/tetragram').TetragramUtils.encode(input);
    fs.writeFileSync(asmFile, `.glyph ${glyphs}\n`);
    execSync(`node ./dist/commands/asm.js ${asmFile} -o ${outFile}`);
    const output = fs.readFileSync(outFile, 'utf8');
    expect(output).toContain(input);
  });

  it('disassembles a file (stub)', () => {
    // This is a stub until disassembly is implemented
    // Should print 'Disassembly not yet implemented'
    fs.writeFileSync(asmFile, 'NOP\n');
    const result = execSync(`node ./dist/commands/asm.js ${asmFile} -d`).toString();
    expect(result).toMatch(/Disassembly not yet implemented/);
  });
}); 