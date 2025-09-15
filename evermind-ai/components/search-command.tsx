"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Search, Bot, Users, MessageSquare, CreditCard, BarChart3 } from "lucide-react"

interface SearchResult {
  id: string
  type: "agent" | "team" | "chat" | "user" | "page"
  title: string
  description: string
  url: string
  icon?: React.ReactNode
  metadata?: string
}

export function SearchCommand() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const mockResults: SearchResult[] = [
    {
      id: "1",
      type: "agent",
      title: "Research Assistant Pro",
      description: "Advanced research and analysis agent",
      url: "/agents/research-assistant-pro",
      icon: <Bot className="h-4 w-4" />,
      metadata: "Active",
    },
    {
      id: "2",
      type: "team",
      title: "AI Research Team",
      description: "8 members • 3 shared agents",
      url: "/collaboration/teams/ai-research",
      icon: <Users className="h-4 w-4" />,
      metadata: "8 members",
    },
    {
      id: "3",
      type: "chat",
      title: "Research Discussion",
      description: "Collaborative chat with Research Assistant Pro",
      url: "/chat/research-discussion",
      icon: <MessageSquare className="h-4 w-4" />,
      metadata: "24 messages",
    },
    {
      id: "4",
      type: "page",
      title: "Analytics Dashboard",
      description: "View usage statistics and performance metrics",
      url: "/analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      id: "5",
      type: "page",
      title: "Credit Management",
      description: "Purchase and manage your credits",
      url: "/credits",
      icon: <CreditCard className="h-4 w-4" />,
    },
  ]

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const filtered = mockResults.filter(
      (result) =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()),
    )
    setSearchResults(filtered)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "agent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "team":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "chat":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "user":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "page":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 bg-transparent"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-0 max-w-2xl">
          <Command className="rounded-lg border-0 shadow-none">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search agents, teams, chats, and more..."
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                onValueChange={handleSearch}
              />
            </div>
            <CommandList className="max-h-96 overflow-y-auto">
              {searchResults.length === 0 ? (
                <CommandEmpty className="py-6 text-center text-sm">
                  No results found. Try searching for agents, teams, or chats.
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {searchResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      className="flex items-center gap-3 p-3 cursor-pointer"
                      onSelect={() => {
                        setIsOpen(false)
                        // Navigate to result.url
                      }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">{result.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{result.title}</span>
                          <Badge variant="outline" className={`text-xs ${getTypeColor(result.type)}`}>
                            {result.type}
                          </Badge>
                          {result.metadata && <span className="text-xs text-muted-foreground">{result.metadata}</span>}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{result.description}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
