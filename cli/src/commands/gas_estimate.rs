//! Gas Estimation Command
//! 
//! Provides gas estimation tools for TritLang contracts, transactions, and homomorphic operations.
//! Includes tier selection advisor, compression savings calculator, and detailed cost breakdowns.

use trinaryvm_runtime::{
    gas_meter::GasMeter,
    homomorphic_gas::{HomomorphicGasMeter, HomomorphicOperation},
    gas_tiers::GasTier,
    instruction::Opcode,
    testnet_config::TestnetConfig,
};

/// Gas estimation result
#[derive(Debug, Clone, serde::Serialize)]
pub struct GasEstimate {
    /// Estimated total gas cost
    pub total_gas: u64,
    /// Recommended tier
    pub recommended_tier: String,
    /// Base gas (intrinsic)
    pub intrinsic_gas: u64,
    /// Execution gas
    pub execution_gas: u64,
    /// Homomorphic operation gas (if any)
    pub homomorphic_gas: u64,
    /// Breakdown by opcode type
    pub opcode_breakdown: Vec<OpcodeEstimate>,
    /// Compression savings (if tetragram-encoded)
    pub compression_savings: Option<CompressionSavings>,
}

/// Gas estimate for a specific opcode
#[derive(Debug, Clone, serde::Serialize)]
pub struct OpcodeEstimate {
    pub opcode: String,
    pub count: u64,
    pub total_gas: u64,
}

/// Compression savings information
#[derive(Debug, Clone, serde::Serialize)]
pub struct CompressionSavings {
    pub original_gas: u64,
    pub compressed_gas: u64,
    pub savings: u64,
    pub savings_percent: f64,
}

/// Gas estimation calculator
pub struct GasEstimator {
    config: TestnetConfig,
}

impl GasEstimator {
    /// Create new gas estimator with testnet config
    pub fn new() -> Self {
        Self {
            config: TestnetConfig::default(),
        }
    }
    
    /// Estimate gas for TritLang contract bytecode
    pub fn estimate_contract(&self, bytecode: &[u8], is_tetragram_compressed: bool) -> GasEstimate {
        // Calculate intrinsic gas
        let intrinsic_gas = GasMeter::calculate_intrinsic_gas(bytecode, is_tetragram_compressed);
        
        // Parse bytecode and estimate execution gas
        let mut execution_gas = 0u64;
        let mut homomorphic_gas = 0u64;
        let mut opcode_counts: std::collections::HashMap<Opcode, u64> = std::collections::HashMap::new();
        
        // Simple bytecode parsing (simplified - real implementation would be more sophisticated)
        let mut offset = 0;
        while offset < bytecode.len() {
            if let Ok(opcode) = Opcode::from_byte(bytecode[offset]) {
                let gas_cost = GasMeter::get_opcode_cost(&opcode);
                
                // Check if homomorphic operation
                if GasMeter::is_homomorphic_op(&opcode) {
                    // Estimate data size (default to 2187 trits)
                    let data_size = 2187;
                    let he_gas = GasMeter::calculate_homomorphic_gas(&opcode, data_size);
                    homomorphic_gas += he_gas;
                    execution_gas += he_gas;
                } else {
                    execution_gas += gas_cost;
                }
                
                *opcode_counts.entry(opcode).or_insert(0) += 1;
                
                // Move to next instruction (simplified - real parsing would handle args)
                offset += 1;
            } else {
                offset += 1; // Skip invalid bytes
            }
        }
        
        // Build opcode breakdown
        let opcode_breakdown: Vec<OpcodeEstimate> = opcode_counts
            .iter()
            .map(|(opcode, count)| {
                let gas = if GasMeter::is_homomorphic_op(opcode) {
                    GasMeter::calculate_homomorphic_gas(opcode, 2187) // Default size
                } else {
                    GasMeter::get_opcode_cost(opcode)
                };
                OpcodeEstimate {
                    opcode: format!("{:?}", opcode),
                    count: *count,
                    total_gas: gas * count,
                }
            })
            .collect();
        
        // Calculate compression savings if applicable
        let compression_savings = if is_tetragram_compressed {
            let original_gas = GasMeter::calculate_intrinsic_gas(bytecode, false);
            let compressed_gas = intrinsic_gas;
            let savings = original_gas.saturating_sub(compressed_gas);
            Some(CompressionSavings {
                original_gas,
                compressed_gas,
                savings,
                savings_percent: if original_gas > 0 {
                    (savings as f64 / original_gas as f64) * 100.0
                } else {
                    0.0
                },
            })
        } else {
            None
        };
        
        let total_gas = intrinsic_gas + execution_gas;
        let recommended_tier = GasTier::from_gas_limit(total_gas);
        
        GasEstimate {
            total_gas,
            recommended_tier: format!("{:?}", recommended_tier),
            intrinsic_gas,
            execution_gas,
            homomorphic_gas,
            opcode_breakdown,
            compression_savings,
        }
    }
    
    /// Estimate gas for a specific homomorphic operation
    pub fn estimate_homomorphic_op(
        &self,
        operation: HomomorphicOperation,
        data_size_trits: usize,
    ) -> u64 {
        HomomorphicGasMeter::calculate_gas_cost(operation, data_size_trits)
    }
    
