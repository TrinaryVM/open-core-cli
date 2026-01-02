import { Command, Flags } from '@oclif/core';

export default class Faucet extends Command {
  static description = 'Request testnet tokens from the faucet';

  static flags = {
    address: Flags.string({ char: 'a', description: 'Recipient address', required: true }),
    network: Flags.string({ char: 'n', description: 'Network to use (e.g. testnet)', required: false }),
    amount: Flags.string({ char: 'm', description: 'Amount to request (optional)', required: false }),
    output: Flags.string({ char: 'o', description: 'Output file for faucet result', required: false }),
  };

  async run() {
    const { flags } = await this.parse(Faucet);
    this.log(`(stub) Would request faucet tokens for address: ${flags.address}` +
      (flags.network ? `, network: ${flags.network}` : '') +
      (flags.amount ? `, amount: ${flags.amount}` : '') +
      (flags.output ? `, output: ${flags.output}` : ''));
    // TODO: Integrate with faucet logic
  }
}
