import { ethers } from 'ethers'
import { zgStorageService, ResearchData, StorageUploadResult } from './0g-storage-service'

// Re-export ResearchData for external use
export type { ResearchData } from './0g-storage-service'

export interface ResearchSession {
    sessionId: string
    researcher: string
    researchType: string
    startTime: number
    endTime?: number
    totalQueries: number
    totalCost: number
    isActive: boolean
}

export interface ResearchQuery {
    queryId: string
    query: string
    context: string
    timestamp: number
    hasResponse: boolean
}

export interface ResearchResponse {
    queryId: string
    storageHash: string // Changed from ipfsHash to storageHash for 0G Storage
    ipfsHash?: string // Keep for backward compatibility
    verificationHash: string
    cost: number
    timestamp: number
    verified: boolean
    fullData?: ResearchData
}

export interface BlockchainResearchHistory {
    createResearchSession(researchType: string): Promise<string>
    addResearchQuery(sessionId: string, query: string, context: string): Promise<string>
    addResearchResponse(
        sessionId: string,
        queryId: string,
        responseData: ResearchData
    ): Promise<void>
    completeResearchSession(sessionId: string): Promise<void>
    getResearchSession(sessionId: string): Promise<ResearchSession>
    getResearchQuery(sessionId: string, queryId: string): Promise<ResearchQuery>
    getResearchResponse(sessionId: string, queryId: string): Promise<ResearchResponse>
    getResearcherSessions(researcher: string): Promise<string[]>
    verifyResponse(sessionId: string, queryId: string, responseData: string): Promise<boolean>
}

export class ResearchHistoryService implements BlockchainResearchHistory {
    private contract: ethers.Contract
    private provider: ethers.Provider
    private signer: ethers.Signer
    private contractAddress: string

    constructor(
        provider: ethers.Provider,
        signer: ethers.Signer,
        contractAddress: string,
        contractABI: any[]
    ) {
        this.provider = provider
        this.signer = signer
        this.contractAddress = contractAddress
        this.contract = new ethers.Contract(contractAddress, contractABI, signer)
    }

    /**
     * Create a new research session on blockchain
     * @param researchType Type of research
     * @returns Session ID
     */
    async createResearchSession(researchType: string): Promise<string> {
        try {
            // Check native token balance before attempting transaction
            const address = await this.signer.getAddress()
            const nativeBalance = await this.provider.getBalance(address)
            const storageFee = ethers.parseEther('0.001') // 0.001 ETH storage fee
            const minGasBalance = ethers.parseEther('0.0001') // Minimum for gas

            if (nativeBalance < storageFee + minGasBalance) {
                const balanceFormatted = ethers.formatEther(nativeBalance)
                const requiredFormatted = ethers.formatEther(storageFee + minGasBalance)
                throw new Error(`Insufficient native tokens. Required: ${requiredFormatted} (0.001 for storage + gas), Have: ${balanceFormatted}`)
            }

            const tx = await this.contract.createResearchSession(researchType, {
                value: storageFee
            })

            const receipt = await tx.wait()

            // Extract session ID from event
            const event = receipt.logs.find((log: any) => {
                try {
                    const parsed = this.contract.interface.parseLog(log)
                    return parsed?.name === 'ResearchSessionCreated'
                } catch {
                    return false
                }
            })

            if (event) {
                const parsed = this.contract.interface.parseLog(event)
                const sessionId = parsed?.args.sessionId.toString()
                return sessionId
            }

            throw new Error('Failed to extract session ID from transaction')
        } catch (error: any) {
            const errorMessage = error.message || error.toString()
            const errorData = error.data || error.error?.data || {}
            const nestedMessage = errorData.message || ''
            const fullErrorString = `${errorMessage} ${nestedMessage}`.toLowerCase()

            // Check for insufficient funds errors
            if (fullErrorString.includes('insufficient') ||
                errorMessage.includes('insufficient') ||
                nestedMessage.includes('insufficient')) {
                console.error('💰 INSUFFICIENT NATIVE TOKENS FOR RESEARCH SESSION')
                console.error('You need native tokens (not OG tokens) to pay for:')
                console.error('1. Storage fee: 0.001 native tokens')
                console.error('2. Gas fees: ~0.0001 native tokens')
                throw new Error('Insufficient native tokens for research session. Please ensure your wallet has enough native tokens for the storage fee (0.001) and gas fees.')
            }

            // Check for missing revert data (usually means insufficient funds)
            if (errorMessage?.includes('missing revert data') ||
                errorMessage?.includes('estimateGas') ||
                error.code === 'CALL_EXCEPTION') {
                console.error('❌ Transaction failed: missing revert data')
                console.error('This usually means insufficient native tokens for gas fees')
                throw new Error('Transaction failed: insufficient native tokens for gas fees. Please ensure your wallet has enough native tokens (0.001 for storage + gas fees).')
            }

            console.error('❌ Failed to create research session:', error)
            throw new Error(`Failed to create research session: ${error}`)
        }
    }

