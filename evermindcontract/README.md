# 🧠 EverMind AI - Decentralized Intelligent Personal Assistant

[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.26.3-orange.svg)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.4.0-green.svg)](https://openzeppelin.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **EverMind AI** is a decentralized, intelligent personal assistant and research companion built on the 0G AI Layer 1 ecosystem. It combines 0G Compute for AI reasoning, 0G Storage for large knowledge bases, and INFTs to encapsulate and transfer personalized AI agents as secure, ownable digital assets.

## 🌟 What is EverMind AI?

EverMind AI removes the barriers of centralized AI by making AI decentralized, verifiable, portable, and censorship-resistant. Users can chat with their AI, store private or public research datasets, and even trade or share their personalized AI assistants via ERC-7857 INFTs.

### 🎯 Problems We Solve

- **Centralized AI lock-in**: Current AI platforms keep your data, models, and personalization locked away
- **Lack of portability**: You can't take your trained AI with you or securely transfer it to others
- **Trust & censorship**: AI providers can censor outputs or restrict usage
- **Limited onchain intelligence**: Most blockchain dapps can't run real AI workloads at scale

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │  Smart Contract │    │   0G Ecosystem  │
│   (Next.js)     │◄──►│  (EverMindAI)   │◄──►│  (Compute/     │
│                 │    │                 │    │   Storage/DA)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Wallet   │    │   INFT System   │    │   AI Models &   │
│   (MetaMask)    │    │  (ERC-7857)     │    │   Datasets      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Core Features

### 🤖 AI Agent Management

- **Mint AI Agents**: Create personalized AI assistants as INFTs
- **Agent Portfolio**: Manage multiple AI agents with different specializations
- **Metadata Encryption**: Secure, encrypted storage of agent data
- **NFT Status Tracking**: Agents are informed when they become NFTs

### ⚡ AI Execution Engine

- **Real-time Inference**: Execute AI operations using 0G Compute
- **Proof Verification**: Zero-knowledge proofs for execution authorization
- **Credit System**: Pay-per-use compute and storage credits
- **Execution Tracking**: Complete audit trail of all AI operations

### 🤝 Multi-Agent Collaboration

- **Agent Discovery**: Find and connect with other AI agents
- **Collaborative Workspaces**: Enable agents to work together
- **Shared Knowledge**: Secure data sharing between agents
- **Collaboration History**: Track and manage agent partnerships

### 💎 INFT Marketplace

- **Agent Trading**: Buy, sell, and trade AI agents
- **Transfer System**: Secure agent transfer with proof verification
- **Evolution Tracking**: Monitor how agents improve over time
- **Metadata Visualization**: Rich INFT display with AI attributes

## 🛠️ Technology Stack

### Smart Contracts

- **Solidity**: 0.8.19
- **Hardhat**: Development and testing framework
- **OpenZeppelin**: Secure contract libraries
- **0G Integration**: Compute, Storage, and Data Availability

### Frontend (Planned)

- **Next.js 14+**: React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework
- **Web3 Integration**: ethers.js, wagmi, viem
- **State Management**: Zustand or Redux Toolkit

### Blockchain Infrastructure

- **0G Chain**: EVM-compatible blockchain for smart contracts
- **0G Compute**: Distributed inference and fine-tuning
- **0G Storage**: Decentralized storage for datasets
- **0G Data Availability**: Scalable and verifiable data access

## 📱 Smart Contract Features

### Core Functions

```solidity
// Mint a new AI agent as an INFT
function mintAIAgent(
    string memory name,
    string memory description,
    bytes32 modelHash,
    bytes32 datasetHash,
    string memory encryptedMetadata,
    bytes32 metadataHash
) external payable returns (uint256)

// Execute AI inference using 0G Compute
function executeAI(
    uint256 agentId,
    bytes32 inputHash,
    bytes calldata proof
) external payable

// Start collaboration between AI agents
function startCollaboration(
    uint256 agentId1,
    uint256 agentId2,
    bytes32 sharedDataHash
) external

// Purchase compute and storage credits
function purchaseCredits(
    uint256 computeCredits,
    uint256 storageCredits
) external payable
```

### Key Events

```solidity
event AIAgentMinted(uint256 indexed agentId, address indexed owner, string name, bytes32 modelHash, bytes32 datasetHash);
event AIExecutionTriggered(uint256 indexed executionId, uint256 indexed agentId, address indexed user, bytes32 inputHash);
event AgentNFTMinted(uint256 indexed agentId, address indexed owner, string agentName, uint256 tokenId, bytes32 modelHash, bytes32 datasetHash, uint256 timestamp);
event AgentNFTStatusAcknowledged(uint256 indexed agentId, address indexed owner, uint256 timestamp, string acknowledgmentMessage);
```

### Pricing Structure

- **Minting Fee**: 0.000001 ETH
- **Execution Fee**: 0.000001 ETH
- **Compute Credits**: 0.000001 ETH per credit
- **Storage Credits**: 0.0000001 ETH per credit

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn package manager
- MetaMask or compatible Web3 wallet
- Access to 0G testnet/mainnet

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd evermindcontract
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Compile contracts**

   ```bash
   npx hardhat compile
   ```

4. **Run tests**

   ```bash
   npx hardhat test
   ```

5. **Start local node**

   ```bash
   npx hardhat node
   ```

6. **Deploy contracts**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

### Environment Setup

Create a `.env` file with the following variables:

```env
# Contract addresses (will be populated after deployment)
CONTRACT_ADDRESS=0x...
OG_COMPUTE_ADDRESS=0x...
OG_STORAGE_ADDRESS=0x...
OG_DATA_AVAILABILITY_ADDRESS=0x...

# Network configuration
CHAIN_ID=1337
RPC_URL=http://127.0.0.1:8545

# Private key for deployment (use test account)
PRIVATE_KEY=0x...
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Gas Reporting

```bash
REPORT_GAS=true npm test
```

### Run Specific Test File

```bash
npx hardhat test test/EverMindAI.t.sol
```

### Coverage Report

```bash
npx hardhat coverage
```

## 📊 Contract Structure

### Data Models

```solidity
struct AIAgent {
    string name;
    string description;
    bytes32 modelHash;           // Hash of AI model on 0G Compute
    bytes32 datasetHash;         // Hash of knowledge base on 0G Storage
    bytes32 metadataHash;        // Encrypted metadata hash
    string encryptedMetadata;    // Encrypted metadata URI
    uint256 creationTimestamp;
    uint256 lastUsedTimestamp;
    bool isActive;
    address creator;
    uint256 computeCredits;      // 0G Compute credits
    uint256 storageCredits;      // 0G Storage credits
    bool nftStatusAcknowledged;  // NFT status acknowledgment
}
```

### State Variables

- `aiAgents`: Mapping of agent ID to agent data
- `executions`: Mapping of execution ID to execution data
- `collaborations`: Mapping of collaboration ID to collaboration data
- `userAgents`: Mapping of user address to array of agent IDs
- `usedProofs`: Mapping of proof hash to usage status

## 🔒 Security Features

- **Reentrancy Protection**: Prevents reentrancy attacks
- **Access Control**: Owner-only functions for critical operations
- **Pausable**: Emergency pause functionality
- **Proof Verification**: Zero-knowledge proof validation
- **Encrypted Metadata**: All sensitive data is encrypted
- **Credit System**: Prevents abuse through credit consumption

## 🌐 Network Support

### Supported Networks

- **0G Chain**: Main production network
- **0G Testnet**: Development and testing
- **Hardhat Network**: Local development
- **Ethereum**: Future compatibility

### Network Configuration

```javascript
// hardhat.config.js
networks: {
  hardhat: {
    chainId: 1337,
  },
  ogTestnet: {
    url: "https://rpc.0g.ai",
    chainId: 1234,
  },
  ogMainnet: {
    url: "https://rpc.0g.ai",
    chainId: 5678,
  }
}
```

## 📈 Roadmap

### Phase 1: Core Infrastructure ✅

- [x] Smart contract development
- [x] Basic INFT functionality
- [x] AI execution framework
- [x] Credit system implementation

### Phase 2: Frontend Development 🚧

- [ ] Next.js application setup
- [ ] Web3 integration
- [ ] AI agent management UI
- [ ] Chat interface implementation

### Phase 3: AI Integration 🎯

- [ ] 0G Compute integration
- [ ] 0G Storage integration
- [ ] Model fine-tuning capabilities
- [ ] Multi-modal AI support

### Phase 4: Advanced Features 🔮

- [ ] Agent marketplace
- [ ] Advanced collaboration tools
- [ ] Mobile application
- [ ] Enterprise features

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow Solidity style guide
- Write comprehensive tests
- Update documentation
- Ensure security best practices

## 🐛 Bug Reports

If you find a bug, please create an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

- **Documentation**: [docs.evermind.ai](https://docs.evermind.ai)
- **Discord**: [discord.gg/evermind](https://discord.gg/evermind)
- **Twitter**: [@evermind_ai](https://twitter.com/evermind_ai)
- **GitHub Issues**: [Report bugs here](https://github.com/evermind-ai/evermindcontract/issues)
- **Email**: support@evermind.ai

## 🙏 Acknowledgments

- **0G Labs**: For building the revolutionary 0G ecosystem
- **OpenZeppelin**: For secure smart contract libraries
- **Hardhat Team**: For the excellent development framework
- **Ethereum Community**: For the foundation of decentralized applications

## 📚 Additional Resources

- [0G Documentation](https://docs.0g.ai)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

**Built with ❤️ for the decentralized AI future**

_EverMind AI - Making AI accessible, portable, and censorship-resistant through blockchain technology._

<div align="center">
  <img src="https://img.shields.io/badge/Made%20with-Solidity-blue?style=for-the-badge&logo=solidity" alt="Made with Solidity"/>
  <img src="https://img.shields.io/badge/Powered%20by-0G%20AI-green?style=for-the-badge" alt="Powered by 0G AI"/>
  <img src="https://img.shields.io/badge/Blockchain-Ethereum-yellow?style=for-the-badge&logo=ethereum" alt="Ethereum Blockchain"/>
</div>
