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
                setServices(zgComputeService.getOfficialServices())
                setSelectedService(zgComputeService.getOfficialServices()[0])
                setAccountBalance({
                    balance: BigInt('5000000000000000000'),
                    locked: BigInt('1000000000000000000'),
                    totalbalance: BigInt('6000000000000000000')
                })
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

    useEffect(() => {
        if (!isInitialized) {
            const initDemo = async () => {
                try {
                    await zgComputeService.initialize(null as any, null as any)
                    setIsInitialized(true)
                    setServices(zgComputeService.getOfficialServices())
                    setSelectedService(zgComputeService.getOfficialServices()[0])
                    setAccountBalance({
                        balance: BigInt('5000000000000000000'),
                        locked: BigInt('1000000000000000000'),
                        totalbalance: BigInt('6000000000000000000')
                    })
                } catch (error) {
                    console.error('Failed to initialize in demo mode:', error)
                    setError('Failed to initialize demo mode')
                }
            }
            initDemo()
        }
    }, [isInitialized])

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
        requestRefund,
        initialize
    }
}
