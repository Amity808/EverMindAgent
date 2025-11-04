"use client"

import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/components/web3-provider"
import { Wallet, LogOut, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TESTNET_CONFIG, MAINNET_CONFIG } from "@/lib/chain-config"

export function WalletConnectButton() {
  const { account, isConnected, isConnecting, connect, disconnect, chainId } = useWeb3()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getChainName = (chainId: number | null) => {
    if (!chainId) return "Not Connected"

    // Check 0G networks
    if (chainId === TESTNET_CONFIG.chain.chainId) {
      return TESTNET_CONFIG.chain.chainName
    }
    if (chainId === MAINNET_CONFIG.chain.chainId) {
      return MAINNET_CONFIG.chain.chainName
    }

    // Other common networks
    switch (chainId) {
      case 1:
        return "Ethereum"
      case 11155111:
        return "Sepolia"
      default:
        return `Chain ${chainId}`
    }
  }

  if (isConnecting) {
    return (
      <Button disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    )
  }

  if (isConnected && account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Wallet className="h-4 w-4" />
            {formatAddress(account)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled>Network: {getChainName(chainId)}</DropdownMenuItem>
          <DropdownMenuItem onClick={disconnect} className="gap-2 text-destructive">
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button onClick={connect} className="gap-2">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  )
}
