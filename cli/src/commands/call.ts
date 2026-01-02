import { Command, Flags } from '@oclif/core';

export default class Call extends Command {
  static description = 'Call a read-only/view function on a deployed contract';

  static flags = {
    contract: Flags.string({ char: 'c', description: 'Contract name or address', required: true }),
    function: Flags.string({ char: 'f', description: 'Function to call', required: true }),
    args: Flags.string({ description: 'Arguments for function (comma-separated)', required: false }),
    network: Flags.string({ char: 'n', description: 'Network to use', required: false }),
    from: Flags.string({ description: 'Caller address', required: false }),
    output: Flags.string({ char: 'o', description: 'Output file for call result', required: false }),
  };

  async run() {
    const { flags } = await this.parse(Call);
    this.log(`(stub) Would call function: ${flags.function} on contract: ${flags.contract}` +
      (flags.args ? `, args: ${flags.args}` : '') +
      (flags.network ? `, network: ${flags.network}` : '') +
      (flags.from ? `, from: ${flags.from}` : '') +
      (flags.output ? `, output: ${flags.output}` : ''));
    // TODO: Integrate with contract call logic
  }
}
