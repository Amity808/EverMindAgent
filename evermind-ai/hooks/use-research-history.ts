import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import {
    ResearchHistoryService,
    ResearchSession,
    ResearchQuery,
    ResearchResponse,
    ResearchData
} from '@/lib/research-history-service'

export interface UseResearchHistoryReturn {
    // State
    currentSession: ResearchSession | null
    sessions: ResearchSession[]
    queries: ResearchQuery[]
    responses: ResearchResponse[]
    isLoading: boolean
    error: string | null

    // Session management
    createSession: (researchType: string) => Promise<string>
    completeSession: () => Promise<void>

    // Query management
    addQuery: (query: string, context: string) => Promise<string>

    // Response management
    addResponse: (queryId: string, responseData: ResearchData) => Promise<void>

    // Data retrieval
    loadSessions: () => Promise<void>
    loadSession: (sessionId: string) => Promise<void>
    loadQuery: (queryId: string) => Promise<ResearchQuery | null>
    loadResponse: (queryId: string) => Promise<ResearchResponse | null>

    // Verification
    verifyResponse: (queryId: string, responseData: string) => Promise<boolean>

    // Utility
    refreshData: () => Promise<void>
    clearError: () => void
}

export const useResearchHistory = (
    provider: ethers.Provider | null,
    signer: ethers.Signer | null,
    contractAddress: string,
    contractABI: any[]
): UseResearchHistoryReturn => {
    const [researchHistoryService, setResearchHistoryService] = useState<ResearchHistoryService | null>(null)
    const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null)
    const [sessions, setSessions] = useState<ResearchSession[]>([])
    const [queries, setQueries] = useState<ResearchQuery[]>([])
    const [responses, setResponses] = useState<ResearchResponse[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Initialize service when provider/signer changes
    useEffect(() => {
        if (provider && signer && contractAddress && contractABI) {
            try {
                const service = new ResearchHistoryService(provider, signer, contractAddress, contractABI)
                setResearchHistoryService(service)
            } catch (error) {
                console.warn('Failed to initialize research history service:', error)
                setResearchHistoryService(null)
            }
        } else {
            setResearchHistoryService(null)
        }
    }, [provider, signer, contractAddress, contractABI])

    // Create a new research session
    const createSession = useCallback(async (researchType: string): Promise<string> => {
        if (!researchHistoryService) {
            throw new Error('Research history service not initialized')
        }

        setIsLoading(true)
        setError(null)

        try {
            const sessionId = await researchHistoryService.createResearchSession(researchType)
            const session = await researchHistoryService.getResearchSession(sessionId)

            setCurrentSession(session)
            setQueries([])
            setResponses([])

            console.log('✅ Research session created:', sessionId)
            return sessionId
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to create research session'
            setError(errorMsg)
            throw new Error(errorMsg)
        } finally {
            setIsLoading(false)
        }
    }, [researchHistoryService])

    // Complete current session
    const completeSession = useCallback(async (): Promise<void> => {
        if (!researchHistoryService || !currentSession) {
            throw new Error('No active session to complete')
        }

        setIsLoading(true)
        setError(null)

        try {
            await researchHistoryService.completeResearchSession(currentSession.sessionId)

            // Update session status
            const updatedSession = await researchHistoryService.getResearchSession(currentSession.sessionId)
            setCurrentSession(updatedSession)

            console.log('✅ Research session completed:', currentSession.sessionId)
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to complete research session'
            setError(errorMsg)
            throw new Error(errorMsg)
        } finally {
            setIsLoading(false)
        }
    }, [researchHistoryService, currentSession])

    // Add a research query
    const addQuery = useCallback(async (query: string, context: string): Promise<string> => {
        if (!researchHistoryService || !currentSession) {
            throw new Error('No active session')
        }

        setIsLoading(true)
        setError(null)

        try {
            const queryId = await researchHistoryService.addResearchQuery(
                currentSession.sessionId,
                query,
                context
            )

            // Reload session to get updated query count
            const updatedSession = await researchHistoryService.getResearchSession(currentSession.sessionId)
            setCurrentSession(updatedSession)

            console.log('✅ Research query added:', queryId)
            return queryId
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to add research query'
            setError(errorMsg)
            throw new Error(errorMsg)
        } finally {
            setIsLoading(false)
        }
    }, [researchHistoryService, currentSession])

    // Add a research response
    const addResponse = useCallback(async (queryId: string, responseData: ResearchData): Promise<void> => {
        if (!researchHistoryService || !currentSession) {
            throw new Error('No active session')
        }

        setIsLoading(true)
        setError(null)

        try {
            await researchHistoryService.addResearchResponse(
                currentSession.sessionId,
                queryId,
                responseData
            )

            // Reload session to get updated cost
            const updatedSession = await researchHistoryService.getResearchSession(currentSession.sessionId)
            setCurrentSession(updatedSession)

            console.log('✅ Research response added:', queryId)
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to add research response'
            setError(errorMsg)
            throw new Error(errorMsg)
        } finally {
            setIsLoading(false)
        }
    }, [researchHistoryService, currentSession])

    // Load all sessions for current user
    const loadSessions = useCallback(async (): Promise<void> => {
        setIsLoading(true)
        setError(null)

        try {
            // Try to load from blockchain first
            if (researchHistoryService && signer && contractAddress) {
                try {
                    const userAddress = await signer.getAddress()
                    const sessionIds = await researchHistoryService.getResearcherSessions(userAddress)

                    const sessionPromises = sessionIds.map(id =>
                        researchHistoryService.getResearchSession(id)
                    )

                    const loadedSessions = await Promise.all(sessionPromises)
                    setSessions(loadedSessions)

                    console.log('✅ Loaded sessions from blockchain:', loadedSessions.length)
                    return
                } catch (err: any) {
                    // Check if this is a contract availability error
                    if (err.message?.includes('missing revert data') ||
                        err.message?.includes('CALL_EXCEPTION') ||
                        err.message?.includes('no matching receipts')) {
                        console.warn('⚠️ Contract not available, falling back to local storage')
                        setError('Contract not deployed or not accessible')
                    } else {
                        console.warn('⚠️ Blockchain loading failed, falling back to local storage:', err)
                    }
                }
            }

            // Fallback: Load sessions from local storage
            console.log('🔍 Loading sessions from local storage...')
            const localSessions = loadSessionsFromLocalStorage()
            setSessions(localSessions)
            console.log('✅ Loaded sessions from local storage:', localSessions.length)

        } catch (err: any) {
            const errorMsg = err.message || 'Failed to load sessions'
            setError(errorMsg)
            console.error('❌ Failed to load sessions:', err)
        } finally {
            setIsLoading(false)
        }
    }, [researchHistoryService, signer, contractAddress])

    // Load sessions from local storage
    const loadSessionsFromLocalStorage = (): ResearchSession[] => {
        try {
            const sessions: ResearchSession[] = []

            // Look for session data in localStorage
            const localKeys = Object.keys(localStorage).filter(key =>
                key.startsWith('research-session-') || key.startsWith('research_data_')
            )

            // Group by session ID
            const sessionMap = new Map<string, any>()

            localKeys.forEach(key => {
                try {
                    const data = localStorage.getItem(key)
                    if (data) {
                        const parsed = JSON.parse(data)
                        const sessionId = parsed.sessionId || parsed.metadata?.sessionId

                        if (sessionId) {
                            if (!sessionMap.has(sessionId)) {
                                sessionMap.set(sessionId, {
                                    sessionId: sessionId,
                                    researcher: parsed.metadata?.researcher || 'local-user',
                                    researchType: parsed.metadata?.researchType || 'academic',
                                    startTime: parsed.metadata?.timestamp || Date.now(),
                                    endTime: undefined,
                                    totalQueries: 0,
                                    totalCost: parsed.metadata?.cost || 0,
                                    isActive: true
                                })
                            }

                            // Increment query count
                            const session = sessionMap.get(sessionId)
                            session.totalQueries++
                            session.totalCost += parsed.metadata?.cost || 0
                        }
                    }
                } catch (parseError) {
                    console.warn('⚠️ Failed to parse local session data:', key, parseError)
                }
            })

            return Array.from(sessionMap.values())
        } catch (error) {
            console.error('❌ Failed to load sessions from local storage:', error)
            return []
        }
    }

    // Load specific session
    const loadSession = useCallback(async (sessionId: string): Promise<void> => {
        if (!researchHistoryService) {
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const session = await researchHistoryService.getResearchSession(sessionId)
            setCurrentSession(session)

            console.log('✅ Loaded session:', sessionId)
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to load session'
            setError(errorMsg)
            console.error('❌ Failed to load session:', err)
        } finally {
            setIsLoading(false)
        }
    }, [researchHistoryService])

    // Load specific query
    const loadQuery = useCallback(async (queryId: string): Promise<ResearchQuery | null> => {
        if (!researchHistoryService || !currentSession) {
            return null
        }

        try {
            const query = await researchHistoryService.getResearchQuery(currentSession.sessionId, queryId)
            return query
        } catch (err: any) {
            console.error('❌ Failed to load query:', err)
            return null
        }
    }, [researchHistoryService, currentSession])

    // Load specific response with full data
    const loadResponse = useCallback(async (queryId: string): Promise<ResearchResponse | null> => {
        if (!researchHistoryService || !currentSession) {
            return null
        }

        try {
            const response = await researchHistoryService.getResearchResponse(currentSession.sessionId, queryId)
            return response
        } catch (err: any) {
            console.error('❌ Failed to load response:', err)
            return null
        }
    }, [researchHistoryService, currentSession])

    // Verify response integrity
    const verifyResponse = useCallback(async (queryId: string, responseData: string): Promise<boolean> => {
        if (!researchHistoryService || !currentSession) {
            return false
        }

        try {
            return await researchHistoryService.verifyResponse(currentSession.sessionId, queryId, responseData)
        } catch (err: any) {
            console.error('❌ Failed to verify response:', err)
            return false
        }
    }, [researchHistoryService, currentSession])

    // Refresh all data
    const refreshData = useCallback(async (): Promise<void> => {
        await loadSessions()
        if (currentSession) {
            await loadSession(currentSession.sessionId)
        }
    }, [loadSessions, loadSession, currentSession])

    // Clear error
    const clearError = useCallback(() => {
        setError(null)
    }, [])

    // Auto-load sessions when component mounts or when service is ready
    useEffect(() => {
        // Add a small delay to prevent immediate loading on initialization
        const timer = setTimeout(() => {
            loadSessions()
        }, 1000)

        return () => clearTimeout(timer)
    }, [loadSessions])

    return {
        // State
        currentSession,
        sessions,
        queries,
        responses,
        isLoading,
        error,

        // Session management
        createSession,
        completeSession,

        // Query management
        addQuery,

        // Response management
        addResponse,

        // Data retrieval
        loadSessions,
        loadSession,
        loadQuery,
        loadResponse,

        // Verification
        verifyResponse,

        // Utility
        refreshData,
        clearError
    }
}

