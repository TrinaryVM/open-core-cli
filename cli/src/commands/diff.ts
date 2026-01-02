import { Command, Flags } from '@oclif/core';

export default class Diff extends Command {
  static description = 'Show state diffs between contract/account states or blocks';

  static flags = {
    from: Flags.string({ description: 'Start state (block number/hash or state file)', required: true }),
    to: Flags.string({ description: 'End state (block number/hash or state file)', required: true }),
    contract: Flags.string({ char: 'c', description: 'Contract address or name to diff', required: false }),
    output: Flags.string({ char: 'o', description: 'Output file for diff result', required: false }),
    format: Flags.string({ description: 'Diff output format (text, json)', default: 'text' }),
  };

  async run() {
    const { flags } = await this.parse(Diff);
    this.log(`(stub) Would diff state from: ${flags.from} to: ${flags.to}` +
      (flags.contract ? `, contract: ${flags.contract}` : '') +
      (flags.output ? `, output: ${flags.output}` : '') +
      `, format: ${flags.format}`);
    // TODO: Integrate with state diffing logic
  }
}
