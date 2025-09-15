"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditOverview } from "@/components/credit-overview"
import { CreditPurchase } from "@/components/credit-purchase"
import { CreditAllocation } from "@/components/credit-allocation"
import { CreditAnalytics } from "@/components/credit-analytics"
import { CreditHistory } from "@/components/credit-history"
import { Coins, ShoppingCart, Users, BarChart3, History } from "lucide-react"

export function CreditDashboard() {
  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Credit Management</h1>
        <p className="text-muted-foreground">Manage your compute and storage credits for AI operations</p>
      </div>

      {/* Credit Overview */}
      <div className="mb-8">
        <CreditOverview />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="purchase" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="purchase" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Purchase
          </TabsTrigger>
          <TabsTrigger value="allocation" className="gap-2">
            <Users className="h-4 w-4" />
            Allocation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2">
            <Coins className="h-4 w-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchase">
          <CreditPurchase />
        </TabsContent>

        <TabsContent value="allocation">
          <CreditAllocation />
        </TabsContent>

        <TabsContent value="analytics">
          <CreditAnalytics />
        </TabsContent>

        <TabsContent value="history">
          <CreditHistory />
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Credit System Overview</CardTitle>
              <CardDescription>Understanding how credits work in EverMind AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <div className="h-2 w-2 bg-primary rounded-full" />
                    Compute Credits
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Used for AI inference operations, model execution, and processing tasks. Each AI operation consumes
                    credits based on complexity and duration.
                  </p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Cost per credit:</span>
                      <span className="font-mono">0.000001 ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Typical usage:</span>
                      <span>1-5 credits per query</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <div className="h-2 w-2 bg-secondary rounded-full" />
                    Storage Credits
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Used for storing AI models, datasets, and conversation history on 0G Storage. Credits are consumed
                    based on data size and storage duration.
                  </p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Cost per credit:</span>
                      <span className="font-mono">0.0000001 ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Typical usage:</span>
                      <span>1-3 credits per file</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
