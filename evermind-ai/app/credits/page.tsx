"use client"

import { Navigation } from "@/components/navigation"
import { Web3Provider } from "@/components/web3-provider"
import { CreditDashboard } from "@/components/credit-dashboard"
import { ZGAccountManagement } from "@/components/0g-account-management"

export default function CreditsPage() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CreditDashboard />
            <ZGAccountManagement />
          </div>
        </div>
      </div>
    </Web3Provider>
  )
}
