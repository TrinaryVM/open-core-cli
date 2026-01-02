import { Command, Flags } from '@oclif/core';

export default class Verify extends Command {
  static description = 'Verify a deployed contract\'s source code and bytecode on the network explorer';

  static flags = {
    contract: Flags.string({ char: 'c', description: 'Contract address', required: true }),
    source: Flags.string({ char: 's', description: 'Path to source file', required: true }),
    network: Flags.string({ char: 'n', description: 'Network to use', required: false }),
    output: Flags.string({ char: 'o', description: 'Output file for verification result', required: false }),
  };

  async run() {
    const { flags } = await this.parse(Verify);
    this.log(`(stub) Would verify contract: ${flags.contract} with source: ${flags.source}` +
      (flags.network ? `, network: ${flags.network}` : '') +
      (flags.output ? `, output: ${flags.output}` : ''));
    // TODO: Integrate with contract verification logic
  }
}
