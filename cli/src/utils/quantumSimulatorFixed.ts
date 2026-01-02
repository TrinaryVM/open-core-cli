import * as fs from 'fs';
import * as path from 'path';

export interface QutritState {
  amplitudes: ComplexNumber[];
  numQutrits: number;
}

export interface ComplexNumber {
  real: number;
  imag: number;
}

export interface QuantumGate {
  name: string;
  matrix: ComplexNumber[][];
  description: string;
  target?: number;
}

export interface QuantumCircuit {
  gates: Array<{ name: string; target?: number }>;
  measurements: number[];
  shots: number;
}

export interface MeasurementResult {
  state: string;
  count: number;
  probability: number;
}

export class QuantumSimulator {
  private static readonly GATES: { [key: string]: QuantumGate } = {
    // Single qutrit gates
    'I': {
      name: 'I',
      matrix: [
        [{ real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
        [{ real: 0, imag: 0 }, { real: 1, imag: 0 }, { real: 0, imag: 0 }],
        [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 1, imag: 0 }]
      ],
      description: 'Identity gate (no operation)'
    },
    'X': {
      name: 'X',
      matrix: [
        [{ real: 0, imag: 0 }, { real: 1, imag: 0 }, { real: 0, imag: 0 }],
        [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 1, imag: 0 }],
        [{ real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }]
      ],
      description: 'Ternary Pauli-X gate (cyclic permutation)'
    },
    'Y': {
      name: 'Y',
      matrix: [
        [{ real: 0, imag: 0 }, { real: 0, imag: -1 }, { real: 0, imag: 0 }],
        [{ real: 0, imag: 1 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
        [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }]
      ],
      description: 'Ternary Pauli-Y gate'
    },
    'Z': {
      name: 'Z',
      matrix: [
        [{ real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
        [{ real: 0, imag: 0 }, { real: -0.5, imag: 0.866 }, { real: 0, imag: 0 }],
        [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: -0.5, imag: -0.866 }]
      ],
      description: 'Ternary Pauli-Z gate (phase rotations)'
    },
    'H': {
      name: 'H',
      matrix: [
        [{ real: 1/3, imag: 0 }, { real: 1/3, imag: 0 }, { real: 1/3, imag: 0 }],
        [{ real: 1/3, imag: 0 }, { real: -1/3, imag: 0 }, { real: 1/3, imag: 0 }],
        [{ real: 1/3, imag: 0 }, { real: 1/3, imag: 0 }, { real: -1/3, imag: 0 }]
      ],
      description: 'Ternary Hadamard gate (superposition creation)'
    },
    'S': {
      name: 'S',
      matrix: [
        [{ real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
        [{ real: 0, imag: 0 }, { real: 0, imag: 1 }, { real: 0, imag: 0 }],
        [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: -1, imag: 0 }]
      ],
      description: 'Ternary S gate (phase gate)'
    },
    'T': {
      name: 'T',
      matrix: [
        [{ real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
        [{ real: 0, imag: 0 }, { real: 0.5, imag: 0.866 }, { real: 0, imag: 0 }],
        [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: -0.5, imag: 0.866 }]
      ],
      description: 'Ternary T gate (π/3 phase)'
    }
  };

  /**
   * Initialize quantum state with specified number of qutrits
   */
  static initializeState(numQutrits: number): QutritState {
    const dimension = Math.pow(3, numQutrits);
    const amplitudes: ComplexNumber[] = new Array(dimension);
    
    // Initialize all qutrits in |0⟩ state
    amplitudes[0] = { real: 1, imag: 0 };
    for (let i = 1; i < dimension; i++) {
      amplitudes[i] = { real: 0, imag: 0 };
    }
    
    return {
      amplitudes,
      numQutrits
    };
  }

  /**
   * Apply a quantum gate to the state
   */
  static applyGate(state: QutritState, gate: QuantumGate, targetQutrit: number): QutritState {
    const newState = { ...state, amplitudes: [...state.amplitudes] };
    const dimension = Math.pow(3, state.numQutrits);
    
    // Apply single-qutrit gate
    for (let i = 0; i < dimension; i++) {
      const qutritValue = Math.floor(i / Math.pow(3, targetQutrit)) % 3;
      const newAmplitude = { real: 0, imag: 0 };
      
      for (let j = 0; j < 3; j++) {
        const gateElement = gate.matrix[qutritValue][j];
        const baseIndex = i - qutritValue * Math.pow(3, targetQutrit);
        const targetIndex = baseIndex + j * Math.pow(3, targetQutrit);
        
        if (targetIndex >= 0 && targetIndex < dimension) {
          const currentAmplitude = state.amplitudes[targetIndex];
          
          newAmplitude.real += gateElement.real * currentAmplitude.real - gateElement.imag * currentAmplitude.imag;
          newAmplitude.imag += gateElement.real * currentAmplitude.imag + gateElement.imag * currentAmplitude.real;
        }
      }
      
      newState.amplitudes[i] = newAmplitude;
    }
    
    return newState;
  }

  /**
   * Measure the quantum state
   */
  static measure(state: QutritState, shots: number = 1000): MeasurementResult[] {
    const dimension = Math.pow(3, state.numQutrits);
    const probabilities: number[] = new Array(dimension);
    const results: MeasurementResult[] = [];
    
    // Calculate probabilities
    for (let i = 0; i < dimension; i++) {
      const amplitude = state.amplitudes[i];
      probabilities[i] = amplitude.real * amplitude.real + amplitude.imag * amplitude.imag;
    }
    
    // Simulate measurements
    const counts: number[] = new Array(dimension).fill(0);
    for (let shot = 0; shot < shots; shot++) {
      const random = Math.random();
      let cumulative = 0;
      
      for (let i = 0; i < dimension; i++) {
        cumulative += probabilities[i];
        if (random <= cumulative) {
          counts[i]++;
          break;
        }
      }
    }
    
    // Convert to results
    for (let i = 0; i < dimension; i++) {
      if (counts[i] > 0) {
        const stateString = this.indexToStateString(i, state.numQutrits);
        results.push({
          state: stateString,
          count: counts[i],
          probability: counts[i] / shots
        });
      }
    }
    
    return results.sort((a, b) => b.count - a.count);
  }

  /**
   * Convert state index to string representation
   */
  private static indexToStateString(index: number, numQutrits: number): string {
    let stateString = '|';
    let temp = index;
    
    for (let i = 0; i < numQutrits; i++) {
      stateString += temp % 3;
      temp = Math.floor(temp / 3);
    }
    
    return stateString + '⟩';
  }

  /**
   * Load quantum circuit from JSON file
   */
  static loadCircuit(filePath: string): QuantumCircuit {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Circuit file not found: ${filePath}`);
    }
    
    const circuitData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return {
      gates: circuitData.gates || [],
      measurements: circuitData.measurements || [],
      shots: circuitData.shots || 1000
    };
  }

  /**
   * Execute a quantum circuit
   */
  static executeCircuit(initialState: QutritState, circuit: QuantumCircuit): { finalState: QutritState; measurements: MeasurementResult[] } {
    let currentState = { ...initialState };
    
    // Apply gates
    for (const gateData of circuit.gates) {
      const gate = this.GATES[gateData.name];
      if (!gate) {
        throw new Error(`Unknown gate: ${gateData.name}`);
      }
      
      currentState = this.applyGate(currentState, gate, gateData.target || 0);
    }
    
    // Perform measurements
    const measurements = this.measure(currentState, circuit.shots);
    
    return {
      finalState: currentState,
      measurements
    };
  }

  /**
   * Get available gates
   */
  static getAvailableGates(): QuantumGate[] {
    return Object.values(this.GATES);
  }

  /**
   * Create a simple superposition circuit
   */
  static createSuperpositionCircuit(numQutrits: number): QuantumCircuit {
    return {
      gates: [
        { name: 'H', target: 0 }
      ],
      measurements: [0],
      shots: 1000
    };
  }

  /**
   * Create a Bell state circuit (entanglement)
   */
  static createBellStateCircuit(): QuantumCircuit {
    return {
      gates: [
        { name: 'H', target: 0 },
        { name: 'X', target: 1 }
      ],
      measurements: [0, 1],
      shots: 1000
    };
  }
}
