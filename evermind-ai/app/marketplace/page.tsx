"use client"

import { Navigation } from "@/components/navigation"
import { Web3Provider } from "@/components/web3-provider"
import { MarketplaceInterface } from "@/components/marketplace-interface"

export default function MarketplacePage() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <MarketplaceInterface />
      </div>
    </Web3Provider>
  )
}
