// Using Pinata for IPFS instead of ipfs-http-client
import CryptoJS from 'crypto-js'

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

export interface IPFSUploadResult {
    hash: string
    size: number
    url: string
}

export class IPFSService {
    private pinataJwt: string | null
    private gatewayUrl: string
    private isServiceAvailable: boolean = false

    constructor() {
        // Initialize Pinata JWT
        this.pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT || null

        if (this.pinataJwt) {
            this.isServiceAvailable = true
            console.log('✅ Pinata IPFS service initialized')
        } else {
            console.warn('⚠️ PINATA_JWT not configured, using local fallback')
            this.isServiceAvailable = false
        }

        this.gatewayUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/'
    }

    /**
     * Upload research data to IPFS
     * @param data Research data to upload
     * @returns IPFS hash and metadata
     */
    async uploadResearchData(data: ResearchData): Promise<IPFSUploadResult> {
        // Check if Pinata is available
        if (!this.isServiceAvailable || !this.pinataJwt) {
            console.warn('⚠️ Pinata IPFS not available, using local fallback')
            return this.createLocalFallback(data)
        }

        try {
            console.log('📤 Uploading research data to Pinata IPFS...')

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

            // Upload to Pinata using pinJsonWithPinata
            const ipfsHash = await this.pinJsonWithPinata(structuredData)
            const hash = ipfsHash.replace('ipfs://', '') // Remove ipfs:// prefix

            console.log('✅ Research data uploaded to Pinata IPFS:', hash)

            return {
                hash: hash,
                size: JSON.stringify(structuredData).length,
                url: `${this.gatewayUrl}${hash}`
            }
        } catch (error) {
            console.error('❌ Failed to upload to Pinata IPFS:', error)

            // If Pinata fails, fall back to local storage
            if ((error as any).message?.includes('401') ||
                (error as any).message?.includes('Unauthorized') ||
                (error as any).message?.includes('JWT') ||
                (error as any).message?.includes('Pinata API error')) {
                console.warn('⚠️ Pinata authentication failed, using local fallback')
                return this.createLocalFallback(data)
            }

            throw new Error(`IPFS upload failed: ${error}`)
        }
    }

    /**
     * Pin JSON data to Pinata IPFS
     * @param json JSON object to pin
     * @returns IPFS hash with ipfs:// prefix
     */
    private async pinJsonWithPinata(json: object): Promise<string> {
        const data = JSON.stringify({
            pinataContent: json,
            pinataMetadata: {
                name: `research-data-${Date.now()}.json`,
            },
        })

        const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.pinataJwt}`,
            },
            body: data,
        })

        if (!res.ok) {
            throw new Error(`Pinata API error: ${res.status} ${res.statusText}`)
        }

        const result = (await res.json()) as { IpfsHash: string }
        return `ipfs://${result.IpfsHash}`
    }

    /**
     * Pin file to Pinata IPFS
     * @param file File to upload
     * @returns IPFS hash with ipfs:// prefix
     */
    async pinFileWithPinata(file: File): Promise<string> {
        if (!this.isServiceAvailable || !this.pinataJwt) {
            throw new Error('Pinata IPFS not available')
        }

        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.pinataJwt}`,
            },
            body: formData,
        })

        if (!res.ok) {
            throw new Error(`Pinata API error: ${res.status} ${res.statusText}`)
        }

        const result = (await res.json()) as { IpfsHash: string }
        return `ipfs://${result.IpfsHash}`
    }

    /**
     * Create local fallback when IPFS is unavailable
     * @param data Research data
     * @returns Local fallback result
     */
    private createLocalFallback(data: ResearchData): IPFSUploadResult {
        console.log('💾 Storing data locally (IPFS unavailable)')

        // Generate a local hash for the data using crypto-js (browser-compatible)
        const dataString = JSON.stringify(data)
        const localHash = CryptoJS.SHA256(dataString).toString()

        // Store in localStorage as fallback
        try {
            localStorage.setItem(`research_data_${localHash}`, dataString)
            console.log('✅ Data stored locally:', localHash)
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
     * Retrieve research data from IPFS
     * @param hash IPFS hash
     * @returns Research data
     */
    async getResearchData(hash: string): Promise<ResearchData> {
        // Check if this is a local hash
        if (hash.startsWith('local_')) {
            return this.getLocalFallback(hash)
        }

        try {
            console.log('📥 Retrieving research data from IPFS:', hash)

            // Use Pinata gateway to retrieve data
            const response = await fetch(`${this.gatewayUrl}${hash}`)

            if (!response.ok) {
                throw new Error(`Failed to fetch from IPFS: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()

            console.log('✅ Research data retrieved from IPFS')

            return data.data
        } catch (error) {
            console.error('❌ Failed to retrieve from IPFS:', error)
            throw new Error(`IPFS retrieval failed: ${error}`)
        }
    }

    /**
     * Get local fallback data
     * @param hash Local hash
     * @returns Research data
     */
    private getLocalFallback(hash: string): ResearchData {
        const localHash = hash.replace('local_', '')
        const dataString = localStorage.getItem(`research_data_${localHash}`)

        if (!dataString) {
            throw new Error('Local data not found')
        }

        return JSON.parse(dataString)
    }

    /**
     * Generate verification hash for data integrity
     * @param data Research data
     * @returns Verification hash
     */
    generateVerificationHash(data: ResearchData): string {
        // Use crypto-js for browser-compatible hashing
        const dataString = JSON.stringify(data)
        return CryptoJS.SHA256(dataString).toString()
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
     * Pin data to IPFS for persistence (Pinata handles this automatically)
     * @param hash IPFS hash to pin
     */
    async pinData(hash: string): Promise<void> {
        console.log('📌 Data is automatically pinned by Pinata:', hash)
        // Pinata automatically pins all uploaded data, so this is a no-op
    }

    /**
     * Get IPFS gateway URL for a hash
     * @param hash IPFS hash
     * @returns Gateway URL
     */
    getGatewayUrl(hash: string): string {
        return `${this.gatewayUrl}${hash}`
    }

    /**
     * Check if IPFS is available
     * @returns Whether IPFS is accessible
     */
    public async isAvailable(): Promise<boolean> {
        if (!this.isServiceAvailable || !this.pinataJwt) {
            return false
        }

        try {
            // Test Pinata API connectivity
            const response = await fetch("https://api.pinata.cloud/data/testAuthentication", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${this.pinataJwt}`,
                },
            })

            if (response.ok) {
                return true
            } else {
                console.error('Pinata authentication failed:', response.status)
                this.isServiceAvailable = false
                return false
            }
        } catch (error) {
            console.error('Pinata not available:', error)
            this.isServiceAvailable = false
            return false
        }
    }
}

// Export singleton instance
export const ipfsService = new IPFSService()

