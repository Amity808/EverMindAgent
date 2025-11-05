# EverMind AI - Decentralized AI Assistant Platform

A Next.js application that enables users to create, manage, and collaborate with AI agents as NFTs on the blockchain, powered by the 0G Compute Network.

## 🚀 Features

- **AI Agent NFTs**: Mint your AI agents as NFTs with unique personalities and capabilities
- **0G Compute Integration**: Execute AI operations with verifiable proofs on decentralized infrastructure
- **Wallet-First Security**: Uses user's connected wallet - no private keys stored
- **Real AI Inference**: Access to state-of-the-art AI models through 0G Network
- **Account Management**: Fund and manage your 0G Compute account
- **Service Discovery**: Browse and select from available AI services
- **TEE Verification**: Verifiable AI responses using Trusted Execution Environments

## 🔐 Security Model

This platform uses a **wallet-first approach**:

- ✅ **No private keys stored** - Users connect their own wallets
- ✅ **User controls all transactions** - Every operation requires user approval
- ✅ **Secure by default** - No sensitive data stored on our servers
- ✅ **Web3 native** - Works with MetaMask, WalletConnect, and other Web3 wallets

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Radix UI, Lucide React
- **Web3**: Ethers.js, Wagmi, RainbowKit
- **AI**: 0G Compute Network SDK
- **Storage**: 0G Storage, IPFS fallback
- **Blockchain**: Ethereum-compatible networks

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- A Web3 wallet (MetaMask, WalletConnect, etc.)
- OG tokens for 0G Compute operations

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd evermind-ai
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Add the following to `.env.local`:

   ```bash
   # 0G Compute Network Configuration
   NEXT_PUBLIC_0G_RPC_URL=https://evmrpc-testnet.0g.ai/
   NEXT_PUBLIC_0G_INDEXER_RPC=https://indexer-storage-testnet-standard.0g.ai

   # Research History Contract (optional)
   # Testnet: 0x5a6E26085f50731BEBC04Dd7C2Fd56bc75A52c1B
   # Mainnet: 0xb06745a2D9f0073A7a976494929fba3756ccDb21
   NEXT_PUBLIC_RESEARCH_HISTORY_CONTRACT=0x...

   # Optional: IPFS fallback
   NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
   ```

4. **Start the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### 1. Connect Your Wallet

1. Click "Connect Wallet" in the top navigation
2. Select your preferred wallet (MetaMask, WalletConnect, etc.)
3. Approve the connection in your wallet

### 2. Fund Your 0G Account

1. Go to the "Credits" page
2. Click "Add Funds" in the 0G Account section
3. Enter the amount of OG tokens you want to add
4. Approve the transaction in your wallet

### 3. Start Chatting with AI

1. Go to the "Chat" page
2. Select an AI service from the available options
3. Type your message and click "Send"
4. Approve the inference transaction in your wallet
5. Receive the AI response!

### 4. Manage Your Agents

1. Go to the "Agents" page
2. Browse available AI services
3. Create new AI agent NFTs
4. Manage your existing agents

## 📁 Project Structure

```
evermind-ai/
├── app/                    # Next.js app router pages
│   ├── chat/              # AI chat interface
│   ├── agents/            # Agent management
│   ├── credits/           # Account management
│   └── ...
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── chat-interface.tsx # Main chat component
│   ├── 0g-account-management.tsx # Account management
│   └── ...
├── hooks/                # Custom React hooks
│   └── use-0g-compute.ts # 0G Compute integration
├── lib/                  # Utility libraries
│   ├── 0g-compute.ts    # 0G Compute service
│   ├── storage.ts       # Storage service
│   └── ...
├── docs/                # Documentation
│   ├── 0G_COMPUTE_INTEGRATION.md
│   ├── WALLET_INTEGRATION.md
│   └── ...
└── ...
```

## 🔧 Configuration

### Environment Variables

| Variable                                | Description                       | Required      |
| --------------------------------------- | --------------------------------- | ------------- |
| `NEXT_PUBLIC_0G_RPC_URL`                | 0G Network RPC URL                | Yes           |
| `NEXT_PUBLIC_0G_INDEXER_RPC`            | 0G Indexer RPC URL                | Yes           |
| `NEXT_PUBLIC_RESEARCH_HISTORY_CONTRACT` | Research History contract address | No (optional) |
| `NEXT_PUBLIC_PINATA_API_KEY`            | IPFS fallback API key             | No            |

### Supported Networks

- **Testnet**: 0G Testnet (default)
- **Mainnet**: 0G Mainnet (production)

### Contract Addresses

#### Research History Contract

- **Mainnet**: `0xb06745a2D9f0073A7a976494929fba3756ccDb21`
- **Testnet**: Set via `NEXT_PUBLIC_RESEARCH_HISTORY_CONTRACT` environment variable

To use the research history feature, set the contract address in your `.env.local`:

```bash
# For testnet (set your deployed testnet contract address)
NEXT_PUBLIC_RESEARCH_HISTORY_CONTRACT=0x...

# For mainnet (already configured)
NEXT_PUBLIC_RESEARCH_HISTORY_CONTRACT=0xb06745a2D9f0073A7a976494929fba3756ccDb21
```

## 🤖 Available AI Services

The platform provides access to official 0G Compute services:

1. **llama-3.3-70b-instruct**

   - Provider: `0xf07240Efa67755B5311bc75784a061eDB47165Dd`
   - Verifiability: TEE (TeeML)
   - Price: 0.001 OG input, 0.002 OG output

2. **deepseek-r1-70b**
   - Provider: `0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3`
   - Verifiability: TEE (TeeML)
   - Price: 0.0015 OG input, 0.003 OG output

## 🔒 Security Features

- **Wallet Integration**: All transactions signed by user's wallet
- **TEE Verification**: Verifiable AI responses using Trusted Execution Environments
- **No Private Keys**: No sensitive data stored on servers
- **User Control**: Users control their own funds and transactions
- **Transparent**: All operations visible on blockchain

## 📚 Documentation

- [0G Compute Integration Guide](docs/0G_COMPUTE_INTEGRATION.md)
- [Wallet Integration Guide](docs/WALLET_INTEGRATION.md)
- [0G Storage Setup](docs/0G_STORAGE_SETUP.md)
- [AI Model Sources](docs/AI_MODEL_SOURCES.md)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [0G Labs](https://0g.ai/) for the 0G Compute Network
- [Ethers.js](https://docs.ethers.org/) for Web3 functionality
- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [Next.js](https://nextjs.org/) for the React framework

## 📞 Support

- **Documentation**: Check the `docs/` folder
- **Issues**: Open an issue on GitHub
- **Discord**: Join our community Discord
- **X (Twitter)**: [Follow us on X](https://x.com/BMuhdsodiq41369)
- **Email**: support@evermind.ai

---

Built with ❤️ for the decentralized AI future
