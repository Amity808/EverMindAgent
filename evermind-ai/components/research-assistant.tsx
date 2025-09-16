"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Search, FileText, BarChart3, Download, Share2, BookOpen, Lightbulb, Target, TrendingUp } from "lucide-react"
import { useZGCompute } from "@/hooks/use-0g-compute"

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
    const { selectedService, sendInference, isInitialized } = useZGCompute()
    const [researchQuery, setResearchQuery] = useState("")
    const [researchContext, setResearchContext] = useState("")
    const [researchType, setResearchType] = useState("academic")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [researchInsights, setResearchInsights] = useState<ResearchInsight[]>([])
    const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([])

    const researchTypes = [
        { value: "academic", label: "Academic Research", icon: BookOpen },
        { value: "market", label: "Market Research", icon: TrendingUp },
        { value: "technical", label: "Technical Analysis", icon: Target },
        { value: "competitive", label: "Competitive Analysis", icon: BarChart3 }
    ]

    const analyzeResearch = async () => {
        if (!researchQuery.trim() || !selectedService || !isInitialized) return

        setIsAnalyzing(true)
        try {
            const prompt = createResearchPrompt(researchQuery, researchContext, researchType)

            const response = await sendInference({
                messages: [{ role: 'user', content: prompt }],
                model: selectedService.model,
                temperature: 0.7,
                max_tokens: 2000
            })

            const insights = parseResearchInsights(response.choices[0].message.content)
            setResearchInsights(insights)

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
                dataSources: ['AI Analysis', '0G Compute Network']
            }

            setResearchProjects(prev => [newProject, ...prev])
        } catch (error) {
            console.error('Research analysis failed:', error)
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
        const sections = content.split(/\*\*([^*]+)\*\*/)

        sections.forEach((section, index) => {
            if (section.includes('Findings') || section.includes('Insights') || section.includes('Recommendations')) {
                const lines = section.split('\n').filter(line => line.trim())
                lines.forEach(line => {
                    if (line.trim() && !line.includes('**')) {
                        insights.push({
                            id: `${Date.now()}-${index}`,
                            type: 'finding',
                            content: line.trim(),
                            confidence: 0.8,
                            sources: ['AI Analysis'],
                            createdAt: new Date()
                        })
                    }
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
                                    <label className="text-sm font-medium">AI Model</label>
                                    <div className="p-2 bg-muted rounded-lg text-sm">
                                        {selectedService?.model || 'No model selected'}
                                    </div>
                                </div>
                            </div>

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
                                    {researchInsights.map((insight, index) => (
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
            </Tabs>
        </div>
    )
}
