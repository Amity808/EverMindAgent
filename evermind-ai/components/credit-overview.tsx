"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Coins, Zap, HardDrive, TrendingUp, TrendingDown, Plus } from "lucide-react"

export function CreditOverview() {
  // Mock data - in real app, this would come from blockchain/API
  const creditData = {
    compute: {
      total: 500,
      used: 150,
      available: 350,
      dailyUsage: 12,
      trend: "up" as const,
    },
    storage: {
      total: 1000,
      used: 300,
      available: 700,
      dailyUsage: 8,
      trend: "down" as const,
    },
    totalSpent: 0.0125, // ETH
    monthlySpent: 0.0045, // ETH
  }

  const computeUsagePercent = (creditData.compute.used / creditData.compute.total) * 100
  const storageUsagePercent = (creditData.storage.used / creditData.storage.total) * 100

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Compute Credits */}
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compute Credits</CardTitle>
          <Zap className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{creditData.compute.available}</div>
          <p className="text-xs text-muted-foreground mb-3">
            {creditData.compute.used} used of {creditData.compute.total}
          </p>
          <Progress value={computeUsagePercent} className="h-2 mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs">
              {creditData.compute.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500" />
              )}
              <span className="text-muted-foreground">{creditData.compute.dailyUsage}/day</span>
            </div>
            <Button size="sm" variant="outline" className="h-6 text-xs gap-1 bg-transparent">
              <Plus className="h-3 w-3" />
              Buy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Storage Credits */}
      <Card className="border-2 hover:border-secondary/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage Credits</CardTitle>
          <HardDrive className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary">{creditData.storage.available}</div>
          <p className="text-xs text-muted-foreground mb-3">
            {creditData.storage.used} used of {creditData.storage.total}
          </p>
          <Progress value={storageUsagePercent} className="h-2 mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs">
              {creditData.storage.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500" />
              )}
              <span className="text-muted-foreground">{creditData.storage.dailyUsage}/day</span>
            </div>
            <Button size="sm" variant="outline" className="h-6 text-xs gap-1 bg-transparent">
              <Plus className="h-3 w-3" />
              Buy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Total Spent */}
      <Card className="border-2 hover:border-accent/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <Coins className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{creditData.totalSpent} ETH</div>
          <p className="text-xs text-muted-foreground mb-3">Lifetime spending</p>
          <div className="text-xs">
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">This month:</span>
              <span className="font-medium">{creditData.monthlySpent} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg/month:</span>
              <span className="font-medium">{(creditData.totalSpent / 3).toFixed(4)} ETH</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          <Plus className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Button size="sm" className="w-full gap-2">
            <Zap className="h-3 w-3" />
            Buy Compute
          </Button>
          <Button size="sm" variant="outline" className="w-full gap-2 bg-transparent">
            <HardDrive className="h-3 w-3" />
            Buy Storage
          </Button>
          <Button size="sm" variant="ghost" className="w-full gap-2">
            <Coins className="h-3 w-3" />
            View History
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
