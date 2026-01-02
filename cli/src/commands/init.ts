import { Command, Flags } from '@oclif/core';
import * as fs from 'fs';
import * as path from 'path';

export default class Init extends Command {
  static description = 'Scaffold a new TrinaryVM project with recommended structure';

  static flags = {
    dir: Flags.string({ char: 'd', description: 'Directory to initialize project in', required: false }),
    template: Flags.string({ char: 't', description: 'Project template (e.g. basic, token, dapp)', required: false }),
    force: Flags.boolean({ description: 'Force overwrite if directory is not empty', default: false }),
  };

  async run() {
    const { flags } = await this.parse(Init);
    const targetDir = flags.dir ? path.resolve(flags.dir) : process.cwd();
    this.log(`(stub) Would scaffold new TrinaryVM project in: ${targetDir}` +
      (flags.template ? `, template: ${flags.template}` : '') +
      (flags.force ? ' (force overwrite enabled)' : ''));
    // TODO: Implement project scaffolding logic
  }
}
