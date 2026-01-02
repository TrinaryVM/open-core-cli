import { Command } from '@oclif/core';

export default class Help extends Command {
  static description = 'Show help and usage information for the TrinaryVM CLI and its commands';

  async run() {
    this.log('🧭 TrinaryVM CLI Help');
    this.log('');
    this.log('Usage: trinaryvm <command> [options]');
    this.log('');
    this.log('Available commands:');
    this.log('  run           - Execute a compiled .tritvm file');
    this.log('  compile       - Compile TritLang source to bytecode');
    this.log('  debug         - Launch VM in debug mode');
    this.log('  encode        - Encode text using tetragram cipher');
    this.log('  decode        - Decode tetragram cipher text');
    this.log('  asm           - Assemble/disassemble TrinaryVM assembly');
    this.log('  trace         - Trace execution of a .tritvm file or transaction');
    this.log('  profile       - Profile gas usage of a .tritvm file or function');
    this.log('  test          - Run tests for TritLang contracts and TrinaryVM bytecode');
    this.log('  coverage      - Collect and report code coverage');
    this.log('  deploy        - Deploy contracts to a network');
    this.log('  simulate      - Simulate contract calls/transactions');
    this.log('  replay        - Replay historical transactions');
    this.log('  analyze       - Static analysis/security audit');
    this.log('  doctor        - System diagnostics');
    this.log('  config        - Manage CLI/network config');
    this.log('  call          - Call a read-only contract function');
    this.log('  send          - Send a transaction to a contract');
    this.log('  balance       - Query account/contract balance');
    this.log('  faucet        - Request testnet tokens');
    this.log('  network       - Start/status for local devnet');
    this.log('  init          - Project scaffolding');
    this.log('  verify        - Contract verification/formal checks');
    this.log('  migrate       - Deployment workflow');
    this.log('  logs          - View logs/events');
    this.log('  diff          - State diffing');
    this.log('  scan-deps     - Dependency scanner');
    this.log('  gas-report    - Detailed gas analysis');
    this.log('  bridge        - Cross-chain bridge operations');
    this.log('  encode-glyphs - Encode data as tetragram glyphs');
    this.log('  decode-glyphs - Decode tetragram glyphs');
    this.log('  fuzz          - Fuzz testing');
    this.log('  check         - Project/contract checks');
    this.log('  audit         - Security audit');
    this.log('  plugin        - Plugin management');
    this.log('  update        - Self-update');
    this.log('  help          - Show this help message');
    this.log('');
    this.log('Use trinaryvm <command> --help for more information on a specific command.');
    this.log('');
    this.log('> "The heavens, earth, and people demand consistency."');
    this.log('  — HK-47, superior droid and architect of functional brilliance');
  }
}
