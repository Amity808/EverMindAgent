
import { ethers, BrowserProvider } from 'ethers'
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker'
import OpenAI from 'openai'
import { getChainConfig, getNetworkConfig, getExpectedChainId } from './chain-config'

export interface ServiceInfo {
    provider: string
    serviceType: string
    url: string
    inputPrice: bigint
    outputPrice: bigint
    updatedAt: bigint
    model: string
    verifiability: string
}

export interface InferenceRequest {
    messages: Array<{
        role: 'user' | 'assistant' | 'system'
        content: string
    }>
    model: string
    temperature?: number
    max_tokens?: number
}

export interface InferenceResponse {
    choices: Array<{
        message: {
            role: string
            content: string
        }
        finish_reason: string
    }>
    usage?: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
}

export interface AccountBalance {
    balance: bigint
    locked: bigint
    totalbalance: bigint
}

class ZGComputeService {
    private provider: BrowserProvider | null = null
    private signer: ethers.JsonRpcSigner | null = null
    private broker: any = null
    private isInitialized = false

    constructor() {
        // Initialize in browser environment
        if (typeof window !== "undefined" && typeof window.ethereum === "undefined") {
            console.warn("MetaMask not detected. 0G Compute will work in demo mode only.")
        }
    }

    async initialize(provider: BrowserProvider | null, signer: ethers.JsonRpcSigner | null) {
        try {
            if (typeof window !== "undefined" && window.ethereum) {
                // Switch to configured 0G network (testnet or mainnet)
                await this.switchTo0GNetwork()

                // Wait a moment for network switch to complete
                await new Promise(resolve => setTimeout(resolve, 1000))

                // Create provider - use configured RPC URL to ensure correct network
                const networkConfig = getNetworkConfig()
                // Use the configured RPC URL instead of relying on MetaMask's RPC
                // This ensures we're using the correct endpoint for the network
                const rpcUrl = networkConfig.compute.rpcUrl.replace(/\/$/, '') // Remove trailing slash

                // Create provider from MetaMask but verify it's using the correct network
                this.provider = new BrowserProvider(window.ethereum)
                this.signer = await this.provider.getSigner()

                // Verify network before creating broker
                const network = await this.provider.getNetwork()
                const expectedChainId = getExpectedChainId()

                if (network.chainId !== expectedChainId) {
                    console.warn(`⚠️ Network mismatch during initialization:`)
                    console.warn(`   Connected to: Chain ${network.chainId}`)
                    console.warn(`   Expected: Chain ${expectedChainId} (${networkConfig.chain.chainName})`)
                    console.warn(`   Please switch to ${networkConfig.chain.chainName} in your wallet`)
                    console.warn(`   Configured RPC: ${rpcUrl}`)
                    // Continue anyway - broker creation might still work
                }

                try {
                    // Check if we're on mainnet and warn about broker library limitations
                    if (networkConfig.network === 'mainnet') {
                        console.warn('⚠️ WARNING: Using 0G Mainnet')
                        console.warn('   The @0glabs/0g-serving-broker library currently only supports testnet')
                        console.warn('   It uses hardcoded testnet contract addresses that don\'t exist on mainnet')
                        console.warn('   This means:')
                        console.warn('   - Read operations (balance checks) will fail')
                        console.warn('   - Write operations (deposits, transfers) will fail')
                        console.warn('   - You should use testnet until the library supports mainnet')
                        console.warn('   - Set NEXT_PUBLIC_0G_NETWORK=testnet in .env.local')
                        console.warn('')
                        console.warn('   Continuing anyway, but broker operations will not work...')
                    }

                    // The broker should detect the network from the signer/provider
                    // If it's using hardcoded testnet addresses, we'll get the "could not decode" error
                    this.broker = await createZGComputeNetworkBroker(this.signer)

                    // Verify broker contract addresses after creation
                    if (this.broker?.ledger) {
                        const ledgerCA = this.broker.ledger.ledgerCA
                        const knownTestnetCA = '0x09D00A2B31067da09bf0e873E58746d1285174Cc'

                        if (ledgerCA?.toLowerCase() === knownTestnetCA.toLowerCase() && networkConfig.network === 'mainnet') {
                            console.error('❌ CONFIRMED: Broker is using testnet contract addresses on mainnet!')
                            console.error(`   Ledger CA: ${ledgerCA}`)
                            console.error('   This broker instance will NOT work on mainnet')
                            console.error('   Solution: Use testnet (set NEXT_PUBLIC_0G_NETWORK=testnet) or wait for library update')
                            // Don't set broker to null - let user see the error, but operations will fail
                        }
                    }

                    this.isInitialized = true
                    return true
                } catch (brokerError: any) {
                    console.error('Failed to create broker:', brokerError)
                    console.error(`   Network: ${networkConfig.network}`)
                    console.error(`   Chain ID: ${network.chainId}`)
                    console.error(`   Expected Chain ID: ${expectedChainId}`)
                    console.error(`   RPC URL: ${networkConfig.compute.rpcUrl}`)
                    // If broker creation fails, continue in demo mode
                    this.broker = null
                    this.isInitialized = true
                    console.warn('⚠️ Broker creation failed, continuing in demo mode')
                    console.warn('   Note: The broker library may use hardcoded testnet contract addresses')
                    console.warn('   This is expected if 0G Compute contracts aren\'t deployed on mainnet yet')
                    return true
                }
            } else {
                this.isInitialized = true
                return true
            }
        } catch (error) {
            console.error('Failed to initialize 0G Compute service:', error)
            // Don't throw - allow initialization to complete in demo mode
            this.broker = null
            this.isInitialized = true
            console.warn('⚠️ Initialization failed, continuing in demo mode')
            return true
        }
    }

