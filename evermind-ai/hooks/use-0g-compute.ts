import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { zgComputeService, ServiceInfo, AccountBalance } from '../lib/0g-compute'
import { useWeb3 } from '@/components/web3-provider'

export function useZGCompute() {
    const { provider, signer, isConnected } = useWeb3()
    const [isInitialized, setIsInitialized] = useState(false)
    const [services, setServices] = useState<ServiceInfo[]>([])
    const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null)
    const [accountBalance, setAccountBalance] = useState<AccountBalance | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDemoMode, setIsDemoMode] = useState(false)

    const initialize = useCallback(async () => {
        // Check if already initialized at service level
        if (zgComputeService.isReady()) {
            if (!isInitialized) {
                setIsInitialized(true)
                // Load services and balance
                try {
                    const availableServices = await zgComputeService.getAvailableServices()
                    setServices(availableServices)
                    if (availableServices.length > 0 && !selectedService) {
                        setSelectedService(availableServices[0])
                    }
                } catch (err) {
                    console.error('Failed to load services after initialization:', err)
                }
            }
            return
        }

        // Don't initialize if already in progress
        if (isInitialized) return

        try {
            setIsLoading(true)
            setError(null)

            // Use actual provider and signer from wallet if connected
            const success = await zgComputeService.initialize(provider, signer)
            if (success && zgComputeService.isReady()) {
                setIsInitialized(true)
                const availableServices = await zgComputeService.getAvailableServices()
                setServices(availableServices)
                if (availableServices.length > 0) {
                    setSelectedService(availableServices[0])
                }

                // Get account balance
                try {
                    const balance = await zgComputeService.getAccountBalance()
                    setAccountBalance(balance)
                    // Check if we're in demo mode
                    setIsDemoMode(zgComputeService.isDemoMode())
                } catch (balanceError: any) {
                    console.warn('Could not get account balance:', balanceError)
                    // Check if it's a real error or just no account yet
                    if (balanceError.message?.includes('Account does not exist')) {
                        // Account doesn't exist yet - this is normal for new mainnet addresses
                        setIsDemoMode(false)
                        setAccountBalance({
                            balance: BigInt('0'),
                            locked: BigInt('0'),
                            totalbalance: BigInt('0')
                        })
                    } else {
                        // Other error - likely demo mode
                        setIsDemoMode(true)
                        setAccountBalance({
                            balance: BigInt('5000000000000000000'),
                            locked: BigInt('1000000000000000000'),
                            totalbalance: BigInt('6000000000000000000')
                        })
                    }
                }
            } else {
                console.warn('Service initialization returned success but service is not ready')
                // Mark as initialized anyway - service might be in demo mode
                setIsInitialized(true)
            }
        } catch (err) {
            console.error('Failed to initialize 0G Compute:', err)
            setError('Failed to initialize 0G Compute service')
            // Still mark as initialized to prevent infinite retries
            setIsInitialized(true)
        } finally {
            setIsLoading(false)
        }
    }, [isInitialized, selectedService])

    const sendInference = useCallback(async (request: any) => {
        if (!selectedService) {
            throw new Error('No service selected')
        }

        try {
            setIsLoading(true)
            setError(null)

            const response = await zgComputeService.sendInferenceRequest(
                request.messages[0].content,
                selectedService.provider
            )

            return response
        } catch (err) {
            console.error('Inference request failed:', err)
            setError('Failed to send inference request')
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [selectedService])

    const addFunds = useCallback(async (amount: string) => {
        if (!zgComputeService.isReady()) {
            console.error('0G Compute service not initialized. Please wait...')
            setError('Service not initialized. Please wait for initialization to complete.')
            return
        }
        try {
            await zgComputeService.addFunds(amount)
            // Wait a bit longer for transaction to be fully confirmed
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Try to get balance, but don't fail if it errors
            try {
                const balance = await zgComputeService.getAccountBalance()
                setAccountBalance(balance)
            } catch (balanceError: any) {
                console.warn('⚠️ Could not read balance immediately after funding:', balanceError)
                console.warn('💡 Your funds were added successfully (transaction confirmed)')
                console.warn('💡 The balance will update once the contract read issue is resolved')
                // Set zero balance as fallback - user knows funds were added from transaction hash
                setAccountBalance({
                    balance: BigInt('0'),
                    locked: BigInt('0'),
                    totalbalance: BigInt('0')
                })
            }
        } catch (err) {
            console.error('Failed to add funds:', err)
            setError('Failed to add funds')
        }
    }, [])

    const depositFund = useCallback(async (amount: string) => {
        if (!zgComputeService.isReady()) {
            console.error('0G Compute service not initialized. Please wait...')
            setError('Service not initialized. Please wait for initialization to complete.')
            return
        }
        try {
            await zgComputeService.depositFund(amount)

            // Wait a bit for transaction to be confirmed before checking balance
            await new Promise(resolve => setTimeout(resolve, 3000))

            // Try to get balance, but don't fail if it errors
            try {
                const balance = await zgComputeService.getAccountBalance()
                setAccountBalance(balance)
            } catch (balanceError: any) {
                console.warn('⚠️ Could not read balance immediately after deposit:', balanceError)
                console.warn('💡 Your deposit transaction was submitted successfully')
                console.warn('💡 The balance will update once the transaction is confirmed and readable')
                // Don't set error - transaction was sent, just balance check failed
            }
        } catch (err) {
            console.error('Failed to deposit funds:', err)
            setError('Failed to deposit funds')
        }
    }, [])

    const requestRefund = useCallback(async (amount: string) => {
        if (!zgComputeService.isReady()) {
            console.error('0G Compute service not initialized. Please wait...')
            setError('Service not initialized. Please wait for initialization to complete.')
            return
        }
        try {
            await zgComputeService.requestRefund(amount)
            const balance = await zgComputeService.getAccountBalance()
            setAccountBalance(balance)
        } catch (err) {
            console.error('Failed to request refund:', err)
            setError('Failed to request refund')
        }
    }, [])

    const transferToInference = useCallback(async (providerAddress: string, amount: string) => {
        if (!zgComputeService.isReady()) {
            console.error('0G Compute service not initialized. Please wait...')
            setError('Service not initialized. Please wait for initialization to complete.')
            return
        }
        try {
            await zgComputeService.transferToInference(providerAddress, amount)
            const balance = await zgComputeService.getAccountBalance()
            setAccountBalance(balance)
        } catch (err) {
            console.error('Failed to transfer to inference:', err)
            setError('Failed to transfer to inference')
        }
    }, [])

    const transferToFineTuning = useCallback(async (providerAddress: string, amount: string) => {
        if (!zgComputeService.isReady()) {
            console.error('0G Compute service not initialized. Please wait...')
            setError('Service not initialized. Please wait for initialization to complete.')
            return
        }
        try {
            await zgComputeService.transferToFineTuning(providerAddress, amount)
            const balance = await zgComputeService.getAccountBalance()
            setAccountBalance(balance)
        } catch (err) {
            console.error('Failed to transfer to fine-tuning:', err)
            setError('Failed to transfer to fine-tuning')
        }
    }, [])

    const refreshServices = useCallback(async () => {
        try {
            const availableServices = await zgComputeService.getAvailableServices()
            setServices(availableServices)
            if (availableServices.length > 0 && !selectedService) {
                setSelectedService(availableServices[0])
            }
        } catch (err) {
            console.error('Failed to refresh services:', err)
            setError('Failed to refresh services')
        }
    }, [selectedService])

    const refreshBalance = useCallback(async () => {
        try {
            const balance = await zgComputeService.getAccountBalance()
            setAccountBalance(balance)
        } catch (err) {
            console.error('Failed to refresh balance:', err)
            setError('Failed to refresh balance')
        }
    }, [])

    useEffect(() => {
        // Initialize if not already initialized and we have a connection
        if (!isInitialized && (isConnected || provider)) {
            initialize()
        }
    }, [isInitialized, initialize, provider, signer, isConnected])

    return {
        isInitialized,
        services,
        selectedService,
        setSelectedService,
        accountBalance,
        isLoading,
        error,
        sendInference,
        addFunds,
        depositFund,
        requestRefund,
        transferToInference,
        transferToFineTuning,
        refreshServices,
        refreshBalance,
        initialize,
        isDemoMode,
        provider: zgComputeService.getProvider(),
        signer: zgComputeService.getSigner()
    }
}
