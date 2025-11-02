import { ZgFile, Indexer, Blob as ZgBlob } from '@0glabs/0g-ts-sdk'
import { ethers } from 'ethers'

// Re-export ResearchData interface for compatibility
export interface ResearchData {
    sessionId: string
    queryId: string
    query: string
    context: string
    response: string
    insights: any[]
    metadata: {
        timestamp: number
        researchType: string
        model: string
        provider: string
        cost: number
    }
}

export interface StorageUploadResult {
    hash: string // Root hash from Merkle tree
    size: number
    url: string
    transactionHash?: string
}

// Keep the old interface name for backward compatibility
export interface IPFSUploadResult extends StorageUploadResult { }

export class ZGStorageService {
    private rpcUrl: string
    private indexerRpc: string
    private indexer: Indexer | null = null

    constructor() {
        // Network Constants - Use environment variables or defaults
        // Testnet (default)
        this.rpcUrl = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai/'
        this.indexerRpc = process.env.NEXT_PUBLIC_0G_INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai'

        // Mainnet (if explicitly set)
        if (process.env.NEXT_PUBLIC_0G_NETWORK === 'mainnet') {
            this.rpcUrl = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc.0g.ai/'
            this.indexerRpc = process.env.NEXT_PUBLIC_0G_INDEXER_RPC || 'https://indexer-storage-turbo.0g.ai'
        }

        // Initialize indexer
        try {
            this.indexer = new Indexer(this.indexerRpc)
            console.log('✅ 0G Storage service initialized')
        } catch (error) {
            console.error('❌ Failed to initialize 0G Storage indexer:', error)
            this.indexer = null
        }
    }

    /**
     * Initialize indexer with provider and signer
     * @param provider Ethereum provider
     * @param signer Ethereum signer
     */
    private ensureIndexer(): Indexer {
        if (!this.indexer) {
            this.indexer = new Indexer(this.indexerRpc)
        }
        return this.indexer
    }

    /**
     * Upload research data to 0G Storage
     * @param data Research data to upload
     * @param provider Ethereum provider (required for upload)
     * @param signer Ethereum signer (required for upload)
     * @returns Storage hash and metadata
     */
    async uploadResearchData(
        data: ResearchData,
        provider: ethers.Provider | null,
        signer: ethers.Signer | null
    ): Promise<StorageUploadResult> {
        // Check if provider and signer are available
        if (!provider || !signer || !this.indexer) {
            console.warn('⚠️ 0G Storage not available (missing provider/signer), using local fallback')
            return this.createLocalFallback(data)
        }

        try {
            console.log('📤 Uploading research data to 0G Storage...')

            // Create structured data object
            const structuredData = {
                version: '1.0',
                timestamp: Date.now(),
                data: data,
                schema: {
                    sessionId: 'string',
                    queryId: 'string',
                    query: 'string',
                    context: 'string',
                    response: 'string',
                    insights: 'array',
                    metadata: 'object'
                }
            }

            // Convert JSON to Buffer/Blob for upload
            const jsonString = JSON.stringify(structuredData)
            const jsonBytes = new TextEncoder().encode(jsonString)

            // Create ZgFile from data
            // In browser, use Blob from SDK. In Node, use Stream
            let file: ZgFile
            if (typeof window !== 'undefined') {
                // Browser environment - use Blob from SDK
                const nativeBlob = new Blob([jsonBytes], { type: 'application/json' })
                file = new ZgBlob(nativeBlob)
            } else {
                // Node environment - use Stream
                const { Readable } = await import('stream')
                const stream = new Readable()
                stream.push(Buffer.from(jsonBytes))
                stream.push(null)
                file = await ZgFile.fromStream(stream, `research-data-${Date.now()}.json`)
            }

            // Generate Merkle tree for verification
            const [tree, treeErr] = await file.merkleTree()
            if (treeErr !== null) {
                throw new Error(`Error generating Merkle tree: ${treeErr}`)
            }

            // Get root hash
            const rootHash = tree?.rootHash()
            if (!rootHash) {
                throw new Error('Failed to get root hash from Merkle tree')
            }

            // Upload to network
            const ensureIndexer = this.ensureIndexer()
            const [tx, uploadErr] = await ensureIndexer.upload(file, this.rpcUrl, signer)
            if (uploadErr !== null) {
                throw new Error(`Upload error: ${uploadErr}`)
            }

            // Close the file
            await file.close()

            console.log('✅ Research data uploaded to 0G Storage:', rootHash)

            return {
                hash: rootHash,
                size: jsonBytes.length,
                url: `https://0g.ai/storage/${rootHash}`,
                transactionHash: tx
            }
        } catch (error) {
            console.error('❌ Failed to upload to 0G Storage:', error)

            // If upload fails, fall back to local storage
            console.warn('⚠️ 0G Storage upload failed, using local fallback')
            return this.createLocalFallback(data)
        }
    }

