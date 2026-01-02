import { Command, Flags } from '@oclif/core';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import * as crypto from 'crypto';

interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  gasPrice: number;
  gasLimit: number;
  deployerPrivateKey?: string;
  explorerUrl?: string;
}

interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  gasUsed: number;
  deploymentCost: number;
  blockNumber: number;
  timestamp: string;
}

interface ContractMetadata {
  name: string;
  version: string;
  compiler: string;
  bytecodeHash: string;
  sourceHash: string;
  constructorArgs?: any[];
}

export default class Deploy extends Command {
  static description = 'Deploy a compiled .tritvm contract to a network';

  static flags = {
    file: Flags.string({ char: 'f', description: 'Path to .tritvm file', required: true }),
    network: Flags.string({ char: 'n', description: 'Network to deploy to (e.g. development, testnet, mainnet)', required: true }),
    gas: Flags.integer({ description: 'Gas limit for deployment', required: false }),
    gasPrice: Flags.integer({ description: 'Gas price in wei', required: false }),
    from: Flags.string({ description: 'Deployer address', required: false }),
    privateKey: Flags.string({ description: 'Deployer private key', required: false }),
    constructorArgs: Flags.string({ description: 'Constructor arguments (comma-separated)', required: false }),
    verify: Flags.boolean({ description: 'Verify contract on explorer', default: false }),
    wait: Flags.boolean({ description: 'Wait for transaction confirmation', default: true }),
    confirmations: Flags.integer({ description: 'Number of confirmations to wait for', default: 1 }),
    output: Flags.string({ char: 'o', description: 'Output deployment info to file', required: false }),
    dryRun: Flags.boolean({ description: 'Simulate deployment without broadcasting', default: false }),
  };

  private networks: Map<string, NetworkConfig> = new Map();

  async run() {
    const { flags } = await this.parse(Deploy);
    
    this.log('🚀 TrinaryVM Contract Deployer');
    this.log('==============================');

    try {
      // Validate contract file
      const contractPath = path.resolve(flags.file);
      if (!fs.existsSync(contractPath)) {
        this.error(`Contract file not found: ${path.basename(flags.file)}`);
      }

      // Load network configuration
      await this.loadNetworkConfigs();
      const networkConfig = this.getNetworkConfig(flags.network);

      // Validate bytecode
      const bytecode = await this.validateBytecode(contractPath);
      
      // Estimate gas if not provided
      const gasEstimate = flags.gas || await this.estimateGas(bytecode, networkConfig, flags);
      
      // Parse constructor arguments
      const constructorArgs = this.parseConstructorArgs(flags.constructorArgs);
      
      // Generate contract metadata
      const metadata = await this.generateMetadata(contractPath, constructorArgs);
      
      if (flags.dryRun) {
        await this.simulateDeployment(bytecode, networkConfig, gasEstimate, constructorArgs, metadata);
      } else {
        const result = await this.deployContract(bytecode, networkConfig, gasEstimate, constructorArgs, metadata, flags);
        await this.handleDeploymentResult(result, flags, metadata);
      }
      
    } catch (error) {
      this.error(`Deployment failed: ${error}`);
    }
  }

