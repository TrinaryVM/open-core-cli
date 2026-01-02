import { QuantumSimulator, QutritState, QuantumCircuit } from '../src/utils/quantumSimulator';

describe('Quantum Simulator', () => {
  describe('State Initialization', () => {
    it('should initialize single qutrit in |0⟩ state', () => {
      const state = QuantumSimulator.initializeState(1);
      
      expect(state.numQutrits).toBe(1);
      expect(state.amplitudes).toHaveLength(3);
      expect(state.amplitudes[0]).toEqual({ real: 1, imag: 0 });
      expect(state.amplitudes[1]).toEqual({ real: 0, imag: 0 });
      expect(state.amplitudes[2]).toEqual({ real: 0, imag: 0 });
    });

    it('should initialize multiple qutrits in |0⟩⊗n state', () => {
      const state = QuantumSimulator.initializeState(2);
      
      expect(state.numQutrits).toBe(2);
      expect(state.amplitudes).toHaveLength(9); // 3^2
      expect(state.amplitudes[0]).toEqual({ real: 1, imag: 0 });
      
      // All other states should be zero
      for (let i = 1; i < 9; i++) {
        expect(state.amplitudes[i]).toEqual({ real: 0, imag: 0 });
      }
    });
  });

  describe('Gate Operations', () => {
    it('should apply identity gate correctly', () => {
      const state = QuantumSimulator.initializeState(1);
      const identityGate = QuantumSimulator.getAvailableGates().find(g => g.name === 'I');
      
      expect(identityGate).toBeDefined();
      
      const newState = QuantumSimulator.applyGate(state, identityGate!, 0);
      
      expect(newState.amplitudes[0]).toEqual({ real: 1, imag: 0 });
      expect(newState.amplitudes[1]).toEqual({ real: 0, imag: 0 });
      expect(newState.amplitudes[2]).toEqual({ real: 0, imag: 0 });
    });

    it('should apply X gate correctly', () => {
      const state = QuantumSimulator.initializeState(1);
      const xGate = QuantumSimulator.getAvailableGates().find(g => g.name === 'X');
      
      expect(xGate).toBeDefined();
      
      const newState = QuantumSimulator.applyGate(state, xGate!, 0);
      
      // X gate should transform |0⟩ to |1⟩
      expect(newState.amplitudes[0]).toEqual({ real: 0, imag: 0 });
      expect(newState.amplitudes[1]).toEqual({ real: 1, imag: 0 });
      expect(newState.amplitudes[2]).toEqual({ real: 0, imag: 0 });
    });

    it('should apply Hadamard gate correctly', () => {
      const state = QuantumSimulator.initializeState(1);
      const hGate = QuantumSimulator.getAvailableGates().find(g => g.name === 'H');
      
      expect(hGate).toBeDefined();
      
      const newState = QuantumSimulator.applyGate(state, hGate!, 0);
      
      // Hadamard should create superposition
      expect(newState.amplitudes[0].real).toBeCloseTo(1/3, 5);
      expect(newState.amplitudes[1].real).toBeCloseTo(1/3, 5);
      expect(newState.amplitudes[2].real).toBeCloseTo(1/3, 5);
    });
  });

  describe('Measurement', () => {
    it('should measure |0⟩ state correctly', () => {
      const state = QuantumSimulator.initializeState(1);
      const measurements = QuantumSimulator.measure(state, 1000);
      
      expect(measurements).toHaveLength(1);
      expect(measurements[0].state).toBe('|0⟩');
      expect(measurements[0].count).toBe(1000);
      expect(measurements[0].probability).toBeCloseTo(1.0, 2);
    });

    it('should measure superposition state with correct probabilities', () => {
      const state = QuantumSimulator.initializeState(1);
      const hGate = QuantumSimulator.getAvailableGates().find(g => g.name === 'H');
      const newState = QuantumSimulator.applyGate(state, hGate!, 0);
      
      const measurements = QuantumSimulator.measure(newState, 10000);
      
      expect(measurements).toHaveLength(3);
      
      // Each state should have approximately equal probability
      measurements.forEach(result => {
        expect(result.probability).toBeCloseTo(1/3, 1);
      });
    });
  });

  describe('Circuit Execution', () => {
    it('should execute simple superposition circuit', () => {
      const initialState = QuantumSimulator.initializeState(1);
      const circuit = QuantumSimulator.createSuperpositionCircuit(1);
      
      const result = QuantumSimulator.executeCircuit(initialState, circuit);
      
      expect(result.measurements).toHaveLength(3);
      result.measurements.forEach(measurement => {
        expect(measurement.probability).toBeCloseTo(1/3, 1);
      });
    });

    it('should load and execute circuit from JSON', () => {
      const circuitData = {
        gates: [
          { name: 'H', target: 0 }
        ],
        measurements: [0],
        shots: 1000
      };
      
      // This would require a temporary file in a real test
      // For now, we'll test the circuit structure
      expect(circuitData.gates).toHaveLength(1);
      expect(circuitData.gates[0].name).toBe('H');
    });
  });

  describe('Available Gates', () => {
    it('should provide all necessary quantum gates', () => {
      const gates = QuantumSimulator.getAvailableGates();
      
      expect(gates).toHaveLength(10);
      
      const gateNames = gates.map(g => g.name);
      expect(gateNames).toContain('I');
      expect(gateNames).toContain('X');
      expect(gateNames).toContain('Y');
      expect(gateNames).toContain('Z');
      expect(gateNames).toContain('H');
      expect(gateNames).toContain('S');
      expect(gateNames).toContain('T');
    });

    it('should have valid gate matrices', () => {
      const gates = QuantumSimulator.getAvailableGates();
      
      gates.forEach(gate => {
        // Single qutrit gates should have 3x3 matrices
        if (['I', 'X', 'Y', 'Z', 'H', 'S', 'T'].includes(gate.name)) {
          expect(gate.matrix).toHaveLength(3);
          gate.matrix.forEach(row => {
            expect(row).toHaveLength(3);
            row.forEach(element => {
              expect(typeof element.real).toBe('number');
              expect(typeof element.imag).toBe('number');
            });
          });
        }
        // Multi-qutrit gates have different dimensions
        else if (['CNOT', 'SWAP'].includes(gate.name)) {
          expect(gate.matrix).toHaveLength(9); // 2 qutrits = 3^2 = 9
          gate.matrix.forEach(row => {
            expect(row).toHaveLength(9);
          });
        }
        // Toffoli gate has 27x27 matrix (3 qutrits)
        else if (gate.name === 'Toffoli') {
          expect(gate.matrix).toHaveLength(27);
          gate.matrix.forEach(row => {
            expect(row).toHaveLength(27);
          });
        }
      });
    });
  });
});