    /**
     * Add a research query to blockchain
     * @param sessionId Session ID
     * @param query Research query
     * @param context Additional context
     * @returns Query ID
     */
    async addResearchQuery(sessionId: string, query: string, context: string): Promise<string> {
        try {
            // Check native token balance for gas
            const address = await this.signer.getAddress()
            const nativeBalance = await this.provider.getBalance(address)
            const minGasBalance = ethers.parseEther('0.0001')

            if (nativeBalance < minGasBalance) {
                const balanceFormatted = ethers.formatEther(nativeBalance)
                throw new Error(`Insufficient native tokens for gas. Required: ~0.0001, Have: ${balanceFormatted}`)
            }

            const tx = await this.contract.addResearchQuery(sessionId, query, context)
            const receipt = await tx.wait()

            // Extract query ID from event
            const event = receipt.logs.find((log: any) => {
                try {
                    const parsed = this.contract.interface.parseLog(log)
                    return parsed?.name === 'ResearchQueryAdded'
                } catch {
                    return false
                }
            })

            if (event) {
                const parsed = this.contract.interface.parseLog(event)
                const queryId = parsed?.args.queryId.toString()
                return queryId
            }

            throw new Error('Failed to extract query ID from transaction')
        } catch (error: any) {
            const errorMessage = error.message || error.toString()

            if (errorMessage.includes('insufficient') ||
                errorMessage.includes('missing revert data') ||
                error.code === 'CALL_EXCEPTION') {
                console.error('❌ Failed to add query: insufficient native tokens for gas')
                throw new Error('Insufficient native tokens for gas fees. Please ensure your wallet has enough native tokens.')
            }

            console.error('❌ Failed to add research query:', error)
            throw new Error(`Failed to add research query: ${error}`)
        }
    }

    /**
     * Add research response to blockchain and 0G Storage
     * @param sessionId Session ID
     * @param queryId Query ID
     * @param responseData Complete response data
     */
    async addResearchResponse(
        sessionId: string,
        queryId: string,
        responseData: ResearchData
    ): Promise<void> {
        try {
            // Check native token balance for gas
            const address = await this.signer.getAddress()
            const nativeBalance = await this.provider.getBalance(address)
            const minGasBalance = ethers.parseEther('0.0001')

            if (nativeBalance < minGasBalance) {
                const balanceFormatted = ethers.formatEther(nativeBalance)
                throw new Error(`Insufficient native tokens for gas. Required: ~0.0001, Have: ${balanceFormatted}`)
            }

            // Upload to 0G Storage
            const storageResult: StorageUploadResult = await zgStorageService.uploadResearchData(
                responseData,
                this.provider,
                this.signer
            )

            // Generate verification hash
            const verificationHash = zgStorageService.generateVerificationHash(responseData)

            // Store on blockchain (contract still uses ipfsHash field name for backward compatibility)
            const tx = await this.contract.addResearchResponse(
                sessionId,
                queryId,
                storageResult.hash,
                verificationHash,
                ethers.parseEther(responseData.metadata.cost.toString())
            )

            await tx.wait()
        } catch (error: any) {
            const errorMessage = error.message || error.toString()

            if (errorMessage.includes('insufficient') ||
                errorMessage.includes('missing revert data') ||
                error.code === 'CALL_EXCEPTION') {
                console.error('❌ Failed to store response: insufficient native tokens for gas')
                throw new Error('Insufficient native tokens for gas fees. Please ensure your wallet has enough native tokens.')
            }

            console.error('❌ Failed to store research response:', error)
            throw new Error(`Failed to store research response: ${error}`)
        }
    }

    /**
     * Complete a research session
     * @param sessionId Session ID
     */
    async completeResearchSession(sessionId: string): Promise<void> {
        try {
            // Check native token balance for gas
            const address = await this.signer.getAddress()
            const nativeBalance = await this.provider.getBalance(address)
            const minGasBalance = ethers.parseEther('0.0001')

            if (nativeBalance < minGasBalance) {
                const balanceFormatted = ethers.formatEther(nativeBalance)
                throw new Error(`Insufficient native tokens for gas. Required: ~0.0001, Have: ${balanceFormatted}`)
            }

            const tx = await this.contract.completeResearchSession(sessionId)
            await tx.wait()
        } catch (error: any) {
            const errorMessage = error.message || error.toString()

            if (errorMessage.includes('insufficient') ||
                errorMessage.includes('missing revert data') ||
                error.code === 'CALL_EXCEPTION') {
                console.error('❌ Failed to complete session: insufficient native tokens for gas')
                throw new Error('Insufficient native tokens for gas fees. Please ensure your wallet has enough native tokens.')
            }

            console.error('❌ Failed to complete research session:', error)
            throw new Error(`Failed to complete research session: ${error}`)
        }
    }

