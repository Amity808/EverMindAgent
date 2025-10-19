import { ethers } from 'ethers'
import { ipfsService, ResearchData, IPFSUploadResult } from './ipfs-service'

// Re-export ResearchData for external use
export type { ResearchData } from './ipfs-service'

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
    ipfsHash: string
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
            console.log('🔗 Creating research session on blockchain...')

            const storageFee = ethers.parseEther('0.001') // 0.001 ETH storage fee

            const tx = await this.contract.createResearchSession(researchType, {
                value: storageFee
            })

            console.log('⏳ Transaction submitted:', tx.hash)
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
                console.log('✅ Research session created:', sessionId)
                return sessionId
            }

            throw new Error('Failed to extract session ID from transaction')
        } catch (error) {
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
            console.log('📝 Adding research query to blockchain...')

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
                console.log('✅ Research query added:', queryId)
                return queryId
            }

            throw new Error('Failed to extract query ID from transaction')
        } catch (error) {
            console.error('❌ Failed to add research query:', error)
            throw new Error(`Failed to add research query: ${error}`)
        }
    }

    /**
     * Add research response to blockchain and IPFS
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
            console.log('💾 Storing research response...')

            // Upload to IPFS
            const ipfsResult: IPFSUploadResult = await ipfsService.uploadResearchData(responseData)

            // Generate verification hash
            const verificationHash = ipfsService.generateVerificationHash(responseData)

            // Store on blockchain
            const tx = await this.contract.addResearchResponse(
                sessionId,
                queryId,
                ipfsResult.hash,
                verificationHash,
                ethers.parseEther(responseData.metadata.cost.toString())
            )

            await tx.wait()

            console.log('✅ Research response stored:', {
                sessionId,
                queryId,
                ipfsHash: ipfsResult.hash,
                verificationHash
            })
        } catch (error) {
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
            console.log('🏁 Completing research session...')

            const tx = await this.contract.completeResearchSession(sessionId)
            await tx.wait()

            console.log('✅ Research session completed:', sessionId)
        } catch (error) {
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
            console.error('❌ Failed to get research session:', error)
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
            console.error('❌ Failed to get research query:', error)
            throw new Error(`Failed to get research query: ${error}`)
        }
    }

    /**
     * Get research response with full data from IPFS
     * @param sessionId Session ID
     * @param queryId Query ID
     * @returns Response details with full data
     */
    async getResearchResponse(sessionId: string, queryId: string): Promise<ResearchResponse> {
        try {
            const response = await this.contract.getResearchResponse(sessionId, queryId)

            // Retrieve full data from IPFS
            const fullData = await ipfsService.getResearchData(response.ipfsHash)

            return {
                queryId: response.queryId_.toString(),
                ipfsHash: response.ipfsHash,
                verificationHash: response.verificationHash,
                cost: Number(ethers.formatEther(response.cost)),
                timestamp: Number(response.timestamp),
                verified: response.verified,
                fullData
            }
        } catch (error) {
            console.error('❌ Failed to get research response:', error)
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
            console.error('❌ Failed to get researcher sessions:', error)
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
            console.error('❌ Failed to verify response:', error)
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
            console.error('❌ Failed to get contract balance:', error)
            throw new Error(`Failed to get contract balance: ${error}`)
        }
    }

    /**
     * Check if IPFS is available
     * @returns Whether IPFS is accessible
     */
    async isIPFSAvailable(): Promise<boolean> {
        return await ipfsService.isAvailable()
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
