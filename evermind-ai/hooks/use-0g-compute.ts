/**
 * React hook for 0G Compute Network integration
 * Provides state management and operations for AI inference services
 */

import { useState, useEffect, useCallback } from 'react'
import { useWeb3 } from '@/components/web3-provider'
import { zgComputeService, ServiceInfo, InferenceRequest, InferenceResponse, AccountBalance } from '@/lib/0g-compute'

export interface UseZGComputeReturn {
    // State
    isInitialized: boolean
    isLoading: boolean
    error: string | null
    services: ServiceInfo[]
    selectedService: ServiceInfo | null
    accountBalance: AccountBalance | null

    // Actions
    initialize: () => Promise<void>
    refreshServices: () => Promise<void>
    selectService: (service: ServiceInfo) => Promise<void>
    sendInference: (request: InferenceRequest) => Promise<InferenceResponse>
    addFunds: (amount: string) => Promise<void>
    refreshBalance: () => Promise<void>
    requestRefund: (serviceType: string, amount: string) => Promise<void>
}

export function useZGCompute(): UseZGComputeReturn {
    const { provider, signer, isConnected } = useWeb3()

    // State
    const [isInitialized, setIsInitialized] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [services, setServices] = useState<ServiceInfo[]>([])
    const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null)
    const [accountBalance, setAccountBalance] = useState<AccountBalance | null>(null)

    // Initialize 0G Compute service
    const initialize = useCallback(async () => {
        if (!provider || !signer || !isConnected) {
            setError('Wallet not connected')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            await zgComputeService.initialize(provider, signer)
            setIsInitialized(true)

            // Load initial data
            await Promise.all([
                refreshServices(),
                refreshBalance()
            ])
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initialize 0G Compute'
            setError(errorMessage)
            console.error('0G Compute initialization error:', err)
        } finally {
            setIsLoading(false)
        }
    }, [provider, signer, isConnected])

    // Refresh available services
    const refreshServices = useCallback(async () => {
        if (!zgComputeService.isReady()) {
            setError('0G Compute service not initialized')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // Try to get services from network, fallback to official services
            let availableServices: ServiceInfo[]
            try {
                availableServices = await zgComputeService.getAvailableServices()
            } catch (networkError) {
                console.warn('Failed to fetch services from network, using official services:', networkError)
                availableServices = zgComputeService.getOfficialServices()
            }

            setServices(availableServices)

            // Auto-select first service if none selected
            if (!selectedService && availableServices.length > 0) {
                await selectService(availableServices[0])
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to refresh services'
            setError(errorMessage)
            console.error('Service refresh error:', err)
        } finally {
            setIsLoading(false)
        }
    }, [selectedService])

    // Select a service
    const selectService = useCallback(async (service: ServiceInfo) => {
        if (!zgComputeService.isReady()) {
            setError('0G Compute service not initialized')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // Acknowledge the provider
            await zgComputeService.acknowledgeProvider(service.provider)
            setSelectedService(service)
            console.log(`Selected service: ${service.model} (${service.provider})`)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to select service'
            setError(errorMessage)
            console.error('Service selection error:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Send inference request
    const sendInference = useCallback(async (request: InferenceRequest): Promise<InferenceResponse> => {
        if (!zgComputeService.isReady()) {
            throw new Error('0G Compute service not initialized')
        }

        if (!selectedService) {
            throw new Error('No service selected')
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await zgComputeService.sendInferenceRequest(
                selectedService.provider,
                request
            )

            // Refresh balance after successful inference
            await refreshBalance()

            return response
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Inference request failed'
            setError(errorMessage)
            console.error('Inference error:', err)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [selectedService])

    // Add funds to account
    const addFunds = useCallback(async (amount: string) => {
        if (!zgComputeService.isReady()) {
            setError('0G Compute service not initialized')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            await zgComputeService.addFunds(amount)
            await refreshBalance()
            console.log(`Added ${amount} OG tokens to account`)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add funds'
            setError(errorMessage)
            console.error('Add funds error:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Refresh account balance
    const refreshBalance = useCallback(async () => {
        if (!zgComputeService.isReady()) {
            return
        }

        try {
            const balance = await zgComputeService.getAccountBalance()
            setAccountBalance(balance)
        } catch (err) {
            console.error('Balance refresh error:', err)
        }
    }, [])

    // Request refund
    const requestRefund = useCallback(async (serviceType: string, amount: string) => {
        if (!zgComputeService.isReady()) {
            setError('0G Compute service not initialized')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            await zgComputeService.requestRefund(serviceType, amount)
            await refreshBalance()
            console.log(`Requested refund of ${amount} OG tokens for ${serviceType}`)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to request refund'
            setError(errorMessage)
            console.error('Refund request error:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Auto-initialize when wallet connects
    useEffect(() => {
        if (isConnected && provider && signer && !isInitialized) {
            initialize()
        }
    }, [isConnected, provider, signer, isInitialized, initialize])

    // Cleanup on disconnect
    useEffect(() => {
        if (!isConnected) {
            setIsInitialized(false)
            setServices([])
            setSelectedService(null)
            setAccountBalance(null)
            setError(null)
        }
    }, [isConnected])

    return {
        // State
        isInitialized,
        isLoading,
        error,
        services,
        selectedService,
        accountBalance,

        // Actions
        initialize,
        refreshServices,
        selectService,
        sendInference,
        addFunds,
        refreshBalance,
        requestRefund
    }
}
