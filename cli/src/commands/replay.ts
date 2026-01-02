import { Command, Flags } from '@oclif/core';

export default class Replay extends Command {
  static description = 'Replay a historical transaction or execution trace for debugging';

  static flags = {
    tx: Flags.string({ description: 'Transaction hash to replay', required: true }),
    from: Flags.string({ description: 'Override sender address', required: false }),
    gas: Flags.integer({ description: 'Override gas limit', required: false }),
    output: Flags.string({ char: 'o', description: 'Output replay report file', required: false }),
  };

  async run() {
    const { flags } = await this.parse(Replay);
    this.log(`(stub) Would replay transaction: ${flags.tx}` +
      (flags.from ? `, from: ${flags.from}` : '') +
      (flags.gas ? `, gas: ${flags.gas}` : '') +
      (flags.output ? `, output: ${flags.output}` : ''));
    // TODO: Integrate with replay logic
  }
}