    /**
     * Get research session details
     * @param sessionId Session ID
     * @returns Session details
     */
    async getResearchSession(sessionId: string): Promise<ResearchSession> {
        try {
            const session = await this.contract.getResearchSession(sessionId)

            return {
                sessionId: session.sessionId_.toString(),
                researcher: session.researcher,
                researchType: session.researchType,
                startTime: Number(session.startTime),
                endTime: session.endTime ? Number(session.endTime) : undefined,
                totalQueries: Number(session.totalQueries),
                totalCost: Number(ethers.formatEther(session.totalCost)),
                isActive: session.isActive
            }
        } catch (error) {
            throw new Error(`Failed to get research session: ${error}`)
        }
    }

    /**
     * Get research query details
     * @param sessionId Session ID
     * @param queryId Query ID
     * @returns Query details
     */
    async getResearchQuery(sessionId: string, queryId: string): Promise<ResearchQuery> {
        try {
            const query = await this.contract.getResearchQuery(sessionId, queryId)

            return {
                queryId: query.queryId_.toString(),
                query: query.query,
                context: query.context,
                timestamp: Number(query.timestamp),
                hasResponse: query.hasResponse
            }
        } catch (error) {
            throw new Error(`Failed to get research query: ${error}`)
        }
    }

    /**
     * Get research response with full data from 0G Storage
     * @param sessionId Session ID
     * @param queryId Query ID
     * @returns Response details with full data
     */
    async getResearchResponse(sessionId: string, queryId: string): Promise<ResearchResponse> {
        try {
            const response = await this.contract.getResearchResponse(sessionId, queryId)

            // Retrieve full data from 0G Storage
            // The contract field is still named ipfsHash for backward compatibility
            const storageHash = response.ipfsHash || response.storageHash || response.ipfsHash
            const fullData = await zgStorageService.getResearchData(storageHash)

            return {
                queryId: response.queryId_.toString(),
                storageHash: storageHash,
                ipfsHash: storageHash, // Keep for backward compatibility
                verificationHash: response.verificationHash,
                cost: Number(ethers.formatEther(response.cost)),
                timestamp: Number(response.timestamp),
                verified: response.verified,
                fullData
            }
        } catch (error) {
            throw new Error(`Failed to get research response: ${error}`)
        }
    }

    /**
     * Get all sessions for a researcher
     * @param researcher Researcher address
     * @returns Array of session IDs
     */
    async getResearcherSessions(researcher: string): Promise<string[]> {
        try {
            const sessions = await this.contract.getResearcherSessions(researcher)
            return sessions.map((id: any) => id.toString())
        } catch (error) {
            throw new Error(`Failed to get researcher sessions: ${error}`)
        }
    }

    /**
     * Verify response integrity
     * @param sessionId Session ID
     * @param queryId Query ID
     * @param responseData Response data to verify
     * @returns Whether response is valid
     */
    async verifyResponse(sessionId: string, queryId: string, responseData: string): Promise<boolean> {
        try {
            return await this.contract.verifyResponse(sessionId, queryId, responseData)
        } catch (error) {
            return false
        }
    }

    /**
     * Get contract balance
     * @returns Contract balance in ETH
     */
    async getContractBalance(): Promise<string> {
        try {
            const balance = await this.contract.getContractBalance()
            return ethers.formatEther(balance)
        } catch (error) {
            throw new Error(`Failed to get contract balance: ${error}`)
        }
    }

    /**
     * Check if 0G Storage is available
     * @returns Whether 0G Storage is accessible
     */
    async isStorageAvailable(): Promise<boolean> {
        return await zgStorageService.isAvailable()
    }

    /**
     * Check if IPFS is available (deprecated, use isStorageAvailable)
     * @returns Whether storage is accessible
     */
    async isIPFSAvailable(): Promise<boolean> {
        return await this.isStorageAvailable()
    }
}

// Export singleton instance factory
export const createResearchHistoryService = (
    provider: ethers.Provider,
    signer: ethers.Signer,
    contractAddress: string,
    contractABI: any[]
): ResearchHistoryService => {
    return new ResearchHistoryService(provider, signer, contractAddress, contractABI)
}
