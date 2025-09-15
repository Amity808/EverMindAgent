/**
 * 0G Compute Network SDK Integration
 * Provides AI inference services through the 0G Compute Network
 */

import { ethers } from 'ethers'
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker'

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
    private broker: any = null
    private provider: ethers.BrowserProvider | null = null
    private signer: ethers.JsonRpcSigner | null = null
    private isInitialized = false

    /**
     * Initialize the 0G Compute broker using the connected wallet
     */
    async initialize(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
        try {
            this.provider = provider
            this.signer = signer

            // Create broker with the user's wallet signer
            this.broker = await createZGComputeNetworkBroker(signer)
            this.isInitialized = true

            console.log('0G Compute broker initialized successfully with user wallet')
            return true
        } catch (error) {
            console.error('Failed to initialize 0G Compute broker:', error)
            throw new Error(`Failed to initialize 0G Compute broker: ${error}`)
        }
    }

    /**
     * Check if the service is initialized
     */
    isReady(): boolean {
        return this.isInitialized && this.broker !== null
    }

    /**
     * Get available AI services on the 0G Network
     */
    async getAvailableServices(): Promise<ServiceInfo[]> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            const services = await this.broker.inference.listService()
            return services.map((service: any) => ({
                provider: service.provider,
                serviceType: service.serviceType,
                url: service.url,
                inputPrice: service.inputPrice,
                outputPrice: service.outputPrice,
                updatedAt: service.updatedAt,
                model: service.model,
                verifiability: service.verifiability
            }))
        } catch (error) {
            console.error('Failed to get available services:', error)
            throw new Error(`Failed to get available services: ${error}`)
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
            await this.broker.inference.acknowledgeProviderSigner(providerAddress)
            console.log(`Provider ${providerAddress} acknowledged successfully`)
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
            const metadata = await this.broker.inference.getServiceMetadata(providerAddress)
            return {
                endpoint: metadata.endpoint,
                model: metadata.model
            }
        } catch (error) {
            console.error('Failed to get service metadata:', error)
            throw new Error(`Failed to get service metadata: ${error}`)
        }
    }

    /**
     * Generate authenticated request headers for a service
     */
    async getRequestHeaders(providerAddress: string, question: string): Promise<Record<string, string>> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            const headers = await this.broker.inference.getRequestHeaders(providerAddress, question)
            return headers
        } catch (error) {
            console.error('Failed to get request headers:', error)
            throw new Error(`Failed to get request headers: ${error}`)
        }
    }

    /**
     * Send an inference request to a 0G Compute service
     */
    async sendInferenceRequest(
        providerAddress: string,
        request: InferenceRequest
    ): Promise<InferenceResponse> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            // Get service metadata
            const { endpoint, model } = await this.getServiceMetadata(providerAddress)

            // Generate auth headers
            const question = request.messages.map(m => m.content).join('\n')
            const headers = await this.getRequestHeaders(providerAddress, question)

            // Send request
            const response = await fetch(`${endpoint}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: JSON.stringify({
                    ...request,
                    model: model
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Failed to send inference request:', error)
            throw new Error(`Failed to send inference request: ${error}`)
        }
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
            const valid = await this.broker.inference.processResponse(
                providerAddress,
                content,
                chatId
            )
            return valid
        } catch (error) {
            console.error('Failed to verify response:', error)
            return false
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
            const ledger = await this.broker.ledger.getLedger()
            return {
                balance: ledger.balance,
                locked: ledger.locked,
                totalbalance: ledger.totalbalance
            }
        } catch (error) {
            console.error('Failed to get account balance:', error)
            throw new Error(`Failed to get account balance: ${error}`)
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
            await this.broker.ledger.addLedger(amount)
            console.log(`Added ${amount} OG tokens to account`)
        } catch (error) {
            console.error('Failed to add funds:', error)
            throw new Error(`Failed to add funds: ${error}`)
        }
    }

    /**
     * Request refund
     */
    async requestRefund(serviceType: string, amount: string): Promise<void> {
        if (!this.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        try {
            await this.broker.ledger.retrieveFund(serviceType, amount)
            console.log(`Requested refund of ${amount} OG tokens for ${serviceType}`)
        } catch (error) {
            console.error('Failed to request refund:', error)
            throw new Error(`Failed to request refund: ${error}`)
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

// Export singleton instance
export const zgComputeService = new ZGComputeService()

// Export the class for custom configurations
export { ZGComputeService }
