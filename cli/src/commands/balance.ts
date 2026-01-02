import { Command, Flags } from '@oclif/core';

export default class Balance extends Command {
  static description = 'Query the balance of an account or contract';

  static flags = {
    address: Flags.string({ char: 'a', description: 'Account or contract address', required: true }),
    network: Flags.string({ char: 'n', description: 'Network to use', required: false }),
    output: Flags.string({ char: 'o', description: 'Output file for balance result', required: false }),
  };

  async run() {
    const { flags } = await this.parse(Balance);
    this.log(`(stub) Would query balance for address: ${flags.address}` +
      (flags.network ? `, network: ${flags.network}` : '') +
      (flags.output ? `, output: ${flags.output}` : ''));
    // TODO: Integrate with balance query logic
  }
}
