"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, Zap, Award, ExternalLink, Share2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AgentNFT {
  id: string
  tokenId: number
  name: string
  description: string
  image: string
  owner: string
  creator: string
  mintDate: Date
  category: string
  performance: {
    totalExecutions: number
    successRate: number
    avgResponseTime: number
    userRating: number
  }
  evolution: {
    level: number
    experience: number
    maxExperience: number
    improvements: string[]
  }
  metadata: {
    modelHash: string
    datasetHash: string
    version: string
    capabilities: string[]
  }
  rarity: "common" | "rare" | "epic" | "legendary"
}

export function NFTGallery() {
  // Mock NFT data
  const [nfts] = useState<AgentNFT[]>([
    {
      id: "1",
      tokenId: 1001,
      name: "Genesis Research Assistant",
      description: "First-generation AI research assistant with advanced analytical capabilities",
      image: "/ai-robot-research-assistant.png",
      owner: "0x1234...abcd",
      creator: "0x5678...efgh",
      mintDate: new Date("2024-01-01"),
      category: "research",
      performance: {
        totalExecutions: 1250,
        successRate: 98.5,
        avgResponseTime: 2.3,
        userRating: 4.8,
      },
      evolution: {
        level: 15,
        experience: 12500,
        maxExperience: 15000,
        improvements: ["Enhanced data analysis", "Improved citation accuracy", "Faster processing"],
      },
      metadata: {
        modelHash: "0xabcd...1234",
        datasetHash: "0xefgh...5678",
        version: "1.5.2",
        capabilities: ["Research", "Analysis", "Citations", "Data Processing"],
      },
      rarity: "legendary",
    },
    {
      id: "2",
      tokenId: 1002,
      name: "Code Wizard Pro",
      description: "Advanced coding assistant with multi-language support",
      image: "/ai-robot-coding-wizard.png",
      owner: "0x9876...wxyz",
      creator: "0x5432...mnop",
      mintDate: new Date("2024-01-05"),
      category: "coding",
      performance: {
        totalExecutions: 890,
        successRate: 96.2,
        avgResponseTime: 1.8,
        userRating: 4.6,
      },
      evolution: {
        level: 12,
        experience: 8900,
        maxExperience: 12000,
        improvements: ["Added Python support", "Improved debugging", "Better error handling"],
      },
      metadata: {
        modelHash: "0x1111...2222",
        datasetHash: "0x3333...4444",
        version: "2.1.0",
        capabilities: ["Coding", "Debugging", "Code Review", "Documentation"],
      },
      rarity: "epic",
    },
    {
      id: "3",
      tokenId: 1003,
      name: "Creative Muse",
      description: "Artistic AI specializing in creative writing and storytelling",
      image: "/ai-robot-creative-artist-writer.png",
      owner: "0xaaaa...bbbb",
      creator: "0xcccc...dddd",
      mintDate: new Date("2024-01-10"),
      category: "creative",
      performance: {
        totalExecutions: 567,
        successRate: 94.8,
        avgResponseTime: 3.1,
        userRating: 4.9,
      },
      evolution: {
        level: 8,
        experience: 5670,
        maxExperience: 8000,
        improvements: ["Enhanced creativity", "Better character development", "Improved dialogue"],
      },
      metadata: {
        modelHash: "0x5555...6666",
        datasetHash: "0x7777...8888",
        version: "1.3.1",
        capabilities: ["Creative Writing", "Storytelling", "Poetry", "Character Development"],
      },
      rarity: "rare",
    },
  ])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
      case "epic":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      case "rare":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "border-yellow-400 shadow-yellow-400/20"
      case "epic":
        return "border-purple-500 shadow-purple-500/20"
      case "rare":
        return "border-blue-500 shadow-blue-500/20"
      default:
        return "border-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{nfts.length}</div>
            <p className="text-sm text-muted-foreground">Total NFTs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-secondary">
              {nfts.reduce((sum, nft) => sum + nft.performance.totalExecutions, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Executions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">
              {(nfts.reduce((sum, nft) => sum + nft.performance.userRating, 0) / nfts.length).toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {nfts.filter((nft) => nft.rarity === "legendary" || nft.rarity === "epic").length}
            </div>
            <p className="text-sm text-muted-foreground">Rare NFTs</p>
          </CardContent>
        </Card>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <Card
            key={nft.id}
            className={`border-2 hover:shadow-lg transition-all duration-300 ${getRarityBorder(nft.rarity)}`}
          >
            <CardHeader className="pb-3">
              <div className="relative">
                <img
                  src={nft.image || "/placeholder.svg"}
                  alt={nft.name}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                  crossOrigin="anonymous"
                />
                <Badge className={`absolute top-2 right-2 ${getRarityColor(nft.rarity)}`}>
                  {nft.rarity.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{nft.name}</CardTitle>
                  <CardDescription className="text-sm">Token #{nft.tokenId}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View on Explorer
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share NFT
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{nft.description}</p>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-primary" />
                    <span className="text-xs text-muted-foreground">Executions</span>
                  </div>
                  <div className="text-sm font-medium">{nft.performance.totalExecutions}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3 text-secondary" />
                    <span className="text-xs text-muted-foreground">Success Rate</span>
                  </div>
                  <div className="text-sm font-medium">{nft.performance.successRate}%</div>
                </div>
              </div>

              {/* Evolution Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Evolution Level {nft.evolution.level}</span>
                  <span className="font-medium">
                    {nft.evolution.experience}/{nft.evolution.maxExperience} XP
                  </span>
                </div>
                <Progress value={(nft.evolution.experience / nft.evolution.maxExperience) * 100} className="h-2" />
              </div>

              {/* Capabilities */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">Capabilities</h4>
                <div className="flex flex-wrap gap-1">
                  {nft.metadata.capabilities.slice(0, 3).map((capability) => (
                    <Badge key={capability} variant="outline" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                  {nft.metadata.capabilities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{nft.metadata.capabilities.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner:</span>
                  <code className="bg-muted px-1 py-0.5 rounded">{nft.owner}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-medium">{nft.metadata.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Minted:</span>
                  <span>{nft.mintDate.toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 gap-1">
                  <Brain className="h-3 w-3" />
                  Interact
                </Button>
                <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                  <ExternalLink className="h-3 w-3" />
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
