"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Search, FileText, BarChart3, Download, Share2, BookOpen, Lightbulb, Target, TrendingUp, Wallet, RefreshCw, AlertCircle, Copy } from "lucide-react"
import { useZGCompute } from "@/hooks/use-0g-compute"
import { useResearchHistory } from "@/hooks/use-research-history"
import { ResearchHistory } from "@/components/research-history"
import { RESEARCH_HISTORY_ABI } from "@/lib/research-history-abi"
import { ethers } from "ethers"

interface ResearchProject {
    id: string
    title: string
    description: string
    status: 'draft' | 'in-progress' | 'completed'
    createdAt: Date
    lastUpdated: Date
    tags: string[]
    insights: string[]
    dataSources: string[]
}

interface ResearchInsight {
    id: string
    type: 'finding' | 'trend' | 'recommendation' | 'gap'
    content: string
    confidence: number
    sources: string[]
    createdAt: Date
}

export function ResearchAssistant() {
    const {
        selectedService,
        setSelectedService,
        sendInference,
        isInitialized,
        accountBalance,
        isLoading,
        error: zgError,
        services,
        addFunds,
        depositFund,
        transferToInference,
        transferToFineTuning,
        refreshServices,
        refreshBalance,
        isDemoMode,
        provider,
        signer
    } = useZGCompute()

    // Research History Integration
    const {
        currentSession,
        sessions,
        isLoading: historyLoading,
        error: historyError,
        createSession,
        completeSession,
        addQuery,
        addResponse,
        loadSessions,
        loadSession,
        loadResponse,
        verifyResponse,
        refreshData: refreshHistory
    } = useResearchHistory(
        provider, // Use provider from 0G compute hook
        signer, // Use signer from 0G compute hook
        process.env.NEXT_PUBLIC_RESEARCH_HISTORY_CONTRACT || '',
        RESEARCH_HISTORY_ABI
    )

    const [researchQuery, setResearchQuery] = useState("")
    const [researchContext, setResearchContext] = useState("")
    const [researchType, setResearchType] = useState("academic")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [researchInsights, setResearchInsights] = useState<ResearchInsight[]>([])
    const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([])
    const [error, setError] = useState<string | null>(null)
    const [fullResponse, setFullResponse] = useState<string | null>(null)
    const [currentQueryId, setCurrentQueryId] = useState<string | null>(null)

    const researchTypes = [
        { value: "academic", label: "Academic Research", icon: BookOpen },
        { value: "market", label: "Market Research", icon: TrendingUp },
        { value: "technical", label: "Technical Analysis", icon: Target },
        { value: "competitive", label: "Competitive Analysis", icon: BarChart3 }
    ]

    const analyzeResearch = async () => {
        if (!researchQuery.trim() || !selectedService || !isInitialized) return

        setIsAnalyzing(true)
        setError(null) // Clear previous errors
        setFullResponse(null) // Clear previous response

        try {
            // Create session if none exists (only if blockchain is available)
            let sessionId = currentSession?.sessionId
            let queryId = null

            if (process.env.NEXT_PUBLIC_RESEARCH_HISTORY_CONTRACT && provider && signer) {
                if (!sessionId) {
                    console.log('🔗 Creating new research session...')
                    sessionId = await createSession(researchType)
                }

                // Add query to blockchain
                console.log('📝 Adding query to blockchain...')
                queryId = await addQuery(researchQuery, researchContext)
                setCurrentQueryId(queryId)
            } else {
                console.log('⚠️ Blockchain features disabled - using local mode')
                // Generate local IDs for demo purposes
                sessionId = `local-${Date.now()}`
                queryId = `query-${Date.now()}`
                setCurrentQueryId(queryId)
            }

            const prompt = createResearchPrompt(researchQuery, researchContext, researchType)

            const response = await sendInference({
                messages: [{ role: 'user', content: prompt }],
                model: selectedService.model,
                temperature: 0.7,
                max_tokens: 2000
            })

            const responseContent = response.choices[0].message.content
            setFullResponse(responseContent)
            const insights = parseResearchInsights(responseContent)
            setResearchInsights(insights)

            // Store response on blockchain and 0G Storage (if available)
            if (process.env.NEXT_PUBLIC_RESEARCH_HISTORY_CONTRACT && provider && signer && queryId) {
                console.log('💾 Storing response on blockchain...')
                const researchData = {
                    sessionId: sessionId,
                    queryId: queryId,
                    query: researchQuery,
                    context: researchContext,
                    response: responseContent,
                    insights: insights,
                    metadata: {
                        timestamp: Date.now(),
                        researchType: researchType,
                        model: selectedService.model,
                        provider: selectedService.provider,
                        cost: 0.001, // Estimated cost
                        researcher: signer ? await signer.getAddress() : 'local-user',
                        sessionCreatedAt: Date.now(),
                        queryIndex: 1 // This would need to be tracked properly
                    }
                }

                try {
                    await addResponse(queryId, researchData)
                } catch (blockchainError) {
                    console.warn('⚠️ Failed to store on blockchain, continuing with local storage:', blockchainError)
                }
            } else {
                console.log('💾 Storing response locally (blockchain not available)')

                // Store locally with proper session metadata
                const localResearchData = {
                    sessionId: sessionId,
                    queryId: queryId,
                    query: researchQuery,
                    context: researchContext,
                    response: responseContent,
                    insights: insights,
                    metadata: {
                        timestamp: Date.now(),
                        researchType: researchType,
                        model: selectedService.model,
                        provider: selectedService.provider,
                        cost: 0.001,
                        researcher: 'local-user',
                        sessionCreatedAt: Date.now(),
                        queryIndex: 1,
                        storedLocally: true
                    }
                }

                // Store in localStorage with session-specific key
                try {
                    const storageKey = `research-session-${sessionId}-${queryId}`
                    localStorage.setItem(storageKey, JSON.stringify(localResearchData))
                    console.log('✅ Research data stored locally:', storageKey)
                } catch (storageError) {
                    console.warn('⚠️ Failed to store in localStorage:', storageError)
                }
            }

            // Create a new research project
            const newProject: ResearchProject = {
                id: Date.now().toString(),
                title: researchQuery.substring(0, 50) + "...",
                description: researchContext,
                status: 'in-progress',
                createdAt: new Date(),
                lastUpdated: new Date(),
                tags: extractTags(researchQuery),
                insights: insights.map(i => i.content),
                dataSources: process.env.NEXT_PUBLIC_RESEARCH_HISTORY_CONTRACT && provider && signer
                    ? ['AI Analysis', '0G Compute Network', '0G Storage', 'Blockchain Verified']
                    : ['AI Analysis', '0G Compute Network']
            }

            setResearchProjects(prev => [newProject, ...prev])

            console.log('✅ Research analysis completed and stored on blockchain!')
        } catch (error: any) {
            console.error('Research analysis failed:', error)

            // Handle specific error cases
            if (error.message?.includes('insufficient balance')) {
                setError('Insufficient balance in inference sub-account. Please transfer funds to inference first using the Account Management tab.')
            } else if (error.message?.includes('ERR_TUNNEL_CONNECTION_FAILED') || error.message?.includes('Failed to fetch')) {
                setError('Network connectivity issue. The AI provider endpoint may be temporarily unavailable. Please try again later.')
            } else {
                setError(error.message || 'Research analysis failed. Please check your account balance and try again.')
            }
        } finally {
            setIsAnalyzing(false)
        }
    }

    const createResearchPrompt = (query: string, context: string, type: string): string => {
        const typePrompts = {
            academic: `Conduct a comprehensive academic research analysis on: "${query}"
      
Context: ${context}

Please provide:
1. **Key Findings**: Main discoveries and insights
2. **Research Gaps**: Areas that need further investigation
3. **Methodology Suggestions**: Recommended research approaches
4. **Literature Review**: Relevant studies and papers
5. **Future Directions**: Potential research opportunities
6. **Critical Analysis**: Strengths and limitations of current knowledge

Format your response with clear sections and actionable insights.`,

            market: `Conduct a comprehensive market research analysis on: "${query}"
      
Context: ${context}

Please provide:
1. **Market Overview**: Size, trends, and growth potential
2. **Competitive Landscape**: Key players and market positioning
3. **Customer Insights**: Target audience and behavior patterns
4. **Opportunities**: Market gaps and untapped potential
5. **Threats**: Challenges and risks to consider
6. **Strategic Recommendations**: Actionable business insights

Format your response with clear sections and data-driven insights.`,

            technical: `Conduct a comprehensive technical analysis on: "${query}"
      
Context: ${context}

Please provide:
1. **Technical Overview**: Current state and capabilities
2. **Architecture Analysis**: System design and components
3. **Performance Metrics**: Key performance indicators
4. **Security Assessment**: Vulnerabilities and security considerations
5. **Scalability Analysis**: Growth potential and limitations
6. **Improvement Recommendations**: Technical optimization suggestions

Format your response with clear sections and technical insights.`,

            competitive: `Conduct a comprehensive competitive analysis on: "${query}"
      
Context: ${context}

Please provide:
1. **Competitor Identification**: Key players in the space
2. **Feature Comparison**: Capabilities and offerings
3. **Market Positioning**: How competitors position themselves
4. **Strengths & Weaknesses**: Competitive advantages and gaps
5. **Market Share Analysis**: Relative market positions
6. **Strategic Recommendations**: How to compete effectively

Format your response with clear sections and competitive insights.`
        }

        return typePrompts[type as keyof typeof typePrompts] || typePrompts.academic
    }

    const parseResearchInsights = (content: string): ResearchInsight[] => {
        const insights: ResearchInsight[] = []

        // Split content into sections based on headers
        const sections = content.split(/(?=#{1,6}\s|\*\*[^*]+\*\*)/)

        sections.forEach((section, sectionIndex) => {
            const lines = section.split('\n').filter(line => line.trim())

            // Determine insight type based on section content
            let insightType: 'finding' | 'trend' | 'recommendation' | 'gap' = 'finding'
            if (section.includes('Gap') || section.includes('gap')) {
                insightType = 'gap'
            } else if (section.includes('Recommendation') || section.includes('recommendation')) {
                insightType = 'recommendation'
            } else if (section.includes('Trend') || section.includes('trend')) {
                insightType = 'trend'
            }

            // Process lines in meaningful chunks
            let currentChunk = ''
            let chunkIndex = 0

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim()

                // Skip empty lines, headers, and table separators
                if (!line ||
                    line.startsWith('#') ||
                    line.startsWith('**') ||
                    line.startsWith('|') ||
                    line.startsWith('---') ||
                    line.match(/^[-=]+$/)) {
                    continue
                }

                // Skip very short lines (likely formatting artifacts)
                if (line.length < 10) {
                    continue
                }

                // Add line to current chunk
                if (currentChunk) {
                    currentChunk += ' ' + line
                } else {
                    currentChunk = line
                }

                // Create insight when chunk reaches meaningful length or at end of section
                if (currentChunk.length > 50 && (i === lines.length - 1 || currentChunk.length > 200)) {
                    const uniqueId = `${Date.now()}-${sectionIndex}-${chunkIndex}`

                    insights.push({
                        id: uniqueId,
                        type: insightType,
                        content: currentChunk,
                        confidence: 0.8,
                        sources: ['AI Analysis'],
                        createdAt: new Date()
                    })

                    currentChunk = ''
                    chunkIndex++
                }
            }

            // Add any remaining chunk
            if (currentChunk && currentChunk.length > 20) {
                const uniqueId = `${Date.now()}-${sectionIndex}-${chunkIndex}`

                insights.push({
                    id: uniqueId,
                    type: insightType,
                    content: currentChunk,
                    confidence: 0.8,
                    sources: ['AI Analysis'],
                    createdAt: new Date()
                })
            }
        })

        return insights
    }

    const extractTags = (query: string): string[] => {
        const commonTags = ['research', 'analysis', 'insights', 'data', 'trends']
        const queryTags = query.toLowerCase().split(' ').filter(word =>
            word.length > 3 && !['the', 'and', 'for', 'with', 'this', 'that'].includes(word)
        )
        return [...commonTags, ...queryTags.slice(0, 3)]
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            // You could add a toast notification here
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'finding': return <Lightbulb className="h-4 w-4" />
            case 'trend': return <TrendingUp className="h-4 w-4" />
            case 'recommendation': return <Target className="h-4 w-4" />
            case 'gap': return <Search className="h-4 w-4" />
            default: return <Brain className="h-4 w-4" />
        }
    }

    const getInsightColor = (type: string) => {
        switch (type) {
            case 'finding': return 'bg-blue-100 text-blue-800'
            case 'trend': return 'bg-green-100 text-green-800'
            case 'recommendation': return 'bg-purple-100 text-purple-800'
            case 'gap': return 'bg-orange-100 text-orange-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="container px-4 py-8 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">AI Research Assistant</h1>
                <p className="text-muted-foreground">
                    Leverage 0G Compute Network for intelligent research analysis and insights
                </p>
            </div>

            <Tabs defaultValue="analyze" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="analyze">Research Analysis</TabsTrigger>
                    <TabsTrigger value="projects">Research Projects</TabsTrigger>
                    <TabsTrigger value="insights">Insights Library</TabsTrigger>
                    <TabsTrigger value="history">Blockchain History</TabsTrigger>
                    <TabsTrigger value="account">Account Management</TabsTrigger>
                </TabsList>

                <TabsContent value="analyze" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                Research Analysis
                            </CardTitle>
                            <CardDescription>
                                Use AI to analyze research topics and generate insights
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Research Type</label>
                                    <Select value={researchType} onValueChange={setResearchType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {researchTypes.map(type => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div className="flex items-center gap-2">
                                                        <type.icon className="h-4 w-4" />
                                                        {type.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">AI Service</label>
                                    <Select
                                        value={selectedService?.provider || ""}
                                        onValueChange={(value) => {
                                            const service = services.find(s => s.provider === value)
                                            if (service) setSelectedService(service)
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select AI Service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services.map(service => (
                                                <SelectItem key={service.provider} value={service.provider}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{service.model}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {service.provider.slice(0, 8)}...{service.provider.slice(-6)}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Account Balance Display */}
                            {accountBalance && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Account Balance</label>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Available:</span>
                                                <span className="font-medium">{ethers.formatEther(accountBalance.balance)} OG</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Locked:</span>
                                                <span className="font-medium">{ethers.formatEther(accountBalance.locked)} OG</span>
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Total:</span>
                                                <span className="font-semibold">{ethers.formatEther(accountBalance.totalbalance)} OG</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Display */}
                            {(error || zgError) && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        <p className="text-red-800 text-sm">{error || zgError}</p>
                                    </div>
                                    {error?.includes('insufficient balance') && selectedService && (
                                        <div className="mt-2">
                                            <Button
                                                onClick={() => transferToInference(selectedService.provider, "0.1")}
                                                disabled={isLoading}
                                                size="sm"
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                                <Wallet className="h-4 w-4 mr-2" />
                                                Transfer 0.1 OG to Inference
                                            </Button>
                                            <p className="text-xs text-red-600 mt-1">
                                                This will transfer funds to your inference sub-account for AI requests
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Research Query</label>
                                <Input
                                    placeholder="What would you like to research? (e.g., 'Impact of AI on healthcare')"
                                    value={researchQuery}
                                    onChange={(e) => setResearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Context & Background</label>
                                <Textarea
                                    placeholder="Provide additional context, specific areas of interest, or background information..."
                                    value={researchContext}
                                    onChange={(e) => setResearchContext(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <Button
                                onClick={analyzeResearch}
                                disabled={!researchQuery.trim() || !selectedService || !isInitialized || isAnalyzing}
                                className="w-full"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Brain className="h-4 w-4 mr-2 animate-spin" />
                                        Analyzing Research...
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-4 w-4 mr-2" />
                                        Analyze Research
                                    </>
                                )}
                            </Button>

                            {/* Quick Setup Guide */}
                            {!isInitialized && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h4 className="font-medium text-yellow-800 mb-2">🚀 Getting Started</h4>
                                    <ol className="text-sm text-yellow-700 space-y-1">
                                        <li>1. Go to <strong>Account Management</strong> tab</li>
                                        <li>2. Click <strong>"Add Funds"</strong> to create your account</li>
                                        <li>3. Transfer funds to inference sub-account for AI requests</li>
                                        <li>4. Select an AI service and start researching!</li>
                                    </ol>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {researchInsights.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5" />
                                    Research Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {researchInsights.map((insight) => (
                                        <div key={insight.id} className="p-4 border rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-full ${getInsightColor(insight.type)}`}>
                                                    {getInsightIcon(insight.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className={getInsightColor(insight.type)}>
                                                            {insight.type}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">
                                                            Confidence: {Math.round(insight.confidence * 100)}%
                                                        </span>
                                                    </div>
                                                    <p className="text-sm">{insight.content}</p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        <span>Sources: {insight.sources.join(', ')}</span>
                                                        <span>{insight.createdAt.toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Full AI Response */}
                    {fullResponse && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        <CardTitle>Complete AI Response</CardTitle>
                                    </div>
                                    <Button
                                        onClick={() => copyToClipboard(fullResponse)}
                                        size="sm"
                                        variant="outline"
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy
                                    </Button>
                                </div>
                                <CardDescription>
                                    Full response from the AI analysis
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none">
                                    <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                                        {fullResponse}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="projects" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Research Projects
                            </CardTitle>
                            <CardDescription>
                                Manage your research projects and track progress
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {researchProjects.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No research projects yet. Start by analyzing a research topic above.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {researchProjects.map(project => (
                                        <Card key={project.id} className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{project.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {project.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline">{project.status}</Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {project.insights.length} insights
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Updated: {project.lastUpdated.toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {project.tags.map(tag => (
                                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Share2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="insights" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Insights Library
                            </CardTitle>
                            <CardDescription>
                                Browse and manage all your research insights
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                Insights library coming soon. Your research insights will be organized here.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                    <ResearchHistory
                        sessions={sessions}
                        currentSession={currentSession}
                        isLoading={historyLoading}
                        error={historyError}
                        onLoadSession={loadSession}
                        onLoadResponse={loadResponse}
                        onVerifyResponse={verifyResponse}
                    />
                </TabsContent>

                <TabsContent value="account" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5" />
                                0G Account Management
                            </CardTitle>
                            <CardDescription>
                                Manage your 0G account balance and fund transfers
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Account Status */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Account Status</label>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="text-sm">
                                        {isInitialized ? 'Connected to 0G Network' : 'Not Connected'}
                                    </span>
                                    {isDemoMode && (
                                        <Badge variant="outline" className="text-xs">
                                            Demo Mode
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Account Balance */}
                            {accountBalance && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Account Balance</label>
                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {ethers.formatEther(accountBalance.balance)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Available OG</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-orange-600">
                                                    {ethers.formatEther(accountBalance.locked)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Locked OG</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {ethers.formatEther(accountBalance.totalbalance)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Total OG</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fund Management */}
                            <div className="space-y-4">
                                <label className="text-sm font-medium">Fund Management</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        onClick={() => addFunds("0.1")}
                                        disabled={isLoading}
                                        className="w-full"
                                        size="sm"
                                    >
                                        <Wallet className="h-4 w-4 mr-2" />
                                        Add Funds (0.1 OG)
                                    </Button>
                                    <Button
                                        onClick={() => depositFund("0.2")}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="w-full"
                                        size="sm"
                                    >
                                        <Wallet className="h-4 w-4 mr-2" />
                                        Deposit (0.2 OG)
                                    </Button>
                                </div>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>💡 Tip:</strong> Before making AI requests, you need to transfer funds to your inference sub-account.
                                        Use the "Transfer to Inference" buttons below for each service.
                                    </p>
                                </div>
                            </div>

                            {/* Service Management */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Service Management</label>
                                    <Button
                                        onClick={refreshServices}
                                        disabled={isLoading}
                                        size="sm"
                                        variant="outline"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Refresh
                                    </Button>
                                </div>

                                {services.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">
                                            Available Services ({services.length})
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {services.map(service => (
                                                <div key={service.provider} className="p-3 border rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium">{service.model}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {service.provider.slice(0, 8)}...{service.provider.slice(-6)}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                onClick={() => transferToInference(service.provider, "0.1")}
                                                                disabled={isLoading}
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                Transfer to Inference
                                                            </Button>
                                                            <Button
                                                                onClick={() => transferToFineTuning(service.provider, "0.1")}
                                                                disabled={isLoading}
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                Transfer to Fine-tuning
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Refresh Balance */}
                            <div className="pt-4 border-t">
                                <Button
                                    onClick={refreshBalance}
                                    disabled={isLoading}
                                    className="w-full"
                                    variant="outline"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh Account Balance
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