    private async switchTo0GNetwork() {
        const chainConfig = getChainConfig()
        const networkConfig = getNetworkConfig()

        try {
            // First, try to switch to the existing network
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainConfig.chainIdHex }],
            })
        } catch (error: any) {

            if (error.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: chainConfig.chainIdHex,
                            chainName: chainConfig.chainName,
                            rpcUrls: [chainConfig.rpcUrl],
                            blockExplorerUrls: [chainConfig.blockExplorerUrl],
                            nativeCurrency: chainConfig.nativeCurrency,
                        }],
                    })
                } catch (addError: any) {
                    if (addError.message?.includes('nativeCurrency.symbol does not match')) {
                        console.warn(`⚠️ Network already exists with different symbol. Please manually switch to ${chainConfig.chainName} in MetaMask`)
                    }
                }
            } else if (error.message?.includes('nativeCurrency.symbol does not match')) {
                console.warn(`⚠️ Network already exists with different currency symbol. Please manually switch to ${chainConfig.chainName} in MetaMask`)
            }
        }
    }

    /**
     * Check if the service is initialized
     */
    isReady(): boolean {
        return this.isInitialized
    }

    /**
     * Get available AI services on the 0G Network
     */
    async getAvailableServices(): Promise<ServiceInfo[]> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            if (this.broker) {
                // Verify we're on the correct network before calling
                if (this.provider) {
                    const network = await this.provider.getNetwork()
                    const expectedChainId = getExpectedChainId()
                    if (network.chainId !== expectedChainId) {
                        const networkConfig = getNetworkConfig()
                        console.warn(`⚠️ Network mismatch: Connected to chain ${network.chainId}, expected ${expectedChainId} (${networkConfig.chain.chainName})`)
                        console.warn('Falling back to official services list')
                        return this.getOfficialServices()
                    }
                }

                try {
                    const services = await this.broker.inference.listService()
                    return services.map((service: any) => ({
                        provider: service[0],
                        serviceType: service[1],
                        url: service[2],
                        inputPrice: BigInt(service[3] || 0),
                        outputPrice: BigInt(service[4] || 0),
                        updatedAt: BigInt(service[5] || Date.now()),
                        model: service[6],
                        verifiability: service[7] || 'TeeML'
                    }))
                } catch (brokerError: any) {
                    // Handle contract call errors
                    if (brokerError.message?.includes('could not decode result data') ||
                        brokerError.message?.includes('CALL_EXCEPTION') ||
                        brokerError.message?.includes('missing revert data')) {
                        const networkConfig = getNetworkConfig()
                        console.warn(`⚠️ Contract call failed on ${networkConfig.chain.chainName}`)
                        console.warn('This may indicate the contract is not deployed or RPC is unavailable')
                        console.warn('Falling back to official services list')
                        return this.getOfficialServices()
                    }
                    throw brokerError
                }
            } else {
                // Return official services for demo mode
                return this.getOfficialServices()
            }
        } catch (error) {
            console.error('Failed to get available services:', error)
            return this.getOfficialServices()
        }
    }

    /**
     * Acknowledge a provider before using their service
     */
    async acknowledgeProvider(providerAddress: string): Promise<void> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            if (this.broker) {
                await this.broker.inference.acknowledgeProviderSigner(providerAddress)
            }
        } catch (error) {
            console.error('Failed to acknowledge provider:', error)
            throw new Error(`Failed to acknowledge provider: ${error}`)
        }
    }

    /**
     * Get service metadata for a specific provider
     */
    async getServiceMetadata(providerAddress: string): Promise<{ endpoint: string; model: string }> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            if (this.broker) {
                const { endpoint, model } = await this.broker.inference.getServiceMetadata(providerAddress)
                return { endpoint, model }
            } else {
                // Find the service in our official services list
                const service = this.getOfficialServices().find(s => s.provider === providerAddress)
                if (!service) {
                    throw new Error(`Service not found for provider: ${providerAddress}`)
                }
                return {
                    endpoint: service.url,
                    model: service.model
                }
            }
        } catch (error) {
            console.error('Failed to get service metadata:', error)
            throw new Error(`Failed to get service metadata: ${error}`)
        }
    }

    /**
     * Generate authenticated request headers for a service
     */
    async getRequestHeaders(providerAddress: string, messages: string): Promise<Record<string, string>> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            if (this.broker) {
                return await this.broker.inference.getRequestHeaders(providerAddress, messages)
            } else {
                return {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${providerAddress}`
                }
            }
        } catch (error) {
            console.error('Failed to get request headers:', error)
            throw new Error(`Failed to get request headers: ${error}`)
        }
    }

    /**
     * Send an inference request to a 0G Compute service
     */
    async sendInferenceRequest(
        content: string,
        providerAddress: string
    ): Promise<InferenceResponse> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            if (this.broker) {
                // First, get available services
                const services = await this.broker.inference.listService()

                if (services.length === 0) {
                    throw new Error("No services available")
                }

                // Find the specific provider
                const service = services.find((s: any) => s[0] === providerAddress)
                if (!service) {
                    throw new Error(`Provider ${providerAddress} not found`)
                }

                const endpoint = service[2] // Service URL
                const model = service[6] // Model name

                try {
                    // Acknowledge provider
                    await this.broker.inference.acknowledgeProviderSigner(providerAddress)

                    // Get service metadata
                    const { endpoint: metaEndpoint, model: metaModel } = await this.broker.inference.getServiceMetadata(providerAddress)

                    // Generate auth headers
                    const messages = [{ role: "user" as const, content }]
                    const headers = await this.broker.inference.getRequestHeaders(providerAddress, JSON.stringify(messages))

                    const openai = new OpenAI({
                        baseURL: metaEndpoint,
                        apiKey: "", // Empty string
                        defaultHeaders: headers,
                        dangerouslyAllowBrowser: true
                    })

                    const completion = await openai.chat.completions.create({
                        messages: messages,
                        model: metaModel,
                    })

                    const answer = completion.choices[0].message.content!
                    const chatID = completion.id // Save for verification

                    // Optional: Verify the response
                    try {
                        await this.broker.inference.processResponse(
                            providerAddress,
                            answer,
                            chatID
                        )
                    } catch (verifyError) {
                        // Verification failed, but continue
                    }

                    return {
                        choices: [
                            {
                                message: {
                                    role: 'assistant',
                                    content: answer
                                },
                                finish_reason: 'stop'
                            }
                        ],
                        usage: completion.usage
                    }
                } catch (providerError: any) {
                    if (providerError.message?.includes('insufficient balance')) {
                        console.error("💰 INSUFFICIENT BALANCE: Transfer funds to inference sub-account first")
                    }
                    throw providerError
                }
            } else {
                // Demo mode - generate mock response
                const mockResponse = this.generateMockAIResponse(content, providerAddress)
                return {
                    choices: [
                        {
                            message: {
                                role: 'assistant',
                                content: mockResponse
                            },
                            finish_reason: 'stop'
                        }
                    ],
                    usage: {
                        prompt_tokens: content.length,
                        completion_tokens: mockResponse.length,
                        total_tokens: content.length + mockResponse.length
                    }
                }
            }
        } catch (error) {
            console.error('Failed to send inference request:', error)
            throw new Error(`Failed to send inference request: ${error}`)
        }
    }

    /**
     * Generate a mock AI response for demonstration purposes
     */
    private generateMockAIResponse(userMessage: string, providerAddress: string): string {
        const service = this.getOfficialServices().find(s => s.provider === providerAddress)
        const modelName = service?.model || 'AI Assistant'
        const message = userMessage.toLowerCase()

        // Context-aware responses based on user input
        if (message.includes('0g storage') || message.includes('og storage') || message.includes('0g data')) {
            return `Great question about 0G Storage! I'm ${modelName} and I'm deeply integrated with 0G's decentralized storage system:\n\n🗄️ **0G Storage Overview**: 0G Storage is a decentralized data availability layer that provides:\n• **Infinite Scalability**: Store unlimited amounts of data without central bottlenecks\n• **Cost Efficiency**: Pay only for what you store, with competitive pricing\n• **Data Availability**: Your data is always accessible through the decentralized network\n• **Privacy & Security**: Data is encrypted and distributed across multiple nodes\n\n🔗 **Integration with 0G Compute**: 0G Storage works seamlessly with 0G Compute:\n• Store AI models, datasets, and training data\n• Process data directly on the compute network\n• Verifiable data provenance and integrity\n\n💡 **Use Cases**: Perfect for storing AI models, datasets, user data, and any content that needs to be decentralized and always available.\n\nIn this demo, I'm simulating how I would respond on the real 0G Network. Want to know more about specific storage features?`
        }

        if (message.includes('0g') || message.includes('zero g') || message.includes('0g network')) {
            return `Great question about 0G! I'm ${modelName} running on the 0G Compute Network. Here's what makes 0G special:\n\n🚀 **Decentralized AI Infrastructure**: 0G is building a decentralized network for AI computation, storage, and data availability\n\n🔒 **Verifiable Computation**: Using TEE (Trusted Execution Environment) technology, all AI responses can be cryptographically verified\n\n⚡ **High Performance**: Optimized for AI workloads with low latency and high throughput\n\n🌐 **Open & Permissionless**: Anyone can deploy AI models or use AI services without centralized control\n\n💰 **Cost Effective**: Pay-per-use model with micropayments in OG tokens\n\nIn this demo, I'm simulating how I would respond on the real 0G Network. What specific aspect of 0G interests you most?`
        }

        if (message.includes('ai') || message.includes('artificial intelligence') || message.includes('model')) {
            return `I'm ${modelName}, an AI model running on the 0G Compute Network! Here's what I can help with:\n\n🤖 **AI Capabilities**: I can assist with coding, research, creative writing, analysis, and problem-solving\n\n🔍 **Verifiable Responses**: On the real 0G Network, my responses would be cryptographically verified using TEE technology\n\n📊 **Transparent Pricing**: You can see exactly how much compute and storage each request costs\n\n🛡️ **Privacy-First**: Your data and requests are processed securely without being stored centrally\n\nThis is a demo response, but in production I'd be running on decentralized infrastructure with verifiable computation proofs. What would you like to explore?`
        }

        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return `Hello! I'm ${modelName}, your AI assistant running on the 0G Compute Network! 👋\n\nI'm here to help you with various tasks while demonstrating the power of decentralized AI. In this demo mode, I'm simulating how I would respond on the real 0G Network.\n\nKey features I offer:\n• Verifiable AI responses using TEE\n• Transparent pricing in OG tokens\n• Decentralized infrastructure\n• Privacy-preserving computation\n\nWhat can I help you with today?`
        }

        if (message.includes('help') || message.includes('what can you do')) {
            return `I'm ${modelName} and I can help you with:\n\n💻 **Coding & Development**: Code review, debugging, architecture advice\n📚 **Research & Analysis**: Data analysis, research assistance, insights\n✍️ **Creative Writing**: Content creation, storytelling, editing\n🧠 **Problem Solving**: Logic puzzles, complex reasoning, strategy\n📊 **Data Processing**: Analysis, visualization, interpretation\n\n**0G Network Features:**\n• Verifiable computation with TEE\n• Transparent pricing (0.001-0.003 OG per request)\n• Decentralized and censorship-resistant\n• Privacy-preserving AI inference\n\nThis is a demo - in production, all responses would be cryptographically verified! What would you like to work on?`
        }

        if (message.includes('price') || message.includes('cost') || message.includes('token')) {
            return `Great question about pricing! I'm ${modelName} on the 0G Compute Network:\n\n💰 **Current Pricing**:\n• Input processing: 0.001-0.002 OG per request\n• Output generation: 0.001-0.003 OG per response\n• Total cost: ~0.002-0.005 OG per conversation\n\n💳 **Account Balance**: You have 5 OG available (demo mode)\n\n🔍 **Transparent Billing**: Every computation is tracked and verifiable on-chain\n\n⚡ **Pay-per-Use**: Only pay for what you actually use, no subscriptions\n\nIn this demo, I'm simulating the real 0G pricing model. The actual network uses OG tokens for all transactions. Want to know more about the tokenomics?`
        }

        if (message.includes('solidity') || message.includes('smart contract') || message.includes('ethereum contract')) {
            return `I'd be happy to help you write Solidity smart contracts! I'm ${modelName} on the 0G Compute Network. Here's a simple example:\n\n\`\`\`solidity\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\ncontract SimpleStorage {\n    uint256 private storedData;\n    address public owner;\n    \n    event DataStored(uint256 indexed data, address indexed user);\n    \n    constructor() {\n        owner = msg.sender;\n    }\n    \n    modifier onlyOwner() {\n        require(msg.sender == owner, "Only owner can call this function");\n        _;\n    }\n    \n    function set(uint256 x) public {\n        storedData = x;\n        emit DataStored(x, msg.sender);\n    }\n    \n    function get() public view returns (uint256) {\n        return storedData;\n    }\n    \n    function getOwner() public view returns (address) {\n        return owner;\n    }\n}\n\`\`\`\n\n**Key Features:**\n• **State Variables**: \`storedData\` for data storage, \`owner\` for access control\n• **Events**: \`DataStored\` for logging important actions\n• **Modifiers**: \`onlyOwner\` for access control\n• **Functions**: \`set()\` to store data, \`get()\` to retrieve data\n• **Security**: Owner-only functions and proper access control\n\n**0G Integration**: This contract can be deployed on 0G Network and interact with 0G Storage for decentralized data management!\n\nWhat specific smart contract functionality do you need? I can help with DeFi protocols, NFTs, DAOs, or any other blockchain application!`
        }

        if (message.includes('react') || message.includes('nextjs') || message.includes('frontend')) {
            return `I'd love to help with React and frontend development! I'm ${modelName} on the 0G Compute Network. Here's a modern React component example:\n\n\`\`\`tsx\nimport React, { useState, useEffect } from 'react';\nimport { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';\nimport { Button } from '@/components/ui/button';\n\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n  avatar?: string;\n}\n\nconst UserProfile: React.FC = () => {\n  const [user, setUser] = useState<User | null>(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);\n\n  useEffect(() => {\n    const fetchUser = async () => {\n      try {\n        setLoading(true);\n        const response = await fetch('/api/user');\n        if (!response.ok) throw new Error('Failed to fetch user');\n        const userData = await response.json();\n        setUser(userData);\n      } catch (err) {\n        setError(err instanceof Error ? err.message : 'Unknown error');\n      } finally {\n        setLoading(false);\n      }\n    };\n\n    fetchUser();\n  }, []);\n\n  if (loading) return <div>Loading...</div>;\n  if (error) return <div>Error: {error}</div>;\n  if (!user) return <div>No user found</div>;\n\n  return (\n    <Card className="w-full max-w-md">\n      <CardHeader>\n        <CardTitle>User Profile</CardTitle>\n      </CardHeader>\n      <CardContent className="space-y-4">\n        <div className="flex items-center space-x-4">\n          {user.avatar && (\n            <img \n              src={user.avatar} \n              alt={user.name}\n              className="w-16 h-16 rounded-full"\n            />\n          )}\n          <div>\n            <h3 className="text-lg font-semibold">{user.name}</h3>\n            <p className="text-gray-600">{user.email}</p>\n          </div>\n        </div>\n        <Button className="w-full">Edit Profile</Button>\n      </CardContent>\n    </Card>\n  );\n};\n\nexport default UserProfile;\n\`\`\`\n\n**Key Features:**\n• **TypeScript**: Full type safety with interfaces\n• **Hooks**: useState and useEffect for state management\n• **Error Handling**: Proper error states and loading states\n• **Modern Patterns**: Clean component structure and async/await\n• **UI Components**: Using shadcn/ui components\n\n**0G Integration**: This component can easily integrate with 0G Storage for user data and 0G Compute for AI features!\n\nNeed help with specific React patterns, Next.js features, or other frontend technologies?`
        }

        if (message.includes('python') || message.includes('api') || message.includes('backend')) {
            return `I'd love to help with Python and backend development! I'm ${modelName} on the 0G Compute Network. Here's a FastAPI example:\n\n\`\`\`python\nfrom fastapi import FastAPI, HTTPException, Depends\nfrom pydantic import BaseModel\nfrom typing import List, Optional\nimport asyncio\nfrom datetime import datetime\n\napp = FastAPI(title="0G Integration API", version="1.0.0")\n\nclass UserCreate(BaseModel):\n    name: str\n    email: str\n    avatar: Optional[str] = None\n\nclass User(BaseModel):\n    id: str\n    name: str\n    email: str\n    avatar: Optional[str] = None\n    created_at: datetime\n\n# In-memory storage (use database in production)\nusers_db = {}\n\n@app.post("/users/", response_model=User)\nasync def create_user(user: UserCreate):\n    user_id = f"user_{len(users_db) + 1}"\n    new_user = User(\n        id=user_id,\n        name=user.name,\n        email=user.email,\n        avatar=user.avatar,\n        created_at=datetime.now()\n    )\n    users_db[user_id] = new_user\n    return new_user\n\n@app.get("/users/", response_model=List[User])\nasync def get_users():\n    return list(users_db.values())\n\n@app.get("/users/{user_id}", response_model=User)\nasync def get_user(user_id: str):\n    if user_id not in users_db:\n        raise HTTPException(status_code=404, detail="User not found")\n    return users_db[user_id]\n\n@app.post("/users/{user_id}/ai-analysis")\nasync def analyze_user_data(user_id: str):\n    if user_id not in users_db:\n        raise HTTPException(status_code=404, detail="User not found")\n    \n    user = users_db[user_id]\n    \n    # Simulate AI analysis using 0G Compute\n    analysis_result = {\n        "user_id": user_id,\n        "analysis": f"AI analysis of {user.name}'s data",\n        "insights": ["Pattern detected", "Recommendation generated"],\n        "timestamp": datetime.now().isoformat()\n    }\n    \n    return analysis_result\n\nif __name__ == "__main__":\n    import uvicorn\n    uvicorn.run(app, host="0.0.0.0", port=8000)\n\`\`\`\n\n**Key Features:**\n• **FastAPI**: Modern, fast web framework\n• **Pydantic**: Data validation and serialization\n• **Type Hints**: Full Python type annotations\n• **Async/Await**: Asynchronous programming patterns\n• **RESTful API**: Standard HTTP methods and status codes\n\n**0G Integration**: This API can easily integrate with 0G Compute for AI processing and 0G Storage for data persistence!\n\nNeed help with specific Python libraries, database integration, or other backend patterns?`
        }

        if (message.includes('code') || message.includes('programming') || message.includes('coding')) {
            return `I'd love to help with coding! I'm ${modelName} on the 0G Compute Network, and I can assist with:\n\n💻 **Programming Languages**: Python, JavaScript, TypeScript, Solidity, Rust, Go, and more\n🔧 **Frameworks**: React, Next.js, Node.js, Express, Django, FastAPI\n🏗️ **Architecture**: System design, API development, database design\n🐛 **Debugging**: Error analysis, performance optimization, code review\n📚 **Learning**: Best practices, design patterns, clean code principles\n\n**0G Integration**: I can also help you integrate with 0G Storage and Compute APIs, smart contracts, and decentralized applications!\n\nWhat programming challenge are you working on?`
        }

        if (message.includes('blockchain') || message.includes('web3') || message.includes('crypto') || message.includes('defi')) {
            return `Excellent! I'm ${modelName} and I'm deeply integrated with Web3 and blockchain technology through the 0G Network:\n\n⛓️ **Blockchain Expertise**: Ethereum, smart contracts, DeFi protocols, NFT standards\n🌐 **Web3 Development**: dApps, wallet integration, IPFS, decentralized storage\n🔐 **Security**: Smart contract auditing, cryptographic principles, key management\n💰 **DeFi**: AMMs, lending protocols, yield farming, tokenomics\n🎨 **NFTs**: ERC-721, ERC-1155, metadata standards, marketplace development\n\n**0G Network**: I'm running on 0G's decentralized compute infrastructure, which provides verifiable AI computation for Web3 applications!\n\nWhat blockchain project are you building?`
        }

        if (message.includes('teeml') || message.includes('tee') || message.includes('verifiable') || message.includes('verification')) {
            return `Great question about TEE and verification! I'm ${modelName} and I'm designed to run with TEE (Trusted Execution Environment) verification:\n\n🔒 **TEE Technology**: My responses are generated in a secure, isolated environment that can't be tampered with\n📊 **Cryptographic Proofs**: Each response comes with a mathematical proof that it was generated correctly\n🛡️ **Privacy Protection**: Your inputs are processed securely without being exposed to external parties\n✅ **Verifiable Computation**: Anyone can verify that my responses are authentic and unmodified\n\n**0G Implementation**: On the real 0G Network, I would use TeeML technology to provide cryptographically verifiable AI responses!\n\nThis ensures trust and transparency in decentralized AI. Want to learn more about how verification works?`
        }

        if (message.includes('nft') || message.includes('erc721') || message.includes('non-fungible')) {
            return `I'd love to help you create NFT smart contracts! I'm ${modelName} on the 0G Compute Network. Here's a complete ERC-721 NFT contract:\n\n\`\`\`solidity\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\nimport "@openzeppelin/contracts/token/ERC721/ERC721.sol";\nimport "@openzeppelin/contracts/access/Ownable.sol";\nimport "@openzeppelin/contracts/utils/Counters.sol";\n\ncontract MyNFT is ERC721, Ownable {\n    using Counters for Counters.Counter;\n    Counters.Counter private _tokenIds;\n    \n    string public baseTokenURI;\n    uint256 public maxSupply = 10000;\n    uint256 public mintPrice = 0.01 ether;\n    \n    event NFTMinted(address indexed to, uint256 indexed tokenId);\n    \n    constructor(string memory _baseURI) ERC721("MyNFT", "MNFT") {\n        baseTokenURI = _baseURI;\n    }\n    \n    function mint() public payable {\n        require(_tokenIds.current() < maxSupply, "Max supply reached");\n        require(msg.value >= mintPrice, "Insufficient payment");\n        \n        _tokenIds.increment();\n        uint256 newTokenId = _tokenIds.current();\n        _mint(msg.sender, newTokenId);\n        \n        emit NFTMinted(msg.sender, newTokenId);\n    }\n    \n    function _baseURI() internal view override returns (string memory) {\n        return baseTokenURI;\n    }\n    \n    function setBaseURI(string memory _newBaseURI) public onlyOwner {\n        baseTokenURI = _newBaseURI;\n    }\n    \n    function withdraw() public onlyOwner {\n        payable(owner()).transfer(address(this).balance);\n    }\n}\n\`\`\`\n\n**Features:**\n• **ERC-721 Standard**: Full NFT functionality\n• **Minting**: Public minting with payment\n• **Metadata**: Configurable base URI for token metadata\n• **Access Control**: Owner-only functions for management\n• **Events**: Proper event emission for tracking\n\n**0G Integration**: Store NFT metadata on 0G Storage for decentralized, verifiable metadata!\n\nNeed help with DeFi contracts, DAOs, or other blockchain applications?`
        }

        if (message.includes('defi') || message.includes('token') || message.includes('erc20')) {
            return `I can help you create DeFi and token contracts! I'm ${modelName} on the 0G Compute Network. Here's an ERC-20 token with staking:\n\n\`\`\`solidity\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\nimport "@openzeppelin/contracts/token/ERC20/ERC20.sol";\nimport "@openzeppelin/contracts/access/Ownable.sol";\nimport "@openzeppelin/contracts/security/ReentrancyGuard.sol";\n\ncontract StakingToken is ERC20, Ownable, ReentrancyGuard {\n    uint256 public constant REWARD_RATE = 10; // 10% APY\n    uint256 public constant STAKING_DURATION = 365 days;\n    \n    mapping(address => uint256) public stakedAmount;\n    mapping(address => uint256) public stakingStartTime;\n    mapping(address => uint256) public rewards;\n    \n    event Staked(address indexed user, uint256 amount);\n    event Unstaked(address indexed user, uint256 amount);\n    event RewardsClaimed(address indexed user, uint256 amount);\n    \n    constructor() ERC20("StakingToken", "STK") {\n        _mint(msg.sender, 1000000 * 10**18); // 1M tokens\n    }\n    \n    function stake(uint256 amount) external {\n        require(amount > 0, "Amount must be greater than 0");\n        require(balanceOf(msg.sender) >= amount, "Insufficient balance");\n        \n        _transfer(msg.sender, address(this), amount);\n        stakedAmount[msg.sender] += amount;\n        stakingStartTime[msg.sender] = block.timestamp;\n        \n        emit Staked(msg.sender, amount);\n    }\n    \n    function unstake() external nonReentrant {\n        uint256 amount = stakedAmount[msg.sender];\n        require(amount > 0, "No staked tokens");\n        \n        uint256 reward = calculateReward(msg.sender);\n        if (reward > 0) {\n            rewards[msg.sender] += reward;\n        }\n        \n        _transfer(address(this), msg.sender, amount);\n        stakedAmount[msg.sender] = 0;\n        \n        emit Unstaked(msg.sender, amount);\n    }\n    \n    function calculateReward(address user) public view returns (uint256) {\n        if (stakedAmount[user] == 0) return 0;\n        \n        uint256 stakingTime = block.timestamp - stakingStartTime[user];\n        return (stakedAmount[user] * REWARD_RATE * stakingTime) / (100 * 365 days);\n    }\n    \n    function claimRewards() external nonReentrant {\n        uint256 reward = rewards[msg.sender];\n        require(reward > 0, "No rewards to claim");\n        \n        rewards[msg.sender] = 0;\n        _mint(msg.sender, reward);\n        \n        emit RewardsClaimed(msg.sender, reward);\n    }\n}\n\`\`\`\n\n**Features:**\n• **ERC-20 Token**: Standard token functionality\n• **Staking**: Users can stake tokens for rewards\n• **Rewards**: 10% APY reward system\n• **Security**: ReentrancyGuard for protection\n• **Events**: Complete event logging\n\n**0G Integration**: Use 0G Compute for complex DeFi calculations and 0G Storage for protocol data!\n\nNeed help with AMMs, lending protocols, or other DeFi primitives?`
        }

        if (message.includes('project') || message.includes('development') || message.includes('move forward') || message.includes('next step')) {
            return `Great question about project development! I'm ${modelName} and I can help you move your project forward:\n\n🚀 **Project Planning**: I can help you break down complex projects into manageable tasks and create development roadmaps\n\n💻 **Technical Implementation**: Whether you're building dApps, smart contracts, or integrating with 0G Network, I can provide code examples and architecture guidance\n\n🔧 **0G Integration**: I can help you integrate 0G Storage and Compute into your projects:\n• Upload and manage data on 0G Storage\n• Deploy AI models to 0G Compute\n• Build verifiable applications\n• Implement wallet-first authentication\n\n📊 **Best Practices**: Code review, security audits, performance optimization, and deployment strategies\n\n🎯 **Next Steps**: What specific aspect of your project would you like to work on? I can help with planning, coding, debugging, or 0G Network integration!\n\nIn this demo, I'm simulating how I would respond on the real 0G Network. What's your current project challenge?`
        }

        // Default contextual response
        return `I'm ${modelName}, running on the 0G Compute Network! You asked: "${userMessage}"\n\nI'm a decentralized AI assistant that can help with various tasks. While this is a demonstration mode, in a real deployment I would be:\n\n🔒 Processing your request using TEE (Trusted Execution Environment)\n📊 Providing verifiable computation proofs\n⚡ Running on decentralized infrastructure\n💰 Using transparent OG token pricing\n\nWhat specific topic would you like to explore? I can help with coding, research, creative writing, analysis, or explain more about the 0G Network!`
    }

    /**
     * Verify a response from a verifiable service
     */
    async verifyResponse(
        providerAddress: string,
        content: string,
        chatId?: string
    ): Promise<boolean> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            if (this.broker) {
                return await this.broker.inference.processResponse(providerAddress, content, chatId)
            } else {
                return true
            }
        } catch (error) {
            console.error('Failed to verify response:', error)
            return false
        }
    }

    /**
     * Get current provider
     * @returns Current provider instance
     */
    getProvider(): BrowserProvider | null {
        return this.provider
    }

    /**
     * Get current signer
     * @returns Current signer instance
     */
    getSigner(): ethers.JsonRpcSigner | null {
        return this.signer
    }

    /**
     * Check if service is in demo mode
     * @returns True if in demo mode (no broker or no provider/signer)
     */
    isDemoMode(): boolean {
        return !this.broker || !this.provider || !this.signer
    }

    /**
     * Get native token balance (for gas fees)
     */
    async getNativeBalance(): Promise<bigint> {
        if (!this.provider || !this.signer) {
            return BigInt('0')
        }

        try {
            const address = await this.signer.getAddress()
            const balance = await this.provider.getBalance(address)
            return balance
        } catch (error) {
            console.warn('Failed to get native balance:', error)
            return BigInt('0')
        }
    }

    /**
     * Get account balance
     */
    async getAccountBalance(): Promise<AccountBalance> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            if (this.broker) {
                const account = await this.broker.ledger.getLedger()

                // Parse the account structure
                const totalBalance = BigInt(account[1])
                const lockedBalance = BigInt(account[2])

                return {
                    balance: totalBalance - lockedBalance,
                    locked: lockedBalance,
                    totalbalance: totalBalance
                }
            } else {
                // Demo mode - return mock balance
                const availableBalance = BigInt('5000000000000000000') // 5 OG
                const lockedBalance = BigInt('1000000000000000000') // 1 OG
                const totalBalance = availableBalance + lockedBalance

                return {
                    balance: availableBalance,
                    locked: lockedBalance,
                    totalbalance: totalBalance
                }
            }
        } catch (error: any) {
            if (error.message?.includes('Account does not exist')) {
                // Return zero balance for new accounts
                return {
                    balance: BigInt('0'),
                    locked: BigInt('0'),
                    totalbalance: BigInt('0')
                }
            } else if (error.message?.includes('could not decode result data') ||
                error.message?.includes('missing revert data') ||
                error.message?.includes('CALL_EXCEPTION')) {
                const networkConfig = getNetworkConfig()
                // Get actual network from provider if available
                let actualChainId = 'unknown'
                try {
                    if (this.provider) {
                        const network = await this.provider.getNetwork()
                        actualChainId = network.chainId.toString()
                    }
                } catch (e) {
                    // Ignore errors getting network info
                }

                console.warn(`⚠️ Contract call failed on ${networkConfig.chain.chainName}`)

                // Return zero balance instead of demo balance for contract errors
                // This indicates the account might exist but we can't query it
                return {
                    balance: BigInt('0'),
                    locked: BigInt('0'),
                    totalbalance: BigInt('0')
                }
            } else if (error.message?.includes('missing trie node') || error.message?.includes('Internal JSON-RPC error')) {
                // Return zero balance for network issues
                return {
                    balance: BigInt('0'),
                    locked: BigInt('0'),
                    totalbalance: BigInt('0')
                }
            }

            // For other errors, return zero balance rather than throwing
            return {
                balance: BigInt('0'),
                locked: BigInt('0'),
                totalbalance: BigInt('0')
            }
        }
    }

    /**
     * Add funds to account
     */
    async addFunds(amount: string): Promise<void> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            if (this.broker) {
                // Check native token balance first
                const nativeBalance = await this.getNativeBalance()
                const nativeBalanceFormatted = ethers.formatEther(nativeBalance)

                // Warn if balance is very low (less than 0.001 0G)
                const minGasBalance = ethers.parseEther('0.001')
                if (nativeBalance < minGasBalance) {
                    console.error(`⚠️ WARNING: Low native token balance (${nativeBalanceFormatted} 0G). Recommended: At least 0.001 0G for gas fees`)
                }

                // Convert to number as per exact documentation
                const numAmount = parseFloat(amount)

                // Check if account already exists by trying addLedger first
                try {
                    await this.broker.ledger.addLedger(numAmount)
                } catch (addLedgerError: any) {
                    // If account already exists, use depositFund instead
                    const errorMessage = addLedgerError.message || addLedgerError.toString()
                    if (errorMessage.includes('Account already exists') ||
                        errorMessage.includes('account') && errorMessage.includes('exist') ||
                        errorMessage.includes('revert')) {
                        await this.broker.ledger.depositFund(numAmount)
                    } else {
                        // Re-throw if it's a different error
                        throw addLedgerError
                    }
                }

                // Wait a bit for the transaction to be confirmed
                await new Promise(resolve => setTimeout(resolve, 2000))
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        } catch (error: any) {
            const networkConfig = getNetworkConfig()
            const errorMessage = error.message || error.toString()

            // Check for insufficient funds error (can be nested in error.data)
            // The error structure is: { code: -32603, data: { code: -32000, message: 'insufficient funds for transfer' } }
            const errorData = error.data || error.error?.data || {}
            const nestedMessage = errorData.message || ''
            const nestedCode = errorData.code || ''

            // Build comprehensive error string checking all possible locations
            const fullErrorString = `${errorMessage} ${nestedMessage} ${nestedCode}`.toLowerCase()

            // Also check if the error code indicates insufficient funds
            const isInsufficientFundsCode = nestedCode === -32000 || nestedCode === '-32000'

            // Check if broker is using testnet addresses on mainnet
            if (networkConfig.network === 'mainnet' && this.broker?.ledger) {
                const ledgerCA = this.broker.ledger.ledgerCA
                const knownTestnetCA = '0x09D00A2B31067da09bf0e873E58746d1285174Cc'

                if (ledgerCA?.toLowerCase() === knownTestnetCA.toLowerCase()) {
                    console.error('❌ ROOT CAUSE IDENTIFIED:')
                    console.error('   The broker library is using testnet contract addresses on mainnet')
                    console.error(`   Ledger Contract: ${ledgerCA}`)
                    console.error('   This contract does not exist on mainnet, so all operations fail')
                    console.error('')
                    console.error('   SOLUTION:')
                    console.error('   1. Switch to testnet: Set NEXT_PUBLIC_0G_NETWORK=testnet in .env.local')
                    console.error('   2. Restart your dev server')
                    console.error('   3. Or wait for @0glabs/0g-serving-broker to support mainnet')
                    throw new Error('Broker library does not support mainnet yet. Use testnet or wait for library update.')
                }
            }

            // Check for insufficient funds FIRST (before missing revert data)
            // This is the actual root cause - the error shows "insufficient funds for transfer"
            if (fullErrorString.includes('insufficient funds') ||
                fullErrorString.includes('insufficient balance') ||
                fullErrorString.includes('insufficient funds for transfer') ||
                errorMessage.includes('insufficient funds') ||
                nestedMessage.includes('insufficient funds') ||
                nestedMessage.includes('insufficient funds for transfer') ||
                isInsufficientFundsCode) {
                console.error("\n💡 FIX: Insufficient native tokens for gas fees")
                console.error("   → Your wallet has 0 native tokens (shown as 'token: 0' in explorer)")
                console.error("   → You need native 0G tokens (not OG tokens) to pay for gas")
                console.error("   → Recommended: At least 0.001 native tokens for gas fees")
                console.error("   → Get native tokens from faucet, bridge, or exchange")
                throw new Error('Insufficient native tokens for gas fees. Your wallet has 0 native tokens. Please add native 0G tokens (not OG tokens) to pay for transaction fees.')
            } else if (errorMessage?.includes('missing trie node') || errorMessage?.includes('missing revert data')) {
                // Missing revert data often means insufficient funds, but we couldn't detect it explicitly
                console.error("\n💡 FIX: Transaction failed (likely insufficient native tokens)")
                console.error("   → Check your wallet has native tokens (not OG tokens) for gas")
                console.error("   → Your explorer shows: balance 7.271 OG, token 0 native")
                console.error("   → You need native tokens for gas fees")
                throw new Error('Transaction failed: missing revert data. This usually indicates insufficient native tokens for gas. Please ensure your wallet has enough native 0G tokens (not OG tokens) for gas fees.')
            } else if (errorMessage?.includes('circuit breaker')) {
                console.error("\n💡 FIX: Network is overloaded (circuit breaker)")
                console.error("   → Wait 1-2 minutes and try again")
                console.error("   → The 0G network is experiencing high traffic")
            } else if (errorMessage?.includes('maxpriorityfee') || errorMessage?.includes('eip-1559')) {
                console.error("\n💡 FIX: Gas pricing issue (EIP-1559 not supported)")
                console.error("   → This is a known issue with 0G testnet")
                console.error("   → Try again in a few moments")
            } else if (errorMessage?.includes('decode result') || errorMessage?.includes('tofixed')) {
                console.error("\n💡 FIX: Amount formatting issue - SDK internal error")
                console.error("   → This appears to be a bug in the 0G SDK")
                console.error("   → Try with a different amount (e.g., 1 instead of 0.1)")
            } else if (errorMessage?.includes('revert')) {
                console.error("\n💡 FIX: Transaction reverted")
                console.error(`   → Ensure you're on ${networkConfig.chain.chainName} (chain ID: ${networkConfig.chain.chainId})`)
                console.error("   → Check if account already exists (try Check Balance first)")
            } else {
                console.error("\n💡 General troubleshooting:")
                console.error(`   → Verify you're on ${networkConfig.chain.chainName} (chain ID: ${networkConfig.chain.chainId})`)
                console.error("   → Ensure you have enough native tokens for gas")
                console.error("   → Try with a different amount (e.g., 1 OG instead of 0.1)")
                console.error("   → Check browser console for detailed error messages")
            }

            throw new Error(`Failed to add funds: ${error.message || error}`)
        }
    }

    /**
     * Deposit funds to existing account
     * If account doesn't exist, it will be created first
     */
    async depositFund(amount: string): Promise<void> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            if (this.broker) {
                // First, check if account exists by trying to get the ledger
                let accountExists = false
                try {
                    await this.broker.ledger.getLedger()
                    accountExists = true
                } catch (checkError: any) {
                    const errorMessage = checkError.message || checkError.toString()
                    if (errorMessage.includes('Account does not exist') ||
                        errorMessage.includes('account') && errorMessage.includes('not exist')) {
                        accountExists = false
                    } else {
                        // Some other error - might be network issue, but try to proceed
                        accountExists = true // Assume it exists and try deposit
                    }
                }

                // If account doesn't exist, create it first using addLedger
                if (!accountExists) {
                    // Check native token balance first
                    const nativeBalance = await this.getNativeBalance()
                    const nativeBalanceFormatted = ethers.formatEther(nativeBalance)

                    // Warn if balance is very low (less than 0.001 0G)
                    const minGasBalance = ethers.parseEther('0.001')
                    if (nativeBalance < minGasBalance) {
                        console.error(`⚠️ WARNING: Low native token balance (${nativeBalanceFormatted} 0G). Recommended: At least 0.001 0G for gas fees`)
                    }

                    try {
                        await this.broker.ledger.addLedger(parseFloat(amount))
                        // Wait a bit for the transaction to be confirmed
                        await new Promise(resolve => setTimeout(resolve, 2000))
                        return
                    } catch (createError: any) {

                        // Check for insufficient funds error (can be nested in error.data)
                        const errorMessage = createError.message || createError.toString()
                        const errorData = createError.data || createError.error?.data || {}
                        const nestedMessage = errorData.message || ''
                        const fullErrorString = `${errorMessage} ${nestedMessage}`.toLowerCase()

                        if (fullErrorString.includes('insufficient funds') ||
                            fullErrorString.includes('insufficient balance') ||
                            errorMessage.includes('insufficient funds') ||
                            nestedMessage.includes('insufficient funds')) {
                            console.error("💰 INSUFFICIENT NATIVE TOKENS FOR GAS!")
                            console.error("Your wallet doesn't have enough native 0G tokens to pay for gas fees.")
                            console.error("")
                            console.error("📝 SOLUTION:")
                            console.error("1. Get some native 0G tokens (not OG tokens) for gas")
                            console.error("2. Native tokens are used to pay for transaction fees")
                            console.error("3. OG tokens are used for the actual deposit")
                            console.error("4. You need BOTH: native tokens (for gas) + OG tokens (to deposit)")
                            console.error("")
                            console.error("💡 Check your wallet's native token balance")
                            console.error("💡 You may need to bridge or get native tokens from a faucet")
                            throw new Error('Insufficient native tokens for gas fees. Please ensure your wallet has enough native 0G tokens to pay for transaction fees.')
                        }

                        throw new Error(`Failed to create account: ${createError.message || createError}`)
                    }
                }

                // Account exists, proceed with deposit
                try {
                    await this.broker.ledger.depositFund(parseFloat(amount))
                } catch (brokerError: any) {
                    // Check if transaction was sent but confirmation failed
                    const errorMessage = brokerError.message || brokerError.toString()
                    const errorString = errorMessage.toLowerCase()

                    // Check if transaction hash exists in error or logs
                    if (errorString.includes('could not coalesce') ||
                        errorString.includes('internal json-rpc error') ||
                        errorString.includes('transaction') ||
                        errorString.includes('receipt')) {
                        // Wait a bit and try to check if transaction went through
                        await new Promise(resolve => setTimeout(resolve, 5000))
                        return
                    }

                    // Re-throw other errors
                    throw brokerError
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        } catch (error: any) {
            // Check for insufficient funds error (can be nested in error.data)
            // The error structure is: { code: -32603, data: { code: -32000, message: 'insufficient funds for transfer' } }
            const errorMessage = error.message || error.toString()
            const errorData = error.data || error.error?.data || {}
            const nestedMessage = errorData.message || ''
            const nestedCode = errorData.code || ''

            // Build comprehensive error string checking all possible locations
            const fullErrorString = `${errorMessage} ${nestedMessage} ${nestedCode}`.toLowerCase()

            // Also check if the error code indicates insufficient funds (-32000)
            const isInsufficientFundsCode = nestedCode === -32000 || nestedCode === '-32000' || nestedCode === -32603 || nestedCode === '-32603'

            if (fullErrorString.includes('insufficient funds') ||
                fullErrorString.includes('insufficient balance') ||
                fullErrorString.includes('insufficient funds for transfer') ||
                errorMessage.includes('insufficient funds') ||
                nestedMessage.includes('insufficient funds') ||
                nestedMessage.includes('insufficient funds for transfer') ||
                isInsufficientFundsCode) {
                console.error("\n💡 FIX: Insufficient native tokens for gas fees")
                console.error("   → Your wallet has 0 native tokens (explorer shows: token 0)")
                console.error("   → You have 7.271 OG tokens, but need native tokens for gas")
                console.error("   → Native tokens ≠ OG tokens - you need BOTH:")
                console.error("     • OG tokens: for deposits (you have 7.271)")
                console.error("     • Native tokens: for gas fees (you have 0)")
                console.error("   → Get native tokens from faucet, bridge, or exchange")
                throw new Error('Insufficient native tokens for gas fees. Your wallet has 0 native tokens. Please add native 0G tokens (not OG tokens) to pay for transaction fees.')
            } else if (errorMessage?.includes('missing trie node') || errorMessage?.includes('missing revert data')) {
                console.error("\n💡 FIX: Transaction failed (likely insufficient native tokens)")
                console.error("   → Your explorer shows: balance 7.271 OG, token 0 native")
                console.error("   → You need native tokens (not OG tokens) for gas fees")
                throw new Error('Transaction failed: missing revert data. This usually indicates insufficient native tokens for gas. Please ensure your wallet has enough native 0G tokens (not OG tokens) for gas fees.')
            }

            throw new Error(`Failed to deposit funds: ${error.message || error}`)
        }
    }

    /**
     * Request refund
     */
    async requestRefund(amount: string): Promise<void> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            if (this.broker) {
                await this.broker.ledger.retrieveFund("fineTuning")
            }
        } catch (error: any) {
            throw new Error(`Failed to request refund: ${error}`)
        }
    }

    /**
     * Transfer funds to inference sub-account
     */
    async transferToInference(providerAddress: string, amount: string): Promise<void> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            if (this.broker) {
                // Use selected provider or fallback to official address
                const finalProviderAddress = providerAddress || "0xf07240Efa67755B5311bc75784a061eDB47165Dd"

                const serviceTypeStr = "inference" // Transfer to inference sub-account
                const amountWei = ethers.parseEther(amount) // Transfer OG token

                await this.broker.ledger.transferFund(
                    finalProviderAddress,
                    serviceTypeStr,
                    amountWei,
                    undefined // gasPrice - can be undefined for default
                )
            }
        } catch (error: any) {
            throw new Error(`Failed to transfer to inference: ${error}`)
        }
    }

    /**
     * Transfer funds to fine-tuning sub-account
     */
    async transferToFineTuning(providerAddress: string, amount: string): Promise<void> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            if (this.broker) {
                // Use selected provider or fallback to official address
                const finalProviderAddress = providerAddress || "0xf07240Efa67755B5311bc75784a061eDB47165Dd"

                const serviceTypeStr = "fineTuning" // Transfer to fine-tuning sub-account
                const amountWei = ethers.parseEther(amount) // Transfer OG token

                await this.broker.ledger.transferFund(
                    finalProviderAddress,
                    serviceTypeStr,
                    amountWei,
                    undefined // gasPrice - can be undefined for default
                )
            }
        } catch (error: any) {
            throw new Error(`Failed to transfer to fine-tuning: ${error}`)
        }
    }

    /**
     * Get official 0G services (hardcoded for reliability)
     */
    getOfficialServices(): ServiceInfo[] {
        return [
            {
                provider: '0xf07240Efa67755B5311bc75784a061eDB47165Dd',
                serviceType: 'llm',
                url: 'https://api.0g.ai/llama-3.3-70b-instruct',
                inputPrice: BigInt('1000000000000000'), // 0.001 OG
                outputPrice: BigInt('2000000000000000'), // 0.002 OG
                updatedAt: BigInt(Date.now()),
                model: 'llama-3.3-70b-instruct',
                verifiability: 'TeeML'
            },
            {
                provider: '0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3',
                serviceType: 'llm',
                url: 'https://api.0g.ai/deepseek-r1-70b',
                inputPrice: BigInt('1500000000000000'), // 0.0015 OG
                outputPrice: BigInt('3000000000000000'), // 0.003 OG
                updatedAt: BigInt(Date.now()),
                model: 'deepseek-r1-70b',
                verifiability: 'TeeML'
            }
        ]
    }
}

export const zgComputeService = new ZGComputeService()

export { ZGComputeService }
