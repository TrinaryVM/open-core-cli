import { Command, Flags } from '@oclif/core';

export default class Send extends Command {
  static description = 'Send a transaction to invoke a state-changing function on a deployed contract';

  static flags = {
    contract: Flags.string({ char: 'c', description: 'Contract name or address', required: true }),
    function: Flags.string({ char: 'f', description: 'Function to invoke', required: true }),
    args: Flags.string({ description: 'Arguments for function (comma-separated)', required: false }),
    network: Flags.string({ char: 'n', description: 'Network to use', required: false }),
    from: Flags.string({ description: 'Sender address', required: false }),
    value: Flags.string({ description: 'Value to send (if applicable)', required: false }),
    gas: Flags.integer({ description: 'Gas limit for transaction', required: false }),
    output: Flags.string({ char: 'o', description: 'Output file for transaction result', required: false }),
  };

  async run() {
    const { flags } = await this.parse(Send);
    this.log(`(stub) Would send transaction to function: ${flags.function} on contract: ${flags.contract}` +
      (flags.args ? `, args: ${flags.args}` : '') +
      (flags.network ? `, network: ${flags.network}` : '') +
      (flags.from ? `, from: ${flags.from}` : '') +
      (flags.value ? `, value: ${flags.value}` : '') +
      (flags.gas ? `, gas: ${flags.gas}` : '') +
      (flags.output ? `, output: ${flags.output}` : ''));
    // TODO: Integrate with contract send logic
  }
}
