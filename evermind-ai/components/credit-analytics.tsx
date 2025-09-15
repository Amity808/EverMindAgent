"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, TrendingDown, Zap, HardDrive, Calendar } from "lucide-react"

export function CreditAnalytics() {
  // Mock analytics data
  const analyticsData = {
    dailyUsage: [
      { date: "2024-01-01", compute: 15, storage: 8 },
      { date: "2024-01-02", compute: 22, storage: 12 },
      { date: "2024-01-03", compute: 18, storage: 6 },
      { date: "2024-01-04", compute: 25, storage: 15 },
      { date: "2024-01-05", compute: 20, storage: 10 },
      { date: "2024-01-06", compute: 28, storage: 18 },
      { date: "2024-01-07", compute: 24, storage: 14 },
    ],
    topAgents: [
      { name: "Code Helper", usage: 156, percentage: 45 },
      { name: "Research Assistant", usage: 89, percentage: 26 },
      { name: "Creative Writer", usage: 67, percentage: 19 },
      { name: "Data Analyst", usage: 34, percentage: 10 },
    ],
    trends: {
      compute: { value: 12, trend: "up" as const },
      storage: { value: -5, trend: "down" as const },
      cost: { value: 8, trend: "up" as const },
    },
  }

  const maxUsage = Math.max(...analyticsData.dailyUsage.map((d) => Math.max(d.compute, d.storage)))

  return (
    <div className="space-y-6">
      {/* Trend Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compute Usage</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {analyticsData.trends.compute.value > 0 ? "+" : ""}
                {analyticsData.trends.compute.value}%
              </div>
              {analyticsData.trends.compute.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">vs last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {analyticsData.trends.storage.value > 0 ? "+" : ""}
                {analyticsData.trends.storage.value}%
              </div>
              {analyticsData.trends.storage.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">vs last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Trend</CardTitle>
            <BarChart3 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {analyticsData.trends.cost.value > 0 ? "+" : ""}
                {analyticsData.trends.cost.value}%
              </div>
              {analyticsData.trends.cost.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">vs last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Daily Credit Usage
          </CardTitle>
          <CardDescription>Credit consumption over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.dailyUsage.map((day, index) => (
              <div key={day.date} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(day.date).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="gap-1">
                      <Zap className="h-3 w-3 text-primary" />
                      {day.compute}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <HardDrive className="h-3 w-3 text-secondary" />
                      {day.storage}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1 h-2">
                  <div className="bg-primary rounded-sm" style={{ width: `${(day.compute / maxUsage) * 100}%` }} />
                  <div className="bg-secondary rounded-sm" style={{ width: `${(day.storage / maxUsage) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Agents */}
      <Card>
        <CardHeader>
          <CardTitle>Top Credit Consumers</CardTitle>
          <CardDescription>Agents with highest credit usage this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topAgents.map((agent, index) => (
              <div key={agent.name} className="flex items-center gap-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.usage} credits used</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${agent.percentage}%` }} />
                  </div>
                  <span className="text-xs font-medium w-8">{agent.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
