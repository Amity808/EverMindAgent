"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Bot, MessageSquare, Share2, Users, CreditCard, Settings, Filter } from "lucide-react"

interface ActivityItem {
  id: string
  type: "chat" | "share" | "join" | "credit" | "agent_created" | "settings"
  user: string
  userAvatar?: string
  description: string
  timestamp: string
  metadata?: {
    agent?: string
    team?: string
    amount?: number
    credits?: number
  }
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "1",
      type: "chat",
      user: "Alice Johnson",
      description: "started a chat session with Research Assistant Pro",
      timestamp: "2024-01-20T10:30:00Z",
      metadata: { agent: "Research Assistant Pro" },
    },
    {
      id: "2",
      type: "share",
      user: "Bob Smith",
      description: "shared Code Review Bot with Development Team",
      timestamp: "2024-01-20T09:45:00Z",
      metadata: { agent: "Code Review Bot", team: "Development Team" },
    },
    {
      id: "3",
      type: "join",
      user: "Carol Davis",
      description: "joined the AI Research Team",
      timestamp: "2024-01-20T09:15:00Z",
      metadata: { team: "AI Research Team" },
    },
    {
      id: "4",
      type: "credit",
      user: "David Wilson",
      description: "purchased 1000 compute credits",
      timestamp: "2024-01-20T08:30:00Z",
      metadata: { credits: 1000, amount: 0.001 },
    },
    {
      id: "5",
      type: "agent_created",
      user: "Eva Brown",
      description: "created a new AI agent: Data Analyst Pro",
      timestamp: "2024-01-19T16:20:00Z",
      metadata: { agent: "Data Analyst Pro" },
    },
    {
      id: "6",
      type: "settings",
      user: "Alice Johnson",
      description: "updated team permissions for AI Research Team",
      timestamp: "2024-01-19T15:10:00Z",
      metadata: { team: "AI Research Team" },
    },
  ])

  const [filter, setFilter] = useState<string>("all")

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "chat":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "share":
        return <Share2 className="h-4 w-4 text-green-500" />
      case "join":
        return <Users className="h-4 w-4 text-purple-500" />
      case "credit":
        return <CreditCard className="h-4 w-4 text-yellow-500" />
      case "agent_created":
        return <Bot className="h-4 w-4 text-primary" />
      case "settings":
        return <Settings className="h-4 w-4 text-gray-500" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "chat":
        return { label: "Chat", variant: "default" as const }
      case "share":
        return { label: "Share", variant: "secondary" as const }
      case "join":
        return { label: "Team", variant: "outline" as const }
      case "credit":
        return { label: "Credits", variant: "default" as const }
      case "agent_created":
        return { label: "Agent", variant: "secondary" as const }
      case "settings":
        return { label: "Settings", variant: "outline" as const }
      default:
        return { label: "Activity", variant: "outline" as const }
    }
  }

  const filteredActivities = filter === "all" ? activities : activities.filter((activity) => activity.type === filter)

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Activity Feed</h2>
          <p className="text-muted-foreground">Recent team and agent activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="chat">Chat Sessions</SelectItem>
              <SelectItem value="share">Agent Sharing</SelectItem>
              <SelectItem value="join">Team Changes</SelectItem>
              <SelectItem value="credit">Credit Transactions</SelectItem>
              <SelectItem value="agent_created">Agent Creation</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Stay updated with your team's collaboration activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b border-border last:border-b-0 last:pb-0"
              >
                <div className="flex-shrink-0 p-2 rounded-lg bg-muted">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.userAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {activity.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{activity.user}</span>
                    <Badge variant={getActivityBadge(activity.type).variant} className="text-xs">
                      {getActivityBadge(activity.type).label}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>

                  {/* Metadata */}
                  {activity.metadata && (
                    <div className="flex items-center gap-2 mt-2">
                      {activity.metadata.agent && (
                        <Badge variant="outline" className="text-xs">
                          <Bot className="h-3 w-3 mr-1" />
                          {activity.metadata.agent}
                        </Badge>
                      )}
                      {activity.metadata.team && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {activity.metadata.team}
                        </Badge>
                      )}
                      {activity.metadata.credits && (
                        <Badge variant="outline" className="text-xs">
                          {activity.metadata.credits} credits
                        </Badge>
                      )}
                      {activity.metadata.amount && (
                        <Badge variant="outline" className="text-xs">
                          {activity.metadata.amount} ETH
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No activities found</h3>
              <p className="text-muted-foreground">
                {filter === "all" ? "No recent activities to display" : `No ${filter} activities found`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
