"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, ShoppingCart, Heart, TrendingUp, Star } from "lucide-react"

interface MarketplaceAgent {
  id: string
  tokenId: number
  name: string
  description: string
  image: string
  price: number
  currency: "ETH"
  seller: string
  category: string
  performance: {
    totalExecutions: number
    successRate: number
    userRating: number
    reviews: number
  }
  features: string[]
  isVerified: boolean
  isFeatured: boolean
  listedDate: Date
}

interface AgentListingProps {
  searchTerm: string
  sortBy: string
  filterCategory: string
  onSelectAgent: (agentId: string) => void
}

export function AgentListing({ searchTerm, sortBy, filterCategory, onSelectAgent }: AgentListingProps) {
  const [favorites, setFavorites] = useState<string[]>([])

  // Mock marketplace data
  const [agents] = useState<MarketplaceAgent[]>([
    {
      id: "1",
      tokenId: 2001,
      name: "Elite Data Analyst",
      description: "Professional-grade AI agent specialized in complex data analysis and visualization",
      image: "/ai-robot-data-analyst-professional.png",
      price: 0.25,
      currency: "ETH",
      seller: "0x1234...abcd",
      category: "analysis",
      performance: {
        totalExecutions: 2150,
        successRate: 97.8,
        userRating: 4.9,
        reviews: 127,
      },
      features: ["Advanced Analytics", "Data Visualization", "Statistical Modeling", "Report Generation"],
      isVerified: true,
      isFeatured: true,
      listedDate: new Date("2024-01-15"),
    },
    {
      id: "2",
      tokenId: 2002,
      name: "Swift Code Generator",
      description: "High-performance coding assistant with expertise in multiple programming languages",
      image: "/ai-robot-programmer-coding-swift.png",
      price: 0.18,
      currency: "ETH",
      seller: "0x5678...efgh",
      category: "coding",
      performance: {
        totalExecutions: 1890,
        successRate: 95.5,
        userRating: 4.7,
        reviews: 89,
      },
      features: ["Multi-language Support", "Code Optimization", "Bug Detection", "Documentation"],
      isVerified: true,
      isFeatured: false,
      listedDate: new Date("2024-01-12"),
    },
    {
      id: "3",
      tokenId: 2003,
      name: "Creative Content Master",
      description: "Innovative AI for creative writing, marketing copy, and content strategy",
      image: "/ai-robot-creative-writer-content-master.png",
      price: 0.12,
      currency: "ETH",
      seller: "0x9876...wxyz",
      category: "creative",
      performance: {
        totalExecutions: 1456,
        successRate: 93.2,
        userRating: 4.6,
        reviews: 73,
      },
      features: ["Creative Writing", "Marketing Copy", "SEO Content", "Brand Voice"],
      isVerified: false,
      isFeatured: false,
      listedDate: new Date("2024-01-08"),
    },
    {
      id: "4",
      tokenId: 2004,
      name: "Research Scholar Pro",
      description: "Academic research specialist with access to vast knowledge databases",
      image: "/ai-robot-research-scholar-academic.png",
      price: 0.32,
      currency: "ETH",
      seller: "0xaaaa...bbbb",
      category: "research",
      performance: {
        totalExecutions: 987,
        successRate: 98.9,
        userRating: 4.8,
        reviews: 45,
      },
      features: ["Academic Research", "Citation Management", "Literature Review", "Fact Checking"],
      isVerified: true,
      isFeatured: true,
      listedDate: new Date("2024-01-20"),
    },
  ])

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = searchTerm === "" || agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || agent.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "popular":
        return b.performance.totalExecutions - a.performance.totalExecutions
      case "performance":
        return b.performance.successRate - a.performance.successRate
      default:
        return b.listedDate.getTime() - a.listedDate.getTime()
    }
  })

  const toggleFavorite = (agentId: string) => {
    setFavorites((prev) => (prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]))
  }

  const handlePurchase = async (agent: MarketplaceAgent) => {
    // In real implementation, this would:
    // 1. Call smart contract to purchase agent NFT
    // 2. Transfer ETH to seller
    // 3. Transfer NFT to buyer
    // 4. Update marketplace listings
    alert(`Purchasing ${agent.name} for ${agent.price} ETH`)
  }

  return (
    <div className="space-y-6">
      {/* Featured Agents */}
      {sortedAgents.some((agent) => agent.isFeatured) && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedAgents
              .filter((agent) => agent.isFeatured)
              .slice(0, 2)
              .map((agent) => (
                <Card key={agent.id} className="border-2 border-yellow-200 bg-yellow-50/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500 text-white">Featured</Badge>
                        {agent.isVerified && <Badge variant="secondary">Verified</Badge>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(agent.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favorites.includes(agent.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                    </div>
                    <div className="flex gap-4">
                      <img
                        src={agent.image || "/placeholder.svg"}
                        alt={agent.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        crossOrigin="anonymous"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription className="text-sm">{agent.description}</CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{agent.performance.userRating}</span>
                            <span className="text-xs text-muted-foreground">({agent.performance.reviews})</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {agent.performance.totalExecutions} runs
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {agent.price} {agent.currency}
                      </div>
                      <Button onClick={() => handlePurchase(agent)} className="gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* All Agents */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Agents ({sortedAgents.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAgents.map((agent) => (
            <Card
              key={agent.id}
              className="border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {agent.isVerified && <Badge variant="secondary">Verified</Badge>}
                    <Badge variant="outline" className="text-xs">
                      #{agent.tokenId}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleFavorite(agent.id)} className="h-8 w-8 p-0">
                    <Heart
                      className={`h-4 w-4 ${
                        favorites.includes(agent.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                </div>
                <img
                  src={agent.image || "/placeholder.svg"}
                  alt={agent.name}
                  className="w-full h-40 object-cover rounded-lg"
                  crossOrigin="anonymous"
                />
                <div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">{agent.description}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-secondary" />
                      <span className="text-xs text-muted-foreground">Success Rate</span>
                    </div>
                    <div className="text-sm font-medium">{agent.performance.successRate}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">Rating</span>
                    </div>
                    <div className="text-sm font-medium">
                      {agent.performance.userRating} ({agent.performance.reviews})
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Key Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.features.slice(0, 2).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {agent.features.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.features.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-primary">
                        {agent.price} {agent.currency}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Listed {agent.listedDate.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handlePurchase(agent)} className="flex-1 gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Buy
                    </Button>
                    <Button variant="outline" onClick={() => onSelectAgent(agent.id)} className="gap-1 bg-transparent">
                      <Brain className="h-3 w-3" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {sortedAgents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Agents Found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search terms or filters to find AI agents
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
