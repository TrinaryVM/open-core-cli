import { TetragramUtils, TetragramError } from './tetragram';

describe('TetragramUtils', () => {
  it('encodes and decodes ASCII text round-trip', () => {
    const input = 'Hello, World!';
    const { glyphs } = TetragramUtils.encode(input);
    const { text } = TetragramUtils.decode(glyphs);
    expect(text).toBe(input);
  });

  it('handles empty string', () => {
    const input = '';
    const { glyphs } = TetragramUtils.encode(input);
    const { text } = TetragramUtils.decode(glyphs);
    expect(text).toBe(input);
  });

  it('throws on non-ASCII character', () => {
    expect(() => TetragramUtils.encode('𝌆')).toThrow(TetragramError);
  });

  it('throws on invalid glyph', () => {
    // U+1D300 is not a valid tetragram
    expect(() => TetragramUtils.decode('\u{1D300}')).toThrow(TetragramError);
  });

  it('throws on length mismatch', () => {
    const { glyphs } = TetragramUtils.encode('Test');
    // Remove one glyph to break the length tag
    const broken = glyphs.slice(1);
    expect(() => TetragramUtils.decode(broken)).toThrow(TetragramError);
  });

  it('validates correct glyphs', () => {
    const { glyphs } = TetragramUtils.encode('A');
    expect(TetragramUtils.validate(glyphs)).toBe(true);
  });

  it('invalidates incorrect glyphs', () => {
    expect(TetragramUtils.validate('abc')).toBe(false);
  });

  it('pads and truncates safely', () => {
    const input = 'Pad';
    const { glyphs } = TetragramUtils.encode(input);
    // Add extra padding glyph (should fail validation)
    const padded = glyphs + glyphs[0];
    expect(() => TetragramUtils.decode(padded)).toThrow(TetragramError);
  });

  it('provides tetragram info', () => {
    const info = TetragramUtils.getTetragramInfo(0);
    expect(info.glyph).toBe(String.fromCodePoint(0x1D306));
    expect(info.trits).toEqual([0, 0, 0, 0]);
    expect(typeof info.meaning).toBe('string');
  });
}); 