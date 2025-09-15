"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Bot, Send, Plus, Eye } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatSession {
  id: string
  name: string
  agent: string
  participants: Array<{
    id: string
    name: string
    avatar?: string
    status: "online" | "offline"
  }>
  lastMessage: string
  lastActivity: string
  messageCount: number
}

interface ChatMessage {
  id: string
  sender: string
  senderType: "user" | "agent"
  content: string
  timestamp: string
  avatar?: string
}

export function CollaborativeChat() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      name: "Research Discussion",
      agent: "Research Assistant Pro",
      participants: [
        { id: "1", name: "Alice Johnson", status: "online" },
        { id: "2", name: "Bob Smith", status: "online" },
        { id: "3", name: "Carol Davis", status: "offline" },
      ],
      lastMessage: "Can you analyze the latest market trends?",
      lastActivity: "2 minutes ago",
      messageCount: 24,
    },
    {
      id: "2",
      name: "Code Review Session",
      agent: "Code Review Bot",
      participants: [
        { id: "4", name: "David Wilson", status: "online" },
        { id: "5", name: "Eva Brown", status: "online" },
      ],
      lastMessage: "The code looks good, but consider optimizing the loop",
      lastActivity: "15 minutes ago",
      messageCount: 12,
    },
  ])

  const [selectedSession, setSelectedSession] = useState<string>("1")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "Alice Johnson",
      senderType: "user",
      content: "Hey team, can we discuss the latest research findings?",
      timestamp: "2024-01-20T10:00:00Z",
    },
    {
      id: "2",
      sender: "Research Assistant Pro",
      senderType: "agent",
      content: "I'd be happy to help analyze the research findings. What specific aspects would you like to explore?",
      timestamp: "2024-01-20T10:01:00Z",
    },
    {
      id: "3",
      sender: "Bob Smith",
      senderType: "user",
      content: "Let's focus on the market trend analysis from the last quarter",
      timestamp: "2024-01-20T10:02:00Z",
    },
    {
      id: "4",
      sender: "Research Assistant Pro",
      senderType: "agent",
      content:
        "Based on the Q4 data, I can see three major trends: 1) Increased adoption of AI tools (45% growth), 2) Shift towards remote collaboration (32% increase), 3) Focus on sustainability metrics (28% growth). Would you like me to dive deeper into any of these areas?",
      timestamp: "2024-01-20T10:03:00Z",
    },
  ])

  const [newMessage, setNewMessage] = useState("")

  const currentSession = chatSessions.find((s) => s.id === selectedSession)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: "You",
      senderType: "user",
      content: newMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Collaborative Chat</h2>
          <p className="text-muted-foreground">Chat with AI agents alongside your team</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Sessions List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Sessions</CardTitle>
              <CardDescription>Your collaborative chat sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSession === session.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedSession(session.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">{session.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {session.messageCount}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{session.agent}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div className="flex -space-x-1">
                        {session.participants.slice(0, 3).map((participant, index) => (
                          <Avatar key={participant.id} className="h-5 w-5 border-2 border-background">
                            <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {participant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {session.participants.length > 3 && (
                          <div className="h-5 w-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+{session.participants.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{session.lastMessage}</p>
                    <p className="text-xs text-muted-foreground mt-1">{session.lastActivity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{currentSession?.name}</CardTitle>
                  <CardDescription>Chatting with {currentSession?.agent}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {currentSession?.participants.map((participant) => (
                      <div key={participant.id} className="relative">
                        <Avatar className="h-8 w-8 border-2 border-background">
                          <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {participant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
                            participant.status === "online" ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    {currentSession?.participants.length} online
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {message.senderType === "agent" ? (
                            <Bot className="h-4 w-4" />
                          ) : (
                            message.sender
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{message.sender}</span>
                          {message.senderType === "agent" && (
                            <Badge variant="secondary" className="text-xs">
                              AI
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
