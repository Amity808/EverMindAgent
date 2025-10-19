"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    History,
    Clock,
    DollarSign,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Download,
    Share2,
    Eye,
    Shield,
    Copy
} from "lucide-react"
import { ResearchSession, ResearchQuery, ResearchResponse } from "@/lib/research-history-service"

interface ResearchHistoryProps {
    sessions: ResearchSession[]
    currentSession: ResearchSession | null
    isLoading: boolean
    error: string | null
    onLoadSession: (sessionId: string) => Promise<void>
    onLoadResponse: (queryId: string) => Promise<ResearchResponse | null>
    onVerifyResponse: (queryId: string, responseData: string) => Promise<boolean>
}

export function ResearchHistory({
    sessions,
    currentSession,
    isLoading,
    error,
    onLoadSession,
    onLoadResponse,
    onVerifyResponse
}: ResearchHistoryProps) {
    const [selectedSession, setSelectedSession] = useState<ResearchSession | null>(null)
    const [selectedResponse, setSelectedResponse] = useState<ResearchResponse | null>(null)
    const [isVerifying, setIsVerifying] = useState(false)
    const [localResponses, setLocalResponses] = useState<any[]>([])

    // Check if blockchain features are available
    const isBlockchainAvailable = process.env.NEXT_PUBLIC_RESEARCH_HISTORY_CONTRACT &&
        !error?.includes('missing revert data') &&
        !error?.includes('CALL_EXCEPTION') &&
        !error?.includes('Contract not deployed or not accessible')

    const handleSessionSelect = async (session: ResearchSession) => {
        console.log('🔍 Loading session:', session.sessionId)
        setSelectedSession(session)
        setSelectedResponse(null) // Clear previous response

        try {
            await onLoadSession(session.sessionId)
            console.log('✅ Session loaded successfully')

            // Try to load responses from local storage as fallback
            await loadSessionResponsesFromLocal(session)

        } catch (error) {
            console.error('❌ Failed to load session:', error)
        }
    }

    const loadSessionResponsesFromLocal = async (session: ResearchSession) => {
        try {
            console.log('🔍 Checking local storage for session responses...')

            // Look for local research data in localStorage
            const localKeys = Object.keys(localStorage).filter(key =>
                key.startsWith('research_data_') || key.startsWith('research-session-')
            )

            console.log('📁 Found local storage keys:', localKeys)

            const responses: any[] = []

            if (localKeys.length > 0) {
                console.log('✅ Found local research data!')

                // Parse each local research data entry
                localKeys.forEach(key => {
                    try {
                        const data = localStorage.getItem(key)
                        if (data) {
                            const parsed = JSON.parse(data)
                            responses.push({
                                id: key,
                                data: parsed,
                                timestamp: parsed.metadata?.timestamp || Date.now(),
                                query: parsed.query || 'Unknown query',
                                response: parsed.response || 'No response available'
                            })
                        }
                    } catch (parseError) {
                        console.warn('⚠️ Failed to parse local data:', key, parseError)
                    }
                })

                // Sort by timestamp
                responses.sort((a, b) => b.timestamp - a.timestamp)
                setLocalResponses(responses)

                console.log('📊 Loaded local responses:', responses.length)
            } else {
                console.log('⚠️ No local research data found')
                setLocalResponses([])
            }

        } catch (error) {
            console.error('❌ Failed to load local responses:', error)
            setLocalResponses([])
        }
    }

    const handleResponseView = async (queryId: string) => {
        const response = await onLoadResponse(queryId)
        setSelectedResponse(response)
    }

    const handleVerifyResponse = async (queryId: string, responseData: string) => {
        setIsVerifying(true)
        try {
            const isValid = await onVerifyResponse(queryId, responseData)
            if (isValid) {
                console.log('✅ Response verified successfully')
            } else {
                console.log('❌ Response verification failed')
            }
        } catch (error) {
            console.error('❌ Verification error:', error)
        } finally {
            setIsVerifying(false)
        }
    }

    const downloadSessionData = async (session: ResearchSession) => {
        try {
            // Load session details to get queries and responses
            await onLoadSession(session.sessionId)

            // Create a comprehensive data object with session info and research data
            const sessionData = {
                sessionInfo: {
                    sessionId: session.sessionId,
                    researcher: session.researcher,
                    researchType: session.researchType,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    totalQueries: session.totalQueries,
                    totalCost: session.totalCost,
                    isActive: session.isActive,
                    exportedAt: new Date().toISOString()
                },
                researchData: {
                    note: "Research responses are stored on IPFS/local storage. Use the 'View' button to see detailed responses.",
                    instructions: "To view full research responses: 1) Click the 'View' button 2) Select individual queries to see responses"
                }
            }

            // Create and download JSON file
            const dataStr = JSON.stringify(sessionData, null, 2)
            const dataBlob = new Blob([dataStr], { type: 'application/json' })
            const url = URL.createObjectURL(dataBlob)

            const link = document.createElement('a')
            link.href = url
            link.download = `research-session-${session.sessionId}-metadata.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            console.log('✅ Session metadata downloaded')
            console.log('💡 To view research responses, click the "View" button to load session details')
        } catch (error) {
            console.error('❌ Failed to download session data:', error)
        }
    }

    const downloadCurrentSessionResponses = async (session: ResearchSession) => {
        try {
            console.log('📥 Loading session responses for download...')

            // This would need to be implemented to fetch actual responses
            // For now, we'll create a placeholder structure
            const responseData = {
                sessionInfo: {
                    sessionId: session.sessionId,
                    researchType: session.researchType,
                    totalQueries: session.totalQueries,
                    totalCost: session.totalCost,
                    exportedAt: new Date().toISOString()
                },
                note: "Full research responses are stored on IPFS/local storage.",
                instructions: "To view actual research responses, use the individual query buttons in the session details view.",
                responses: "Responses would be loaded here when the blockchain/IPFS integration is fully functional."
            }

            const dataStr = JSON.stringify(responseData, null, 2)
            const dataBlob = new Blob([dataStr], { type: 'application/json' })
            const url = URL.createObjectURL(dataBlob)

            const link = document.createElement('a')
            link.href = url
            link.download = `research-responses-${session.sessionId}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            console.log('✅ Research responses structure downloaded')
            console.log('💡 Note: Full responses require blockchain/IPFS integration')
        } catch (error) {
            console.error('❌ Failed to download research responses:', error)
        }
    }

    const shareSession = async (session: ResearchSession) => {
        try {
            const shareData = {
                title: `Research Session: ${session.researchType}`,
                text: `Research session with ${session.totalQueries} queries`,
                url: window.location.href
            }

            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                // Fallback: copy to clipboard
                const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`
                await navigator.clipboard.writeText(shareText)
                console.log('✅ Session info copied to clipboard')
            }
        } catch (error) {
            console.error('❌ Failed to share session:', error)
        }
    }

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString()
    }

    const formatDuration = (startTime: number, endTime?: number) => {
        const end = endTime || Date.now() / 1000
        const duration = end - startTime
        const hours = Math.floor(duration / 3600)
        const minutes = Math.floor((duration % 3600) / 60)
        return `${hours}h ${minutes}m`
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Research History</h2>
                    <p className="text-muted-foreground">
                        View and manage your blockchain-stored research sessions
                    </p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Blockchain Verified
                </Badge>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="sessions" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="sessions">All Sessions</TabsTrigger>
                    <TabsTrigger value="current">Current Session</TabsTrigger>
                    <TabsTrigger value="details">Session Details</TabsTrigger>
                </TabsList>

                <TabsContent value="sessions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Research Sessions ({isBlockchainAvailable ? sessions.length : 'Local Mode'})
                            </CardTitle>
                            <CardDescription>
                                {isBlockchainAvailable
                                    ? 'All your blockchain-stored research sessions'
                                    : 'Research sessions stored locally (blockchain unavailable)'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!isBlockchainAvailable ? (
                                <div className="text-center py-8">
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                                        <h3 className="font-medium text-yellow-800 mb-2">Blockchain Features Unavailable</h3>
                                        <p className="text-sm text-yellow-700 mb-3">
                                            The research history contract is not deployed or not accessible.
                                            Research analysis will work in local mode.
                                        </p>
                                        <div className="text-xs text-yellow-600">
                                            <p>To enable blockchain features:</p>
                                            <ul className="list-disc list-inside mt-1 space-y-1">
                                                <li>Deploy the ResearchHistory.sol contract</li>
                                                <li>Set NEXT_PUBLIC_RESEARCH_HISTORY_CONTRACT environment variable</li>
                                                <li>Ensure your wallet is connected to the correct network</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No research sessions found. Start a new research session to see your history here.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sessions.map((session) => (
                                        <Card
                                            key={session.sessionId}
                                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedSession?.sessionId === session.sessionId ? 'ring-2 ring-primary' : ''
                                                }`}
                                            onClick={() => handleSessionSelect(session)}
                                        >
                                            <CardContent className="pt-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="font-semibold">{session.researchType}</h3>
                                                            <Badge variant={session.isActive ? "default" : "secondary"}>
                                                                {session.isActive ? "Active" : "Completed"}
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDuration(session.startTime, session.endTime)}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <CheckCircle className="h-3 w-3" />
                                                                {session.totalQueries} queries
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <DollarSign className="h-3 w-3" />
                                                                {session.totalCost} OG
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Started: {formatTimestamp(session.startTime)}
                                                            {session.endTime && (
                                                                <span> • Ended: {formatTimestamp(session.endTime)}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleSessionSelect(session)}
                                                            title="View session details"
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => downloadSessionData(session)}
                                                            title="Download session data"
                                                        >
                                                            <Download className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => shareSession(session)}
                                                            title="Share session"
                                                        >
                                                            <Share2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="current" className="space-y-4">
                    {currentSession ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Current Session
                                </CardTitle>
                                <CardDescription>
                                    Active research session details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Research Type</label>
                                        <p className="text-lg font-semibold">{currentSession.researchType}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={currentSession.isActive ? "default" : "secondary"}>
                                                {currentSession.isActive ? "Active" : "Completed"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Total Queries</label>
                                        <p className="text-lg font-semibold">{currentSession.totalQueries}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Total Cost</label>
                                        <p className="text-lg font-semibold">{currentSession.totalCost} OG</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Duration</label>
                                        <p className="text-lg font-semibold">
                                            {formatDuration(currentSession.startTime, currentSession.endTime)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Session ID</label>
                                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                            {currentSession.sessionId.slice(0, 8)}...{currentSession.sessionId.slice(-8)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                    <Button
                                        onClick={() => downloadCurrentSessionResponses(currentSession)}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Research Responses
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-8 text-muted-foreground">
                                    No active session. Start a new research session to see details here.
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                    {selectedResponse ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ExternalLink className="h-5 w-5" />
                                    Response Details
                                </CardTitle>
                                <CardDescription>
                                    Blockchain-verified research response
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">IPFS Hash</label>
                                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded break-all">
                                            {selectedResponse.ipfsHash}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Verification Hash</label>
                                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded break-all">
                                            {selectedResponse.verificationHash.slice(0, 16)}...
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Cost</label>
                                        <p className="text-lg font-semibold">{selectedResponse.cost} OG</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                                        <p className="text-sm">{formatTimestamp(selectedResponse.timestamp)}</p>
                                    </div>
                                </div>

                                {selectedResponse.fullData && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Query</label>
                                            <p className="text-sm bg-muted p-3 rounded">{selectedResponse.fullData.query}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Response</label>
                                            <div className="bg-muted p-3 rounded max-h-64 overflow-y-auto">
                                                <pre className="text-sm whitespace-pre-wrap">
                                                    {selectedResponse.fullData.response}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleVerifyResponse(
                                            selectedResponse.queryId,
                                            selectedResponse.fullData?.response || ''
                                        )}
                                        disabled={isVerifying}
                                        variant="outline"
                                    >
                                        <Shield className="h-4 w-4 mr-2" />
                                        {isVerifying ? 'Verifying...' : 'Verify Response'}
                                    </Button>
                                    <Button variant="outline">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View on IPFS
                                    </Button>
                                    <Button variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-8 text-muted-foreground">
                                    {selectedSession ? (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <h3 className="font-medium text-blue-800 mb-2">Session Loaded: {selectedSession.sessionId}</h3>
                                                <p className="text-sm text-blue-700 mb-2">
                                                    This session has {selectedSession.totalQueries} queries with responses.
                                                </p>
                                                <p className="text-xs text-blue-600">
                                                    Found {localResponses.length} responses in local storage.
                                                </p>
                                            </div>

                                            {localResponses.length > 0 ? (
                                                <div className="space-y-3">
                                                    <h4 className="font-medium">Local Research Responses:</h4>
                                                    {localResponses.map((response, index) => (
                                                        <Card key={response.id} className="p-4">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <h5 className="font-medium text-sm">Query {index + 1}</h5>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {new Date(response.timestamp).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-medium text-muted-foreground">Query:</label>
                                                                    <p className="text-sm">{response.query}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-medium text-muted-foreground">Response:</label>
                                                                    <div className="text-sm bg-muted p-2 rounded max-h-32 overflow-y-auto">
                                                                        {response.response.substring(0, 200)}
                                                                        {response.response.length > 200 && '...'}
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(response.response)
                                                                        console.log('✅ Response copied to clipboard')
                                                                    }}
                                                                >
                                                                    <Copy className="h-3 w-3 mr-1" />
                                                                    Copy Response
                                                                </Button>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm">
                                                    <p>No local responses found. To view responses:</p>
                                                    <ol className="list-decimal list-inside mt-2 space-y-1">
                                                        <li>Ensure blockchain contract is deployed</li>
                                                        <li>Check IPFS configuration</li>
                                                        <li>Individual responses will appear here when loaded</li>
                                                    </ol>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        "Select a session first to view its responses."
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

