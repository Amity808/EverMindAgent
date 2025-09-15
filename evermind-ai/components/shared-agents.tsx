"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, Share2, Users, Eye, MessageSquare, BarChart3 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface SharedAgent {
  id: string
  name: string
  description: string
  owner: string
  ownerAvatar?: string
  sharedWith: string[]
  permissions: {
    canView: boolean
    canChat: boolean
    canEdit: boolean
    canAnalyze: boolean
  }
  usage: {
    totalChats: number
    activeUsers: number
    lastUsed: string
  }
  status: "active" | "paused"
}

export function SharedAgents() {
  const [sharedAgents, setSharedAgents] = useState<SharedAgent[]>([
    {
      id: "1",
      name: "Research Assistant Pro",
      description: "Advanced research and analysis agent",
      owner: "Alice Johnson",
      sharedWith: ["AI Research Team", "Data Science Team"],
      permissions: {
        canView: true,
        canChat: true,
        canEdit: false,
        canAnalyze: true,
      },
      usage: {
        totalChats: 156,
        activeUsers: 8,
        lastUsed: "2024-01-20T10:30:00Z",
      },
      status: "active",
    },
    {
      id: "2",
      name: "Code Review Bot",
      description: "Automated code review and suggestions",
      owner: "Bob Smith",
      sharedWith: ["Development Team"],
      permissions: {
        canView: true,
        canChat: true,
        canEdit: true,
        canAnalyze: false,
      },
      usage: {
        totalChats: 89,
        activeUsers: 5,
        lastUsed: "2024-01-19T15:45:00Z",
      },
      status: "active",
    },
  ])

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string>("")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Shared Agents</h2>
          <p className="text-muted-foreground">AI agents shared with your teams</p>
        </div>
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Share2 className="h-4 w-4 mr-2" />
              Share Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share AI Agent</DialogTitle>
              <DialogDescription>Share an AI agent with your team members</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-select">Select Agent</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent to share" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent1">My Research Assistant</SelectItem>
                    <SelectItem value="agent2">Creative Writer Bot</SelectItem>
                    <SelectItem value="agent3">Data Analyst Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="team-select">Share with Team</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team1">AI Research Team</SelectItem>
                    <SelectItem value="team2">Development Team</SelectItem>
                    <SelectItem value="team3">Data Science Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can-view" className="text-sm">
                      Can View
                    </Label>
                    <Switch id="can-view" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can-chat" className="text-sm">
                      Can Chat
                    </Label>
                    <Switch id="can-chat" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can-edit" className="text-sm">
                      Can Edit
                    </Label>
                    <Switch id="can-edit" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can-analyze" className="text-sm">
                      Can Analyze
                    </Label>
                    <Switch id="can-analyze" defaultChecked />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsShareDialogOpen(false)}>Share Agent</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shared Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {sharedAgents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>{agent.description}</CardDescription>
                  </div>
                </div>
                <Badge variant={agent.status === "active" ? "default" : "secondary"}>{agent.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Owner */}
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={agent.ownerAvatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {agent.owner
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">Owned by {agent.owner}</span>
              </div>

              {/* Shared With */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Shared with</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.sharedWith.map((team, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {team}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Your permissions</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.permissions.canView && (
                    <Badge variant="secondary" className="text-xs">
                      View
                    </Badge>
                  )}
                  {agent.permissions.canChat && (
                    <Badge variant="secondary" className="text-xs">
                      Chat
                    </Badge>
                  )}
                  {agent.permissions.canEdit && (
                    <Badge variant="secondary" className="text-xs">
                      Edit
                    </Badge>
                  )}
                  {agent.permissions.canAnalyze && (
                    <Badge variant="secondary" className="text-xs">
                      Analyze
                    </Badge>
                  )}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground">{agent.usage.totalChats}</div>
                  <div className="text-xs text-muted-foreground">Total Chats</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground">{agent.usage.activeUsers}</div>
                  <div className="text-xs text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground">
                    {new Date(agent.usage.lastUsed).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Last Used</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
