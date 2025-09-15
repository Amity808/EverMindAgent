"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, HardDrive, ArrowRight, Settings } from "lucide-react"

interface Agent {
  id: string
  name: string
  computeCredits: number
  storageCredits: number
  dailyUsage: {
    compute: number
    storage: number
  }
}

export function CreditAllocation() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "1",
      name: "Research Assistant",
      computeCredits: 45,
      storageCredits: 120,
      dailyUsage: { compute: 8, storage: 3 },
    },
    {
      id: "2",
      name: "Code Helper",
      computeCredits: 78,
      storageCredits: 200,
      dailyUsage: { compute: 15, storage: 5 },
    },
    {
      id: "3",
      name: "Creative Writer",
      computeCredits: 12,
      storageCredits: 80,
      dailyUsage: { compute: 3, storage: 2 },
    },
  ])

  const [transferAmount, setTransferAmount] = useState("")
  const [selectedFromAgent, setSelectedFromAgent] = useState("")
  const [selectedToAgent, setSelectedToAgent] = useState("")
  const [transferType, setTransferType] = useState<"compute" | "storage">("compute")

  const totalCredits = {
    compute: agents.reduce((sum, agent) => sum + agent.computeCredits, 0),
    storage: agents.reduce((sum, agent) => sum + agent.storageCredits, 0),
  }

  const handleTransfer = () => {
    if (!selectedFromAgent || !selectedToAgent || !transferAmount) return

    const amount = Number.parseInt(transferAmount)
    if (amount <= 0) return

    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id === selectedFromAgent) {
          const currentCredits = transferType === "compute" ? agent.computeCredits : agent.storageCredits
          if (currentCredits < amount) return agent // Not enough credits

          return {
            ...agent,
            [transferType === "compute" ? "computeCredits" : "storageCredits"]: currentCredits - amount,
          }
        }
        if (agent.id === selectedToAgent) {
          return {
            ...agent,
            [transferType === "compute" ? "computeCredits" : "storageCredits"]:
              (transferType === "compute" ? agent.computeCredits : agent.storageCredits) + amount,
          }
        }
        return agent
      }),
    )

    setTransferAmount("")
    setSelectedFromAgent("")
    setSelectedToAgent("")
  }

  const getUsageProjection = (agent: Agent) => {
    const computeDays = Math.floor(agent.computeCredits / (agent.dailyUsage.compute || 1))
    const storageDays = Math.floor(agent.storageCredits / (agent.dailyUsage.storage || 1))
    return Math.min(computeDays, storageDays)
  }

  return (
    <div className="space-y-6">
      {/* Agent Credit Status */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const projectedDays = getUsageProjection(agent)
          const isLowCredits = projectedDays < 7

          return (
            <Card key={agent.id} className={`border-2 ${isLowCredits ? "border-red-200 bg-red-50/50" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">{agent.name}</CardTitle>
                  </div>
                  {isLowCredits && <Badge variant="destructive">Low Credits</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-primary" />
                      <span className="text-xs text-muted-foreground">Compute</span>
                    </div>
                    <div className="text-lg font-bold text-primary">{agent.computeCredits}</div>
                    <div className="text-xs text-muted-foreground">{agent.dailyUsage.compute}/day usage</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3 text-secondary" />
                      <span className="text-xs text-muted-foreground">Storage</span>
                    </div>
                    <div className="text-lg font-bold text-secondary">{agent.storageCredits}</div>
                    <div className="text-xs text-muted-foreground">{agent.dailyUsage.storage}/day usage</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Projected runtime:</span>
                    <span className={`font-medium ${isLowCredits ? "text-red-600" : ""}`}>{projectedDays} days</span>
                  </div>
                  <Progress
                    value={Math.min((projectedDays / 30) * 100, 100)}
                    className={`h-2 ${isLowCredits ? "[&>div]:bg-red-500" : ""}`}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Credit Transfer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Transfer Credits Between Agents
          </CardTitle>
          <CardDescription>Redistribute credits to optimize agent performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>From Agent</Label>
              <select
                className="w-full mt-1 p-2 border rounded-md bg-background"
                value={selectedFromAgent}
                onChange={(e) => setSelectedFromAgent(e.target.value)}
              >
                <option value="">Select agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>To Agent</Label>
              <select
                className="w-full mt-1 p-2 border rounded-md bg-background"
                value={selectedToAgent}
                onChange={(e) => setSelectedToAgent(e.target.value)}
              >
                <option value="">Select agent</option>
                {agents
                  .filter((agent) => agent.id !== selectedFromAgent)
                  .map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <Label>Credit Type</Label>
              <select
                className="w-full mt-1 p-2 border rounded-md bg-background"
                value={transferType}
                onChange={(e) => setTransferType(e.target.value as "compute" | "storage")}
              >
                <option value="compute">Compute</option>
                <option value="storage">Storage</option>
              </select>
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
              />
            </div>
          </div>

          <Button
            onClick={handleTransfer}
            disabled={!selectedFromAgent || !selectedToAgent || !transferAmount}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Transfer Credits
          </Button>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Credit Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Total Compute Credits
              </h4>
              <div className="text-2xl font-bold text-primary">{totalCredits.compute}</div>
              <p className="text-sm text-muted-foreground">Distributed across {agents.length} agents</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-secondary" />
                Total Storage Credits
              </h4>
              <div className="text-2xl font-bold text-secondary">{totalCredits.storage}</div>
              <p className="text-sm text-muted-foreground">Distributed across {agents.length} agents</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
