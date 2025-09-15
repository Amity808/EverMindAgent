"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins, Zap, HardDrive, Plus } from "lucide-react"

export function CreditBalance() {
  // Mock data - in real app, this would come from blockchain/API
  const credits = {
    compute: 150,
    storage: 500,
    totalSpent: 0.0045, // ETH
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compute Credits</CardTitle>
          <Zap className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{credits.compute}</div>
          <p className="text-xs text-muted-foreground">Available for AI operations</p>
          <Button size="sm" variant="outline" className="mt-2 gap-1 bg-transparent">
            <Plus className="h-3 w-3" />
            Buy More
          </Button>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-secondary/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage Credits</CardTitle>
          <HardDrive className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary">{credits.storage}</div>
          <p className="text-xs text-muted-foreground">Available for data storage</p>
          <Button size="sm" variant="outline" className="mt-2 gap-1 bg-transparent">
            <Plus className="h-3 w-3" />
            Buy More
          </Button>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-accent/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <Coins className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{credits.totalSpent} ETH</div>
          <p className="text-xs text-muted-foreground">Lifetime spending</p>
          <Button size="sm" variant="outline" className="mt-2 bg-transparent">
            View History
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