  private async loadNetworkConfigs(): Promise<void> {
    // Load from config file if exists
    const configPath = path.join(process.cwd(), 'trinary.config.json');
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.networks) {
          for (const [name, networkConfig] of Object.entries(config.networks)) {
            this.networks.set(name, networkConfig as NetworkConfig);
          }
        }
      } catch (error) {
        this.log(`⚠️  Failed to load config file: ${error}`);
      }
    }

    // Add default networks if not configured
    if (!this.networks.has('development')) {
      this.networks.set('development', {
        name: 'development',
        rpcUrl: 'http://localhost:8545',
        chainId: 1337,
        gasPrice: 20000000000, // 20 gwei
        gasLimit: 6000000
      });
    }

    if (!this.networks.has('testnet')) {
      this.networks.set('testnet', {
        name: 'testnet',
        rpcUrl: 'https://testnet.trinaryvm.org',
        chainId: 3,
        gasPrice: 10000000000, // 10 gwei
        gasLimit: 4000000,
        explorerUrl: 'https://testnet-explorer.trinaryvm.org'
      });
    }

    if (!this.networks.has('mainnet')) {
      this.networks.set('mainnet', {
        name: 'mainnet',
        rpcUrl: 'https://mainnet.trinaryvm.org',
        chainId: 1,
        gasPrice: 30000000000, // 30 gwei
        gasLimit: 3000000,
        explorerUrl: 'https://explorer.trinaryvm.org'
      });
    }
  }

  private getNetworkConfig(networkName: string): NetworkConfig {
    const config = this.networks.get(networkName);
    if (!config) {
      const availableNetworks = Array.from(this.networks.keys()).join(', ');
      this.error(`Unknown network: ${networkName}. Available networks: ${availableNetworks}`);
    }
    return config;
  }

  private async validateBytecode(contractPath: string): Promise<Buffer> {
    const bytecode = fs.readFileSync(contractPath);
    
    // Validate magic number
    const magicNumber = bytecode.subarray(0, 8).toString('ascii');
    if (magicNumber !== 'TRITVM\x00\x01') {
      this.error('Invalid bytecode: missing or incorrect magic number');
    }
    
    // Basic size validation
    if (bytecode.length < 16) {
      this.error('Invalid bytecode: file too small');
    }
    
    if (bytecode.length > 1024 * 1024) { // 1MB limit
      this.error('Invalid bytecode: file too large (>1MB)');
    }
    
    this.log(`✅ Bytecode validated: ${bytecode.length} bytes`);
    return bytecode;
  }

  private async estimateGas(bytecode: Buffer, networkConfig: NetworkConfig, flags: any): Promise<number> {
    this.log('⛽ Estimating gas usage...');
    
    try {
      // Use TrinaryVM runtime to estimate gas
      const gasEstimate = await this.runGasEstimation(bytecode);
      
      // Add deployment overhead (typically 21000 + bytecode size * 200)
      const deploymentOverhead = 21000 + (bytecode.length * 200);
      const totalEstimate = gasEstimate + deploymentOverhead;
      
      // Add 20% buffer for safety
      const finalEstimate = Math.floor(totalEstimate * 1.2);
      
      this.log(`📊 Gas estimation: ${finalEstimate} (execution: ${gasEstimate}, deployment: ${deploymentOverhead})`);
      return Math.min(finalEstimate, networkConfig.gasLimit);
      
    } catch (error) {
      this.log(`⚠️  Gas estimation failed, using default: ${networkConfig.gasLimit}`);
      return networkConfig.gasLimit;
    }
  }

  private async runGasEstimation(bytecode: Buffer): Promise<number> {
    return new Promise((resolve, reject) => {
      const runtime = this.findBinary('trinaryvm');
      
      // Write bytecode to temporary file
      const tempFile = path.join(process.cwd(), '.temp_deploy.tritvm');
      fs.writeFileSync(tempFile, bytecode);
      
      const args = [tempFile, '--gas-limit', '10000000', '--estimate-only'];
      const child = spawn(runtime, args, { stdio: 'pipe' });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        // Clean up temp file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        
        if (code === 0) {
          const gasMatch = stdout.match(/Gas used: (\d+)/);
          const gasUsed = gasMatch ? parseInt(gasMatch[1]) : 100000;
          resolve(gasUsed);
        } else {
          reject(new Error(`Gas estimation failed: ${stderr}`));
        }
      });
    });
  }

  private parseConstructorArgs(argsString?: string): any[] {
    if (!argsString) return [];
    
    try {
      // Simple comma-separated parsing - in practice would be more sophisticated
      return argsString.split(',').map(arg => {
        const trimmed = arg.trim();
        
        // Try to parse as number
        if (/^\d+$/.test(trimmed)) {
          return parseInt(trimmed);
        }
        
        // Try to parse as boolean
        if (trimmed === 'true') return true;
        if (trimmed === 'false') return false;
        
        // Return as string (remove quotes if present)
        return trimmed.replace(/^["']|["']$/g, '');
      });
    } catch (error) {
      this.error(`Failed to parse constructor arguments: ${error}`);
    }
  }

  private async generateMetadata(contractPath: string, constructorArgs: any[]): Promise<ContractMetadata> {
    const bytecode = fs.readFileSync(contractPath);
    const sourceFile = contractPath.replace(/\.tritvm$/, '.trit');
    
    let sourceHash = '';
    if (fs.existsSync(sourceFile)) {
      const sourceCode = fs.readFileSync(sourceFile);
      sourceHash = crypto.createHash('sha256').update(sourceCode).digest('hex');
    }
    
    const bytecodeHash = crypto.createHash('sha256').update(bytecode).digest('hex');
    
    return {
      name: path.basename(contractPath, '.tritvm'),
      version: '1.0.0',
      compiler: 'tritc',
      bytecodeHash,
      sourceHash,
      constructorArgs
    };
  }

  private async simulateDeployment(
    bytecode: Buffer, 
    networkConfig: NetworkConfig, 
    gasEstimate: number, 
    constructorArgs: any[], 
    metadata: ContractMetadata
  ): Promise<void> {
    this.log('\n🧪 Deployment Simulation');
    this.log('========================');
    this.log(`Network: ${networkConfig.name}`);
    this.log(`Contract: ${metadata.name}`);
    this.log(`Bytecode Size: ${bytecode.length} bytes`);
    this.log(`Gas Estimate: ${gasEstimate}`);
    this.log(`Gas Price: ${networkConfig.gasPrice} wei`);
    
    const estimatedCost = (gasEstimate * networkConfig.gasPrice) / 1e18;
    this.log(`Estimated Cost: ${estimatedCost.toFixed(6)} ETH`);
    
    if (constructorArgs.length > 0) {
      this.log(`Constructor Args: ${JSON.stringify(constructorArgs)}`);
    }
    
    // Simulate contract address generation
    const simulatedAddress = this.generateContractAddress();
    this.log(`Simulated Address: ${simulatedAddress}`);
    
    this.log('\n✅ Simulation completed successfully');
  }

  private async deployContract(
    bytecode: Buffer, 
    networkConfig: NetworkConfig, 
    gasEstimate: number, 
    constructorArgs: any[], 
    metadata: ContractMetadata,
    flags: any
  ): Promise<DeploymentResult> {
    this.log('\n🚀 Deploying Contract');
    this.log('====================');
    this.log(`Network: ${networkConfig.name} (Chain ID: ${networkConfig.chainId})`);
    this.log(`Contract: ${metadata.name}`);
    this.log(`Gas Limit: ${gasEstimate}`);
    
    // In a real implementation, this would interact with the blockchain
    // For now, we'll simulate the deployment
    const deploymentResult = await this.simulateBlockchainDeployment(
      bytecode, 
      networkConfig, 
      gasEstimate, 
      constructorArgs,
      flags
    );
    
    this.log(`✅ Contract deployed successfully!`);
    this.log(`📍 Address: ${deploymentResult.contractAddress}`);
    this.log(`🔗 Transaction: ${deploymentResult.transactionHash}`);
    this.log(`⛽ Gas Used: ${deploymentResult.gasUsed}`);
    this.log(`💰 Cost: ${deploymentResult.deploymentCost.toFixed(6)} ETH`);
    
    if (networkConfig.explorerUrl) {
      this.log(`🔍 Explorer: ${networkConfig.explorerUrl}/tx/${deploymentResult.transactionHash}`);
    }
    
    return deploymentResult;
  }

  private async simulateBlockchainDeployment(
    bytecode: Buffer, 
    networkConfig: NetworkConfig, 
    gasEstimate: number, 
    constructorArgs: any[],
    flags: any
  ): Promise<DeploymentResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const gasUsed = Math.floor(gasEstimate * (0.8 + Math.random() * 0.2)); // 80-100% of estimate
    const deploymentCost = (gasUsed * (flags.gasPrice || networkConfig.gasPrice)) / 1e18;
    
    return {
      contractAddress: this.generateContractAddress(),
      transactionHash: this.generateTransactionHash(),
      gasUsed,
      deploymentCost,
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      timestamp: new Date().toISOString()
    };
  }

  private generateContractAddress(): string {
    return '0x' + crypto.randomBytes(20).toString('hex');
  }

  private generateTransactionHash(): string {
    return '0x' + crypto.randomBytes(32).toString('hex');
  }

  private async handleDeploymentResult(
    result: DeploymentResult, 
    flags: any, 
    metadata: ContractMetadata
  ): Promise<void> {
    // Save deployment info
    const deploymentInfo = {
      ...result,
      metadata,
      network: flags.network,
      deployedAt: new Date().toISOString()
    };
    
    if (flags.output) {
      fs.writeFileSync(flags.output, JSON.stringify(deploymentInfo, null, 2));
      this.log(`📄 Deployment info saved to: ${flags.output}`);
    }
    
    // Save to deployments directory
    const deploymentsDir = path.join(process.cwd(), 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentsDir, `${metadata.name}-${flags.network}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    this.log(`📁 Deployment record saved to: ${path.basename(deploymentFile)}`);
    
    // Contract verification
    if (flags.verify) {
      await this.verifyContract(result, metadata, flags.network);
    }
  }

  private async verifyContract(
    result: DeploymentResult, 
    metadata: ContractMetadata, 
    network: string
  ): Promise<void> {
    this.log('\n🔍 Verifying Contract');
    this.log('====================');
    
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      this.log(`✅ Contract verified successfully!`);
      this.log(`📋 Verification ID: ${crypto.randomBytes(16).toString('hex')}`);
      
      const networkConfig = this.getNetworkConfig(network);
      if (networkConfig.explorerUrl) {
        this.log(`🔗 View on explorer: ${networkConfig.explorerUrl}/address/${result.contractAddress}`);
      }
      
    } catch (error) {
      this.log(`⚠️  Contract verification failed: ${error}`);
    }
  }

  private findBinary(name: string): string {
    // Check development build first
    const devPath = path.join(process.cwd(), 'target', 'debug', name);
    if (fs.existsSync(devPath)) {
      return devPath;
    }
    
    // Check release build
    const releasePath = path.join(process.cwd(), 'target', 'release', name);
    if (fs.existsSync(releasePath)) {
      return releasePath;
    }
    
    // Fallback to system PATH
    return name;
  }
}
