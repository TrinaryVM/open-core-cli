import { Command } from '@oclif/core';

export default class Update extends Command {
  static description = 'Update the TrinaryVM CLI and all installed plugins to the latest version';

  async run() {
    this.log('(stub) Would update TrinaryVM CLI and all plugins to the latest version');
    // TODO: Integrate with self-update and plugin update logic
  }
}
