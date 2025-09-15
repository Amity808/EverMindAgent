"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, ArrowRight, Shield, AlertCircle, Loader2 } from "lucide-react"
import { useWeb3 } from "@/components/web3-provider"

interface TransferInterfaceProps {
  onClose: () => void
  agentId: string | null
}

export function TransferInterface({ onClose, agentId }: TransferInterfaceProps) {
  const { isConnected, account } = useWeb3()
  const [recipientAddress, setRecipientAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"input" | "confirm" | "proof">("input")

  // Mock agent data
  const agentData = {
    id: "1",
    tokenId: 1001,
    name: "Research Assistant Pro",
    description: "Advanced AI research assistant",
    image: "/ai-robot-research-assistant.png",
    currentOwner: account || "0x1234...abcd",
    estimatedValue: 0.25,
  }

  const handleTransfer = async () => {
    if (!recipientAddress || !isConnected) return

    setIsLoading(true)
    try {
      // Step 1: Input validation
      setStep("confirm")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Step 2: Generate proof
      setStep("proof")
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In real implementation, this would:
      // 1. Validate recipient address
      // 2. Generate transfer proof
      // 3. Call smart contract transfer function
      // 4. Wait for transaction confirmation
      // 5. Update NFT ownership

      alert("Transfer completed successfully!")
      onClose()
    } catch (error) {
      console.error("Transfer failed:", error)
      alert("Transfer failed. Please try again.")
      setStep("input")
    } finally {
      setIsLoading(false)
    }
  }

  const isValidAddress = (address: string) => {
    return address.length === 42 && address.startsWith("0x")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Secure Agent Transfer</CardTitle>
                <CardDescription>Transfer your AI agent NFT with proof verification</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isConnected && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Please connect your wallet to transfer agents.</AlertDescription>
            </Alert>
          )}

          {/* Agent Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img
                  src={agentData.image || "/placeholder.svg"}
                  alt={agentData.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  crossOrigin="anonymous"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{agentData.name}</h3>
                  <p className="text-sm text-muted-foreground">{agentData.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">Token #{agentData.tokenId}</Badge>
                    <Badge variant="outline">~{agentData.estimatedValue} ETH</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {step === "input" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  className="font-mono"
                />
                {recipientAddress && !isValidAddress(recipientAddress) && (
                  <p className="text-sm text-destructive mt-1">Please enter a valid Ethereum address</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Current Owner</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm">{agentData.currentOwner}</code>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  This transfer will be secured with 0G Network proof verification. The recipient will need to
                  acknowledge NFT status after transfer.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Confirm Transfer</h3>
                <p className="text-muted-foreground">Please review the transfer details</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">From:</span>
                  <code className="text-sm">{agentData.currentOwner}</code>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">To:</span>
                  <code className="text-sm">{recipientAddress}</code>
                </div>
              </div>
            </div>
          )}

          {step === "proof" && (
            <div className="space-y-4">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Generating Proof</h3>
                <p className="text-muted-foreground">Creating secure transfer proof on 0G Network...</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span>Validating ownership</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span>Generating cryptographic proof</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span>Submitting to blockchain</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={isLoading}>
              Cancel
            </Button>
            {step === "input" && (
              <Button
                onClick={() => setStep("confirm")}
                disabled={!isConnected || !recipientAddress || !isValidAddress(recipientAddress)}
                className="flex-1 gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Continue
              </Button>
            )}
            {step === "confirm" && (
              <Button onClick={handleTransfer} disabled={isLoading} className="flex-1 gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Confirm Transfer
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
