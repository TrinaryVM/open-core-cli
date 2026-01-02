import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

describe('asm command', () => {
  const cliPath = path.resolve(__dirname, '../../bin/trinaryvm');
  
  beforeAll(() => {
    // Ensure the CLI is built
    if (!fs.existsSync(cliPath)) {
      throw new Error('CLI not built. Run build first.');
    }
  });

  it('should show help message', async () => {
    const { stdout } = await execAsync(`${cliPath} --help`);
    expect(stdout).toContain('Assemble or disassemble TrinaryVM assembly code');
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('Options:');
  });

  it('should process a simple assembly file', async () => {
    // Create a temporary test file with valid tetragram glyphs for "test"
    const testFile = path.resolve(__dirname, 'test.asm');
    const testContent = `.glyph 𝌆𝌊𝌒𝍏𝌚𝌒𝍆𝌩\n`;
    fs.writeFileSync(testFile, testContent);

    try {
      const { stdout } = await execAsync(`${cliPath} ${testFile}`);
      expect(stdout).toBeTruthy();
      expect(stdout.trim()).toBe('test'); // Should output the decoded text
    } finally {
      // Cleanup
      fs.unlinkSync(testFile);
    }
  });

  it('should handle invalid glyphs', async () => {
    const testFile = path.resolve(__dirname, 'invalid.asm');
    const testContent = `.glyph invalid\n`;
    fs.writeFileSync(testFile, testContent);

    try {
      await expect(execAsync(`${cliPath} ${testFile}`))
        .rejects
        .toThrow();
    } finally {
      fs.unlinkSync(testFile);
    }
  });

  it('should handle missing file', async () => {
    await expect(execAsync(`${cliPath} nonexistent.asm`))
      .rejects
      .toThrow();
  });
}); 