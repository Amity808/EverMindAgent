"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Brain, User, Settings, Clock, Zap, HardDrive } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  type: "user" | "agent" | "system"
  content: string
  timestamp: Date
  agentId?: string
  executionId?: string
  files?: File[]
  status?: "pending" | "executing" | "completed" | "failed"
  credits?: {
    compute: number
    storage: number
  }
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "executing":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "failed":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-muted"
    }
  }

  if (message.type === "system") {
    return (
      <div className="flex justify-center">
        <Card className={cn("max-w-md", getStatusColor(message.status))}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4" />
              <span>{message.content}</span>
              {message.status === "executing" && (
                <div className="ml-auto flex items-center gap-1">
                  <div className="h-2 w-2 bg-current rounded-full animate-pulse" />
                </div>
              )}
            </div>
            {message.credits && (
              <div className="flex items-center gap-3 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>{message.credits.compute} compute</span>
                </div>
                {message.credits.storage > 0 && (
                  <div className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    <span>{message.credits.storage} storage</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const isUser = message.type === "user"

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}
        >
          {isUser ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col gap-1 max-w-[70%]", isUser ? "items-end" : "items-start")}>
        <Card className={cn(isUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
          <CardContent className="p-3">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>

            {/* File attachments */}
            {message.files && message.files.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.files.map((file, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {file.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatTime(message.timestamp)}</span>
          {message.executionId && (
            <Badge variant="outline" className="text-xs">
              {message.executionId}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