    /**
     * Retrieve research data from 0G Storage
     * @param rootHash Root hash from Merkle tree
     * @returns Research data
     */
    async getResearchData(rootHash: string): Promise<ResearchData> {
        // Check if this is a local hash
        if (rootHash.startsWith('local_')) {
            return this.getLocalFallback(rootHash)
        }

        // Check if this is an old IPFS hash (for backward compatibility)
        if (!rootHash.startsWith('0x')) {
            // Might be an old IPFS hash, try to load from localStorage
            try {
                return this.getLocalFallback(rootHash)
            } catch {
                // If not found locally, try to treat as 0G hash
            }
        }

        if (!this.indexer) {
            throw new Error('0G Storage indexer not initialized')
        }

        try {
            console.log('📥 Retrieving research data from 0G Storage:', rootHash)

            let data: any

            if (typeof window !== 'undefined') {
                // Browser: create a temporary object URL to download the file
                // The download method expects a file path, so we'll use a blob URL approach
                // For browser, we can try to fetch directly from the storage network
                // or use a workaround with a temporary file object

                // Create a temporary File object to use as download destination
                // Note: This is a workaround since browser doesn't have file system access
                // In practice, you might need to use a different approach or fetch API
                try {
                    // Try to construct a direct URL to the storage network
                    // This is a simplified approach - you may need to adjust based on actual 0G Storage gateway
                    const storageUrl = `https://0g.ai/storage/${rootHash}`
                    const response = await fetch(storageUrl)
                    if (response.ok) {
                        data = await response.json()
                    } else {
                        throw new Error(`Failed to fetch from storage: ${response.status}`)
                    }
                } catch (fetchError) {
                    // Fallback: try using download with a temporary file
                    // This might not work in browser, so we'll throw the error
                    console.warn('Direct fetch failed, trying alternative method:', fetchError)
                    throw new Error(`Browser download not fully implemented. Use Node.js environment or check 0G Storage gateway configuration.`)
                }
            } else {
                // Node: use temp file
                const fs = await import('fs')
                const path = await import('path')
                const os = await import('os')
                const outputPath = path.join(os.tmpdir(), `research-${rootHash.slice(0, 8)}.json`)

                // Download from 0G Storage (with proof verification)
                const err = await this.indexer.download(rootHash, outputPath, true)
                if (err !== null) {
                    throw new Error(`Download error: ${err}`)
                }

                // Read from file
                const fileContent = fs.readFileSync(outputPath, 'utf-8')
                data = JSON.parse(fileContent)
                fs.unlinkSync(outputPath) // Clean up temp file
            }

            console.log('✅ Research data retrieved from 0G Storage')

            // Extract the actual data from the structured format
            return data.data || data
        } catch (error) {
            console.error('❌ Failed to retrieve from 0G Storage:', error)

            // Try to get from local storage as fallback
            try {
                return this.getLocalFallback(rootHash)
            } catch {
                throw new Error(`0G Storage retrieval failed: ${error}`)
            }
        }
    }

