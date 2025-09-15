"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, HardDrive, ShoppingCart, Loader2, AlertCircle } from "lucide-react"
import { useWeb3 } from "@/components/web3-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CreditPurchase() {
  const { isConnected, account } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  const [computeAmount, setComputeAmount] = useState("100")
  const [storageAmount, setStorageAmount] = useState("500")

  const computeCreditCost = 0.000001 // ETH per credit
  const storageCreditCost = 0.0000001 // ETH per credit

  const computeTotal = Number.parseFloat(computeAmount) * computeCreditCost
  const storageTotal = Number.parseFloat(storageAmount) * storageCreditCost

  const handlePurchase = async (type: "compute" | "storage") => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    setIsLoading(true)
    try {
      // Simulate purchase transaction
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // In real implementation, this would:
      // 1. Call smart contract purchaseCredits function
      // 2. Send ETH payment
      // 3. Wait for transaction confirmation
      // 4. Update user's credit balance

      alert(`Successfully purchased ${type} credits!`)
    } catch (error) {
      console.error("Purchase failed:", error)
      alert("Purchase failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const creditPackages = [
    { name: "Starter", compute: 50, storage: 200, price: 0.00007, popular: false },
    { name: "Pro", compute: 200, storage: 800, price: 0.00028, popular: true },
    { name: "Enterprise", compute: 1000, storage: 4000, price: 0.0014, popular: false },
  ]

  return (
    <div className="space-y-6">
      {!isConnected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please connect your wallet to purchase credits.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="packages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packages">Credit Packages</TabsTrigger>
          <TabsTrigger value="custom">Custom Amount</TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          <div className="grid md:grid-cols-3 gap-6">
            {creditPackages.map((pkg) => (
              <Card
                key={pkg.name}
                className={`relative border-2 transition-colors ${
                  pkg.popular ? "border-primary bg-primary/5" : "hover:border-primary/50"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold">{pkg.price} ETH</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm">Compute Credits</span>
                      </div>
                      <Badge variant="outline">{pkg.compute}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-secondary" />
                        <span className="text-sm">Storage Credits</span>
                      </div>
                      <Badge variant="outline">{pkg.storage}</Badge>
                    </div>
                  </div>
                  <Button
                    className="w-full gap-2"
                    disabled={!isConnected || isLoading}
                    onClick={() => handlePurchase("compute")}
                    variant={pkg.popular ? "default" : "outline"}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        Purchase Package
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Compute Credits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Compute Credits
                </CardTitle>
                <CardDescription>For AI inference and processing operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="compute-amount">Number of Credits</Label>
                  <Input
                    id="compute-amount"
                    type="number"
                    value={computeAmount}
                    onChange={(e) => setComputeAmount(e.target.value)}
                    min="1"
                    max="10000"
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Credits:</span>
                    <span className="font-medium">{computeAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per credit:</span>
                    <span className="font-mono">{computeCreditCost} ETH</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span className="font-mono">{computeTotal.toFixed(6)} ETH</span>
                  </div>
                </div>
                <Button
                  className="w-full gap-2"
                  disabled={!isConnected || isLoading || !computeAmount}
                  onClick={() => handlePurchase("compute")}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Buy Compute Credits
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Storage Credits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-secondary" />
                  Storage Credits
                </CardTitle>
                <CardDescription>For data storage on 0G Network</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="storage-amount">Number of Credits</Label>
                  <Input
                    id="storage-amount"
                    type="number"
                    value={storageAmount}
                    onChange={(e) => setStorageAmount(e.target.value)}
                    min="1"
                    max="50000"
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Credits:</span>
                    <span className="font-medium">{storageAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per credit:</span>
                    <span className="font-mono">{storageCreditCost} ETH</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span className="font-mono">{storageTotal.toFixed(7)} ETH</span>
                  </div>
                </div>
                <Button
                  className="w-full gap-2"
                  disabled={!isConnected || isLoading || !storageAmount}
                  onClick={() => handlePurchase("storage")}
                  variant="outline"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Buy Storage Credits
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
