# 🔗 Blockchain Research History System

## Overview

The Blockchain Research History System provides permanent, verifiable storage of research chat history on the blockchain using a hybrid approach:

- **Smart Contract**: Stores metadata, verification hashes, and session information
- **IPFS**: Stores large response data and full research content
- **0G Compute Network**: Powers the AI research capabilities

## 🏗️ Architecture

### 1. Smart Contract (`ResearchHistory.sol`)

- **Purpose**: Stores research session metadata and verification data
- **Features**:
  - Session management (create, complete)
  - Query tracking with timestamps
  - Response verification with IPFS hashes
  - Cost tracking in OG tokens
  - Access control and ownership

### 2. IPFS Service (`ipfs-service.ts`)

- **Purpose**: Decentralized storage for large research data
- **Features**:
  - Upload research data with structured format
  - Retrieve data by IPFS hash
  - Generate verification hashes
  - Data integrity verification
  - Pinning for persistence

### 3. Research History Service (`research-history-service.ts`)

- **Purpose**: Bridge between blockchain and IPFS
- **Features**:
  - Smart contract interaction
  - IPFS data management
  - Response verification
  - Session lifecycle management

### 4. React Hook (`use-research-history.ts`)

- **Purpose**: React integration for UI components
- **Features**:
  - State management for sessions and queries
  - Blockchain transaction handling
  - Error handling and loading states
  - Data synchronization

### 5. UI Components (`research-history.tsx`)

- **Purpose**: User interface for viewing blockchain history
- **Features**:
  - Session overview and details
  - Response verification interface
  - IPFS data viewing
  - Export and sharing capabilities

## 🚀 How It Works

### Research Flow

1. **Session Creation**: User starts research → Smart contract creates session
2. **Query Storage**: Research query → Stored on blockchain with timestamp
3. **AI Processing**: Query → 0G Compute Network → AI response
4. **Response Storage**:
   - Full response data → IPFS
   - Verification hash → Smart contract
   - Metadata → Smart contract
5. **Verification**: Users can verify response integrity anytime

### Data Structure

```typescript
// Research Session (Blockchain)
{
  sessionId: string
  researcher: address
  researchType: string
  startTime: timestamp
  endTime?: timestamp
  totalQueries: number
  totalCost: number
  isActive: boolean
}

// Research Query (Blockchain)
{
  queryId: string
  query: string
  context: string
  timestamp: number
  hasResponse: boolean
}

// Research Response (IPFS + Blockchain)
{
  queryId: string
  ipfsHash: string        // IPFS location
  verificationHash: string // Blockchain verification
  cost: number
  timestamp: number
  verified: boolean
  fullData: ResearchData  // Retrieved from IPFS
}
```

## 🔐 Security Features

### Data Integrity

- **Verification Hashes**: SHA-256 hashes for response verification
- **IPFS Immutability**: Content-addressed storage prevents tampering
- **Blockchain Immutability**: Permanent record on blockchain

### Access Control

- **Session Ownership**: Only session creator can add queries/responses
- **Public Verification**: Anyone can verify response integrity
- **Private Data**: Full research data only accessible to session owner

### Cost Management

- **Storage Fees**: 0.001 ETH per session creation
- **Transaction Costs**: Gas fees for blockchain operations
- **IPFS Costs**: Minimal for decentralized storage

## 📊 Benefits

### For Researchers

- **Permanent Record**: Research history stored forever
- **Verification**: Prove authenticity of research results
- **Portability**: Access research from anywhere
- **Transparency**: Public verification of research integrity

### For Institutions

- **Audit Trail**: Complete research history for compliance
- **Quality Assurance**: Verified research results
- **Collaboration**: Shareable research sessions
- **Reputation**: Blockchain-verified research credentials

### For the Community

- **Open Science**: Transparent research processes
- **Knowledge Preservation**: Permanent research archive
- **Innovation**: Decentralized research infrastructure
- **Trust**: Cryptographic verification of research

## 🛠️ Setup Instructions

### 1. Smart Contract Deployment

```bash
# Deploy ResearchHistory.sol to Ethereum/0G Testnet
npx hardhat deploy --network 0g-testnet
```

### 2. Environment Configuration

```bash
# Add to .env.local
NEXT_PUBLIC_RESEARCH_HISTORY_CONTRACT=0x...
NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001/api/v0
NEXT_PUBLIC_INFURA_PROJECT_ID=your_project_id
```

### 3. Dependencies Installation

```bash
npm install ipfs-http-client
npm install @openzeppelin/contracts
```

### 4. Integration

```typescript
// Use in your components
import { useResearchHistory } from "@/hooks/use-research-history";

const { currentSession, sessions, createSession, addQuery, addResponse } =
  useResearchHistory(provider, signer, contractAddress, contractABI);
```

## 🔍 Usage Examples

### Creating a Research Session

```typescript
const sessionId = await createSession("academic");
console.log("Session created:", sessionId);
```

### Adding a Research Query

```typescript
const queryId = await addQuery(
  sessionId,
  "What is the capital of Nigeria?",
  "Geography research context"
);
```

### Storing Research Response

```typescript
const researchData = {
  sessionId,
  queryId,
  query: 'What is the capital of Nigeria?',
  context: 'Geography research context',
  response: 'The capital of Nigeria is Abuja...',
  insights: [...],
  metadata: {
    timestamp: Date.now(),
    researchType: 'academic',
    model: 'phala/gpt-oss-120b',
    provider: '0xf07240Efa67755B5311bc75784a061eDB47165Dd',
    cost: 0.001
  }
}

await addResponse(queryId, researchData)
```

### Verifying Response Integrity

```typescript
const isValid = await verifyResponse(queryId, responseData);
console.log("Response verified:", isValid);
```

## 🌟 Future Enhancements

### Planned Features

- **Research Collaboration**: Multi-user research sessions
- **Citation System**: Blockchain-based research citations
- **Reputation System**: Research quality scoring
- **Marketplace**: Research data trading
- **Cross-Chain**: Multi-blockchain support

### Advanced Features

- **AI Verification**: Automated response quality checking
- **Research Templates**: Predefined research frameworks
- **Analytics Dashboard**: Research performance metrics
- **Export Options**: Multiple format support
- **API Integration**: Third-party research tools

## 🔧 Troubleshooting

### Common Issues

1. **IPFS Connection**: Check Infura credentials
2. **Contract Interaction**: Verify contract address and ABI
3. **Gas Fees**: Ensure sufficient ETH for transactions
4. **Network Issues**: Check 0G testnet connectivity

### Debug Mode

```typescript
// Enable detailed logging
localStorage.setItem("debug", "research-history:*");
```

## 📚 Resources

- [Smart Contract Documentation](./contracts/ResearchHistory.sol)
- [IPFS Service API](./lib/ipfs-service.ts)
- [React Hook Usage](./hooks/use-research-history.ts)
- [UI Components](./components/research-history.tsx)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