    /// Calculate tetragram compression savings
    pub fn calculate_compression_savings(&self, data: &[u8]) -> CompressionSavings {
        let original_gas = GasMeter::calculate_intrinsic_gas(data, false);
        let compressed_gas = GasMeter::calculate_intrinsic_gas(data, true);
        let savings = original_gas.saturating_sub(compressed_gas);
        
        CompressionSavings {
            original_gas,
            compressed_gas,
            savings,
            savings_percent: if original_gas > 0 {
                (savings as f64 / original_gas as f64) * 100.0
            } else {
                0.0
            },
        }
    }
    
    /// Get tier recommendation for gas limit
    pub fn recommend_tier(&self, gas_limit: u64) -> GasTier {
        GasTier::from_gas_limit(gas_limit)
    }
    
    /// Get priority fee recommendation for tier
    pub fn recommend_priority_fee(&self, tier: GasTier) -> u64 {
        self.config.priority_fee_for_tier(tier)
    }
}

impl Default for GasEstimator {
    fn default() -> Self {
        Self::new()
    }
}

/// Format gas estimate as human-readable string
pub fn format_gas_estimate(estimate: &GasEstimate) -> String {
    let mut output = String::new();
    output.push_str("⛽ Gas Estimation Results\n");
    output.push_str("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
    output.push_str(&format!("Total Gas: {} ({:.3} {})\n", 
        estimate.total_gas,
        estimate.total_gas as f64 / if estimate.total_gas >= 1_000_000 { 1_000_000.0 } else { 1_000.0 },
        if estimate.total_gas >= 1_000_000 { "M" } else { "K" }));
    output.push_str(&format!("Recommended Tier: {}\n", estimate.recommended_tier));
    output.push_str(&format!("  Intrinsic Gas: {}\n", estimate.intrinsic_gas));
    output.push_str(&format!("  Execution Gas: {}\n", estimate.execution_gas));
    
    if estimate.homomorphic_gas > 0 {
        output.push_str(&format!("  Homomorphic Gas: {} ({:.1}% of execution)\n",
            estimate.homomorphic_gas,
            if estimate.execution_gas > 0 {
                (estimate.homomorphic_gas as f64 / estimate.execution_gas as f64) * 100.0
            } else {
                0.0
            }));
    }
    
    if let Some(ref savings) = estimate.compression_savings {
        output.push_str("\n📦 Compression Savings:\n");
        output.push_str(&format!("  Original: {} gas\n", savings.original_gas));
        output.push_str(&format!("  Compressed: {} gas\n", savings.compressed_gas));
        output.push_str(&format!("  Savings: {} gas ({:.1}%)\n", 
            savings.savings, savings.savings_percent));
    }
    
    if !estimate.opcode_breakdown.is_empty() {
        output.push_str("\n📊 Opcode Breakdown:\n");
        for op_est in &estimate.opcode_breakdown {
            let gas_per_op = if op_est.count > 0 {
                op_est.total_gas / op_est.count
            } else {
                0
            };
            output.push_str(&format!("  {}: {} ops × {} gas = {} gas\n",
                op_est.opcode, op_est.count, gas_per_op, op_est.total_gas));
        }
    }
    
    output
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_gas_estimation() {
        let estimator = GasEstimator::new();
        let bytecode = vec![
            Opcode::Nop.to_byte(),
            Opcode::Add.to_byte(),
            Opcode::Mul.to_byte(),
        ];
        
        let estimate = estimator.estimate_contract(&bytecode, false);
        assert!(estimate.total_gas > 0);
        assert!(estimate.intrinsic_gas > 0);
    }
    
    #[test]
    fn test_homomorphic_estimation() {
        let estimator = GasEstimator::new();
        
        let add_gas = estimator.estimate_homomorphic_op(HomomorphicOperation::HEAdd, 1000);
        assert_eq!(add_gas, 81 + 3); // Base 81 + 1 kilotrit * 3
        
        let mul_gas = estimator.estimate_homomorphic_op(HomomorphicOperation::HEMultiply, 5000);
        assert_eq!(mul_gas, 243 + 30); // Base 243 + 5 kilotrits * 6
        
        let bootstrap_gas = estimator.estimate_homomorphic_op(HomomorphicOperation::HEBootstrap, 1000);
        assert_eq!(bootstrap_gas, 729 + 9); // Base 729 + 1 kilotrit * 9
    }
    
    #[test]
    fn test_compression_savings() {
        let estimator = GasEstimator::new();
        let data = vec![0u8; 1000]; // 1KB of data
        
        let savings = estimator.calculate_compression_savings(&data);
        assert!(savings.savings > 0);
        assert!(savings.savings_percent > 0.0);
    }
    
    #[test]
    fn test_tier_recommendation() {
        let estimator = GasEstimator::new();
        
        assert_eq!(estimator.recommend_tier(500_000), GasTier::Tier3);
        assert_eq!(estimator.recommend_tier(1_500_000), GasTier::Tier6);
        assert_eq!(estimator.recommend_tier(5_000_000), GasTier::Tier9);
    }
}