    /**
     * Create local fallback when 0G Storage is unavailable
     * @param data Research data
     * @returns Local fallback result
     */
    private createLocalFallback(data: ResearchData): StorageUploadResult {
        console.log('💾 Storing data locally (0G Storage unavailable)')

        // Generate a local hash for the data
        const crypto = require('crypto')
        const dataString = JSON.stringify(data)
        const localHash = crypto.createHash('sha256').update(dataString).digest('hex')

        // Store in localStorage as fallback
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem(`research_data_${localHash}`, dataString)
                console.log('✅ Data stored locally:', localHash)
            }
        } catch (storageError) {
            console.warn('⚠️ Failed to store in localStorage:', storageError)
        }

        return {
            hash: `local_${localHash}`,
            size: dataString.length,
            url: `local://${localHash}`
        }
    }

    /**
     * Get local fallback data
     * @param hash Local hash
     * @returns Research data
     */
    private getLocalFallback(hash: string): ResearchData {
        const localHash = hash.replace('local_', '')

        if (typeof window !== 'undefined') {
            const dataString = localStorage.getItem(`research_data_${localHash}`)
            if (!dataString) {
                throw new Error('Local data not found')
            }
            return JSON.parse(dataString)
        } else {
            throw new Error('Local storage not available in Node environment')
        }
    }

    /**
     * Generate verification hash for data integrity
     * @param data Research data
     * @returns Verification hash
     */
    generateVerificationHash(data: ResearchData): string {
        const crypto = require('crypto')
        const dataString = JSON.stringify(data)
        return crypto.createHash('sha256').update(dataString).digest('hex')
    }

    /**
     * Verify data integrity using hash
     * @param data Research data
     * @param expectedHash Expected hash
     * @returns Whether data is valid
     */
    verifyDataIntegrity(data: ResearchData, expectedHash: string): boolean {
        const actualHash = this.generateVerificationHash(data)
        return actualHash === expectedHash
    }

    /**
     * Get storage gateway URL for a hash
     * @param hash Storage hash
     * @returns Gateway URL
     */
    getGatewayUrl(hash: string): string {
        if (hash.startsWith('local_')) {
            return `local://${hash.replace('local_', '')}`
        }
        return `https://0g.ai/storage/${hash}`
    }

    /**
     * Check if 0G Storage is available
     * @returns Whether 0G Storage is accessible
     */
    public async isAvailable(): Promise<boolean> {
        return this.indexer !== null
    }
}

// Export singleton instance
export const zgStorageService = new ZGStorageService()

// Export as ipfsService for backward compatibility during migration
// Note: This wrapper provides backward compatibility but requires provider/signer for uploads
export const ipfsService = {
    uploadResearchData: async (
        data: ResearchData,
        provider?: ethers.Provider | null,
        signer?: ethers.Signer | null
    ) => {
        // If provider/signer not provided, try to get from context or use null (will fallback to local)
        return zgStorageService.uploadResearchData(data, provider || null, signer || null)
    },
    getResearchData: (hash: string) => zgStorageService.getResearchData(hash),
    generateVerificationHash: (data: ResearchData) => zgStorageService.generateVerificationHash(data),
    verifyDataIntegrity: (data: ResearchData, expectedHash: string) =>
        zgStorageService.verifyDataIntegrity(data, expectedHash),
    getGatewayUrl: (hash: string) => zgStorageService.getGatewayUrl(hash),
    isAvailable: () => zgStorageService.isAvailable(),
    // Keep old interface names for compatibility
    pinJsonWithPinata: async (json: object) => {
        console.warn('pinJsonWithPinata is deprecated, use uploadResearchData instead')
        throw new Error('Pinata IPFS is deprecated. Please use 0G Storage with uploadResearchData method.')
    },
    pinFileWithPinata: async (file: File) => {
        console.warn('pinFileWithPinata is deprecated, use 0G Storage instead')
        throw new Error('Pinata IPFS is deprecated. Please use 0G Storage.')
    }
}

