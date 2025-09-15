/**
 * Fallback storage service for when 0G Storage SDK is not available
 * This provides a mock implementation for development and testing
 */

import { ethers } from 'ethers'

export interface UploadResult {
    hash: string
    url: string
    size: number
    type: string
    transactionHash?: string
}

export interface StorageConfig {
    provider: 'ipfs' | '0g' | 'arweave'
    endpoint?: string
    apiKey?: string
    rpcUrl?: string
    indexerRpc?: string
    privateKey?: string
}

class FallbackStorageService {
    private config: StorageConfig

    constructor(config: StorageConfig) {
        this.config = config
    }

    /**
     * Upload a file to storage (mock implementation)
     */
    async uploadFile(file: File, metadata?: Record<string, any>): Promise<UploadResult> {
        try {
            // Simulate upload process with progress
            console.log('Starting 0G Storage upload simulation...')
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Generate a realistic hash
            const hash = await this.generateMockHash(file)

            // Simulate merkle tree generation
            console.log('Generating merkle tree...')
            await new Promise(resolve => setTimeout(resolve, 500))

            // Simulate blockchain transaction
            console.log('Submitting to 0G Storage network...')
            await new Promise(resolve => setTimeout(resolve, 1000))

            const transactionHash = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`

            console.log('Upload completed successfully!')
            console.log(`File hash: ${hash}`)
            console.log(`Transaction: ${transactionHash}`)

            return {
                hash,
                url: `https://0g-storage.com/${hash}`,
                size: file.size,
                type: file.type,
                transactionHash
            }
        } catch (error) {
            console.error('Storage upload error:', error)
            throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Generate a mock hash for the file
     */
    private async generateMockHash(file: File): Promise<string> {
        const arrayBuffer = await file.arrayBuffer()
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }

    /**
     * Validate file before upload
     */
    validateFile(file: File, maxSize: number, allowedTypes: string[]): { valid: boolean; error?: string } {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            return {
                valid: false,
                error: `File size exceeds maximum allowed size of ${maxSize}MB`
            }
        }

        // Check file type
        const extension = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!allowedTypes.includes(extension)) {
            return {
                valid: false,
                error: `File type ${extension} is not supported. Allowed types: ${allowedTypes.join(', ')}`
            }
        }

        return { valid: true }
    }

    /**
     * Get file metadata
     */
    async getFileMetadata(hash: string): Promise<Record<string, any> | null> {
        try {
            return {
                hash,
                timestamp: Date.now(),
                size: 0,
                type: 'unknown'
            }
        } catch (error) {
            console.error('Failed to fetch file metadata:', error)
            return null
        }
    }
}

// Export default instance
export const fallbackStorageService = new FallbackStorageService({
    provider: '0g', // Mock 0G Storage
    rpcUrl: process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai/',
    indexerRpc: process.env.NEXT_PUBLIC_0G_INDEXER_RPC || 'https://indexer-storage-testnet-standard.0g.ai',
    privateKey: process.env.NEXT_PUBLIC_0G_PRIVATE_KEY,
})

// Export the class for custom configurations
export { FallbackStorageService }
