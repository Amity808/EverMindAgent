"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Web3Provider } from "@/components/web3-provider"
import { AgentPortfolio } from "@/components/agent-portfolio"
import { AgentMintingForm } from "@/components/agent-minting-form"
import { CreditBalance } from "@/components/credit-balance"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Brain, Zap, Activity } from "lucide-react"

export default function DashboardPage() {
  const [showMintingForm, setShowMintingForm] = useState(false)

  return (
    <Web3Provider>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Agent Dashboard</h1>
              <p className="text-muted-foreground">Manage your AI agents, credits, and collaborations</p>
            </div>
            <Button onClick={() => setShowMintingForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Agent
            </Button>
          </div>

          {/* Credit Balance Overview */}
          <div className="mb-8">
            <CreditBalance />
          </div>

          {/* Main Content */}
          <Tabs defaultValue="portfolio" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="portfolio" className="gap-2">
                <Brain className="h-4 w-4" />
                My Agents
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <Zap className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio">
              <AgentPortfolio />
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Track your AI agent operations and collaborations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">Your agent operations will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                  <CardDescription>Monitor your agent performance and credit consumption</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Analytics coming soon</p>
                    <p className="text-sm">Detailed usage metrics will be available here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Agent Minting Modal */}
        {showMintingForm && <AgentMintingForm onClose={() => setShowMintingForm(false)} />}
      </div>
    </Web3Provider>
  )
}
