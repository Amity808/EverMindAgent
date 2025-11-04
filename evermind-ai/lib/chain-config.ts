/**
 * Centralized chain configuration for 0G Network
 * Supports both testnet and mainnet
 */

export type NetworkType = 'testnet' | 'mainnet'

export interface ChainConfig {
    chainId: number
    chainIdHex: string
    chainName: string
    rpcUrl: string
    blockExplorerUrl: string
    nativeCurrency: {
        name: string
        symbol: string
        decimals: number
    }
}

export interface NetworkConfig {
    network: NetworkType
    compute: {
        rpcUrl: string
    }
    storage: {
        rpcUrl: string
        indexerRpc: string
    }
    chain: ChainConfig
}

/**
 * Get the current network type from environment variables
 */
export function getNetworkType(): NetworkType {
    const networkEnv = process.env.NEXT_PUBLIC_0G_NETWORK
    return networkEnv === 'mainnet' ? 'mainnet' : 'testnet'
}

/**
 * 0G Testnet Configuration
 */
export const TESTNET_CONFIG: NetworkConfig = {
    network: 'testnet',
    compute: {
        rpcUrl: process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai/',
    },
    storage: {
        rpcUrl: process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai/',
        indexerRpc: process.env.NEXT_PUBLIC_0G_INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai',
    },
    chain: {
        chainId: 16602,
        chainIdHex: '0x40da',
        chainName: '0G Testnet',
        rpcUrl: 'https://evmrpc-testnet.0g.ai',
        blockExplorerUrl: 'https://testnet.0g.ai',
        nativeCurrency: {
            name: 'OG',
            symbol: 'OG',
            decimals: 18,
        },
    },
}

/**
 * 0G Mainnet Configuration
 */
export const MAINNET_CONFIG: NetworkConfig = {
    network: 'mainnet',
    compute: {
        rpcUrl: process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc.0g.ai/',
    },
    storage: {
        rpcUrl: process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc.0g.ai/',
        indexerRpc: process.env.NEXT_PUBLIC_0G_INDEXER_RPC || 'https://indexer-storage-turbo.0g.ai',
    },
    chain: {
        chainId: 16661,
        chainIdHex: '0x4115',
        chainName: '0G Mainnet',
        rpcUrl: 'https://evmrpc.0g.ai',
        blockExplorerUrl: 'https://chainscan.0g.ai',
        nativeCurrency: {
            name: '0G',
            symbol: '0G',
            decimals: 18,
        },
    },
}

/**
 * Get the current network configuration
 */
export function getNetworkConfig(): NetworkConfig {
    const networkType = getNetworkType()
    return networkType === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG
}

/**
 * Get chain configuration for wallet connection
 */
export function getChainConfig(): ChainConfig {
    return getNetworkConfig().chain
}

/**
 * Check if a chainId matches the configured network
 */
export function isChainIdValid(chainId: bigint | number): boolean {
    const config = getNetworkConfig()
    const configChainId = BigInt(config.chain.chainId)
    const providedChainId = typeof chainId === 'bigint' ? chainId : BigInt(chainId)
    return providedChainId === configChainId
}

/**
 * Get the expected chain ID for the current network
 */
export function getExpectedChainId(): bigint {
    const config = getNetworkConfig()
    return BigInt(config.chain.chainId)
}

