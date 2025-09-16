"use client"

import { Navigation } from "@/components/navigation"
import { Web3Provider } from "@/components/web3-provider"
import { ResearchAssistant } from "@/components/research-assistant"

export default function ResearchPage() {
    return (
        <Web3Provider>
            <div className="min-h-screen bg-background">
                <Navigation />
                <ResearchAssistant />
            </div>
        </Web3Provider>
    )
}
