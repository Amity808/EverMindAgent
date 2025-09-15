"use client"

import { Navigation } from "@/components/navigation"
import { Web3Provider } from "@/components/web3-provider"
import { AgentPortfolio } from "@/components/agent-portfolio"
import { ZGServiceDiscovery } from "@/components/0g-service-discovery"

export default function AgentsPage() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">AI Agents & Services</h1>
            <p className="text-muted-foreground">Manage your AI agents and discover services on the 0G Network</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AgentPortfolio />
            <ZGServiceDiscovery />
          </div>
        </div>
      </div>
    </Web3Provider>
  )
}
