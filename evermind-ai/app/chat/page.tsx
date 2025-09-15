"use client"

import { Navigation } from "@/components/navigation"
import { Web3Provider } from "@/components/web3-provider"
import { ChatInterface } from "@/components/chat-interface"

export default function ChatPage() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <ChatInterface />
      </div>
    </Web3Provider>
  )
}
