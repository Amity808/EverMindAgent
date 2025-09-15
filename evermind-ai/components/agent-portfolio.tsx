"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, HardDrive, MessageSquare, Settings, MoreHorizontal, CheckCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Agent {
  id: string
  name: string
  description: string
  modelHash: string
  datasetHash: string
  computeCredits: number
  storageCredits: number
  isNFTAcknowledged: boolean
  lastActive: string
  totalExecutions: number
}

export function AgentPortfolio() {
  // Mock data - in real app, this would come from blockchain/API
  const [agents] = useState<Agent[]>([
    {
      id: "1",
      name: "Research Assistant",
      description: "Specialized in academic research and data analysis",
      modelHash: "0x1234...abcd",
      datasetHash: "0x5678...efgh",
      computeCredits: 45,
      storageCredits: 120,
      isNFTAcknowledged: true,
      lastActive: "2 hours ago",
      totalExecutions: 23,
    },
    {
      id: "2",
      name: "Code Helper",
      description: "Expert in software development and debugging",
      modelHash: "0x9876...wxyz",
      datasetHash: "0x5432...mnop",
      computeCredits: 78,
      storageCredits: 200,
      isNFTAcknowledged: false,
      lastActive: "1 day ago",
      totalExecutions: 156,
    },
    {
      id: "3",
      name: "Creative Writer",
      description: "Generates creative content and storytelling",
      modelHash: "0xabcd...1234",
      datasetHash: "0xefgh...5678",
      computeCredits: 12,
      storageCredits: 80,
      isNFTAcknowledged: true,
      lastActive: "5 minutes ago",
      totalExecutions: 8,
    },
  ])

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No AI Agents Yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Create your first AI agent to get started with decentralized AI operations
          </p>
          <Button>Create Your First Agent</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <Card key={agent.id} className="border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {agent.isNFTAcknowledged && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <CheckCircle className="h-3 w-3" />
                        NFT
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {agent.totalExecutions} runs
                    </Badge>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat with Agent
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Settings className="h-4 w-4" />
                    Configure
                  </DropdownMenuItem>
                  {!agent.isNFTAcknowledged && (
                    <DropdownMenuItem className="gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Acknowledge NFT
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription className="text-sm">{agent.description}</CardDescription>

            {/* Credit Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                <Zap className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Compute</p>
                  <p className="text-sm font-medium">{agent.computeCredits}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/5">
                <HardDrive className="h-4 w-4 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">Storage</p>
                  <p className="text-sm font-medium">{agent.storageCredits}</p>
                </div>
              </div>
            </div>

            {/* Hashes */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">Model: </span>
                <code className="bg-muted px-1 py-0.5 rounded">{agent.modelHash}</code>
              </div>
              <div>
                <span className="text-muted-foreground">Dataset: </span>
                <code className="bg-muted px-1 py-0.5 rounded">{agent.datasetHash}</code>
              </div>
            </div>

            {/* Last Active */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last active: {agent.lastActive}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 gap-1">
                <MessageSquare className="h-3 w-3" />
                Chat
              </Button>
              <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                <Settings className="h-3 w-3" />
                Config
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
