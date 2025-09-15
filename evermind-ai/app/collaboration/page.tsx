"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamManagement } from "@/components/team-management"
import { SharedAgents } from "@/components/shared-agents"
import { CollaborativeChat } from "@/components/collaborative-chat"
import { ActivityFeed } from "@/components/activity-feed"
import { Users, Bot, MessageSquare, Activity } from "lucide-react"

export default function CollaborationPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Collaboration Hub</h1>
        <p className="text-muted-foreground">Manage teams, share AI agents, and collaborate on projects</p>
      </div>

      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Shared Agents
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Collaborative Chat
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Feed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="agents">
          <SharedAgents />
        </TabsContent>

        <TabsContent value="chat">
          <CollaborativeChat />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  )
}
