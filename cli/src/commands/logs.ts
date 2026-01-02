import { Command, Flags } from '@oclif/core';

export default class Logs extends Command {
  static description = 'View logs and events from contracts or the network';

  static flags = {
    contract: Flags.string({ char: 'c', description: 'Contract address or name', required: false }),
    fromBlock: Flags.string({ description: 'Start block number or hash', required: false }),
    toBlock: Flags.string({ description: 'End block number or hash', required: false }),
    event: Flags.string({ description: 'Event name to filter', required: false }),
    network: Flags.string({ char: 'n', description: 'Network to use', required: false }),
    output: Flags.string({ char: 'o', description: 'Output file for logs', required: false }),
    follow: Flags.boolean({ description: 'Stream logs/events in real time', default: false }),
  };

  async run() {
    const { flags } = await this.parse(Logs);
    this.log(`(stub) Would fetch logs` +
      (flags.contract ? ` for contract: ${flags.contract}` : '') +
      (flags.event ? `, event: ${flags.event}` : '') +
      (flags.fromBlock ? `, fromBlock: ${flags.fromBlock}` : '') +
      (flags.toBlock ? `, toBlock: ${flags.toBlock}` : '') +
      (flags.network ? `, network: ${flags.network}` : '') +
      (flags.output ? `, output: ${flags.output}` : '') +
      (flags.follow ? ' (follow mode)' : ''));
    // TODO: Integrate with log/event fetching logic
  }
}
