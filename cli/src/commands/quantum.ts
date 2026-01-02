import { Command, Flags } from '@oclif/core';
import { QuantumSimulator, QutritState, QuantumCircuit } from '../utils/quantumSimulator';
import * as fs from 'fs';
import * as path from 'path';

export default class Quantum extends Command {
  static description = 'Quantum Qutrit Simulator for ternary quantum computation';

  static examples = [
    '<%= config.bin %> <%= command.id %> --circuit quantum_circuit.json',
    '<%= config.bin %> <%= command.id %> --init --qutrits 3',
    '<%= config.bin %> <%= command.id %> --measure --shots 1000',
  ];

  static flags = {
    init: Flags.boolean({
      char: 'i',
      description: 'Initialize quantum state',
    }),
    qutrits: Flags.integer({
      char: 'q',
      description: 'Number of qutrits to initialize',
      default: 1,
    }),
    circuit: Flags.string({
      char: 'c',
      description: 'Path to quantum circuit JSON file',
    }),
    measure: Flags.boolean({
      char: 'm',
      description: 'Measure quantum state',
    }),
    shots: Flags.integer({
      char: 's',
      description: 'Number of measurement shots',
      default: 1000,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file for results',
    }),
    help: Flags.help({ char: 'h' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Quantum);
    
    this.log('🌌 TrinaryVM Quantum Qutrit Simulator');
    this.log('⚛️  Ternary quantum computation with 3-state qutrits');
    
    try {
      let state: QutritState | null = null;
      let circuit: QuantumCircuit | null = null;
      
      // Initialize quantum state
      if (flags.init) {
        this.log(`🔬 Initializing ${flags.qutrits} qutrit(s)`);
        state = QuantumSimulator.initializeState(flags.qutrits);
        this.log(`✅ Initialized ${flags.qutrits} qutrit(s) in |0⟩ state`);
        this.log(`📊 Quantum state: |0⟩⊗${flags.qutrits}`);
        this.log(`🔢 State dimension: ${Math.pow(3, flags.qutrits)}`);
      }
      
      // Load quantum circuit
      if (flags.circuit) {
        if (!fs.existsSync(flags.circuit)) {
          this.error(`❌ Circuit file not found: ${flags.circuit}`);
        }
        this.log(`📋 Loading circuit: ${path.basename(flags.circuit)}`);
        circuit = QuantumSimulator.loadCircuit(flags.circuit);
        this.log(`🔧 Circuit loaded with ${circuit.gates.length} gates`);
      }
      
      // Execute circuit if available
      if (circuit && state) {
        this.log('🚀 Executing quantum circuit...');
        const result = QuantumSimulator.executeCircuit(state, circuit);
        state = result.finalState;
        this.log(`✅ Circuit executed successfully`);
      }
      
      // Perform measurements
      if (flags.measure && state) {
        this.log(`📊 Measuring quantum state (${flags.shots} shots)`);
        const measurements = QuantumSimulator.measure(state, flags.shots);
        
        this.log('📈 Measurement results:');
        measurements.forEach(result => {
          this.log(`   ${result.state}: ${result.count} (${(result.probability * 100).toFixed(1)}%)`);
        });
        
        // Save results if output specified
        if (flags.output) {
          const results = {
            shots: flags.shots,
            measurements: measurements,
            timestamp: new Date().toISOString()
          };
          fs.writeFileSync(flags.output, JSON.stringify(results, null, 2));
          this.log(`💾 Results saved to: ${flags.output}`);
        }
      }
      
      // Show available gates if no specific operation
      if (!flags.init && !flags.circuit && !flags.measure) {
        this.log('🔧 Available quantum gates:');
        const gates = QuantumSimulator.getAvailableGates();
        gates.forEach(gate => {
          this.log(`   ${gate.name}: ${gate.description}`);
        });
        
        this.log('\n📝 Example usage:');
        this.log('   trinaryvm quantum --init --qutrits 2');
        this.log('   trinaryvm quantum --circuit circuit.json --measure --shots 1000');
        this.log('   trinaryvm quantum --init --qutrits 1 --measure --shots 500');
      }
      
      this.log('🎯 Quantum simulation completed');
      
    } catch (error: any) {
      this.error(`❌ Quantum simulation error: ${error.message}`);
    }
  }
}
