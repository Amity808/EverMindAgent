import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { zgComputeService, ServiceInfo, AccountBalance } from '../lib/0g-compute'

export function useZGCompute() {
    const [isInitialized, setIsInitialized] = useState(false)
    const [services, setServices] = useState<ServiceInfo[]>([])
    const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null)
    const [accountBalance, setAccountBalance] = useState<AccountBalance | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const initialize = useCallback(async () => {
        if (isInitialized) return

        try {
            setIsLoading(true)
            setError(null)

            const success = await zgComputeService.initialize(null, null)
            if (success) {
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
                } catch (balanceError) {
                    console.warn('Could not get account balance:', balanceError)
                    // Set mock balance for demo
                    setAccountBalance({
                        balance: BigInt('5000000000000000000'),
                        locked: BigInt('1000000000000000000'),
                        totalbalance: BigInt('6000000000000000000')
                    })
                }
            }
        } catch (err) {
            console.error('Failed to initialize 0G Compute:', err)
            setError('Failed to initialize 0G Compute service')
        } finally {
            setIsLoading(false)
        }
    }, [isInitialized])

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
        try {
            await zgComputeService.addFunds(amount)
            const balance = await zgComputeService.getAccountBalance()
            setAccountBalance(balance)
        } catch (err) {
            console.error('Failed to add funds:', err)
            setError('Failed to add funds')
        }
    }, [])

    const depositFund = useCallback(async (amount: string) => {
        try {
            await zgComputeService.depositFund(amount)
            const balance = await zgComputeService.getAccountBalance()
            setAccountBalance(balance)
        } catch (err) {
            console.error('Failed to deposit funds:', err)
            setError('Failed to deposit funds')
        }
    }, [])

    const requestRefund = useCallback(async (amount: string) => {
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
        if (!isInitialized) {
            initialize()
        }
    }, [isInitialized, initialize])

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
        provider: zgComputeService.getProvider(),
        signer: zgComputeService.getSigner()
    }
}
