import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { asmMain } from '../src/commands/asm';

describe('ASM Command', () => {
  const testDir = path.join(__dirname, '../test-temp');
  
  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });
  
  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  function captureLogs() {
    let logs: string[] = [];
    let errors: string[] = [];
    return {
      log: (msg: string) => logs.push(msg),
      errorLog: (msg: string) => errors.push(msg),
      getLogs: () => logs.join('\n'),
      getErrors: () => errors.join('\n'),
    };
  }

  describe('Assembly Mode', () => {
    it('should assemble basic instructions', async () => {
      const inputFile = path.join(testDir, 'basic.asm');
      const content = `
        PUSH #42
        MOV R1, R2
        HALT
      `;
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, {}, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs()).toContain('20 2A 00');
      expect(logs.getLogs()).toContain('24 01 00 02 00');
      expect(logs.getLogs()).toContain('30');
    });

    it('should handle glyph directives', async () => {
      const inputFile = path.join(testDir, 'glyph.asm');
      const content = '.glyph 𝌒𝍏𝌚𝌒𝍆𝌩';
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, {}, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs().trim()).toBe('test');
    });

    it('should handle mixed content', async () => {
      const inputFile = path.join(testDir, 'mixed.asm');
      const content = `
        .glyph 𝌒𝍏𝌚𝌒𝍆𝌩
        PUSH #42
        MOV R1, R2
      `;
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, {}, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs()).toContain('test');
      expect(logs.getLogs()).toContain('20 2A 00');
      expect(logs.getLogs()).toContain('24 01 00 02 00');
    });

    it('should handle labels and comments', async () => {
      const inputFile = path.join(testDir, 'labels.asm');
      const content = `
        start:  ; This is a label
          PUSH #42  ; Push value
          MOV R1, R2  ; Move registers
      `;
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, {}, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs()).toContain('20 2A 00');
      expect(logs.getLogs()).toContain('24 01 00 02 00');
    });

    it('should handle memory references', async () => {
      const inputFile = path.join(testDir, 'memory.asm');
      const content = `
        LOAD R1, [R2]
        STORE R3, [R4]
      `;
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, {}, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs()).toContain('22 01 00 02 00');
      expect(logs.getLogs()).toContain('23 03 00 04 00');
    });

    it('should handle special registers', async () => {
      const inputFile = path.join(testDir, 'special.asm');
      const content = `
        MOV PC, SP
        MOV FP, SR
      `;
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, {}, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs()).toContain('24 1B 00 1C 00');
      expect(logs.getLogs()).toContain('24 1D 00 1E 00');
    });

    it('should handle jump instructions', async () => {
      const inputFile = path.join(testDir, 'jumps.asm');
      const content = `
        JMP 0x1000
        JEQ R1, R2, 0x2000
      `;
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, {}, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs()).toContain('10 00 10');
      expect(logs.getLogs()).toContain('11 01 00 02 00 00 20');
    });

    it('should error on invalid glyphs', async () => {
      const inputFile = path.join(testDir, 'invalid-glyph.asm');
      const content = '.glyph INVALID';
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, {}, logs.log, logs.errorLog);
      expect(code).toBe(1);
      expect(logs.getErrors()).toContain('Invalid tetragram glyphs');
    });

    it('should error on invalid instructions', async () => {
      const inputFile = path.join(testDir, 'invalid-inst.asm');
      const content = 'INVALID R1, R2';
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, {}, logs.log, logs.errorLog);
      expect(code).toBe(1);
      expect(logs.getErrors()).toContain('Unknown mnemonic');
    });

    it('should error on wrong operand count', async () => {
      const inputFile = path.join(testDir, 'wrong-operands.asm');
      const content = 'PUSH R1, R2'; // PUSH only takes 1 operand
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, {}, logs.log, logs.errorLog);
      expect(code).toBe(1);
      expect(logs.getErrors()).toContain('Invalid operand count');
    });

    it('should error on invalid operands', async () => {
      const inputFile = path.join(testDir, 'invalid-operands.asm');
      const content = 'MOV R1, INVALID';
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, {}, logs.log, logs.errorLog);
      expect(code).toBe(1);
      expect(logs.getErrors()).toContain('Invalid operand');
    });
  });

  describe('Disassembly Mode', () => {
    it('should disassemble tetragram glyphs', async () => {
      const inputFile = path.join(testDir, 'tetragram.txt');
      const content = '𝌒𝍏𝌚𝌒𝍆𝌩';
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, { disassemble: true }, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs()).toContain('Tetragram Disassembly');
      expect(logs.getLogs()).toContain('Decoded text: test');
      expect(logs.getLogs()).toContain('.glyph 𝌒𝍏𝌚𝌒𝍆𝌩');
    });

    it('should disassemble bytecode', async () => {
      const inputFile = path.join(testDir, 'bytecode.hex');
      const content = `54524954564D0100000003000000
20 2A 00
24 01 00 02 00
30`;
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, { disassemble: true }, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs()).toContain('TrinaryVM Bytecode Disassembly');
      expect(logs.getLogs()).toContain('PUSH    #42');
      expect(logs.getLogs()).toContain('MOV     R1, R2');
      expect(logs.getLogs()).toContain('HALT');
    });

    it('should handle disassembly with gas costs', async () => {
      const inputFile = path.join(testDir, 'bytecode-gas.hex');
      const content = `54524954564D0100000002000000
20 2A 00
30`;
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, { disassemble: true, showGas: true }, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs()).toContain('Gas: 1');
      expect(logs.getLogs()).toContain('Gas: 0');
    });

    it('should handle disassembly without addresses', async () => {
      const inputFile = path.join(testDir, 'bytecode-no-addr.hex');
      const content = `54524954564D0100000001000000
30`;
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, { disassemble: true, addresses: false }, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs()).toContain('HALT');
      expect(logs.getLogs()).not.toContain('0x');
    });

    it('should error on invalid bytecode header', async () => {
      const inputFile = path.join(testDir, 'invalid-bytecode.hex');
      const content = '4142434445464748494A4B4C4D4E4F50'; // "ABCDEFGHIJKLMNOP" in hex
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, { disassemble: true }, logs.log, logs.errorLog);
      expect(code).toBe(1);
      expect(logs.getErrors()).toContain('Invalid bytecode header');
    });

    it('should error on invalid hex string', async () => {
      const inputFile = path.join(testDir, 'invalid-hex.hex');
      const content = 'INVALID HEX STRING';
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, { disassemble: true }, logs.log, logs.errorLog);
      expect(code).toBe(1);
      expect(logs.getErrors()).toContain('Invalid hex string');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing input file', async () => {
      const inputFile = path.join(testDir, 'nonexistent.asm');
      const logs = captureLogs();
      const code = await asmMain(inputFile, {}, logs.log, logs.errorLog);
      expect(code).toBe(1);
      expect(logs.getErrors()).toContain('ENOENT');
    });

    it('should handle empty input file', async () => {
      const inputFile = path.join(testDir, 'empty.asm');
      fs.writeFileSync(inputFile, '');
      const logs = captureLogs();
      const code = await asmMain(inputFile, {}, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs().trim()).toBe('');
    });

    it('should handle file with only comments', async () => {
      const inputFile = path.join(testDir, 'comments-only.asm');
      const content = `
        ; This is a comment
        ; Another comment
      `;
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, {}, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs().trim()).toBe('');
    });
  });

  describe('Output Options', () => {
    it('should write to output file', async () => {
      const inputFile = path.join(testDir, 'output-test.asm');
      const outputFile = path.join(testDir, 'output.bin');
      const content = 'PUSH #42';
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, { output: outputFile }, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs()).toContain('Assembled');
      expect(fs.existsSync(outputFile)).toBe(true);
      expect(fs.readFileSync(outputFile, 'utf8')).toContain('20 2A 00');
    });

    it('should show verbose statistics', async () => {
      const inputFile = path.join(testDir, 'verbose-test.asm');
      const content = `
        .glyph 𝌆𝌊𝌒𝍏𝌚𝌒𝍆𝌩
        PUSH #42
        MOV R1, R2
      `;
      fs.writeFileSync(inputFile, content);
      const logs = captureLogs();
      const code = await asmMain(inputFile, { verbose: true }, logs.log, logs.errorLog);
      expect(code).toBe(0);
      expect(logs.getLogs()).toContain('Assembly Statistics');
      expect(logs.getLogs()).toContain('Input Lines:');
      expect(logs.getLogs()).toContain('Output Size:');
      expect(logs.getLogs()).toContain('Instructions:');
      expect(logs.getLogs()).toContain('Glyph Directives:');
    });
  });
}); 